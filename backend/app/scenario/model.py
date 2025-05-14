from datetime import date, datetime

from pydantic import BaseModel
from sqlalchemy import JSON, Column
from sqlmodel import SQLModel, Field

from ..ensys.components.energysystem import EnEnergysystem


class EnScenario(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    interval: float = Field(default=1)
    simulation_year: int = Field(default=datetime.now().year)
    start_date: date | None = Field(default=None, nullable=True)
    time_steps: int | None = Field(default=None, nullable=True)
    project_id: int
    energysystem_model: EnEnergysystem = Field()

class EnScenarioDB(SQLModel, table=True):
    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    interval: float = Field(default=1)
    simulation_year: int = Field(default=datetime.now().year)
    start_date: date | None = Field(default=None, nullable=True)
    time_steps: int | None = Field(default=365, nullable=True)
    project_id: int = Field(foreign_key="projects.id")
    user_id: int = Field(foreign_key="users.id")
    energysystem_model: EnEnergysystem = Field(sa_column=Column(JSON), default={})

class EnScenarioUpdate(EnScenario):
    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    interval: float | None = Field(default=1, nullable=True)
    simulation_year: date | None = Field(default=datetime.now().year, nullable=True)
    start_date: date | None = Field(default=None, nullable=True)
    time_steps: int | None = Field(default=None, nullable=True)
    energysystem_model: EnEnergysystem | None = Field(default=None, nullable=True)
    project_id: None = None
    user_id: None = None
