"""
Energy System Simulation Models
===========================

This module provides data models for managing energy system simulations,
including status tracking, execution metadata, and result handling.

The module includes:
    - Simulation status enumeration
    - Base simulation model
    - Database persistence model
    - Status update operations
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class Status(Enum):
    """
    Enumeration of possible simulation states.

    Defines the lifecycle states of a simulation from initiation to completion
    or failure.

    :cvar STARTED: Initial state when simulation begins (value: 1)
    :cvar FINISHED: Successful completion state (value: 2)
    :cvar FAILED: Error or failure state (value: 3)
    :cvar STOPPED: User-initiated termination state (value: 4)
    """
    STARTED = 1
    FINISHED = 2
    FAILED = 3
    STOPPED = 4


class EnSimulation(BaseModel):
    """
    Base simulation model with metadata and status tracking.

    Represents a simulation instance with its various properties, including
    identification, timing, and scenario association.

    :ivar sim_token: Unique token for simulation identification
    :type sim_token: str
    :ivar status: Current simulation status (from Status enum)
    :type status: int
    :ivar status_message: Optional message describing current status
    :type status_message: str | None
    :ivar scenario_id: ID of the associated scenario
    :type scenario_id: int
    """
    sim_token: str
    status: int = Field(default=Status.STARTED.value)
    status_message: str | None = Field(default=None)
    scenario_id: int


class EnSimulationDB(SQLModel, table=True):
    """
    Database model for simulation persistence.

    Extends the base simulation model with additional fields needed for
    database storage and relationship management.

    :ivar id: Primary key for the simulation record
    :type id: int
    :ivar sim_token: Unique token for simulation identification
    :type sim_token: str
    :ivar status: Current status of the simulation
    :type status: int
    :ivar status_message: Optional message describing the current status
    :type status_message: str | None
    :ivar scenario_id: Foreign key to the associated scenario
    :type scenario_id: int
    :ivar start_date: Timestamp when simulation started
    :type start_date: datetime
    :ivar end_date: Timestamp when simulation completed/failed
    :type end_date: datetime | None
    """
    __tablename__ = "simulations"

    id: int | None = Field(default=None, primary_key=True)
    sim_token: str = Field(unique=True, index=True)
    status: int = Field(default=Status.STARTED.value)
    status_message: str | None = Field(default=None)
    scenario_id: int = Field(foreign_key="scenarios.id")
    start_date: datetime = Field(default_factory=datetime.now)
    end_date: datetime | None = Field(default=None)

    class Config:
        arbitrary_types_allowed = True

    def model_dump(self, *args, **kwargs) -> dict:
        """
        Convert simulation model to dictionary representation.

        Handles datetime conversions for timestamps.

        :param args: Additional positional arguments
        :param kwargs: Additional keyword arguments
        :return: Dictionary with simulation data
        :rtype: dict
        """
        dump_data = super().model_dump(*args, **kwargs)
        dump_data["start_date"] = datetime.timestamp(self.start_date)
        dump_data["end_date"] = datetime.timestamp(self.end_date) if self.end_date else None
        return dump_data

    def model_update(self, obj: dict) -> SQLModel:
        """
        Update simulation record with new data.

        Wrapper for SQLModel update operation with type hints.

        :param obj: Dictionary of fields to update
        :type obj: dict
        :return: Updated simulation model
        :rtype: SQLModel
        """
        return super().model_update(obj)


class EnSimulationUpdate(BaseModel):
    """
    Model for simulation status updates.

    Provides a structure for updating simulation status and completion
    information while maintaining data validation.

    :ivar status: New simulation status code
    :type status: int
    :ivar status_message: New status description or error message
    :type status_message: str | None
    :ivar end_date: New completion timestamp
    :type end_date: int | None

    Note:
        Used primarily for status changes and completion recording.
    """
    status: int = Field(nullable=False)
    status_message: str | None = Field(default=None, nullable=True)
    end_date: int | None = Field(default=None, nullable=True)
