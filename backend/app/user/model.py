"""
User Models Module
================

This module provides the data models for user management in the EnSys application,
including user authentication, validation, and database persistence.

The module includes:
    - Base user model with validation
    - Database-specific user model
    - User update model for modification operations
    - Password and email validation utilities
"""

from datetime import datetime

from fastapi import HTTPException
from jose import jwt
from passlib.hash import pbkdf2_sha256
from pydantic import field_validator, BaseModel
from sqlmodel import Field, SQLModel
from starlette import status

from ..project import read_project
from ..scenario import read_scenario
from ..security import token_secret

PASSWORD_MAX_LENGTH = 128


class EnUser(BaseModel):
    """
    Represents a user entity with various attributes and validation mechanisms.

    This class is primarily used to model user information and enforce constraints
    on attributes such as username, password, email, and names. It includes mechanisms
    to handle secure storage and validation of sensitive data.

    :ivar username: The unique username for the user (3-128 characters)
    :type username: str
    :ivar firstname: The optional first name of the user (0-64 characters)
    :type firstname: str | None
    :ivar lastname: The optional last name of the user (0-64 characters)
    :type lastname: str | None
    :ivar password: The hashed password for the user (8-128 characters)
    :type password: str
    :ivar mail: The valid email address associated with the user
    :type mail: str
    """

    username: str = Field(min_length=3, max_length=128)
    firstname: str | None = Field(default=None, min_length=0, max_length=64)
    lastname: str | None = Field(default=None, min_length=0, max_length=64)
    password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)
    mail: str = Field(min_length=8, max_length=128)

    @field_validator("mail", mode="after")
    @classmethod
    def is_mail_address(cls, value: str) -> str:
        """
        Validates email address format.

        Ensures the provided email address contains an '@' symbol and meets
        basic email format requirements.

        :param value: Email address to validate
        :type value: str
        :return: Validated email address
        :rtype: str
        :raises HTTPException: If email format is invalid (status code 422)
        """
        if "@" not in value:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid email address format",
            )
        return value

    @field_validator("password", mode="after")
    @classmethod
    def is_good_password(cls, value: str) -> str:
        """
        Validates the strength of a password after it has been assigned or modified. The
        method ensures that the password meets specific security requirements, such as
        minimum and maximum length, uppercase and lowercase characters, numeric
        characters, and the inclusion of special symbols.

        :param value: The password string to be validated.
        :type value: str
        :return: The original password string if it meets all validation criteria.
        :rtype: str
        :raises HTTPException: If the password fails any validation check, such as length,
            lack of uppercase letters, lowercase letters, digits, or special characters.
        """
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
    """
    Database model for user persistence.

    Extends the base user model with additional fields needed for database
    storage and user management. Includes timestamps and administrative flags.

    :ivar id: Unique identifier for the user
    :type id: int
    :ivar username: Unique username (3-128 characters)
    :type username: str
    :ivar firstname: Optional first name (0-64 characters)
    :type firstname: str | None
    :ivar lastname: Optional last name (0-64 characters)
    :type lastname: str | None
    :ivar password_hash: Securely hashed password
    :type password_hash: str
    :ivar mail: Validated email address
    :type mail: str
    :ivar date_joined: Timestamp of user registration
    :type date_joined: datetime
    :ivar is_active: Whether the user account is active
    :type is_active: bool
    :ivar is_staff: Whether the user has administrative privileges
    :type is_staff: bool

    Note:
        The password is stored as a secure hash using PBKDF2-SHA256.
        Account activation requires email verification.
    """

    __tablename__ = "users"

    id: int = Field(default=None, primary_key=True)
    username: str = Field(min_length=3, max_length=128, unique=True)
    firstname: str | None = Field(default=None, min_length=0, max_length=64)
    lastname: str | None = Field(default=None, min_length=0, max_length=64)
    password_hash: str = Field(max_length=PASSWORD_MAX_LENGTH)
    mail: str = Field(min_length=8, max_length=128)
    date_joined: datetime = Field(default_factory=datetime.now)
    is_active: bool = Field(default=False)
    is_staff: bool = Field(default=False)

    def verify_password(self, password: str) -> bool:
        """
        Verify a password against the stored hash.

        :param password: Plain text password to verify
        :type password: str
        :return: True if password matches, False otherwise
        :rtype: bool
        """
        return pbkdf2_sha256.verify(password, self.password_hash)

    def get_token(self) -> str:
        """
        Get user information for JWT token generation.

        :return: Dictionary containing user data for token
        :rtype: dict
        """
        return jwt.encode({"username": self.username}, token_secret, algorithm="HS256")

    def check_scenario_rights(self, scenario_id: int) -> bool:
        scenario = read_scenario(scenario_id)

        if self.is_staff:
            return True
        elif scenario.user_id == self.id:
            return True
        else:
            return False

    def check_project_rights(self, project_id: int) -> bool:
        project = read_project(project_id)

        if self.is_staff:
            return True
        elif project.user_id == self.id:
            return True
        else:
            raise False

    def check_user_rights(self, scenario_id: int) -> bool:
        scenario = read_scenario(scenario_id)
        if scenario is None:
            raise HTTPException(status_code=404, detail="Scenario does not exist.")

        project = read_project(scenario.project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project does not exist.")

        return self.check_scenario_rights(scenario_id) and self.check_project_rights(
            project.id
        )


class EnUserUpdate(BaseModel):
    """
    Model for user information updates.

    This model defines which user attributes can be modified and enforces
    validation rules for updates. It makes certain fields optional and
    maintains proper constraints.

    :ivar firstname: Updated first name (optional)
    :type firstname: str | None
    :ivar lastname: Updated last name (optional)
    :type lastname: str | None
    :ivar password: New password (optional, 8-128 characters)
    :type password: str | None
    :ivar mail: New email address (optional)
    :type mail: str | None

    Note:
        Username cannot be updated after account creation.
        Password changes require re-hashing before storage.
    """

    firstname: str | None = Field(default=None, min_length=0, max_length=64)
    lastname: str | None = Field(default=None, min_length=0, max_length=64)
    password: str | None = Field(
        default=None, min_length=8, max_length=PASSWORD_MAX_LENGTH
    )
    mail: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("mail", mode="after")
    @classmethod
    def is_mail_address(cls, value: str) -> str:
        """
        Validate updated email address format.

        :param value: New email address to validate
        :type value: str
        :return: Validated email address
        :rtype: str
        :raises HTTPException: If email format is invalid (status code 422)
        """
        if value and "@" not in value:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid email address format",
            )
        return value
