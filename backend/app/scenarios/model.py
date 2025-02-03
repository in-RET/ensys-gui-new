from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class EnScenario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    simulation_start: datetime
    timestep: str = Field(default="1H", nullable=False)
    period: int = Field(default=365, nullable=False)
    user_mode: str = Field(default="Expert", nullable=False)
    project_id: int = Field(default=None, nullable=False, foreign_key="EnProject.id")
