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
from ..simulation.service import delete_simulation, read_scenario_simulations
from ..user.model import EnUserDB


def _check_scenario_duplicates(scen_name: str, scen_proj_id: int, db: Session) -> bool:
    """Return True if no duplicate scenario name exists in a project.

    - param scen_name: scenario name to check
    - param scen_proj_id: project id to scope the check
    - param db: SQLModel session
    - returns: bool
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
    db: Session,
) -> EnScenarioDB:
    """Create a scenario after auth and duplicate checks.

    - param scenario_data: scenario payload
    - param user: owner user
    - param db: SQLModel session
    - returns: created EnScenarioDB
    - raises: HTTPException 401/409 on auth or duplicate
    """

    if user.check_project_rights(project_id=scenario_data.project_id, db=db):
        if _check_scenario_duplicates(
            scen_name=scenario_data.name, scen_proj_id=scenario_data.project_id, db=db
        ):
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


def read_scenario(scenario_id: int, user: EnUserDB, db: Session) -> EnScenarioDB:
    """Fetch a scenario by id after authorization.

    - param scenario_id: id to fetch
    - param user: requesting user
    - param db: SQLModel session
    - returns: EnScenarioDB
    - raises: HTTPException 404/401 on missing or unauthorized
    """
    if user.check_scenario_rights(scenario_id=scenario_id, db=db):
        scenario = db.get(EnScenarioDB, scenario_id)

    if scenario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scenario not found.")

    return scenario


def read_scenarios(project_id: int, db: Session) -> list[EnScenarioDB]:
    """List all scenarios for a project.

    - param project_id: project id to filter
    - param db: SQLModel session
    - returns: list of EnScenarioDB
    """
    scenarios = db.exec(
        select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
    ).all()

    return scenarios


def update_scenario(
    scenario_id: int, scenario_data: EnScenarioUpdate, user: EnUserDB, db: Session
) -> EnScenarioDB:
    """Apply partial updates to a scenario.

    - param scenario_id: id to update
    - param scenario_data: update payload
    - param user: requesting user
    - param db: SQLModel session
    - returns: updated EnScenarioDB
    - raises: HTTPException 401/409 on auth or db errors
    """
    if not user.check_scenario_rights(scenario_id=scenario_id, db=db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized."
        )
    else:
        scenario = read_scenario(scenario_id=scenario_id, user=user, db=db)

        if _check_scenario_duplicates(
            scen_name=scenario_data.name, scen_proj_id=scenario_data.project_id, db=db
        ):
            scenario = scenario.sqlmodel_update(
                scenario_data.model_dump(exclude_unset=True)
            )

            try:
                db.add(scenario)
                db.commit()
            except IntegrityError as exc:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Could not update scenario.",
                ) from exc

            db.refresh(scenario)

        return scenario


def delete_scenario(scenario_id: int, user: EnUserDB, db: Session) -> bool:
    """Delete a scenario and its simulations after auth checks.

    - param scenario_id: id of the scenario to delete
    - param user: requesting user
    - param db: SQLModel session
    - raises: HTTPException 401/404/409 on auth, missing, or db errors
    """
    scenario = read_scenario(scenario_id=scenario_id, user=user, db=db)

    linked_simulations = read_scenario_simulations(
        scenario_id=scenario_id, user=user, db=db
    )

    for simulation in linked_simulations:
        delete_simulation(simulation_id=simulation.id, user=user, db=db)

    db.delete(scenario)

    try:
        db.commit()

        return True
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
    db: Session,
    new_project_id: Optional[int] = None,
) -> EnScenarioDB:
    """Create a copy of a scenario, optionally into another project.

    - param scenario_id: id to duplicate
    - param user: requesting user
    - param db: SQLModel session
    - param new_project_id: target project or None for same project
    - returns: new EnScenarioDB copy
    - raises: HTTPException 404/409 on missing source or db issues
    """
    db_scenario = read_scenario(scenario_id=scenario_id, user=user, db=db)

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
        db.refresh(new_scenario)

        return new_scenario
    except IntegrityError as exc:
        db.rollback()
        # Generic handling; DB should ideally have unique constraints and proper messages
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity error at duplicate scenario.",
        ) from exc
