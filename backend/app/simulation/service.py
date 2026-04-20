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

from celery import uuid
from fastapi import HTTPException
from oemof.tools import logger
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnSimulationDB, Status
from ..celery import start_task, celery_app
from ..user.model import EnUserDB


def create_and_start_simulation(
    user: EnUserDB,
    db: Session,
    scenario_id: int,
    simulation_token: str = uuid(),
) -> tuple[int | None, str | None]:
    """Create a simulation entry and enqueue the celery task.

    - param user: authenticated user
    - param scenario_id: scenario to simulate
    - param simulation_token: optional token (auto-generated)
    - param db: SQLModel session
    - returns: tuple of simulation id and celery task id
    - raises: HTTPException 401/409 on auth or db errors
    """
    if not user.check_user_rights(scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    stop_simulations_for_scenario(scenario_id=scenario_id, user=user, db=db)

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

    task = start_task(simulation=simulation)
    logger.info("Task UUID:", task.id)

    return simulation.id, task.id


def read_simulation_status(simulation_id: int, user: EnUserDB, db: Session) -> int:
    """Return the status code for a simulation."""

    return read_simulation(simulation_id=simulation_id, user=user, db=db).status


def read_simulation(
    simulation_id: int,
    user: EnUserDB,
    db: Session,
) -> EnSimulationDB:
    """Fetch a simulation after authorizing access.

    - param simulation_id: target simulation id
    - param user: requesting user
    - param db: SQLModel session
    - returns: `EnSimulationDB`
    - raises: HTTPException 404/401 on missing or unauthorized
    """
    simulation = db.exec(
        select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)
    ).first()

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found."
        )

    if not user.check_user_rights(scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return simulation


def read_scenario_simulations(
    scenario_id: int, user: EnUserDB, db: Session
) -> list[EnSimulationDB] | None:
    """List simulations for a scenario if the user is authorized."""
    if user.check_user_rights(scenario_id=scenario_id, db=db):
        statement = select(EnSimulationDB).where(
            EnSimulationDB.scenario_id == scenario_id
        )

        return list(db.exec(statement).all())
    else:
        return None


def stop_simulation(
    simulation_id: int,
    user: EnUserDB,
    db: Session,
) -> EnSimulationDB:
    """Cancel a running simulation and mark it stopped."""
    simulation = read_simulation(simulation_id=simulation_id, user=user, db=db)

    celery_app.control.revoke(task_id=simulation.sim_token, terminate=True)
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
    scenario_id: int, user: EnUserDB, db: Session, simulation_id: int = None
) -> list[EnSimulationDB]:
    """Revoke running simulations for a scenario and mark them stopped.

    - param scenario_id: scenario whose simulations should stop
    - param user: requesting user
    - param db: SQLModel session
    - param simulation_id: optional id to keep running
    - returns: list of affected simulations
    - raises: HTTPException 401/500 on auth or db errors
    """
    simulations = read_scenario_simulations(scenario_id=scenario_id, user=user, db=db)

    for simulation in simulations:
        if simulation.id != simulation_id or simulation_id is None:
            celery_app.control.revoke(task_id=simulation.sim_token, terminate=True)
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


def delete_simulation(simulation_id: int, user: EnUserDB, db: Session) -> bool:
    """Delete a simulation if the user is authorized.

    - param simulation_id: id to delete
    - param user: requesting user
    - param db: SQLModel session
    - returns: True when deleted
    """
    simulation = read_simulation(simulation_id=simulation_id, user=user, db=db)
    if simulation:
        db.delete(simulation)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            return False

    return True
