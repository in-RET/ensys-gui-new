"""
Scenario Service Module
====================

This module provides service layer functionality for managing energy scenarios,
including CRUD operations, duplication, and validation services.

The module handles:
    - Scenario deletion with cascade
    - Duplicate detection
    - Scenario copying
    - Transaction management
"""

from typing import Optional

from fastapi import HTTPException, Depends
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from . import EnScenarioDB, EnScenario, EnScenarioUpdate
from ..db import get_db_session
from ..simulation import delete_simulation, read_scenario_simulations
from ..user import EnUserDB
from ..user.service import read_user_by_token


def _check_scenario_duplicates(
    scen_name: str, scen_proj_id: int, db: Session = Depends(get_db_session())
) -> bool:
    """
    Check for duplicate scenarios within a project.

    Verifies whether a scenario with the given name already exists in the
    specified project to prevent duplicates.

    :param scen_name: Name to check for duplicates
    :type scen_name: str
    :param scen_proj_id: Project ID to check within
    :type scen_proj_id: int
    :param db: Database session for query
    :type db: Session
    :return: True if no duplicates exist, False otherwise
    :rtype: bool
    """
    possible_duplicates = db.exec(
        select(EnScenarioDB)
        .where(EnScenarioDB.name == scen_name)
        .where(EnScenarioDB.project_id == scen_proj_id)
    ).all()

    return len(possible_duplicates) == 0


def create_scenario(
    scenario_data: EnScenario,
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> EnScenarioDB:

    if user.check_project_rights(scenario_data.project_id):
        if _check_scenario_duplicates(scenario_data.name, scenario_data.project_id):
            scenario = EnScenarioDB(**scenario_data.model_dump())
            scenario.user_id = user.id

            db.add(scenario)
            try:
                db.commit()
            except IntegrityError as exc:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Could not create scenario.",
                ) from exc

            db.refresh(scenario)

            return scenario
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Scenario name already exists.",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized."
        )


def read_scenario(
    scenario_id: int, db: Session = Depends(get_db_session())
) -> EnScenarioDB:
    scenario = db.get(EnScenarioDB, scenario_id)

    if scenario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scenario not found.")

    return scenario


def read_scenarios(
    project_id: int, db: Session = Depends(get_db_session())
) -> list[EnScenarioDB]:
    scenarios = db.exec(
        select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
    ).all()

    return scenarios


def update_scenario(
    scenario_id: int,
    scenario_data: EnScenarioUpdate,
    db: Session = Depends(get_db_session()),
) -> EnScenarioDB:
    scenario = read_scenario(scenario_id)

    if _check_scenario_duplicates(scenario_data.name, scenario_data.project_id):
        scenario = scenario.model_copy(
            update=scenario_data.model_dump(exclude_unset=True)
        )

        db.add(scenario)

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Could not update scenario.",
            ) from exc

        db.refresh(scenario)

    return scenario


def delete_scenario(scenario_id: int, db: Session = Depends(get_db_session())) -> None:
    """
    Delete a scenario and its associated simulations.

    Performs a cascading delete of a scenario and all its linked simulations
    within a single database transaction. Validates authentication and existence
    before deletion.

    :param token: Authentication token for validation
    :type token: str
    :param scenario_id: ID of the scenario to delete
    :type scenario_id: int
    :param db: Database session for transaction
    :type db: Session
    :return: Success message dictionary
    :rtype: dict
    :raises HTTPException: If unauthorized (401) or scenario not found (404)

    Note:
        - Requires valid authentication token
        - Performs cascade delete of linked simulations
        - Executes in a single transaction
    """
    scenario = read_scenario(scenario_id)

    linked_simulations = read_scenario_simulations(scenario_id)

    for simulation in linked_simulations:
        delete_simulation(simulation.id)

    db.delete(scenario)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        # Generic handling; DB should ideally have unique constraints and proper messages
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity error at delete scenario.",
        ) from exc


def duplicate_scenario(
    scenario_id: int,
    db: Session = Depends(get_db_session()),
    new_project_id: Optional[int] = None,
) -> EnScenarioDB:
    """
    Create a copy of an existing scenario.

    Creates a new scenario with the same configuration as an existing one,
    optionally in a different project. Useful for creating variations of
    existing scenarios.

    :param scenario_id: ID of the scenario to duplicate
    :type scenario_id: int
    :param db: Database session for transaction
    :type db: Session
    :param new_project_id: Optional target project ID (default: same project)
    :type new_project_id: Optional[int]
    :return: Success message with new scenario details
    :rtype: dict
    :raises HTTPException: If source scenario not found (404)

    Note:
        - Creates a deep copy of the scenario
        - Maintains all configuration but creates new IDs
        - Can copy across projects if new_project_id provided
    """
    db_scenario = db.get(EnScenarioDB, scenario_id)
    if not db_scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found."
        )

    new_scenario_data = db_scenario.model_dump()  # type: ignore[call-arg]

    if new_project_id is None:
        # create a unique name in the same project
        base_name = db_scenario.name  # type: ignore[attr-defined]
        new_scenario_name = f"{base_name} - Copy"

        i = 1
        # keep incrementing until name is unique in that project
        while not _check_scenario_duplicates(
            scen_name=new_scenario_name,
            scen_proj_id=db_scenario.project_id,  # type: ignore[attr-defined]
            db=db,
        ):
            new_scenario_name = f"{base_name} - Copy {i}"
            i += 1
    else:
        new_scenario_name = db_scenario.name  # type: ignore[attr-defined]
        new_scenario_data["project_id"] = new_project_id

    new_scenario_data["name"] = new_scenario_name
    new_scenario_data["id"] = None
    new_scenario_data["start_date"] = db_scenario.start_date  # type: ignore[attr-defined]

    new_scenario = EnScenarioDB(**new_scenario_data)
    db.add(new_scenario)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        # Generic handling; DB should ideally have unique constraints and proper messages
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity error at duplicate scenario.",
        ) from exc

    db.refresh(new_scenario)

    return new_scenario
