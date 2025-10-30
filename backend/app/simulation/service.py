"""
Simulation Service Module
=====================

This module provides service layer functionality for simulation management.
It handles the business logic for simulation operations including:
- Starting and stopping simulations
- Status monitoring
- Simulation data management
"""

from datetime import datetime
from typing import List

from celery import uuid
from celery.worker.control import revoke
from fastapi import HTTPException, Depends
from oemof.tools import logger
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from . import EnSimulationDB, Status
from ..celery import start_task
from ..db import get_db_session
from ..user import EnUserDB
from ..user.service import read_user_by_token


def create_simulation(
    scenario_id: int,
    simulation_token: str = uuid(),
    db: Session = Depends(get_db_session()),
) -> EnSimulationDB:
    # Create new simulation
    simulation = EnSimulationDB(
        sim_token=simulation_token,
        start_date=datetime.now(),
        end_date=None,
        scenario_id=scenario_id,
    )

    db.add(simulation)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity error for create_simulation.",
        ) from exc

    db.refresh(simulation)

    return simulation


def start_simulation(
    simulation_id: int, user: EnUserDB = Depends(read_user_by_token())
) -> tuple[str, str]:
    """
    Start a new simulation for a given scenario.

    :param scenario_id: The scenario ID to simulate
    :param token: Authentication token
    :param db: Database session
    :return: Tuple of (simulation ID, task ID)
    :raises HTTPException: If not authenticated or authorized
    """
    simulation = read_simulation(simulation_id)

    if not user.check_user_rights(scenario_id=simulation.scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    stopped_simulations = stop_simulations_for_scenario(
        scenario_id=simulation.scenario_id
    )
    # for debugging
    print(f"stopped_simulations: {stopped_simulations}")

    task = start_task(simulation=simulation)
    logger.info("Task UUID:", task.id)

    return simulation.id, task.id


def read_simulation_status(simulation_id: int) -> int:
    """
    Get the status of a specific simulation.

    :param simulation_id: The simulation ID
    :param token: Authentication token
    :param db: Database session
    :return: The simulation object
    :raises HTTPException: If simulation not found or not authorized
    """

    return read_simulation(simulation_id).status


def read_simulation(
    simulation_id: int,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> EnSimulationDB:
    """
    Get a specific simulation.

    :param user:
    :param simulation_id: The simulation ID
    :param token: Authentication token
    :param db: Database session
    :return: The simulation
    :raises HTTPException: If not found or not authorized
    """
    simulation = db.exec(
        select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)
    ).first()

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found."
        )

    if not user.check_user_rights(scenario_id=simulation.scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return simulation


def read_scenario_simulations(
    scenario_id: int,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> List[EnSimulationDB] | None:
    """
    Get all simulations for a scenario.

    :param user:
    :param scenario_id: The scenario ID
    :param token: Authentication token
    :param db: Database session
    :return: List of simulations
    :raises HTTPException: If not authorized
    """
    if user.check_user_rights(scenario_id):
        statement = select(EnSimulationDB).where(
            EnSimulationDB.scenario_id == scenario_id
        )

        return list(db.exec(statement).all())
    else:
        return None


def stop_simulation(
    simulation_id: int,
    db: Session = Depends(get_db_session()),
) -> EnSimulationDB:
    """
    Stop a specific simulation.

    :param simulation_id: The simulation ID to stop
    :param token: Authentication token
    :param db: Database session
    :return: The stopped simulation
    :raises HTTPException: If not found or not authorized
    """
    simulation = read_simulation(simulation_id)

    revoke(simulation.sim_token, terminate=True)
    simulation.status = Status.STOPPED.value
    simulation.status_message = "Simulation was canceled by user request."
    simulation.end_date = datetime.now()

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Database integrity error."
        ) from exc

    db.refresh(simulation)

    return simulation


def stop_simulations_for_scenario(
    scenario_id: int, db: Session = Depends(get_db_session())
) -> List[EnSimulationDB]:
    """
    Stop all running simulations for a scenario.

    :param scenario_id: The scenario ID
    :param token: Authentication token
    :param db: Database session
    :return: Tuple of (stopped simulations, error message if multiple found)
    :raises HTTPException: If not authorized or no simulations found
    """
    simulations = read_scenario_simulations(scenario_id)

    for simulation in simulations:
        revoke(simulation.sim_token, terminate=True)
        simulation.status = Status.STOPPED.value
        simulation.status_message = "Simulation was canceled by user request."
        simulation.end_date = datetime.now()

        try:
            db.commit()
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
            )

        db.refresh(simulation)

    return simulations


def delete_simulation(
    simulation_id: int, db: Session = Depends(get_db_session())
) -> None:
    """
    Delete a simulation from the database.

    :param simulation_id: The simulation ID to delete
    :param db: Database session
    """
    simulation = read_simulation(simulation_id)
    if simulation:
        db.delete(simulation)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Database integrity error."
            ) from exc
