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
from fastapi import HTTPException
from oemof.tools import logger
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnSimulationDB, Status
from ..celery import start_task
from ..db import SessionLocal
from ..user.model import EnUserDB


def create_simulation(
    scenario_id: int,
    simulation_token: str = uuid(),
    db: Session = SessionLocal(),
) -> EnSimulationDB:
    """
    Create a new simulation record for a scenario.

    Initializes a simulation database entry with the provided or generated
    token, associating it with a specific scenario.

    :param scenario_id: ID of the scenario to simulate
    :type scenario_id: int
    :param simulation_token: Unique token for the simulation (auto-generated if not provided)
    :type simulation_token: str
    :param db: Database session for transaction
    :type db: Session
    :return: Created simulation database object
    :rtype: EnSimulationDB
    :raises HTTPException: If database integrity error occurs (409)
    """
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
    simulation_id: int, user: EnUserDB
) -> tuple[int | None, str | None]:
    """
    Start a new simulation for a given scenario.

    Validates user authorization, stops any running simulations for the scenario,
    and initiates a new simulation task.

    :param simulation_id: The simulation ID to start
    :type simulation_id: int
    :param user: Authenticated user starting the simulation
    :type user: EnUserDB
    :return: Tuple of (simulation ID, task ID)
    :rtype: tuple[int | None, str | None]
    :raises HTTPException: If not authenticated or authorized (401)
    """
    simulation = read_simulation(simulation_id, user)

    if not user.check_user_rights(scenario_id=simulation.scenario_id):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    stopped_simulations = stop_simulations_for_scenario(
        scenario_id=simulation.scenario_id, user=user
    )
    # for debugging
    print(f"stopped_simulations: {stopped_simulations}")

    task = start_task(simulation=simulation)
    logger.info("Task UUID:", task.id)

    return simulation.id, task.id


def read_simulation_status(simulation_id: int, user: EnUserDB) -> int:
    """
        Get the status of a specific simulation.
    ®
        Retrieves the current status code of a simulation.

        :param simulation_id: The simulation ID
        :type simulation_id: int
        :param user: Authenticated user requesting the status
        :type user: EnUserDB
        :return: The simulation status code
        :rtype: int
        :raises HTTPException: If simulation not found or not authorized
    """

    return read_simulation(simulation_id, user).status


def read_simulation(
    simulation_id: int,
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> EnSimulationDB:
    """
    Get a specific simulation.

    Retrieves a simulation by ID and validates user authorization.

    :param simulation_id: The simulation ID
    :type simulation_id: int
    :param user: Authenticated user requesting the simulation
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: The simulation database object
    :rtype: EnSimulationDB
    :raises HTTPException: If not found (404) or not authorized (401)
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
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> List[EnSimulationDB] | None:
    """
    Get all simulations for a scenario.

    Retrieves all simulation records associated with a specific scenario
    if the user has authorization.

    :param scenario_id: The scenario ID
    :type scenario_id: int
    :param user: Authenticated user requesting the simulations
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: List of simulations or None if not authorized
    :rtype: List[EnSimulationDB] | None
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
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> EnSimulationDB:
    """
    Stop a specific simulation.

    Revokes the running simulation task and updates its status to stopped.

    :param simulation_id: The simulation ID to stop
    :type simulation_id: int
    :param user: Authenticated user stopping the simulation
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: The stopped simulation database object
    :rtype: EnSimulationDB
    :raises HTTPException: If not found (404), not authorized (401),
        or database error (409)
    """
    simulation = read_simulation(simulation_id, user)

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
    scenario_id: int, user: EnUserDB, db: Session = SessionLocal()
) -> List[EnSimulationDB]:
    """
    Stop all running simulations for a scenario.

    Revokes all active simulation tasks for a given scenario and updates
    their status to stopped.

    :param scenario_id: The scenario ID
    :type scenario_id: int
    :param user: Authenticated user stopping the simulations
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: List of stopped simulations
    :rtype: List[EnSimulationDB]
    :raises HTTPException: If not authorized (401) or database error (500)
    """
    simulations = read_scenario_simulations(scenario_id=scenario_id, user=user)

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
    simulation_id: int, user: EnUserDB, db: Session = SessionLocal()
) -> None:
    """
    Delete a simulation from the database.

    Permanently removes a simulation record and all associated data.

    :param simulation_id: The simulation ID to delete
    :type simulation_id: int
    :param user: Authenticated user deleting the simulation
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :raises HTTPException: If not found (404), not authorized (401),
        or database error (409)
    """
    simulation = read_simulation(simulation_id, user)
    if simulation:
        db.delete(simulation)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Database integrity error."
            ) from exc
