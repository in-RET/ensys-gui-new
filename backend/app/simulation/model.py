"""Simulation models for tracking runs and statuses."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel
from sqladmin import ModelView
from sqlmodel import Field, SQLModel


class Status(Enum):
    """Lifecycle states for simulations (started/finished/failed/stopped)."""

    STARTED = 1
    FINISHED = 2
    FAILED = 3
    STOPPED = 4


class EnSimulation(BaseModel):
    """Simulation payload with token, status, message, and scenario link."""

    sim_token: str
    status: int = Field(default=Status.STARTED.value)
    status_message: str | None = Field(default=None)
    scenario_id: int


class EnSimulationDB(SQLModel, table=True):
    """DB model for simulations with timing and status info."""

    __tablename__ = "simulations"

    id: int | None = Field(default=None, primary_key=True)
    sim_token: str = Field()
    status: int = Field(default=Status.STARTED.value)
    status_message: str | None = Field(default=None)
    scenario_id: int = Field(foreign_key="scenarios.id")
    start_date: datetime = Field(default_factory=datetime.now)
    end_date: datetime | None = Field(default=None)

    class Config:
        arbitrary_types_allowed = True

    def model_dump(self, *args, **kwargs) -> dict:
        """Return simulation dict with timestamps as epoch floats."""
        dump_data = super().model_dump(*args, **kwargs)
        dump_data["start_date"] = datetime.timestamp(self.start_date)
        dump_data["end_date"] = (
            datetime.timestamp(self.end_date) if self.end_date else None
        )
        return dump_data

    def model_update(self, obj: dict) -> SQLModel:
        """Wrapper around SQLModel update with type hints."""
        return super().model_update(obj)


class EnSimulationUpdate(BaseModel):
    """Patchable simulation status fields."""

    status: int = Field(nullable=False)
    status_message: str | None = Field(default=None, nullable=True)
    end_date: int | None = Field(default=None, nullable=True)

class SimulationAdmin(ModelView, model=EnSimulationDB):
    column_list = [
        "id",
        "sim_token",
        "status",
        "status_message",
        "scenario_id",
        "start_date",
        "end_date"
    ]
    name = "Simulation (EnSimulationDB)"
    icon = "fa-solid fa-calculator"
    name_plural = "Simulations"
    category = "Energysystems"
    category_icon = "fa-solid fa-bolt"
    can_view_details = True
    can_edit = False
    can_create = False
    can_delete = False
    can_retrieve = True
    can_export = False
