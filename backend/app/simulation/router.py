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
    create_simulation,
    start_simulation,
    stop_simulations_for_scenario,
    stop_simulation,
    delete_simulation,
    read_simulation_status,
    read_scenario_simulations,
    read_simulation,
)
from ..models.base import GeneralDataModel
from ..models.response import DataResponse, MessageResponse
from ..security import oauth2_scheme
from ..user.service import read_user_by_token

simulation_router = APIRouter(prefix="/simulation", tags=["simulation"])


@simulation_router.post("/start/{scenario_id}", response_model=MessageResponse)
async def start_simulation_endpoint(
    scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)]
) -> MessageResponse:
    """
    Start a new simulation for the given scenario.

    :param scenario_id: The scenario to simulate
    :param background_tasks: FastAPI background tasks
    :param token: Authentication token
    :param db: Database session
    :return: Success message with simulation details
    """
    user = read_user_by_token(token)

    if not user.check_user_rights(scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
    else:
        simulation = create_simulation(scenario_id=scenario_id)
        sim_id, task_id = start_simulation(simulation_id=simulation.id, user=user)

        return MessageResponse(
            data=f"Simulation with id:{sim_id} and task id:{task_id} started.",
            success=True,
        )


@simulation_router.get("/status/{simulation_id}", response_model=MessageResponse)
async def get_simulation_status_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> MessageResponse:
    """
    Get the status of a specific simulation.

    :param simulation_id: The simulation to check
    :param token: Authentication token
    :return: Status message
    """
    user = read_user_by_token(token)
    if not user.check_user_rights(simulation_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
    else:
        simulation = read_simulation_status(simulation_id, user)
        return MessageResponse(
            data=f"{simulation.status} -- {simulation.status_message}", success=True
        )


@simulation_router.post("s/stop/{scenario_id}", response_model=MessageResponse)
async def stop_simulations_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> MessageResponse:
    """
    Stop all simulations for a scenario.

    :param scenario_id: The scenario whose simulations to stop
    :param token: Authentication token
    :param db: Database session
    :return: Success message with optional errors
    """
    user = read_user_by_token(token)

    if user.check_user_rights(scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    else:
        simulations = stop_simulations_for_scenario(scenario_id=scenario_id, user=user)

        return MessageResponse(
            data=f"{len(simulations)} Simulation(s) stopped.", success=True
        )


@simulation_router.post("/stop/{simulation_id}", response_model=MessageResponse)
async def stop_simulation_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> MessageResponse:
    """
    Stop a specific simulation.

    :param simulation_id: The simulation to stop
    :param token: Authentication token
    :return: Success message
    """
    user = read_user_by_token(token)
    if not user.check_user_rights(simulation_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
    else:
        simulation = stop_simulation(simulation_id=simulation_id, user=user)
        return MessageResponse(
            data=f"Simulation with id: {simulation.id} and token:{simulation.sim_token} stopped.",
            success=True,
        )


@simulation_router.get("s/{scenario_id}", response_model=DataResponse)
async def get_simulations_endpoint(
    scenario_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> DataResponse:
    """
    Get all simulations for a scenario.

    :param scenario_id: The scenario to get simulations for
    :param token: Authentication token
    :param db: Database session
    :return: List of simulations
    """
    user = read_user_by_token(token)

    if not user.check_user_rights(scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
    else:
        simulations = read_scenario_simulations(scenario_id=scenario_id, user=user)
        return DataResponse(
            data=GeneralDataModel(
                items=list(simulations),
                totalCount=len(list(simulations)),
            ),
            success=True,
        )


@simulation_router.get("/{simulation_id}", response_model=DataResponse)
async def get_simulation_endpoint(
    simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)]
) -> DataResponse:
    """
    Get details of a specific simulation.

    :param simulation_id: The simulation to get
    :param token: Authentication token
    :param db: Database session
    :return: Simulation details
    """
    user = read_user_by_token(token)
    if not user.check_user_rights(simulation_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
    else:
        simulation = read_simulation(simulation_id=simulation_id, user=user)
        return DataResponse(
            data=GeneralDataModel(
                items=[simulation],
                totalCount=1,
            ),
            success=True,
        )


@simulation_router.delete("/{simulation_id}")
async def delete_simulation_endpoint(
    simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)]
) -> MessageResponse:
    """
    Delete a simulation.

    :param simulation_id: The simulation to delete
    :param token: Authentication token
    :param db: Database session
    :return: Success message
    """
    user = read_user_by_token(token)

    if not user.check_user_rights(simulation_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
    else:
        delete_simulation(simulation_id=simulation_id, user=user)

        return MessageResponse(data="Simulation deleted.", success=True)
