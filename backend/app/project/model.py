from datetime import datetime

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class EnProject(BaseModel):
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
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)
    is_favorite: bool = Field(default=False)


class EnProjectDB(SQLModel, table=True):
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
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, min_length=1, max_length=255, nullable=True)
    country: str = Field(min_length=1, max_length=40)
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)
    date_created: datetime = Field()
    date_updated: datetime | None = Field(default=None, nullable=True)
    is_favorite: bool = Field(default=False)

    def model_dump(self, *args, **kwargs):
        model_dump_data = super().model_dump(
            exclude={"user_id", "is_favorite"},
            *args,
            **kwargs
        )

        model_dump_data["date_created"] = datetime.timestamp(self.date_created)
        model_dump_data["date_updated"] = datetime.timestamp(self.date_updated) if self.date_updated else None

        return model_dump_data


class EnProjectUpdate(BaseModel):
    """
    Represents an update to a project entity, inheriting from the base class
    EnProject. This class is used to update specific attributes of a project
    while ensuring input data validation.

    :ivar name: The name of the project, optional. Can be None if not provided.
        Must be a string with a length between 1 and 100 characters if specified.
    :type name: str | None
    :ivar country: The country associated with the project, optional. Can be None
        if not provided. Must be a string with a length between 1 and 100
        characters if specified.
    :type country: str | None
    :ivar description: A description of the project, optional. Can be None if not
        provided. Must be a string with a length between 1 and 255 characters
        if specified.
    :type description: str | None
    :ivar longitude: The longitude coordinate of the project location, optional.
        Can be None if not provided. If specified, must be a float value.
    :type longitude: float | None
    :ivar latitude: The latitude coordinate of the project location, optional.
        Can be None if not provided. If specified, must be a float value.
    :type latitude: float | None
    """
    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    country: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    description: str | None = Field(default=None, min_length=1, max_length=255, nullable=True)
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
    is_favorite: bool | None = Field(default=False, nullable=True)
