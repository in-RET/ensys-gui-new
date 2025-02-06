from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlmodel import SQLModel, Field


class EnScenario(BaseModel):
    name: str
    timestep: str = "1H"
    period: int = 365
    user_mode: str
    project_id: int
    simulations: list[int]

class EnScenarioDB(SQLModel, table=True):
    __tablename__ = "scenarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    timestep: str = Field(default="1H", nullable=False)
    period: int = Field(default=365, nullable=False)
    user_mode: str = Field(default="Expert", nullable=False)
    project_id: int = Field(default=None, nullable=False, foreign_key="projects.id")

