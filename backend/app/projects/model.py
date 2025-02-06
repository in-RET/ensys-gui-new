from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlmodel import SQLModel, Field


class EnProject(BaseModel):
    name: str
    description: Optional[str] = Field(default=None, nullable=True)
    country: str
    unit_energy: str
    unit_co2: str
    user_id: int
    date_created: datetime
    date_updated: Optional[datetime] = Field(default=None, nullable=True)
    #viewers: list[int] = Field(default=None, nullable=True)

class EnProjectDB(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = Field(default=None, nullable=True)
    country: str
    unit_energy: str
    unit_co2: str
    user_id: int = Field(default=None, foreign_key="users.id")
    date_created: Optional[datetime] = Field(default=None, nullable=True)
    date_updated: Optional[datetime] = Field(default=None, nullable=True)
    #viewers: list[int] = Field(default=None, nullable=True)
