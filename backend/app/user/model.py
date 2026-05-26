"""User data models for auth, storage, and validation."""

from datetime import datetime
from secrets import token_urlsafe

from fastapi import HTTPException
from jose import jwt
from passlib.handlers.pbkdf2 import pbkdf2_sha256
from pydantic import field_validator, BaseModel
from sqladmin import ModelView
from sqlmodel import Field, SQLModel, Session
from starlette import status

from ..project.model import EnProjectDB
from ..scenario.model import EnScenarioDB
from ..security import token_secret

PASSWORD_MAX_LENGTH = 128


class EnUser(BaseModel):
    """User payload with credentials and profile fields."""

    username: str = Field(min_length=3, max_length=128)
    firstname: str | None = Field(default=None, min_length=0, max_length=64)
    lastname: str | None = Field(default=None, min_length=0, max_length=64)
    password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)
    mail: str = Field(min_length=8, max_length=128)

    @field_validator("mail", mode="after")
    @classmethod
    def is_mail_address(cls, value: str) -> str:
        """Validate email contains '@'; raise HTTP 422 otherwise."""
        if "@" not in value:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid email address format",
            )
        return value

    @field_validator("password", mode="after")
    @classmethod
    def is_good_password(cls, value: str) -> str:
        """Enforce password length and character classes; raise HTTP 400 on failure."""
        punctionation = [
            "/",
            "$",
            "§",
            "'",
            ",",
            ".",
            "@",
            "(",
            ")",
            "!",
            "#",
            "*",
            "?",
            "=",
            "&",
            "%",
            "'",
            ":",
            ";",
            "<",
            ">",
            "+",
            "-",
            "_",
        ]

        if len(value) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 3 characters long.",
            )

        if len(value) > PASSWORD_MAX_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password should not exceed 128 characters.",
            )

        if not any(c.isupper() for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one uppercase character in password.",
            )

        if not any(c.islower() for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one lowercase character in password.",
            )

        if not any(c.isdigit() for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one digit in password.",
            )

        if not any(c in punctionation for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one special character in password.",
            )

        return value


class EnUserDB(SQLModel, table=True):
    """DB model for users with auth metadata and timestamps."""

    __tablename__ = "users"

    id: int = Field(default=None, primary_key=True)
    username: str = Field(min_length=3, max_length=128, unique=True)
    firstname: str | None = Field(default=None, min_length=0, max_length=64)
    lastname: str | None = Field(default=None, min_length=0, max_length=64)
    password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)
    mail: str = Field(min_length=8, max_length=128)
    date_joined: datetime | None = Field(default_factory=datetime.now)
    last_login: datetime | None = Field(default=None)
    is_active: bool = Field(default=False)
    is_staff: bool = Field(default=False)

    def verify_password(self, password: str) -> bool:
        """Check plaintext against stored hash."""
        return pbkdf2_sha256.verify(password, self.password)

    def reset_password(self) -> str:
        """Reset password to a random value."""
        new_password = token_urlsafe(32)
        new_password_hash = pbkdf2_sha256.hash(new_password)
        self.verify_password(new_password_hash)
        self.password = new_password_hash

        return new_password

    def get_token(self) -> str:
        """Return JWT token payload with username and is_staff flags."""
        token = jwt.encode(
            {"username": self.username, "is_staff": self.is_staff, "is_active": self.is_active},
            token_secret,
            algorithm="HS256",
        )
        return token

    def check_scenario_rights(self, scenario_id: int, db: Session) -> bool:
        """Return True if user is staff or owns the scenario."""
        scenario: EnScenarioDB = db.get(EnScenarioDB, scenario_id)
        if self.is_staff:
            return True

        if scenario and scenario.user_id == self.id:
            return True
        else:
            return False

    def check_project_rights(self, project_id: int, db: Session) -> bool:
        """Return True if user is staff or owns the project."""
        project: EnProjectDB | None = db.get(EnProjectDB, project_id)

        if project and self.is_staff:
            return True
        elif project and self.id == project.user_id:
            return True
        else:
            return False

    def check_user_rights(self, scenario_id: int, db: Session) -> bool:
        """Ensure access to scenario and its project; raise 404s when missing."""
        scenario = db.get(EnScenarioDB, scenario_id)
        if scenario is None:
            raise HTTPException(status_code=404, detail="Scenario does not exist.")

        project = db.get(EnProjectDB, scenario.project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project does not exist.")

        return self.check_scenario_rights(
            scenario_id=scenario_id, db=db
        ) and self.check_project_rights(project_id=project.id, db=db)


class EnUserUpdate(BaseModel):
    """Patchable user profile fields (all optional)."""

    firstname: str | None = Field(default=None, min_length=0, max_length=64)
    lastname: str | None = Field(default=None, min_length=0, max_length=64)
    password: str | None = Field(
        default=None, min_length=8, max_length=PASSWORD_MAX_LENGTH
    )
    mail: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("mail", mode="after")
    @classmethod
    def is_mail_address(cls, value: str) -> str:
        """Validate updated email address format."""
        if value and "@" not in value:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid email address format",
            )
        return value


class UserAdmin(ModelView, model=EnUserDB):
    column_list = [
        "id",
        "username",
        "firstname",
        "lastname",
        "password",
        "mail",
        "date_joined",
        "last_login",
        "is_active",
        "is_staff",
    ]
    name = "User (EnUserDB)"
    name_plural = "Users"
    icon = "fa-solid fa-users"
    can_view_details = True
    can_edit = True
    can_create = True
    can_delete = True
    can_retrieve = True
    can_export = True
