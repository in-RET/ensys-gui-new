"""
Project Models Module
==================

This module provides data models for project management in the EnSys application,
defining the structure and validation rules for energy system projects.

The module includes:
    - Base project model with validation
    - Database-specific project model
    - Project update operations
"""

import math
from datetime import datetime

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class EnProject(BaseModel):
    """
    Represents a project entity with details regarding its name, description, location,
    and metadata.

    This class is intended to encapsulate core information about a project, such as
    its basic details and metadata, allowing for clear organization and representation
    in a database. The attributes include constraints for data validation.

    :ivar name: The name of the project must be between 1 and 100 characters
    :type name: str
    :ivar description: Optional description of the project, up to 255 characters
    :type description: str | None
    :ivar country: The country where the project is located, max 40 characters
    :type country: str
    :ivar longitude: The longitude coordinate of the project location
    :type longitude: float | None
    :ivar latitude: The latitude coordinate of the project location
    :type latitude: float | None
    :ivar is_favorite: Whether the project is marked as favorite
    :type is_favorite: bool
    """

    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    country: str = Field(min_length=1, max_length=40)
    longitude: float | None = Field(nullable=True)
    latitude: float | None = Field(nullable=True)
    is_favorite: bool = Field(default=False)


class EnProjectDB(SQLModel, table=True):
    """
    Database model for project persistence.

    Extends the base project model with additional fields needed for database
    storage and project management. Includes timestamps and user associations.

    :ivar id: Unique identifier for the project
    :type id: int
    :ivar user_id: ID of the user who owns the project
    :type user_id: int
    :ivar name: Project name (1-100 characters)
    :type name: str
    :ivar description: Optional project description
    :type description: str | None
    :ivar country: Project location country
    :type country: str
    :ivar longitude: Geographical longitude
    :type longitude: float | None
    :ivar latitude: Geographical latitude
    :type latitude: float | None
    :ivar is_favorite: Favorite status flag
    :type is_favorite: bool
    :ivar date_created: Timestamp of project creation
    :type date_created: datetime
    :ivar date_updated: Timestamp of last update
    :type date_updated: datetime

    Note:
        - Project coordinates (longitude/latitude) are optional but should be valid
          when provided
        - Updates to the project automatically set the date_updated field
    """

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

    def model_dump(self, *args, **kwargs) -> dict:
        """
        Convert the project model to a dictionary representation.

        Handles special formatting of geographical coordinates and timestamps.

        :param args: Additional positional arguments for model_dump
        :param kwargs: Additional keyword arguments for model_dump
        :return: Dictionary representation of the project
        :rtype: dict
        """
        dump_data = super().model_dump(*args, **kwargs)

        # Handle NaN values for coordinates
        if self.longitude and math.isnan(self.longitude):
            dump_data["longitude"] = None
        if self.latitude and math.isnan(self.latitude):
            dump_data["latitude"] = None

        return dump_data

    # Provide explicit sqlmodel_update signature for static analyzers
    def sqlmodel_update(self, *args, **kwargs) -> SQLModel:
        """Wrapper to expose the sqlmodel_update signature for static analysis."""
        return super().sqlmodel_update(*args, **kwargs)


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
    country: str | None = Field(
        default=None, min_length=1, max_length=100, nullable=True
    )
    description: str | None = Field(
        default=None, min_length=1, max_length=255, nullable=True
    )
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
    is_favorite: bool | None = Field(default=False, nullable=True)
