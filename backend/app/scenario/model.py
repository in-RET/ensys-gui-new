"""
Scenario data models for storing and updating scenarios.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Annotated

import math
from pydantic import BaseModel
from sqladmin import ModelView
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class EnScenario(BaseModel):
    """Scenario payload with timing, project link, and modeling data."""

    name: str = Field(min_length=1, max_length=100)
    start_date: int = Field()  # start
    time_steps: int = Field(default=8760)  # number
    interval: float = Field(default=1.0)  # interval
    project_id: int = Field()
    constraints: str = Field(default="")
    modeling_data: str = Field(default="")

    def model_dump(self, *args, **kwargs) -> dict:
        """Return scenario dict converting start_date timestamp."""
        model_data = super().model_dump(*args, **kwargs)
        if self.start_date:
            model_data["start_date"] = datetime.fromtimestamp(self.start_date)

        return model_data


class EnScenarioDB(SQLModel, table=True):
    """DB model for scenarios with JSONB modeling_data."""

    # Pydantic v2 config
    model_config = {
        "arbitrary_types_allowed": True,
    }

    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    start_date: datetime = Field()
    time_steps: int = Field(default=8760)
    interval: float = Field(default=1)
    project_id: int = Field(foreign_key="projects.id")
    user_id: int = Field(foreign_key="users.id")
    constraints: str = Field(sa_column=Column(JSONB), default={})
    modeling_data: str = Field(sa_column=Column(JSONB), default={})

    def model_dump(self, *args, **kwargs) -> dict:
        """Return scenario dict incl. simulation_year and unix start_date."""
        data = super().model_dump(*args, **kwargs)
        data["simulation_year"] = self.start_date.year
        data["start_date"] = math.trunc(datetime.timestamp(self.start_date))
        return data

    def sqlmodel_update(self, *args, **kwargs) -> SQLModel:
        """Expose `sqlmodel_update` for static analysis helpers."""
        return super().sqlmodel_update(*args, **kwargs)


class EnScenarioUpdate(EnScenario):
    """Patchable scenario fields (all optional)."""

    name: Annotated[
        str | None, Field(default=None, min_length=1, max_length=100, nullable=True)
    ]
    interval: Annotated[float | None, Field(default=1, nullable=True)]
    start_date: Annotated[int | None, Field(default=None, nullable=True)]
    time_steps: Annotated[int | None, Field(default=8760, nullable=True)]
    modeling_data: Annotated[str | None, Field(default=None, nullable=True)]
    constraints: Annotated[str | None, Field(default=None, nullable=True)]
    project_id: Annotated[None, Field(default=None, nullable=True, repr=False)]


if TYPE_CHECKING:
    # Help static analyzers understand dynamically-created SQLModel attributes
    EnScenarioDB.name: str  # type: ignore[name-defined]
    EnScenarioDB.project_id: int  # type: ignore[name-defined]
    EnScenarioDB.id: int  # type: ignore[name-defined]
    EnScenarioDB.start_date: datetime  # type: ignore[name-defined]


class ScenarioAdmin(ModelView, model=EnScenarioDB):
    column_list = [
        "id",
        "name",
        "start_date",
        "time_steps",
        "interval",
        "project_id",
        "user_id",
        "constraints",
        "modeling_data",
    ]
    name = "Scenario (EnScenarioDB)"
    icon = "fa-solid fa-timeline"
    name_plural = "Scenarios"
    category = "Energysystems"
    category_icon = "fa-solid fa-bolt"
    can_view_details = True
    can_edit = True
    can_create = True
    can_delete = True
    can_retrieve = True
    can_export = True
