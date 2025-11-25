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

from fastapi import APIRouter, Depends
from sqlmodel import Session

from .service import (
    get_all_templates,
    clone_template_to_project,
    delete_template,
    duplicate_template,
    get_template_scenarios,
    get_template_scenario,
)
from ..db import get_db_session
from ..models.base import GeneralDataModel
from ..models.response import DataResponse, MessageResponse
from ..security import oauth2_scheme
from ..user.service import read_user_by_token

templates_router = APIRouter(prefix="/templates", tags=["templates"])


@templates_router.get("/")
async def get_templates_endpoint(db: Session = Depends(get_db_session)) -> DataResponse:
    """
    Retrieve all available templates.

    Lists all templates accessible to the authenticated user. Templates are
    returned with their complete configuration data.

    :return: Response containing list of templates and count
    :rtype: DataResponse
    :raises HTTPException: If not authenticated (401)
    """
    response_list = get_all_templates(db=db)
    return DataResponse(
        data=GeneralDataModel(items=response_list, totalCount=len(response_list)),
        success=True,
    )


@templates_router.get("/{template_id}")
async def get_templates_scenarios_endpoint(
    template_id: int, db: Session = Depends(get_db_session)
) -> DataResponse:
    """
    Retrieve all scenarios for a specific template.

    Lists all scenarios associated with the specified template.

    :param template_id: ID of the template
    :type template_id: int
    :return: Response containing list of scenarios and count
    :rtype: DataResponse
    :raises HTTPException: If template not found (404)
    """
    response_list = get_template_scenarios(template_id=template_id, db=db)

    return DataResponse(
        data=GeneralDataModel(items=response_list, totalCount=len(response_list)),
        success=True,
    )


@templates_router.get("/scenario/{template_scenario_id}")
async def get_template_scenarios_endpoint(
    template_scenario_id: int, db: Session = Depends(get_db_session)
) -> DataResponse:
    """
    Retrieve details for a specific template scenario.

    Provides detailed information about the specified template scenario.

    :param template_scenario_id: ID of the template scenario
    :type template_scenario_id: int
    :return: Response containing scenario details
    :rtype: DataResponse
    :raises HTTPException: If template scenario not found (404)
    """
    response = get_template_scenario(template_scenario_id=template_scenario_id, db=db)

    return DataResponse(
        data=GeneralDataModel(items=[response], totalCount=1),
        success=True,
    )


@templates_router.post("/{template_id}")
async def create_project_from_template_endpoint(
    template_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
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
    user = read_user_by_token(token=token, db=db)

    clone_template_to_project(template_id=template_id, user_id=user.id, db=db)

    return MessageResponse(data="Template cloned to project.", success=True)


@templates_router.delete("/{template_id}")
async def delete_template_endpoint(
    template_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """
    Delete a template.

    Removes a template and its associated data from the database.

    :param template_id: ID of the template to delete
    :type template_id: int
    :param token: Authentication token from OAuth2 scheme
    :type token: str
    :return: Success message with operation result
    :rtype: MessageResponse
    :raises HTTPException: If not authenticated (401) or template not found (404)
    """
    delete_template(template_id=template_id, db=db)

    return MessageResponse(data="Template deleted successfully.", success=True)


@templates_router.post("/{template_id}/duplicate")
async def duplicate_template_endpoint(
    template_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """
    Duplicate a template.

    Creates a copy of an existing template with all its configurations.

    :param template_id: ID of the template to duplicate
    :type template_id: int
    :param token: Authentication token from OAuth2 scheme
    :type token: str
    :return: Success message with operation result
    :rtype: MessageResponse
    :raises HTTPException: If not authenticated (401) or template not found (404)
    """
    duplicate_template(template_id=template_id, db=db)
    return MessageResponse(data="Template duplicated successfully.", success=True)
