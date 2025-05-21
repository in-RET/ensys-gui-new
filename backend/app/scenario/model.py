from datetime import date, datetime

from pydantic import BaseModel
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field

from ..ensys.components.energysystem import EnEnergysystem


class EnScenario(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    start_date: date = Field(default=datetime.now().date()) # start
    time_steps: int | None = Field(default=8760, nullable=True) # number
    interval: float = Field(default=1.0)  # interval
    project_id: int
    energysystem_model: EnEnergysystem = Field(default={})

class EnScenarioDB(SQLModel, table=True):
    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    start_date: date = Field(nullable=False)
    time_steps: int | None = Field(default=8760, nullable=True)
    interval: float = Field(default=1)
    project_id: int = Field(foreign_key="projects.id")
    user_id: int = Field(foreign_key="users.id")
    energysystem_model: EnEnergysystem = Field(sa_column=Column(JSONB), default={})

class EnScenarioUpdate(EnScenario):
    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    interval: float | None = Field(default=1, nullable=True)
    start_date: date | None = Field(default=None, nullable=True)
    time_steps: int | None = Field(default=None, nullable=True)
    energysystem_model: EnEnergysystem | None = Field(default=None, nullable=True)
    project_id: None = None
    user_id: None = None
