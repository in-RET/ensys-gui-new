from datetime import datetime

from sqlmodel import SQLModel, Field


class EnSimulation(SQLModel):
    sim_token: str
    status: str
    start_date: datetime
    end_date: datetime | None
    scenario_id: int = Field(default=None, nullable=False, foreign_key="scenarios.id")

class EnSimulationDB(EnSimulation, table=True):
    __tablename__ = "simulations"

    id: int = Field(default=None, primary_key=True)
