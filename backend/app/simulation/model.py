from datetime import datetime
from enum import Enum

from pydantic import BaseModel
from sqlmodel import SQLModel, Field


class Status(Enum):
    STARTED = "Started"
    FINISHED = "Finished"
    FAILED = "Failed"
    CANCELED = "Canceled"


class EnSimulation(BaseModel):
    sim_token: str = Field(nullable=False)
    status: str = Field(default=Status.STARTED, nullable=False)
    start_date: datetime = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=True)
    scenario_id: int = Field(default=None, nullable=False, foreign_key="scenarios.id")

class EnSimulationDB(SQLModel, table=True):
    __tablename__ = "simulations"

    id: int = Field(default=None, primary_key=True)
    sim_token: str = Field(nullable=False)
    status: str = Field(default=str(Status.STARTED), nullable=False)
    start_date: datetime = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=True)
    scenario_id: int = Field(default=None, nullable=False, foreign_key="scenarios.id")

class EnSimulationUpdate(SQLModel):
    status: str = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=True)
