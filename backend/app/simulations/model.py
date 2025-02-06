from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlmodel import SQLModel, Field


class EnSimulation(BaseModel):
    sim_token: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    scenario_id: int

class EnSimulationDB(SQLModel, table=True):
    __tablename__ = "simulations"

    id: Optional[int] = Field(default=None, primary_key=True)
    sim_token: str
    status: str
    start_date: datetime
    end_date: Optional[datetime] = Field(default=None, nullable=True)
    scenario_id: int = Field(foreign_key="scenario.id")
