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
from ..project.model import EnProjectDB
from ..scenario.model import EnScenarioDB


def get_all_templates(db: Session) -> list[dict]:
    """Fetch all templates as serialized dicts."""
    templates = db.exec(select(EnTemplateDB)).all()
    return [t.model_dump() for t in templates]


def get_template_scenarios(template_id: int, db: Session) -> list[EnTemplateScenarioDB]:
    """Fetch scenarios linked to a template id."""
    scenarios = db.exec(
        select(EnTemplateScenarioDB).where(
            EnTemplateScenarioDB.template_id == template_id
        )
    ).all()

    return scenarios


def get_template_scenario(
    template_scenario_id: int, db: Session
) -> EnTemplateScenarioDB:
    """Return a template scenario by id or 404."""
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
    template_id: int, user_id: int, db: Session
) -> EnProjectDB:
    """Create a project (and scenarios) from a template for a user."""
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

    linked_scenarios = db.exec(
        select(EnTemplateScenarioDB).where(
            EnTemplateScenarioDB.template_id == template_id
        )
    ).all()

    for linked_scenario in linked_scenarios:
        db.add(
            EnScenarioDB(
                name=linked_scenario.name,
                start_date=linked_scenario.start_date,
                time_steps=linked_scenario.time_steps,
                interval=linked_scenario.interval,
                project_id=new_project.id,
                user_id=user_id,
                modeling_data=linked_scenario.modeling_data,
                constraints=linked_scenario.constraints
            )
        )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create scenarios from template; DB constraint violated.",
        )

    return new_project


def validate_template_name(name: str, db: Session) -> bool:
    """Check if a template name is unused."""
    existing = db.exec(select(EnTemplateDB).where(EnTemplateDB.name == name)).first()
    return existing is None


def delete_template(template_id: int, db: Session) -> None:
    """Delete a template by id, raising 404 or 409 on failure."""
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


def duplicate_template(template_id: int, db: Session) -> EnTemplateDB:
    """Create a copy of a template with `(Copy)` suffix."""
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
        unit_currency=template.unit_currency,
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
