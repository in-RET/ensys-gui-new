"""
Template Service Module
====================

This module provides service layer functionality for managing templates and
their conversion into projects. It handles template retrieval, cloning,
and project generation operations.

The module provides:
    - Template listing and retrieval
    - Template to project conversion
    - Data validation and error handling
"""

from datetime import datetime

from fastapi import HTTPException, Depends
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from . import EnTemplateDB
from ..db import get_db_session
from ..project import EnProjectDB


def get_all_templates(db: Session = Depends(get_db_session())) -> list[dict]:
    """
    Retrieve all available templates from the database.

    Fetches and serializes all template records for presentation or processing.

    :param db: Active database session for query execution
    :type db: Session
    :return: List of serialized template records
    :rtype: list[dict]
    """
    templates = db.exec(select(EnTemplateDB)).all()
    return [t.model_dump() for t in templates]


def clone_template_to_project(
    template_id: int, user_id: int, db: Session = Depends(get_db_session())
) -> EnProjectDB:
    """
    Generate a new project from a template.

    Creates a new project instance based on a template's configuration,
    associating it with the specified user and copying all relevant template
    data.

    :param template_id: Template to clone
    :type template_id: int
    :param user_id: User who will own the new project
    :type user_id: int
    :param db: Database session for transaction
    :type db: Session
    :return: Newly created project instance
    :rtype: EnProjectDB
    :raises HTTPException: For template not found (404) or constraint violations (409)

    Note:
        - Creates a new project with fresh IDs
        - Maintains template metadata in project
        - Sets creation timestamp to current time
    """
    template = db.exec(
        select(EnTemplateDB).where(EnTemplateDB.id == template_id)
    ).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Template not found."
        )

    new_project = EnProjectDB(
        user_id=user_id,
        name=template.name,
        description=template.description,
        country=template.country,
        longitude=template.longitude,
        latitude=template.latitude,
        date_created=datetime.now(),
    )

    db.add(new_project)
    try:
        db.commit()
        db.refresh(new_project)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create project; DB constraint violated.",
        )

    return new_project


def validate_template_name(name: str, db: Session = Depends(get_db_session())) -> bool:
    """
    Verify template name uniqueness.

    Checks if a template name is available for use, ensuring no duplicates
    exist in the system.

    :param name: Proposed template name
    :type name: str
    :param db: Database session for query
    :type db: Session
    :return: True if name is unique, False otherwise
    :rtype: bool
    """
    existing = db.exec(select(EnTemplateDB).where(EnTemplateDB.name == name)).first()
    return existing is None
