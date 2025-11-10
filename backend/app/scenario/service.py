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

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnScenarioDB, EnScenario, EnScenarioUpdate
from ..db import SessionLocal
from ..simulation.service import delete_simulation, read_scenario_simulations
from ..user.model import EnUserDB


def _check_scenario_duplicates(
    scen_name: str, scen_proj_id: int, db: Session = SessionLocal()
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
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> EnScenarioDB:
    """
    Create a new scenario for a project.

    Validates project ownership, checks for duplicate scenario names,
    and creates the scenario in the database.

    :param scenario_data: Scenario configuration data
    :type scenario_data: EnScenario
    :param user: User creating the scenario
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: Created scenario database object
    :rtype: EnScenarioDB
    :raises HTTPException: If user lacks project rights (401), scenario name
        exists (409), or database error (409)
    """

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
    scenario_id: int, user: EnUserDB, db: Session = SessionLocal()
) -> EnScenarioDB:
    """
    Retrieve a specific scenario by ID.

    Validates user access rights before returning the scenario data.

    :param scenario_id: ID of the scenario to retrieve
    :type scenario_id: int
    :param user: User requesting the scenario
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: Scenario database object
    :rtype: EnScenarioDB
    :raises HTTPException: If scenario not found (404)
    """
    if user.check_scenario_rights(scenario_id):
        scenario = db.get(EnScenarioDB, scenario_id)

    if scenario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scenario not found.")

    return scenario


def read_scenarios(project_id: int, db: Session = SessionLocal()) -> list[EnScenarioDB]:
    """
    Retrieve all scenarios for a specific project.

    :param project_id: ID of the project
    :type project_id: int
    :param db: Database session
    :type db: Session
    :return: List of scenario database objects
    :rtype: list[EnScenarioDB]
    """
    scenarios = db.exec(
        select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
    ).all()

    return scenarios


def update_scenario(
    scenario_id: int,
    scenario_data: EnScenarioUpdate,
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> EnScenarioDB:
    """
    Update an existing scenario's configuration.

    Validates user authorization, checks for name conflicts, and applies
    the provided updates to the scenario.

    :param scenario_id: ID of the scenario to update
    :type scenario_id: int
    :param scenario_data: Updated scenario data
    :type scenario_data: EnScenarioUpdate
    :param user: User performing the update
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: Updated scenario database object
    :rtype: EnScenarioDB
    :raises HTTPException: If user not authorized (401) or database error (409)
    """
    if not user.check_scenario_rights(scenario_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized."
        )
    else:
        scenario = read_scenario(scenario_id=scenario_id, user=user)

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


def delete_scenario(
    scenario_id: int, user: EnUserDB, db: Session = SessionLocal()
) -> None:
    """
    Delete a scenario and its associated simulations.

    Performs a cascading delete of a scenario and all its linked simulations
    within a single database transaction. Validates authentication and existence
    before deletion.

    :param scenario_id: ID of the scenario to delete
    :type scenario_id: int
    :param user: User performing the deletion
    :type user: EnUserDB
    :param db: Database session for transaction
    :type db: Session
    :raises HTTPException: If unauthorized (401), scenario not found (404),
        or database integrity error (409)

    Note:
        - Requires valid user authorization
        - Performs cascade delete of linked simulations
        - Executes in a single transaction
    """
    scenario = read_scenario(scenario_id=scenario_id, user=user)

    linked_simulations = read_scenario_simulations(scenario_id=scenario_id, user=user)

    for simulation in linked_simulations:
        delete_simulation(simulation_id=simulation.id, user=user)

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
    user: EnUserDB,
    db: Session = SessionLocal(),
    new_project_id: Optional[int] = None,
) -> EnScenarioDB:
    """
    Create a copy of an existing scenario.

    Creates a new scenario with the same configuration as an existing one,
    optionally in a different project. Useful for creating variations of
    existing scenarios.

    :param scenario_id: ID of the scenario to duplicate
    :type scenario_id: int
    :param user: User performing the duplication
    :type user: EnUserDB
    :param db: Database session for transaction
    :type db: Session
    :param new_project_id: Optional target project ID (default: same project)
    :type new_project_id: Optional[int]
    :return: Newly created scenario database object
    :rtype: EnScenarioDB
    :raises HTTPException: If source scenario not found (404) or database
        integrity error (409)

    Note:
        - Creates a deep copy of the scenario
        - Maintains all configuration but creates new IDs
        - Can copy across projects if new_project_id provided
        - Automatically generates unique name with " - Copy" suffix
    """
    db_scenario = read_scenario(scenario_id=scenario_id, user=user)

    new_scenario_data = db_scenario.model_dump()

    if new_project_id is None:
        base_name = db_scenario.name
        new_scenario_name = f"{base_name} - Copy"

        i = 1
        # keep incrementing until name is unique in that project
        while not _check_scenario_duplicates(
            scen_name=new_scenario_name,
            scen_proj_id=db_scenario.project_id,
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
