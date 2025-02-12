from datetime import datetime

from passlib.hash import pbkdf2_sha256
from sqlmodel import Field, SQLModel


class EnUser(SQLModel):
    username: str
    firstname: str | None = None
    lastname: str | None = None
    password: str
    mail: str
    date_joined: datetime | None = None
    last_login: datetime | None = None

    def verify_password(self, plain_password: str) -> bool:
        return pbkdf2_sha256.verify(plain_password, self.password)

    def get_token_information(self) -> dict:
        return self.model_dump(include={"username"})

    # TODO: Type Validation for mail address

class EnUserDB(EnUser, table=True):
    __tablename__ = "users"

    id: int = Field(default=None, primary_key=True, index=True)
    is_active: bool = Field(default=False)
    is_superuser: bool = Field(default=False)
    is_staff: bool = Field(default=False)


class EnUserUpdate(EnUser):
    username: str | None = None
    firstname: str | None = None
    lastname: str | None = None
    password: str | None = None
    mail: str | None = None

