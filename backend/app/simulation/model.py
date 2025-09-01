from datetime import datetime
from enum import Enum

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class Status(Enum):
    STARTED = "Started"
    FINISHED = "Finished"
    FAILED = "Failed"
    CANCELED = "Canceled"


class EnSimulation(BaseModel):
    """
    Represents the simulation entity in the application.

    The `EnSimulation` class models a simulation instance with its various
    properties, including token, status, start and end dates, and
    association to a specific scenario. It provides a structured
    representation of simulation for storing and retrieving purposes.

    :ivar sim_token: Unique token identifying the simulation.
    :type sim_token: str
    :ivar status: Current status of the simulation, e.g., started, completed.
    :type status: str
    :ivar start_date: Date and time when the simulation was started.
    :type start_date: datetime
    :ivar end_date: Date and time when the simulation was ended (optional).
    :type end_date: datetime | None
    :ivar scenario_id: Identifier of the related scenario in the database.
    :type scenario_id: int
    """
    sim_token: str = Field(nullable=False)
    status: str = Field(default=Status.STARTED.value, nullable=False)
    start_date: datetime = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=True)
    scenario_id: int = Field(default=None, nullable=False, foreign_key="scenarios.id")


class EnSimulationDB(SQLModel, table=True):
    """
    Representation of a simulation entry in the database.

    This class defines the data structure and table mapping for
    simulation entries in the database. It includes fields
    for basic simulation attributes such as its unique identifier,
    status, dates, and related scenario. This model is used to
    manage and interact with the simulation data persisted in the
    database.

    :ivar id: Unique identifier for the simulation.
    :type id: int
    :ivar sim_token: Token associated with the simulation, used for
        identification or access.
    :type sim_token: str
    :ivar status: Current status of the simulation. Default is
        `Status.STARTED.value`.
    :type status: str
    :ivar start_date: Date and time when the simulation started.
    :type start_date: datetime
    :ivar end_date: Date and time when the simulation ended, if available.
    :type end_date: datetime | None
    :ivar scenario_id: Identifier of the related scenario. Links the
        simulation record to a scenario in the database.
    :type scenario_id: int
    """
    __tablename__ = "simulations"

    id: int = Field(default=None, primary_key=True)
    sim_token: str = Field(nullable=False)
    status: str = Field(default=Status.STARTED.value, nullable=False)
    start_date: datetime = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=True)
    scenario_id: int = Field(default=None, nullable=False, foreign_key="scenarios.id")


class EnSimulationUpdate(SQLModel):
    """
    Represents an energy simulation update model used to track the status
    and completion date of a simulation.

    This class models the data structure for storing information about an
    energy simulation's current status and its potential end date. It
    inherits from SQLModel to enable database interactions and data
    serialization.

    :ivar status: Indicates the current status of the energy simulation.
    :type status: str
    :ivar end_date: Represents the simulation's end date if available.
    :type end_date: datetime | None
    """
    status: str = Field(nullable=False)
    end_date: datetime | None = Field(default=None, nullable=True)
