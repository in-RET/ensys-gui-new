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
from ..scenario.service import read_scenarios, delete_scenario, duplicate_scenario
from ..user.model import EnUserDB


def create_project(project_data: EnProject, user: EnUserDB, db: Session) -> None:
    """Create a project for the given user.

    - param project_data: validated project payload
    - param user: owner
    - param db: SQLModel session
    """
    project = EnProjectDB(**project_data.model_dump())
    project.user_id = user.id
    project.date_created = datetime.now()
    project.date_updated = datetime.now()

    db.add(project)
    db.commit()


def read_projects(user: EnUserDB, db: Session) -> List[dict]:
    """Return all projects owned by the user."""
    stmt = select(EnProjectDB).where(EnProjectDB.user_id == user.id)
    projects = db.exec(stmt).all()
    return [p.model_dump() for p in projects]


def read_project(project_id: int, user: EnUserDB, db: Session) -> EnProjectDB:
    """Fetch a project after checking ownership.

    - raises: HTTPException 401/404 on unauthorized or missing project
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
    """Apply partial updates to a project the user owns.

    - returns: updated project
    - raises: HTTPException 401/404/409 on auth or db issues
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
    """Delete a project and its scenarios after auth checks."""
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


def duplicate_project(project_id: int, user: EnUserDB, db: Session) -> EnProjectDB:
    """Clone a project with all its scenarios for the same user."""
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
            duplicate_scenario(
                scenario_id=scenario.id,
                new_project_id=new_project.id,
                user=user,
                db=db
            )

        try:
            db.commit()
            db.refresh(new_project)

            return new_project
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Could not duplicate project.",
            ) from exc
