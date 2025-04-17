import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnSimulationDB
from ..db import get_db_session
from ..link.model import EnLinkDB
from ..projects.model import EnProjectDB
from ..responses import CustomResponse, ErrorModel
from ..security import oauth2_scheme
from ..scenarios.router import validate_scenario_owner
from ..projects.router import validate_project_owner

simulation_router = APIRouter(
    prefix="/simulation",
    tags=["simulation"]
)

def validate_user_rights(token, scenario_id, db):
    validation_scenario = validate_scenario_owner(
        token=token,
        scenario_id=scenario_id,
        db=db
    )
    if not validation_scenario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    project = db.exec(select(EnProjectDB).where(EnProjectDB.scenario_id == scenario_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    validation_project = validate_project_owner(
        token=token,
        project_id=project.id,
        db=db,
    )
    if not validation_project:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return True

@simulation_router.post("/start/{scenario_id}", response_model=CustomResponse)
async def start_simulation(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    # TODO: oemof-energy-system erstellen

    # Get old Simulation and stop it
    running_simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id)).where(EnSimulationDB.status == "started").all()

    for running_simulation in running_simulations:
        running_simulation.status = "stopped"
        running_simulation.end_time = datetime.now()
        db.commit()

    # Create new Simulation
    simulation = EnSimulationDB(
        sim_token=str(uuid.uuid4()),
        start_date=datetime.now(),
        status="started"
    )

    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    return CustomResponse(
        data={
            "message": "Simulation started. But only for deployment! Not implemented yet.",
            "simulation": simulation
        },
        success=True
    )

@simulation_router.post("/stop/{scenario_id}", response_model=CustomResponse)
async def stop_simulation(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    #TODO: simulation stoppen
    simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.status == "started").where(EnSimulationDB.scenario_id == scenario_id)).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if len(simulations) > 1:
        print("Hallo, mehr als 2 Simulationen laufen, du Bob hast vergessen beim Starten die alte zu beenden!")

    for simulation in simulations:
        # TODO: Simulation stoppen (s. sim token)
        print(simulation.sim_token)

        simulation.status = "stopped"
        simulation.end_date = datetime.now()
        db.commit()
        db.refresh(simulation)

    return CustomResponse(
        data={
            "message": "Simulation stopped. But only for deployment! Not implemented yet.",
            "simulation": simulations
        },
        success=True
    )

@simulation_router.get("s/{scenario_id}", response_model=CustomResponse)
async def get_simulations(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id)).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulations found.")

    return CustomResponse(
        data={"simulations": simulations},
        success=True,
    )

@simulation_router.get("/{simulation_id}", response_model=CustomResponse)
async def get_simulation(simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.exec(select(EnSimulationDB).where(EnSimulationDB.simulation_id == simulation_id)).last()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    if simulation.status != "finished":
        return CustomResponse(
            data={"status": simulation.status,
                  "start_date": simulation.start_date},
            success=False,
            errors=[ErrorModel(
                message="Simulation not finished yet!",
                code=status.HTTP_425_TOO_EARLY
            )]
        )
    else:
        # TODO: Daten zurück geben --> Wie?
        return CustomResponse(
            data={
                "simulation_token": simulation.sim_token,
                "start_date": simulation.start_date,
                "end_date": simulation.end_date
            },
            success=True
        )

@simulation_router.delete("/{simulation_id}")
async def delete_simulation(token: Annotated[str, Depends(oauth2_scheme)], simulation_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Not authenticated."
        #     )],
        # )

    simulation = db.get(EnLinkDB, simulation_id)
    db.delete(simulation)
    db.commit()

    return CustomResponse(
        data={"message": "Simulation deleted."},
        success=True,
        errors=None
    )
