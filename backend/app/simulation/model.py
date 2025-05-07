from datetime import datetime

from sqlmodel import SQLModel, Field


class EnSimulation(SQLModel):
    sim_token: str = Field(nullable=False)
    status: str = Field(default="Started", nullable=False)
    start_date: datetime = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=False)
    scenario_id: int = Field(default=None, nullable=False, foreign_key="scenarios.id")

class EnSimulationDB(EnSimulation, table=True):
    __tablename__ = "simulations"

    id: int = Field(default=None, primary_key=True)

class EnSimulationUpdate(SQLModel):
    status: str = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=False)
