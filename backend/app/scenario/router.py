"""
Scenario Router Module
====================

This module provides the API endpoints for scenario management in the EnSys
application. It handles CRUD operations for energy system scenarios and
their configurations.

The module provides endpoints for:
    - Creating new scenarios
    - Retrieving scenario data
    - Updating scenario configurations
    - Deleting scenarios
    - Duplicating scenarios
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette import status

from .model import EnScenario, EnScenarioUpdate
from .service import (
    create_scenario,
    read_scenarios,
    update_scenario,
    delete_scenario,
    read_scenario,
    duplicate_scenario,
)
from ..db import get_db_session
from ..models.base import GeneralDataModel
from ..models.response import DataResponse, MessageResponse
from ..security import oauth2_scheme
from ..user.service import read_user_by_token

scenario_router = APIRouter(
    prefix="/scenario",
    tags=["scenario"],
)


@scenario_router.post("")
async def create_scenario_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    scenario_data: EnScenario,
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """
    Create a new scenario for a project.

    Validates project ownership and creates a scenario with the provided
    configuration data.

    :param scenario_data: Scenario configuration data
    :type scenario_data: EnScenario
    :return: Response containing the created scenario data
    :rtype: DataResponse
    :raises HTTPException: If user lacks project access rights (401)
    """
    user = read_user_by_token(token=token, db=db)

    scenario = create_scenario(scenario_data=scenario_data, user=user, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[scenario.model_dump(exclude={"energysystem"})],  # type: ignore[call-arg]
            totalCount=1,
        )
    )


@scenario_router.get("s/{project_id}", response_model=DataResponse)
async def read_scenarios_endpoint(
    project_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """
    Retrieve all scenarios for a specific project.

    Returns a list of scenarios associated with the given project ID,
    excluding the detailed energy system modeling data.

    :param project_id: ID of the project whose scenarios to retrieve
    :type project_id: int
    :param token: Authentication token
    :type token: str
    :param db: Database session
    :type db: Session
    :return: Response containing list of scenarios
    :rtype: DataResponse
    :raises HTTPException: If user not authorized to access project (401)
    """
    user = read_user_by_token(token=token, db=db)
    if not user.check_project_rights(project_id=project_id, db=db):  # db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized to access scenarios for this project.",
        )
    else:
        scenarios = read_scenarios(project_id=project_id, db=db)

        response_data = [
            scenario.model_dump(exclude={"modeling_data"}) for scenario in scenarios
        ]
        return DataResponse(
            data=GeneralDataModel(items=response_data, totalCount=len(response_data)),
            success=True,
        )


@scenario_router.get("/{scenario_id}", response_model=DataResponse)
async def read_scenario_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """
    Retrieve a specific scenario by its ID.

    Returns detailed information about a single scenario, excluding the
    energy system modeling data.

    :param scenario_id: ID of the scenario to retrieve
    :type scenario_id: int
    :param token: Authentication token
    :type token: str
    :return: Response containing the scenario data
    :rtype: DataResponse
    :raises HTTPException: If user not authorized to access scenario (401)
    """
    user = read_user_by_token(token=token, db=db)
    print(f"user: {user.id} requests scenario: {scenario_id}")
    if not user.check_scenario_rights(scenario_id=scenario_id, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized to access this scenario.",
        )
    else:
        scenario = read_scenario(scenario_id=scenario_id, user=user, db=db)

        response_data = scenario.model_dump(exclude={})  # type: ignore[call-arg]
        return DataResponse(
            data=GeneralDataModel(items=[response_data], totalCount=1), success=True
        )


@scenario_router.patch("/{scenario_id}")
async def update_scenario_endpoint(
    scenario_id: int,
    scenario_data: EnScenarioUpdate,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """
    Update an existing scenario's configuration.

    Applies partial updates to a scenario's data.

    :param scenario_id: ID of the scenario to update
    :type scenario_id: int
    :param scenario_data: Updated scenario data
    :type scenario_data: EnScenarioUpdate
    :param token: Authentication token
    :type token: str
    :return: Response containing updated scenario data
    :rtype: DataResponse
    :raises HTTPException: If user not authorized to update scenario (401)
    """
    user = read_user_by_token(token=token, db=db)

    if not user.check_scenario_rights(scenario_id=scenario_id, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized to update this scenario.",
        )
    else:
        scenario_updated = update_scenario(
            scenario_id=scenario_id, scenario_data=scenario_data, user=user, db=db
        )

        return DataResponse(
            data=GeneralDataModel(items=[scenario_updated.model_dump()], totalCount=1),
            success=True,
        )


@scenario_router.delete("/{scenario_id}", response_model=MessageResponse)
async def delete_scenario_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """
    Delete a specific scenario.

    Permanently removes a scenario and all its associated data from the system.

    :param db:
    :type db: Session
    :param scenario_id: ID of the scenario to delete
    :type scenario_id: int
    :param token: Authentication token
    :type token: str
    :return: Response confirming successful deletion
    :rtype: MessageResponse
    :raises HTTPException: If user not authorized to delete scenario (401)
    """
    user = read_user_by_token(token=token, db=db)

    if not user.check_scenario_rights(scenario_id=scenario_id, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized to delete this scenario.",
        )
    else:
        delete_scenario(scenario_id=scenario_id, user=user, db=db)

        return MessageResponse(data="Scenario deleted.", success=True)


@scenario_router.post("/duplicate/{scenario_id}")
async def duplicate_scenario_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """
    Duplicate an existing scenario.

    Creates a copy of the specified scenario with all its configuration data
    and energy system settings.

    :param db:
    :type db: Session
    :param scenario_id: ID of the scenario to duplicate
    :type scenario_id: int
    :param token: Authentication token
    :type token: str
    :return: Response containing the new scenario data
    :rtype: DataResponse
    :raises HTTPException: If user not authorized to access scenario (401)
    """
    user = read_user_by_token(token=token, db=db)
    scenario = duplicate_scenario(scenario_id=scenario_id, user=user, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[scenario.model_dump(exclude={"modeling_data"})],
            totalCount=1,
        ),
        success=True,
    )
