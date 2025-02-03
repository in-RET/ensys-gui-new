from datetime import datetime
from typing import Optional

from passlib.hash import pbkdf2_sha256
from sqlmodel import Field, SQLModel


class EnUser(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    firstname: str
    lastname: str
    password: str
    mail: str
    is_active: bool = Field(default=False)
    is_superuser: bool = Field(default=False)
    is_staff: bool = Field(default=False)
    last_login: Optional[datetime] = Field(default=None, nullable=True)
    date_joined: Optional[datetime] = Field(default=None, nullable=True)

    def verify_password(self, plain_password: str) -> bool:
        return pbkdf2_sha256.verify(plain_password, self.password)

