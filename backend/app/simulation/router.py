"""
Simulation Router Module
=====================

This module provides API endpoints for managing energy system simulations,
including starting, stopping, and monitoring simulation tasks.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from .service import (
    stop_simulations_for_scenario,
    stop_simulation,
    delete_simulation,
    read_simulation_status,
    read_scenario_simulations,
    read_simulation,
    create_and_start_simulation,
)
from ..db import get_db_session
from ..models.base import GeneralDataModel
from ..models.response import DataResponse, MessageResponse
from ..security import oauth2_scheme
from ..user.service import read_user_by_token

simulation_router = APIRouter(prefix="/simulation", tags=["simulation"])


@simulation_router.post("/start/{scenario_id}", response_model=MessageResponse)
async def start_simulation_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db=Depends(get_db_session),
) -> MessageResponse:
    """
    Start a new simulation for the given scenario.

    :param scenario_id: The scenario to simulate
    :type scenario_id: int
    :param token: Authentication token
    :type token: str
    :param db: Database session
    :type db: Session
    :return: Success message with simulation details
    :rtype: MessageResponse
    """
    user = read_user_by_token(token=token, db=db)

    sim_id, task_id = create_and_start_simulation(
        scenario_id=scenario_id, db=db, user=user
    )

    return MessageResponse(
        data=f"Simulation with id:{sim_id} and task id:{task_id} started.",
        success=True,
    )


@simulation_router.get("/status/{simulation_id}", response_model=MessageResponse)
async def get_simulation_status_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db=Depends(get_db_session),
) -> MessageResponse:
    """
    Get the status of a specific simulation.

    :param simulation_id: The simulation to check
    :param token: Authentication token
    :return: Status message
    """
    user = read_user_by_token(token=token, db=db)

    simulation = read_simulation_status(simulation_id=simulation_id, user=user, db=db)
    return MessageResponse(
        data=f"{simulation.status} -- {simulation.status_message}", success=True
    )


@simulation_router.post("s/stop/{scenario_id}", response_model=MessageResponse)
async def stop_simulations_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db=Depends(get_db_session),
) -> MessageResponse:
    """
    Stop all simulations for a scenario.

    :param scenario_id: The scenario whose simulations to stop
    :param token: Authentication token
    :param db: Database session
    :return: Success message with optional errors
    """
    user = read_user_by_token(token=token, db=db)

    simulations = stop_simulations_for_scenario(
        scenario_id=scenario_id, user=user, db=db
    )

    return MessageResponse(
        data=f"{len(simulations)} Simulation(s) stopped.", success=True
    )


@simulation_router.post("/stop/{simulation_id}", response_model=MessageResponse)
async def stop_simulation_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db=Depends(get_db_session),
) -> MessageResponse:
    """
    Stop a specific simulation.

    :param simulation_id: The simulation to stop
    :param token: Authentication token
    :return: Success message
    """
    user = read_user_by_token(token=token, db=db)

    simulation = stop_simulation(simulation_id=simulation_id, user=user, db=db)
    return MessageResponse(
        data=f"Simulation with id: {simulation.id} and token:{simulation.sim_token} stopped.",
        success=True,
    )


@simulation_router.get("s/{scenario_id}", response_model=DataResponse)
async def get_simulations_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db=Depends(get_db_session),
) -> DataResponse:
    """
    Get all simulations for a scenario.

    :param scenario_id: The scenario to get simulations for
    :param token: Authentication token
    :param db: Database session
    :return: List of simulations
    """
    user = read_user_by_token(token=token, db=db)

    simulations = read_scenario_simulations(scenario_id=scenario_id, user=user, db=db)
    return DataResponse(
        data=GeneralDataModel(
            items=list(simulations),
            totalCount=len(list(simulations)),
        ),
        success=True,
    )


@simulation_router.get("/{simulation_id}", response_model=DataResponse)
async def get_simulation_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db=Depends(get_db_session),
) -> DataResponse:
    """
    Get details of a specific simulation.

    :param simulation_id: The simulation to get
    :param token: Authentication token
    :param db: Database session
    :return: Simulation details
    """
    user = read_user_by_token(token=token, db=db)

    simulation = read_simulation(simulation_id=simulation_id, user=user, db=db)
    return DataResponse(
        data=GeneralDataModel(
            items=[simulation],
            totalCount=1,
        ),
        success=True,
    )


@simulation_router.delete("/{simulation_id}")
async def delete_simulation_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db=Depends(get_db_session),
) -> MessageResponse:
    """
    Delete a simulation.

    :param simulation_id: The simulation to delete
    :param token: Authentication token
    :param db: Database session
    :return: Success message
    """
    user = read_user_by_token(token=token, db=db)

    if delete_simulation(simulation_id=simulation_id, user=user, db=db):
        return MessageResponse(data="Simulation deleted.", success=True)
    else:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Could not delete Simulation."
        )
