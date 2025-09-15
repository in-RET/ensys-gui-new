from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from ensys.components.energysystem import EnEnergysystem


class EnScenario(BaseModel):
    """
    Represents an energy scenario with detailed specifications and attributes.

    The EnScenario class models a scenario in an energy system setting, incorporating
    various attributes such as name, start date, time steps, interval, and associated
    energy system models. This facilitates structured handling of scenario data within
    an energy modeling system.

    :ivar name: Name of the energy scenario. Must be between 1 and 100 characters.
    :type name: Str
    :ivar start_date: The starting date for the scenario. Defaults to the current date.
    :type start_date: Date
    :ivar time_steps: The number of time steps in the scenario. Can be None for no specific
                      limit or defaults to 8760.
    :type time_steps: Int | None
    :ivar interval: The interval between each time step in hours. Defaults to 1.0.
    :type interval: Float
    :ivar project_id: Identifier for the project to which the scenario belongs.
    :type project_id: Int
    :ivar modeling_data: The associated energy system model for the scenario.
    :type modeling_data: JSONB
    """
    name: str = Field(min_length=1, max_length=100)
    start_date: int = Field()  # start
    time_steps: int = Field(default=8760)  # number
    interval: float = Field(default=1.0)  # interval
    project_id: int = Field()
    modeling_data: str = Field(default="")


class EnScenarioDB(SQLModel, table=True):
    """
    Represents the database model for energy scenario information.

    This class defines a database model for storing information about
    energy scenarios. It uses SQLModel with table mapping enabled
    to represent the corresponding table in the database. The class
    includes various fields that describe properties of the energy
    scenario, such as its name, associated project and user IDs, start
    date, time steps, and other relevant details.

    :ivar id: Primary key of the scenario record.
    :type id: Int
    :ivar name: Name of the energy scenario must be between 1 and 100
        characters in length.
    :type name: Str
    :ivar start_date: Start date of the energy scenario. This is a required
        field.
    :type start_date: Date
    :ivar time_steps: Number of time steps in the energy scenario.
        Defaults to 8760 if not provided and is nullable.
    :type time_steps: Int | None
    :ivar interval: Time interval associated with the energy scenario.
        Defaults to 1.
    :type interval: Float
    :ivar project_id: Foreign key referencing the associated project for
        the scenario.
    :type project_id: Int
    :ivar user_id: Foreign key referencing the user associated with the
        scenario.
    :type user_id: Int
    :ivar modeling_data: JSONB column storing the energy system
        model associated with the scenario. Defaults to an empty
        dictionary.
    :type modeling_data: Str
    """

    class Config:
        arbitrary_types_allowed = True

    __tablename__ = "scenarios"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    start_date: datetime = Field()
    time_steps: int = Field(default=8760)
    interval: float = Field(default=1)
    project_id: int = Field(foreign_key="projects.id")
    user_id: int = Field(foreign_key="users.id")
    modeling_data: str = Field(sa_column=Column(JSONB), default={})

    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        data["simulation_year"] = self.start_date.year
        data["start_date"] = datetime.timestamp(self.start_date)

        return data


class EnScenarioUpdate(EnScenario):
    """
    Represents an updated energy scenario with validated parameters.

    This class extends the functionality of the `EnScenario` class to allow for
    scenario updates with specific attributes constrained by validation requirements.
    It is primarily used for defining and updating the parameters of an energy simulation
    scenario, ensuring proper formats and validations such as field lengths and data type
    constraints.

    :ivar name: Optional name of the scenario, which must be a string with a
        minimum length of 1 character and a maximum length of 100 characters.
    :type name: Str | None
    :ivar interval: Optional interval defining the time step size, where the value
        is a float.
    :type interval: Float | None
    :ivar start_date: Optional start date for the scenario, represented as a date object.
    :type start_date: Date | None
    :ivar time_steps: Optional total number of time steps in the simulation.
    :type time_steps: Int | None
    :ivar modeling_data: All modeling data from the graphical user interface generated by drawflow.
    :type modeling_data: str | None
    """
    name: Annotated[str | None, Field(default=None, min_length=1, max_length=100, nullable=True)]
    interval: Annotated[float | None, Field(default=1, nullable=True)]
    start_date: Annotated[int | None, Field(default=None, nullable=True)]
    time_steps: Annotated[int | None, Field(default=8760, nullable=True)]
    modeling_data: Annotated[str | None, Field(default=None, nullable=True)]
    project_id: Annotated[None, Field(default=None, nullable=True, repr=False)]
    # user_id: None = Field(default=None, nullable=True, repr=False)
