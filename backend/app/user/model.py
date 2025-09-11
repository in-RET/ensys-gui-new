from datetime import datetime

from fastapi import HTTPException
from passlib.hash import pbkdf2_sha256
from pydantic import field_validator
from sqlmodel import Field, SQLModel
from starlette import status

PASSWORD_MAX_LENGTH = 128


class EnUser(SQLModel):
    """
    Represents a user entity with various attributes and validation mechanisms for
    the user-related data fields.

    This class is primarily used to model user information and enforce constraints
    on attributes such as username, password, email, and names. It includes mechanisms
    to handle secure storage and validation of sensitive data like passwords and email
    addresses. Additionally, methods are provided for verifying passwords and extracting
    specific token-relevant user data.

    :ivar username: The unique username for the user.
    :type username: str
    :ivar firstname: The optional first name of the user.
    :type firstname: str, optional
    :ivar lastname: The optional last name of the user.
    :type lastname: str, optional
    :ivar password: The hashed password for the user.
    :type password: str
    :ivar mail: The valid email address associated with the user.
    :type mail: str
    """
    username: str = Field(min_length=3, max_length=128)
    firstname: str | None = Field(default=None, min_length=0, max_length=64)
    lastname: str | None = Field(default=None, min_length=0, max_length=64)
    password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)
    mail: str = Field(min_length=8, max_length=128)

    def verify_password(self, plain_password: str) -> bool:
        return pbkdf2_sha256.verify(plain_password, self.password)

    def get_token_information(self) -> dict:
        return self.model_dump(include={"username"})

    @field_validator('mail', mode='after')
    @classmethod
    def is_mail_address(cls, value: str) -> str:
        """
        Validates and ensures the provided email address is in a valid format.
        This function checks whether the given string contains the '@' symbol,
        indicating it is properly structured as an email address. If the validation
        fails, an HTTPException is raised with an appropriate status code and
        detail message.

        :param value: The email address to be validated.
        :type value: str
        :return: The validated email address if it is valid.
        :rtype: str
        :raises HTTPException: If the email address does not contain the '@' symbol.
        """
        if value.find("@") == -1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid mail address."
            )
        return value

    @field_validator('password', mode='after')
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
        punctionation = ["/", "$", "§", "'", ",", ".", "@", "(", ")", "!", "#", "*", "?", "=", "&", "%", "'", ":", ";",
                         "<", ">", "+", "-", "_"]

        if len(value) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 3 characters long."
            )

        if len(value) > PASSWORD_MAX_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password should not exceed 128 characters."
            )

        if not any(c.isupper() for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one uppercase character in password."
            )

        if not any(c.islower() for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one lowercase character in password."
            )

        if not any(c.isdigit() for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one digit in password."
            )

        if not any(c in punctionation for c in value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There should be at least one special character in password."
            )

        return value


class EnUserDB(EnUser, table=True):
    """
    Represents a database model for storing user information.

    This class inherits from `EnUser` and serves as a database table
    for user-related data. It defines the structure of the `users`
    table, including various user attributes like ID, date of joining,
    last login, and flags for active status, superuser, and staff roles.

    :ivar id: The unique identifier for each user.
    :type id: int
    :ivar date_joined: The datetime when the user registered. Defaults to None.
    :type date_joined: datetime | None
    :ivar last_login: The last login datetime for the user. Defaults to None.
    :type last_login: datetime | None
    :ivar is_active: Whether the user account is active. Defaults to False.
    :type is_active: bool
    :ivar is_superuser: Whether the user has superuser privileges. Defaults to False.
    :type is_superuser: bool
    :ivar is_staff: Whether the user is part of the staff. Defaults to False.
    :type is_staff: bool
    """
    __tablename__ = "users"

    id: int = Field(default=None, primary_key=True)
    date_joined: datetime | None = Field(default=None)
    last_login: datetime | None = Field(default=None)
    is_active: bool = Field(default=False)
    is_staff: bool = Field(default=False)


class EnUserUpdate(EnUser):
    """
    Represents an update to an EnUser.

    This class serves as a model for updating an existing user's details in the
    system. It extends the `EnUser` class, inheriting its attributes and adding
    optional fields specific to updating a user's information. Each attribute can
    be set to None if the corresponding field is not being updated.

    :ivar username: Optional updated username for the user.
    :type username: str | None
    :ivar firstname: Optional updated first name for the user.
    :type firstname: str | None
    :ivar lastname: Optional updated last name for the user.
    :type lastname: str | None
    :ivar password: Optional updated password for the user.
    :type password: str | None
    :ivar mail: Optional updated email address for the user.
    :type mail: str | None
    """
    username: str | None = None
    firstname: str | None = None
    lastname: str | None = None
    password: str | None = None
    mail: str | None = None
