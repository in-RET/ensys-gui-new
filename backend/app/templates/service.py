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

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnTemplateDB, EnTemplateScenarioDB
from ..db import SessionLocal
from ..project.model import EnProjectDB


def get_all_templates(db: Session = SessionLocal()) -> list[dict]:
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


def get_template_scenarios(
    template_id: int, db: Session = SessionLocal()
) -> list[EnTemplateScenarioDB]:
    """
    Retrieve all scenarios associated with a specific template.

    Fetches scenarios linked to the given template ID.

    :param template_id: ID of the template to fetch scenarios for
    :type template_id: int
    :param db: Active database session for query execution
    :type db: Session
    :return: List of scenarios associated with the template
    :rtype: list[EnTemplateScenarioDB]
    """

    scenarios = db.exec(
        select(EnTemplateScenarioDB).where(
            EnTemplateScenarioDB.template_id == template_id
        )
    ).all()

    return scenarios


def get_template_scenario(
    template_scenario_id: int, db: Session = SessionLocal()
) -> EnTemplateScenarioDB:
    """
    Retrieve a specific template scenario by its ID.

    Fetches the scenario record corresponding to the provided scenario ID.

    :param template_scenario_id: ID of the template scenario to retrieve
    :type template_scenario_id: int
    :param db: Active database session for query execution
    :type db: Session
    :return: Template scenario record
    :rtype: EnTemplateScenarioDB
    :raises HTTPException: If scenario not found (404)
    """
    scenario = db.exec(
        select(EnTemplateScenarioDB).where(
            EnTemplateScenarioDB.id == template_scenario_id
        )
    ).first()

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template scenario not found.",
        )

    return scenario


def clone_template_to_project(
    template_id: int, user_id: int, db: Session = SessionLocal()
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


def validate_template_name(name: str, db: Session = SessionLocal()) -> bool:
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


def delete_template(template_id: int, db: Session = SessionLocal()) -> None:
    """
    Delete a template from the database.

    Removes a template and all its associated data.

    :param template_id: ID of the template to delete
    :type template_id: int
    :param db: Database session for transaction
    :type db: Session
    :raises HTTPException: If template not found (404)
    """
    template = db.exec(
        select(EnTemplateDB).where(EnTemplateDB.id == template_id)
    ).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Template not found."
        )

    db.delete(template)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not delete template; DB constraint violated.",
        )


def duplicate_template(template_id: int, db: Session = SessionLocal()) -> EnTemplateDB:
    """
    Duplicate an existing template.

    Creates a copy of a template with all its configurations.

    :param template_id: ID of the template to duplicate
    :type template_id: int
    :param db: Database session for transaction
    :type db: Session
    :return: Newly created template instance
    :rtype: EnTemplateDB
    :raises HTTPException: If template not found (404) or constraint violations (409)
    """
    template = db.exec(
        select(EnTemplateDB).where(EnTemplateDB.id == template_id)
    ).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Template not found."
        )

    # Create a copy with a new name
    new_template = EnTemplateDB(
        name=f"{template.name} (Copy)",
        description=template.description,
        country=template.country,
        longitude=template.longitude,
        latitude=template.latitude,
        currency=template.currency,
        unit_energy=template.unit_energy,
        unit_co2=template.unit_co2,
    )

    db.add(new_template)
    try:
        db.commit()
        db.refresh(new_template)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not duplicate template; DB constraint violated.",
        )

    return new_template
