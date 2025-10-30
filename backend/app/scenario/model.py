"""
Energy Scenario Models Module
=========================

This module provides data models for energy scenarios in the EnSys application,
defining the structure and validation rules for energy system simulations.

The module includes:
    - Base scenario model with validation
    - Database-specific scenario model
    - Scenario update operations
"""

import math
from datetime import datetime
from typing import TYPE_CHECKING, Annotated

from pydantic import BaseModel
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class EnScenario(BaseModel):
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
    :ivar project_id: Associated project identifier
    :type project_id: int
    :ivar modeling_data: Energy system model specification
    :type modeling_data: str
    """

    name: str = Field(min_length=1, max_length=100)
    start_date: int = Field()  # start
    time_steps: int = Field(default=8760)  # number
    interval: float = Field(default=1.0)  # interval
    project_id: int = Field()
    modeling_data: str = Field(default="")

    def model_dump(self, *args, **kwargs) -> dict:
        model_data = super().model_dump(*args, **kwargs)
        if self.start_date:
            model_data["start_date"] = datetime.fromtimestamp(self.start_date)

        return model_data


class EnScenarioDB(SQLModel, table=True):
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
    :ivar project_id: Reference to associated project
    :type project_id: int
    :ivar user_id: Reference to scenario owner
    :type user_id: int
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

    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    start_date: datetime = Field()
    time_steps: int = Field(default=8760)
    interval: float = Field(default=1)
    project_id: int = Field(foreign_key="projects.id")
    user_id: int = Field(foreign_key="users.id")
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


class EnScenarioUpdate(EnScenario):
    """
    Model for scenario update operations.

    Extends EnScenario to provide a structure for partial updates to scenario
    entities, making all fields optional while maintaining validation rules.

    :ivar name: Updated scenario name (optional)
    :type name: str | None
    :ivar interval: Updated time step interval (optional)
    :type interval: float | None
    :ivar start_date: Updated start date timestamp (optional)
    :type start_date: int | None
    :ivar time_steps: Updated number of time steps (optional)
    :type time_steps: int | None
    :ivar modeling_data: Updated energy system model (optional)
    :type modeling_data: str | None
    :ivar project_id: Updated project reference (optional)
    :type project_id: int | None

    Note:
        All fields are nullable to allow partial updates without affecting
        other fields.
    """

    name: Annotated[
        str | None, Field(default=None, min_length=1, max_length=100, nullable=True)
    ]
    interval: Annotated[float | None, Field(default=1, nullable=True)]
    start_date: Annotated[int | None, Field(default=None, nullable=True)]
    time_steps: Annotated[int | None, Field(default=8760, nullable=True)]
    modeling_data: Annotated[str | None, Field(default=None, nullable=True)]
    project_id: Annotated[None, Field(default=None, nullable=True, repr=False)]


if TYPE_CHECKING:
    # Help static analyzers understand dynamically-created SQLModel attributes
    EnScenarioDB.name: str  # type: ignore[name-defined]
    EnScenarioDB.project_id: int  # type: ignore[name-defined]
    EnScenarioDB.id: int  # type: ignore[name-defined]
    EnScenarioDB.start_date: datetime  # type: ignore[name-defined]
