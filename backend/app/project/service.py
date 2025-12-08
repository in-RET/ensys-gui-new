"""
Project Service Module
===================

This module provides service layer functionality for project management.
It handles the business logic for project operations including:
- Project creation and management
- Project duplication
- Project validation
- Scenario management within projects
"""

from datetime import datetime
from typing import List

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnProject, EnProjectDB, EnProjectUpdate
from ..scenario.model import EnScenarioDB
from ..scenario.service import read_scenarios, delete_scenario
from ..user.model import EnUserDB


def create_project(project_data: EnProject, user: EnUserDB, db: Session) -> None:
    """
    Create a new project for a user.

    Initializes a project with creation and update timestamps, associating
    it with the specified user.

    :param project_data: Project data to create
    :type project_data: EnProject
    :param user: User who will own the project
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    """
    project = EnProjectDB(**project_data.model_dump())
    project.user_id = user.id
    project.date_created = datetime.now()
    project.date_updated = datetime.now()

    db.add(project)
    db.commit()


def read_projects(user: EnUserDB, db: Session) -> List[dict]:
    """
    Retrieve all projects owned by a user.

    :param user: User whose projects to retrieve
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: List of project data dictionaries
    :rtype: List[dict]
    """
    stmt = select(EnProjectDB).where(EnProjectDB.user_id == user.id)
    projects = db.exec(stmt).all()
    return [p.model_dump() for p in projects]


def read_project(project_id: int, user: EnUserDB, db: Session) -> EnProjectDB:
    """
    Retrieve a specific project by ID.

    :param project_id: ID of the project to retrieve
    :type project_id: int
    :param db: Database session
    :type db: Session
    :return: Project database model instance
    :rtype: EnProjectDB
    :raises HTTPException: If project not found (404)
    """
    if not user.check_project_rights(project_id=project_id, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to access this project.",
        )
    else:
        project = db.get(EnProjectDB, project_id)
        if project:
            return project
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found."
            )


def update_project(
    project_id: int, project_data: EnProjectUpdate, user: EnUserDB, db: Session
) -> EnProjectDB:
    """
    Update an existing project.

    Applies partial updates to a project's data and refreshes the update timestamp.

    :param project_id: ID of the project to update
    :type project_id: int
    :param project_data: New project data
    :type project_data: EnProjectUpdate
    :param user: User performing the update
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: Updated project database object
    :rtype: EnProjectDB
    :raises HTTPException: If not authorized (401), project not found (404),
        or database error (409)
    """
    if not user.check_project_rights(project_id=project_id, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to update this project.",
        )
    else:
        project = read_project(project_id, user, db=db)

        update_data = project_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)

        project.date_updated = datetime.now()

        db.add(project)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Could not update project."
            ) from exc

        db.refresh(project)

        return project


def delete_project(project_id: int, user: EnUserDB, db: Session) -> None:
    """
    Delete a project and all its scenarios.

    Performs a cascading delete of all scenarios before removing the project.

    :param project_id: ID of the project to delete
    :type project_id: int
    :param user: Authenticated user deleting the project
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :raises HTTPException: If not authorized (401) or project not found (404)
    """
    if user.check_project_rights(project_id=project_id, db=db):
        project = read_project(project_id=project_id, user=user, db=db)

        # Delete all associated scenarios first
        scenarios = read_scenarios(project_id=project_id, db=db)
        for scenario in scenarios:
            delete_scenario(scenario_id=scenario.id, user=user, db=db)

        # Then delete the project
        db.delete(project)
        db.commit()
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to delete this project.",
        )


def duplicate_project(project_id: int, user: EnUserDB, db: Session) -> None:
    """
    Duplicate a project and all its scenarios.

    Creates a copy of a project with all associated scenarios and configurations.

    :param project_id: ID of the project to duplicate
    :type project_id: int
    :param user: Authenticated user duplicating the project
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :raises HTTPException: If not authorized (401) or project not found (404)
    """
    if not user.check_project_rights(project_id=project_id, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to duplicate this project.",
        )
    else:
        project = read_project(project_id=project_id, user=user, db=db)

        # Create a copy of the project
        new_project_data = project.model_dump()
        new_project_data.pop("id", None)
        new_project_data["user_id"] = user.id if user is not None else project.user_id
        new_project_data["date_created"] = datetime.now()
        new_project_data["date_updated"] = datetime.now()

        new_project = EnProjectDB(**new_project_data)
        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        # Duplicate all associated scenarios
        scenarios = db.exec(
            select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
        ).all()

        for scenario in scenarios:
            new_scenario_data = scenario.model_dump()
            new_scenario_data.pop("id", None)
            new_scenario_data["project_id"] = new_project.id
            new_scenario_data["date_created"] = datetime.now()
            new_scenario_data["date_updated"] = datetime.now()

            new_scenario = EnScenarioDB(**new_scenario_data)
            db.add(new_scenario)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Could not duplicate project.",
            ) from exc
