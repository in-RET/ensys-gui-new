from typing import Optional

from sqlmodel import SQLModel, Field


class EnScenario(SQLModel):
    name: str
    timestep: str = "1H"
    period: int = 365
    user_mode: str
    project_id: int = Field(default=None, nullable=False, foreign_key="projects.id")

class EnScenarioDB(SQLModel, table=True):
    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
