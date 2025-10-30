"""
Template Router Module
===================

This module provides the API endpoints for template management in the EnSys
application. It handles template listing and project creation from templates.

The module provides endpoints for:
    - Retrieving available templates
    - Creating new projects from templates
    - Template access control
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette import status

from . import get_all_templates, clone_template_to_project
from ..db import get_db_session
from ..models import DataResponse, MessageResponse, GeneralDataModel
from ..security import oauth2_scheme
from ..user import read_user_by_token, EnUserDB

templates_router = APIRouter(prefix="/templates", tags=["templates"])


@templates_router.get("/")
async def get_templates(
    token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)
) -> DataResponse:
    """
    Retrieve all available templates.

    Lists all templates accessible to the authenticated user. Templates are
    returned with their complete configuration data.

    :param token: Authentication token from OAuth2 scheme
    :type token: str
    :param db: Database session for queries
    :type db: Session
    :return: Response containing list of templates and count
    :rtype: DataResponse
    :raises HTTPException: If not authenticated (401)
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated."
        )

    response_list = get_all_templates(db)

    return DataResponse(
        data=GeneralDataModel(items=response_list, totalCount=len(response_list)),
        success=True,
    )


@templates_router.post("/{template_id}")
async def create_project_from_template(
    template_id: int, user: EnUserDB = Depends(read_user_by_token())
) -> MessageResponse:
    """
    Create a new project from a template.

    Generates a new project instance based on the specified template,
    associating it with the authenticated user.

    :param template_id: ID of the template to use
    :type template_id: int
    :param token: Authentication token from OAuth2 scheme
    :type token: str
    :param db: Database session for transaction
    :type db: Session
    :return: Success message with operation result
    :rtype: MessageResponse
    :raises HTTPException: If not authenticated (401) or template not found (404)

    Note:
        - Creates a new project with unique ID
        - Copies all template configurations
        - Associates project with current user
    """
    clone_template_to_project(template_id=template_id, user_id=user.id)

    return MessageResponse(data="Template cloned to project.", success=True)
