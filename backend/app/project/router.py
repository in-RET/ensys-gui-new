"""
Project Router Module
==================

This module provides the API endpoints for project management in the EnSys
application. It handles CRUD operations for projects and their relationships
with scenarios.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from .model import EnProjectUpdate, EnProject
from .service import (
    create_project,
    read_projects,
    read_project,
    update_project,
    delete_project,
    duplicate_project,
)
from ..db import get_db_session
from ..models.base import GeneralDataModel
from ..models.response import DataResponse, MessageResponse
from ..security import oauth2_scheme
from ..user.service import read_user_by_token

projects_router = APIRouter(
    prefix="/project",
    tags=["project"],
)


@projects_router.post("", response_model=DataResponse)
async def create_project_endpoint(
    project_data: EnProject,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """Create a project for the authenticated user.

    - param project_data: project payload
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with created project payload
    """
    user = read_user_by_token(token=token, db=db)
    create_project(project_data=project_data, user=user, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[project_data.model_dump_json()],
            totalCount=1),
        success=True
    )


@projects_router.get("s", response_model=DataResponse)
async def read_projects_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """List all projects owned by the caller.

    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with projects and totalCount
    """
    user = read_user_by_token(token=token, db=db)

    projects_data = read_projects(user=user, db=db)

    return DataResponse(
        data=GeneralDataModel(items=projects_data, totalCount=len(projects_data)),
        success=True,
    )


@projects_router.get("/{project_id}", response_model=DataResponse)
async def read_project_endpoint(
    project_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """Get a single project if the user is authorized.

    - param project_id: id of the project
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with project data
    - raises: HTTPException 401/404 on auth or missing project
    """
    user = read_user_by_token(token=token, db=db)

    if user.check_project_rights(project_id=project_id, db=db):
        project = read_project(project_id=project_id, user=user, db=db)

        return DataResponse(
            data=GeneralDataModel(items=[project.model_dump()], totalCount=1),
            success=True,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized"
        )


@projects_router.patch("/{project_id}", response_model=MessageResponse)
async def update_project_endpoint(
    project_id: int,
    project_data: EnProjectUpdate,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """Update a project the user owns.

    - param project_id: id to update
    - param project_data: partial update payload
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: MessageResponse on success
    """
    user = read_user_by_token(token=token, db=db)

    if user.check_project_rights(project_id=project_id, db=db):
        update_project(
            project_id=project_id, project_data=project_data, user=user, db=db
        )
        return MessageResponse(data="Project Updated.", success=True)
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized"
        )


@projects_router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project_endpoint(
    project_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """Delete a project and its scenarios when authorized.

    - param project_id: id to delete
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: MessageResponse indicating deletion
    """
    user = read_user_by_token(token=token, db=db)

    if user.check_project_rights(project_id=project_id, db=db):
        delete_project(project_id=project_id, user=user, db=db)

        return MessageResponse(
            data="Project deleted and all scenarios deleted.", success=True
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to delete the project.",
        )


@projects_router.post("/duplicate/{project_id}", response_model=DataResponse)
async def duplicate_project_endpoint(
    project_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """Duplicate a project and its scenarios for the owner or a specified user.

    - param project_id: ID of the project to duplicate
    - param token: Authentication token of the requester
    - param db: SQLModel session dependency
    - returns: DataResponse with duplicated project payload
    """
    user = read_user_by_token(token=token, db=db)
    if user.check_project_rights(project_id=project_id, db=db):
        new_proj = duplicate_project(project_id=project_id, user=user, db=db)

        return DataResponse(
            data=GeneralDataModel(
                items=[new_proj.model_dump_json()], totalCount=0),
            success=True,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to duplicate the project.",
        )
