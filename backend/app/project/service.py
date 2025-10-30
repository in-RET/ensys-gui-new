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
from typing import List, Optional

from fastapi import HTTPException, Depends
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from . import EnProject, EnProjectDB, EnProjectUpdate
from ..db import get_db_session
from ..scenario import EnScenarioDB
from ..scenario.service import read_scenarios, delete_scenario
from ..user import EnUserDB
from ..user.service import read_user_by_token


def create_project(
    project_data: EnProject,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> None:
    """
    Create a new project for a user.

    :param project_data: Project data to create
    :type project_data: EnProject
    :param current_user: User who will own the project
    :type current_user: EnUserDB
    :param db: Database session
    :type db: Session
    """
    project = EnProjectDB(**project_data.model_dump())
    project.user_id = user.id
    project.date_created = datetime.now()
    project.date_updated = datetime.now()

    db.add(project)
    db.commit()


def read_projects(
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> List[dict]:
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


def read_project(
    project_id: int,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> EnProjectDB:
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
    if not user.check_project_rights(project_id):
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
    project_id: int,
    project_data: EnProjectUpdate,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> EnProjectDB:
    """
    Update an existing project.

    :param project_id: ID of the project to update
    :type project_id: int
    :param project_data: New project data
    :type project_data: EnProjectUpdate
    :param db: Database session
    :type db: Session
    :raises HTTPException: If project not found (404)
    """
    if not user.check_project_rights(project_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to update this project.",
        )
    else:
        project = read_project(project_id)

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


def delete_project(
    project_id: int,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> None:
    """
    Delete a project and all its scenarios.

    :param project_id: ID of the project to delete
    :type project_id: int
    :param token: Authentication token for scenario deletion
    :type token: str
    :param db: Database session
    :type db: Session
    :raises HTTPException: If project not found (404)
    """
    if user.check_project_rights(project_id):
        project = read_project(project_id)

        # Delete all associated scenarios first
        scenarios = read_scenarios(project_id=project_id)
        for scenario in scenarios:
            delete_scenario(scenario.id)

        # Then delete the project
        db.delete(project)
        db.commit()
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to delete this project.",
        )


def duplicate_project(
    project_id: int,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> None:
    """
    Duplicate a project and all its scenarios.

    :param project_id: ID of the project to duplicate
    :type project_id: int
    :param db: Database session
    :type db: Session
    :param user_id: Optional ID of the new owner user
    :type user_id: Optional[int]
    :raises HTTPException: If project not found (404)
    """
    if not user.check_project_rights(project_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You do not have permission to duplicate this project.",
        )
    else:
        project = read_project(project_id)

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
