"""
Template Models Module
===================

This module provides data models for template management in the EnSys application,
defining the structure and validation rules for reusable energy system templates.

The module includes:
    - Base template model
    - Database persistence model
    - Template update operations
"""

import math
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class EnTemplate(BaseModel):
    """
    Base template model for energy system configurations.

    Defines the core attributes of a template that can be used to generate
    new energy system projects.

    :ivar name: Template identifier (1-100 characters)
    :type name: str
    :ivar description: Optional template details (max 255 characters)
    :type description: str | None
    :ivar country: Location country (1-40 characters)
    :type country: str
    :ivar longitude: Geographical longitude coordinate
    :type longitude: float | None
    :ivar latitude: Geographical latitude coordinate
    :type latitude: float | None
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
    unit_co2: str = Field(default="kg/tCO2", max_length=10, nullable=False)


class EnTemplateDB(SQLModel, table=True):
    """
    Database model for template persistence.

    Extends the base template model with database-specific fields and
    functionality for persistent storage.

    :ivar id: Unique identifier for the template
    :type id: int
    :ivar name: Template name (1-100 characters)
    :type name: str
    :ivar description: Optional template description
    :type description: str | None
    :ivar country: Template's geographic context
    :type country: str
    :ivar longitude: Location longitude
    :type longitude: float | None
    :ivar latitude: Location latitude
    :type latitude: float | None

    Note:
        - Templates serve as blueprints for new projects
        - Geographic coordinates are optional but validated when present
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
    unit_co2: str = Field(default="kg/tCO2", max_length=10, nullable=False)

    def model_dump(self, *args, **kwargs) -> dict:
        """
        Convert template model to dictionary representation.

        :param args: Additional positional arguments
        :param kwargs: Additional keyword arguments
        :return: Dictionary containing template data
        :rtype: dict
        """
        return super().model_dump(*args, **kwargs)


class EnTemplateUpdate(BaseModel):
    """
    Model for template update operations.

    Provides a structure for partial updates to template entities,
    making all fields optional while maintaining validation rules.

    :ivar name: Updated template name (optional)
    :type name: str | None
    :ivar country: Updated country (optional)
    :type country: str | None
    :ivar description: Updated description (optional)
    :type description: str | None
    :ivar longitude: Updated longitude coordinate (optional)
    :type longitude: float | None
    :ivar latitude: Updated latitude coordinate (optional)
    :type latitude: float | None

    Note:
        All fields are nullable to allow partial updates without affecting
        other fields. Validation rules still apply to non-null values.
    """

    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    country: str | None = Field(
        default=None, min_length=1, max_length=100, nullable=True
    )
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
    unit_currency: str | None = Field(default="EUR", max_length=8, nullable=True)
    unit_energy: str | None = Field(default="kW/kWh", max_length=10, nullable=True)
    unit_co2: str | None = Field(default="kg/tCO2", max_length=10, nullable=True)


class EnTemplateScenario(BaseModel):
    """
    Represents an energy scenario with detailed specifications and attributes.

    Models a scenario in an energy system setting, incorporating timing parameters,
    project associations, and energy system modeling data.

    :ivar name: Name of the scenario (1-100 characters)
    :type name: str
    :ivar start_date: Unix timestamp for scenario start
    :type start_date: int
    :ivar time_steps: Number of simulation time steps (default: 8760)
    :type time_steps: int
    :ivar interval: Time step interval in hours (default: 1.0)
    :type interval: float
    :ivar template_id: Associated template identifier
    :type template_id: int
    :ivar modeling_data: Energy system model specification
    :type modeling_data: str
    """

    name: str = Field(min_length=1, max_length=100)
    start_date: int = Field()  # start
    time_steps: int = Field(default=8760)  # number
    interval: float = Field(default=1.0)  # interval
    template_id: int = Field()
    modeling_data: str = Field(default="")

    def model_dump(self, *args, **kwargs) -> dict:
        model_data = super().model_dump(*args, **kwargs)
        if self.start_date:
            model_data["start_date"] = datetime.fromtimestamp(self.start_date)

        return model_data


class EnTemplateScenarioDB(SQLModel, table=True):
    """
    Database model for energy scenario persistence.

    Extends the base scenario model with additional fields needed for database
    storage and scenario management. Includes user associations and JSONB data
    for flexible model storage.

    :ivar id: Unique identifier for the scenario
    :type id: int
    :ivar name: Scenario name (1-100 characters)
    :type name: str
    :ivar start_date: Simulation start datetime
    :type start_date: datetime
    :ivar time_steps: Number of simulation steps
    :type time_steps: int
    :ivar interval: Time step duration in hours
    :type interval: float
    :ivar template_id: Reference to associated template
    :type template_id: int
    :ivar modeling_data: Energy system model in JSONB format
    :type modeling_data: str

    Note:
        - The modeling_data field uses PostgreSQL's JSONB type for efficient
          storage and querying of complex model structures
        - Time steps typically represent hours in a year (8760)
        - Interval defines the granularity of the simulation
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
    interval: float = Field(default=1)
    template_id: int = Field(foreign_key="templates.id")
    modeling_data: str = Field(sa_column=Column(JSONB), default={})

    def model_dump(self, *args, **kwargs) -> dict:
        """
        Convert the scenario model to a dictionary representation.

        Handles timestamp conversion and adds simulation year information.

        :param args: Additional positional arguments for model_dump
        :param kwargs: Additional keyword arguments for model_dump
        :return: Dictionary representation of the scenario
        :rtype: dict
        """
        data = super().model_dump(*args, **kwargs)
        data["simulation_year"] = self.start_date.year
        data["start_date"] = math.trunc(datetime.timestamp(self.start_date))
        return data

    def sqlmodel_update(self, *args, **kwargs) -> SQLModel:
        """
        Update the scenario model with new data.

        Wrapper method to expose sqlmodel_update for type checking.

        :param args: Positional arguments for update
        :param kwargs: Keyword arguments for update
        :return: Updated model instance
        :rtype: SQLModel
        """
        return super().sqlmodel_update(*args, **kwargs)
