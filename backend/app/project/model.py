"""Project data models for creation, storage, and updates."""

from datetime import datetime

import math
from pydantic import BaseModel
from sqladmin import ModelView
from sqlmodel import Field, SQLModel


class EnProject(BaseModel):
    """Project payload with name, location, flags, and units."""

    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    country: str = Field(min_length=1, max_length=40)
    longitude: float | None = Field(nullable=True)
    latitude: float | None = Field(nullable=True)
    is_favorite: bool = Field(default=False)
    unit_currency: str = Field(default="EUR", max_length=8, nullable=False)
    unit_energy: str = Field(default="kW/kWh", max_length=10, nullable=False)
    unit_co2: str = Field(default="tCO2", max_length=10, nullable=False)


class EnProjectDB(SQLModel, table=True):
    """DB model for projects with ownership and timestamps."""

    __tablename__ = "projects"

    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    country: str = Field(min_length=1, max_length=40)
    longitude: float | None = Field(nullable=True)
    latitude: float | None = Field(nullable=True)
    is_favorite: bool = Field(default=False)
    date_created: datetime = Field(default_factory=datetime.now)
    date_updated: datetime | None = Field(default_factory=datetime.now)
    unit_currency: str = Field(default="EUR", max_length=8, nullable=False)
    unit_energy: str = Field(default="kW/kWh", max_length=10, nullable=False)
    unit_co2: str = Field(default="tCO2", max_length=10, nullable=False)

    def model_dump(self, *args, **kwargs) -> dict:
        """Return project dict with NaN coords normalized to None."""
        dump_data = super().model_dump(*args, **kwargs)

        # Handle NaN values for coordinates
        if self.longitude and math.isnan(self.longitude):
            dump_data["longitude"] = None
        if self.latitude and math.isnan(self.latitude):
            dump_data["latitude"] = None

        return dump_data

    # Provide explicit sqlmodel_update signature for static analyzers
    def sqlmodel_update(self, *args, **kwargs) -> SQLModel:
        """Expose `sqlmodel_update` for static analysis helpers."""
        return super().sqlmodel_update(*args, **kwargs)


class EnProjectUpdate(BaseModel):
    """Patchable project fields (all optional)."""

    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    country: str | None = Field(
        default=None, min_length=1, max_length=100, nullable=True
    )
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
    is_favorite: bool | None = Field(default=False, nullable=True)
    unit_currency: str | None = Field(default=None, max_length=8, nullable=True)
    unit_energy: str | None = Field(default=None, max_length=10, nullable=True)
    unit_co2: str | None = Field(default=None, max_length=10, nullable=True)


class ProjectAdmin(ModelView, model=EnProjectDB):
    column_list = [
        "id",
        "user_id",
        "name",
        "description",
        "country",
        "longitude",
        "latitude",
        "is_favorite",
        "date_created",
        "date_updated",
        "unit_currency",
        "unit_energy",
        "unit_co2",
    ]
    name = "Project (EnProjectDB)"
    icon = "fa-solid fa-diagram-project"
    name_plural = "Projects"
    category = "Energysystems"
    category_icon = "fa-solid fa-bolt"
    can_view_details = True
    can_edit = True
    can_create = True
    can_delete = True
    can_retrieve = True
    can_export = True
