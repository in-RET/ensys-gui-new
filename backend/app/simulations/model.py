from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class EnSimulation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str
    status: str
    start_date: Optional[datetime] = Field(default=None, nullable=True)
    end_date: Optional[datetime] = Field(default=None, nullable=True)
    scenario_id: Optional[int] = Field(foreign_key="EnScenario.id")
