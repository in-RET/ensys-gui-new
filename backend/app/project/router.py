"""
Project Router Module
==================

This module provides the API endpoints for project management in the EnSys
application. It handles CRUD operations for projects and their relationships
with scenarios.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from . import (
    create_project,
    read_projects,
    read_project,
    update_project,
    delete_project,
    duplicate_project,
    EnProjectUpdate,
    EnProject,
)
from ..models import GeneralDataModel, DataResponse, MessageResponse
from ..user import EnUserDB
from ..user.service import read_user_by_token

projects_router = APIRouter(
    prefix="/project",
    tags=["project"],
)


@projects_router.post("/", response_model=MessageResponse)
async def create_project_endpoint(
    project_data: EnProject, user: EnUserDB = Depends(read_user_by_token())
) -> MessageResponse:
    """
    Create a new project for the authenticated user.

    :param project_data: Project data to create
    :type project_data: EnProject
    :param current_user: Authenticated user creating the project
    :type current_user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: Response message indicating success
    :rtype: MessageResponse

    Note:
        The project is initially owned by the authenticated user and has
        the current timestamp as its creation date.
    """
    create_project(project_data, user)

    return MessageResponse(data="Project created.", success=True)


@projects_router.get("s/", response_model=DataResponse)
async def read_projects_endpoint(
    user: EnUserDB = Depends(read_user_by_token()),
) -> DataResponse:
    """
    Retrieve all projects owned by the authenticated user.

    :param current_user: Authenticated user requesting their projects
    :type current_user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: Response containing the list of projects
    :rtype: DataResponse

    Note:
        This endpoint returns a paginated list of projects.
    """
    projects_data = read_projects(user)

    return DataResponse(
        data=GeneralDataModel(items=projects_data, totalCount=len(projects_data)),
        success=True,
    )


@projects_router.get("/{project_id}", response_model=DataResponse)
async def read_project_endpoint(
    project_id: int,
    user=Depends(read_user_by_token()),
) -> DataResponse:
    """
    Retrieve a specific project by its ID if the requester is the owner.

    :param project_id: ID of the project to retrieve
    :type project_id: int
    :param token: Authentication token of the requester
    :type token: str
    :param db: Database session
    :type db: Session
    :return: Response containing the project data
    :rtype: DataResponse

    Error 404 is raised if the project does not exist.
    """
    if user.check_project_owner(project_id):
        project = read_project(project_id)

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
    user: EnUserDB = Depends(read_user_by_token()),
) -> MessageResponse:
    """
    Update an existing project owned by the authenticated user.

    :param project_id: ID of the project to update
    :type project_id: int
    :param project_data: New data for the project
    :type project_data: EnProjectUpdate
    :param token: Authentication token of the requester
    :type token: str
    :param db: Database session
    :type db: Session
    :return: Response message indicating success
    :rtype: MessageResponse

    Error 404 is raised if the project does not exist.
    """
    if not user.check_project_owner(project_id):
        update_project(project_id, project_data)
        return MessageResponse(data="Project Updated.", success=True)
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized"
        )


@projects_router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project_endpoint(
    project_id: int, user: EnUserDB = Depends(read_user_by_token())
) -> MessageResponse:
    """
    Delete a project and all its associated scenarios.

    :param project_id: ID of the project to delete
    :type project_id: int
    :param token: Authentication token of the requester
    :type token: str
    :param db: Database session
    :type db: Session
    :return: Response message indicating success
    :rtype: MessageResponse

    This operation removes the project and all scenarios linked to it.
    """
    if not user.check_project_owner(project_id):
        delete_project(project_id)

        return MessageResponse(
            data="Project deleted and all scenarios deleted.", success=True
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to delete the project.",
        )


@projects_router.post("/duplicate/{project_id}")
async def duplicate_project_endpoint(
    project_id: int,
    user: EnUserDB = Depends(read_user_by_token()),
) -> MessageResponse:
    """
    Duplicate a project and its scenarios for the owner or a specified user.

    :param project_id: ID of the project to duplicate
    :type project_id: int
    :param token: Authentication token of the requester
    :type token: str
    :param db: Database session
    :type db: Session
    :param user_id: Optional ID of the new owner user
    :type user_id: int
    :return: Response message indicating success
    :rtype: MessageResponse

    The duplication includes all scenarios from the original project.
    """
    if user.check_project_rights(project_id):
        duplicate_project(project_id)

        return MessageResponse(
            data="Project and all scenarios duplicated.", success=True
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to duplicate the project.",
        )
