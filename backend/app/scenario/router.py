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


@scenario_router.post("", response_model=DataResponse)
async def create_scenario_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    scenario_data: EnScenario,
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """Create a scenario for a project owned by the caller.

    - param token: bearer token from OAuth2
    - param scenario_data: scenario payload
    - param db: SQLModel session dependency
    - returns: DataResponse with created scenario (without modeling_data)
    """
    user = read_user_by_token(token=token, db=db)

    scenario = create_scenario(scenario_data=scenario_data, user=user, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[scenario.model_dump(exclude={"modeling_data"})],  # type: ignore[call-arg]
            totalCount=1,
        )
    )


@scenario_router.get("s/{project_id}", response_model=DataResponse)
async def read_scenarios_endpoint(
    project_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """List scenarios for a project the user can access.

    - param project_id: project id to filter scenarios
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with scenarios (without modeling_data)
    - raises: HTTPException 401 on unauthorized access
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
    """Fetch a single scenario by id.

    - param scenario_id: scenario id to fetch
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with the scenario
    - raises: HTTPException 401/404 on unauthorized or missing
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
    """Apply partial updates to a scenario the user owns.

    - param scenario_id: scenario id to update
    - param scenario_data: partial update payload
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with updated scenario
    """
    user = read_user_by_token(token=token, db=db)

    scenario = update_scenario(
        scenario_id=scenario_id,
        scenario_data=scenario_data,
        user=user,
        db=db
    )

    return DataResponse(
        data=GeneralDataModel(
            items=[scenario.model_dump()],
            totalCount=1
        )
    )


@scenario_router.delete("/{scenario_id}")
async def delete_scenario_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """Delete a scenario the user can access.

    - param scenario_id: scenario id to delete
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: MessageResponse confirming deletion
    - raises: HTTPException 401 on unauthorized access
    """
    user = read_user_by_token(token=token, db=db)

    delete_success = delete_scenario(scenario_id=scenario_id, user=user, db=db)

    return MessageResponse(
        data=f"Scenario {scenario_id} has been deleted",
        success=delete_success,
    )


@scenario_router.post("/duplicate/{scenario_id}")
async def duplicate_scenario_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """Duplicate a scenario and return the copy.

    - param scenario_id: scenario id to duplicate
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with duplicated scenario
    - raises: HTTPException 401 on unauthorized access
    """
    user = read_user_by_token(token=token, db=db)

    scenario = duplicate_scenario(scenario_id=scenario_id, user=user, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[scenario.model_dump()],
            totalCount=1
        )
    )
