from typing import ClassVar

from sqlmodel import SQLModel, Field


class EnScenario(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    timestep: str = Field(default="1H", min_length=2, max_length=2)
    period: int = Field(default=365)
    user_mode: str = Field(default="Novice", min_length=1, max_length=10)
    project_id: int = Field(foreign_key="projects.id")

class EnScenarioDB(EnScenario, table=True):
    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")


class EnScenarioUpdate(EnScenario):
    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    timestep: str | None = Field(default=None, min_length=2, max_length=2, nullable=True)
    period: int | None = Field(default=None, min_length=1, max_length=3, nullable=True)
    user_mode: str | None = Field(default=None, min_length=1, max_length=10, nullable=True)
    project_id: ClassVar[str]
    user_id: ClassVar[str]
