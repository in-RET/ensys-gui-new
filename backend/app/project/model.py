from datetime import datetime

from sqlmodel import Field, SQLModel


class EnProject(SQLModel):
    """
    Represents a project entity with details regarding its name, description, location,
    energy unit, CO2 unit, currency, geographical coordinates, and favorite status.

    This class is intended to encapsulate core information about a project, such as
    its basic details and metadata, allowing for clear organization and representation
    in a database. The attributes include constraints for data validation.

    :ivar name: The name of the project must be between 1 and 100 characters.
    :type name: Str
    :ivar description: An optional description of the project, up to 255 characters.
    :type description: Str | None
    :ivar country: The country where the project is located, max length of 40 characters.
    :type country: Str
    :ivar unit_energy: The energy unit associated with the project, max length of 10 characters.
    :type unit_energy: Str
    :ivar unit_co2: The CO2 unit associated with the project, max length of 10 characters.
    :type unit_co2: Str
    :ivar currency: The currency used in the project, max length of 8 characters.
    :type currency: Str
    :ivar longitude: The longitude coordinate of the project location. Can be null.
    :type longitude: Float
    :ivar latitude: The latitude coordinate of the project location. Can be null.
    :type latitude: Float
    :ivar is_favorite: Indicates if the project is marked as a favorite. Defaults to False.
    :type is_favorite: Bool
    """
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, min_length=1, max_length=255, nullable=True)
    country: str = Field(min_length=1, max_length=40)
    unit_energy: str = Field(min_length=1, max_length=10)
    unit_co2: str = Field(min_length=1, max_length=10)
    currency: str = Field(min_length=1, max_length=8)
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)
    is_favorite: bool = Field(default=False)
    # viewers: list[int] = Field(default=None, nullable=True)


class EnProjectDB(EnProject, table=True):
    """
    Represents the EnProjectDB entity that defines the structure of the "projects" database
    table and inherits from the EnProject class.

    This class is used to model and manipulate project data within the database, providing
    details such as project ID, associated user ID, creation timestamp, and update timestamp.

    :ivar id: Unique identifier for the project.
    :type id: Int
    :ivar user_id: ID of the user associated with the project.
    :type user_id: Int
    :ivar date_created: Timestamp indicating when the project was created.
    :type date_created: Datetime
    :ivar date_updated: Timestamp indicating when the project was last updated or None if not updated.
    :type date_updated: Datetime | None
    """
    __tablename__ = "projects"

    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    date_created: datetime = Field(default=datetime.now)
    date_updated: datetime | None = Field(default=None)

    def get_return_data(self):
        return self.model_dump(exclude={"user_id"})


class EnProjectUpdate(EnProject):
    """
    Represents an updated project with additional configurable fields.

    This class is a subclass of `EnProject` and is designed to provide
    additional fields and configuration options for a project's update. It
    allows for modification of the project's name, country, energy and CO2
    units, currency, as well as geographical coordinates (longitude and
    latitude).

    :ivar name: Name of the project. This is an optional field that must have
        a length between 1 and 100 characters if provided.
    :ivar country: Country associated with the project. This is an optional
        field that must have a length between 1 and 40 characters if provided.
    :ivar unit_energy: Unit of energy measurement for the project. This is an
        optional field that must have a length between 1 and 10 characters if
        provided.
    :ivar unit_co2: Unit of CO2 measurement for the project. This is an
        optional field that must have a length between 1 and 10 characters if
        provided.
    :ivar currency: Currency used for the project. This is a required field
        that must have a length between 1 and 8 characters.
    :ivar longitude: Longitude value of the project's geographical location.
        This is an optional field.
    :ivar latitude: Latitude value of the project's geographical location.
        This is an optional field.
    """
    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    country: str | None = Field(default=None, min_length=1, max_length=40, nullable=True)
    unit_energy: str | None = Field(default=None, min_length=1, max_length=10, nullable=True)
    unit_co2: str | None = Field(default=None, min_length=1, max_length=10, nullable=True)
    currency: str | None = Field(min_length=1, max_length=8)
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
