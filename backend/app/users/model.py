from datetime import datetime
from typing import Optional, Any

from passlib.hash import pbkdf2_sha256
from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class EnUserDB(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    username: str
    firstname: Optional[str] = Field(default=None, nullable=True)
    lastname: Optional[str] = Field(default=None, nullable=True)
    password: str
    mail: str
    is_active: bool = Field(default=False)
    is_superuser: bool = Field(default=False)
    is_staff: bool = Field(default=False)
    date_joined: datetime = Field(default=None, nullable=True)
    last_login: Optional[datetime] = Field(default=None, nullable=True)

class EnUser(BaseModel):
    username: str
    firstname: Optional[str]
    lastname: Optional[str]
    password: str
    mail: str
    date_joined: datetime
    last_login: Optional[datetime]

    def verify_password(self, plain_password: str) -> bool:
        return pbkdf2_sha256.verify(plain_password, self.password)

    def get_token_information(self) -> dict:
        return self.model_dump(exclude={"password", "date_joined", "last_login", "is_superuser", "is_active", "is_staff", "firstname", "lastname"})

    # TODO: Type Validation for mail address


class EnUserUpdate(EnUser):
    username: Optional[str]
    firstname: Optional[str]
    lastname: Optional[str]
    password: Optional[str]
    mail: Optional[str]

