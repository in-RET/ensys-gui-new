from datetime import datetime
from typing import Optional

from fastapi import HTTPException
from passlib.hash import pbkdf2_sha256
from pydantic import field_validator
from sqlmodel import Field, SQLModel
from starlette import status


PASSWORD_MAX_LENGTH = 128

class EnUser(SQLModel):
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
        if value.find("@") == -1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid mail address.")
        return value

    @field_validator('password', mode='after')
    @classmethod
    def is_good_password(cls, value: str) -> str:
        punctionation = ["/", "$", "§", "'", ",", ".", "@", "(", ")", "!", "#", "*", "?", "=", "&", "%", "'", ":", ";", "<", ">", "+", "-", "_"]

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
    __tablename__ = "users"

    id: int = Field(default=None, primary_key=True, index=True)
    date_joined: datetime | None = Field(default=None)
    last_login: datetime | None = Field(default=None)
    is_active: bool = Field(default=False)
    is_superuser: bool = Field(default=False)
    is_staff: bool = Field(default=False)


class EnUserUpdate(EnUser):
    username: str | None = None
    firstname: str | None = None
    lastname: str | None = None
    password: str | None = None
    mail: str | None = None

