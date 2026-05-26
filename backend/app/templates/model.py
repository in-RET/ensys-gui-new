"""
Template data models for reusable energy system setups.
"""

from datetime import datetime

import math
from pydantic import BaseModel
from sqladmin import ModelView
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class EnTemplate(BaseModel):
    """Base template payload for creating projects.

    - fields: name, description, country, coords, unit_* defaults
    """

    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    country: str = Field(min_length=1, max_length=40)
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)
    unit_currency: str = Field(default="EUR", max_length=8, nullable=False)
    unit_energy: str = Field(default="kW/kWh", max_length=10, nullable=False)
    unit_co2: str = Field(default="tCO2", max_length=10, nullable=False)


class EnTemplateDB(SQLModel, table=True):
    """Template persistence model for the DB.

    - table: `templates`
    - fields: id, name/description/country, coords, unit_* defaults
    """

    __tablename__ = "templates"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    country: str = Field(min_length=1, max_length=40)
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)
    unit_currency: str = Field(default="EUR", max_length=8, nullable=False)
    unit_energy: str = Field(default="kW/kWh", max_length=10, nullable=False)
    unit_co2: str = Field(default="tCO2", max_length=10, nullable=False)

    def model_dump(self, *args, **kwargs) -> dict:
        """Return template fields as a dict (wrapper around Base)."""
        return super().model_dump(*args, **kwargs)


class EnTemplateUpdate(BaseModel):
    """Patchable template fields (all optional)."""

    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    country: str | None = Field(
        default=None, min_length=1, max_length=100, nullable=True
    )
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
    unit_currency: str | None = Field(default=None, max_length=8, nullable=True)
    unit_energy: str | None = Field(default=None, max_length=10, nullable=True)
    unit_co2: str | None = Field(default=None, max_length=10, nullable=True)


class EnTemplateScenario(BaseModel):
    """Scenario payload tied to a template.

    - fields: name, start_date, time_steps, interval, template_id, modeling_data
    """

    name: str = Field(min_length=1, max_length=100)
    start_date: int = Field()  # start
    time_steps: int = Field(default=8760)  # number
    interval: float = Field(default=1.0)  # interval
    template_id: int = Field(nullable=False)
    modeling_data: str = Field(default="")

    def model_dump(self, *args, **kwargs) -> dict:
        """Dictify scenario and convert start_date timestamp."""
        model_data = super().model_dump(*args, **kwargs)
        if self.start_date:
            model_data["start_date"] = datetime.fromtimestamp(self.start_date)

        return model_data


class EnTemplateScenarioDB(SQLModel, table=True):
    """DB model for template scenarios with JSONB modeling data.

    - table: `template_scenarios`
    - fields: id/name/start_date/time_steps/interval/template_id/modeling_data
    """

    # Pydantic v2 config
    model_config = {
        "arbitrary_types_allowed": True,
    }

    __tablename__ = "template_scenarios"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    start_date: datetime = Field()
    time_steps: int = Field(default=8760)
    description: str = Field(default="", nullable=True)
    interval: float = Field(default=1)
    template_id: int = Field(foreign_key="templates.id")
    modeling_data: str = Field(sa_column=Column(JSONB), default={})

    def model_dump(self, *args, **kwargs) -> dict:
        """Return scenario dict incl. simulation_year and unix timestamp."""
        data = super().model_dump(*args, **kwargs)
        data["simulation_year"] = self.start_date.year
        data["start_date"] = math.trunc(datetime.timestamp(self.start_date))
        return data

    def sqlmodel_update(self, *args, **kwargs) -> SQLModel:
        """Expose `sqlmodel_update` for static analysis helpers."""
        return super().sqlmodel_update(*args, **kwargs)


class TemplateAdmin(ModelView, model=EnTemplateDB):
    column_list = [
        "id",
        "name",
        "description",
        "country",
        "longitude",
        "latitude",
        "unit_currency",
        "unit_energy",
        "unit_co2",
    ]
    name = "Template (EnTemplateDB)"
    icon = "fa-solid fa-diagram-project"
    name_plural = "Templates"
    category = "Templates"
    category_icon = "fa-solid fa-box-open"
    can_view_details = True
    can_edit = True
    can_create = True
    can_delete = True
    can_retrieve = True
    can_export = True


class TemplateScenarioAdmin(ModelView, model=EnTemplateScenarioDB):
    column_list = [
        "id",
        "name",
        "start_date",
        "time_steps",
        "description",
        "interval",
        "template_id",
        "modeling_data",
    ]
    name = "Template Scenario (EnTemplateScenarioDB)"
    icon = "fa-solid fa-timeline"
    name_plural = "Template Scenarios"
    category = "Templates"
    category_icon = "fa-solid fa-box-open"
    can_view_details = True
    can_edit = True
    can_create = True
    can_delete = True
    can_retrieve = True
    can_export = True
