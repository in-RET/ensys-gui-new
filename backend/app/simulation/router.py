"""
Simulation Router Module
=====================

This module provides API endpoints for managing energy system simulations,
including starting, stopping, and monitoring simulation tasks.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette import status

from . import create_simulation
from .service import (
    start_simulation,
    stop_simulations_for_scenario,
    stop_simulation,
    delete_simulation,
    read_simulation_status,
    read_scenario_simulations,
    read_simulation,
)
from ..db import get_db_session
from ..models import DataResponse, ErrorModel, GeneralDataModel, MessageResponse
from ..security import oauth2_scheme
from ..user import EnUserDB, read_user_by_token

simulation_router = APIRouter(prefix="/simulation", tags=["simulation"])


@simulation_router.post("/start/{scenario_id}", response_model=MessageResponse)
async def start_simulation_endpoint(
    scenario_id: int, user: EnUserDB = Depends(read_user_by_token())
) -> MessageResponse:
    """
    Start a new simulation for the given scenario.

    :param scenario_id: The scenario to simulate
    :param background_tasks: FastAPI background tasks
    :param token: Authentication token
    :param db: Database session
    :return: Success message with simulation details
    """
    if not user.check_user_rights(scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
    else:
        simulation = create_simulation(scenario_id=scenario_id)
        sim_id, task_id = start_simulation(simulation.id)
        return MessageResponse(
            data=f"Simulation with id:{sim_id} and task id:{task_id} started.",
            success=True,
        )


@simulation_router.get("/status/{simulation_id}", response_model=MessageResponse)
async def get_simulation_status_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """
    Get the status of a specific simulation.

    :param simulation_id: The simulation to check
    :param token: Authentication token
    :param db: Database session
    :return: Status message
    """
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = read_simulation_status(simulation_id)
    return MessageResponse(
        data=f"{simulation.status} -- {simulation.status_message}", success=True
    )


@simulation_router.post("s/stop/{scenario_id}", response_model=MessageResponse)
async def stop_simulations_endpoint(
    scenario_id: int,
    user: EnUserDB = Depends(read_user_by_token()),
) -> MessageResponse:
    """
    Stop all simulations for a scenario.

    :param scenario_id: The scenario whose simulations to stop
    :param token: Authentication token
    :param db: Database session
    :return: Success message with optional errors
    """
    if user.check_user_rights(scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    else:
        simulations, error_message = stop_simulations_for_scenario(scenario_id)

        errors = []
        if error_message:
            errors.append(
                ErrorModel(code=status.HTTP_409_CONFLICT, message=error_message)
            )

        return MessageResponse(
            data="Simulation(s) stopped.", success=True, errors=errors
        )


@simulation_router.post("/stop/{simulation_id}", response_model=MessageResponse)
async def stop_simulation_endpoint(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """
    Stop a specific simulation.

    :param simulation_id: The simulation to stop
    :param token: Authentication token
    :param db: Database session
    :return: Success message
    """
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = await stop_simulation(simulation_id, token, db)
    return MessageResponse(
        data=f"Simulation with id:{simulation.sim_token} stopped.",
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
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulations = read_scenario_simulations(scenario_id)
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
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = read_simulation(simulation_id)
    return DataResponse(
        data=GeneralDataModel(
            items=[simulation],
            totalCount=1,
        ),
        success=True,
    )


@simulation_router.delete("/{simulation_id}")
async def delete_simulation_endpoint(
    simulation_id: int, user: EnUserDB = Depends(read_user_by_token())
) -> MessageResponse:
    """
    Delete a simulation.

    :param simulation_id: The simulation to delete
    :param token: Authentication token
    :param db: Database session
    :return: Success message
    """
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to delete the simulation.",
        )
    else:
        delete_simulation(simulation_id)
        return MessageResponse(data="Simulation deleted.", success=True)
