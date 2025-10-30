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

from pydantic import BaseModel
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
    description: str | None = Field(default=None, min_length=1, max_length=255, nullable=True)
    country: str = Field(min_length=1, max_length=40)
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)


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
    description: str | None = Field(default=None, min_length=1, max_length=255, nullable=True)
    country: str = Field(min_length=1, max_length=40)
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)

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
    country: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    description: str | None = Field(default=None, min_length=1, max_length=255, nullable=True)
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
