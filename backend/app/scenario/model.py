from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel
from sqlalchemy import JSON, Column
from sqlmodel import SQLModel, Field

from ..components.common.apimodel import ApiEnergysystem


class EnScenario(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    timestep: str = Field(default="1H", min_length=2, max_length=2)
    period: int = Field(default=365)
    simulation_year: int = Field(default=datetime.now().year)
    user_mode: str = Field(default="Novice", min_length=1, max_length=10)
    project_id: int
    energysystem_model: ApiEnergysystem

class EnScenarioDB(SQLModel, table=True):
    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    timestep: str = Field(default="1H", min_length=2, max_length=2)
    period: int = Field(default=365)
    user_mode: str = Field(default="Novice", min_length=1, max_length=10)
    simulation_year: int = Field(default=datetime.now().year, max_digits=4, decimal_places=0)
    project_id: int = Field(foreign_key="projects.id")
    user_id: int = Field(foreign_key="users.id")
    energysystem_model: ApiEnergysystem = Field(sa_column=Column(JSON), default={})

class EnScenarioUpdate(EnScenario):
    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    timestep: str | None = Field(default=None, min_length=2, max_length=2, nullable=True)
    period: int | None = Field(default=None, nullable=True)
    simulation_year: datetime | None = Field(default=None, nullable=True)
    user_mode: str | None = Field(default=None, min_length=1, max_length=10, nullable=True)
    energysystem_model: ApiEnergysystem | None = Field(default=None, nullable=True)
    project_id: None = None
    user_id: None = None
