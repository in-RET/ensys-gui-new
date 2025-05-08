import json
import os
import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnSimulationDB
from ..components.common.apimodel import ApiEnergysystem
from ..components.common.types import Frequencies, Solver
from ..components.ensys import EnEnergysystem, EnModel
from ..db import get_db_session
from ..project.model import EnProjectDB
from ..project.router import validate_project_owner
from ..responses import CustomResponse, ErrorModel
from ..scenario.model import EnScenarioDB
from ..scenario.router import validate_scenario_owner
from ..security import oauth2_scheme

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

    scenario = db.exec(select(EnScenarioDB).where(EnScenarioDB.id == scenario_id)).first()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    project = db.exec(select(EnProjectDB).where(EnProjectDB.id == scenario.project_id)).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

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
    selected_scenario = db.exec(select(EnScenarioDB).where(EnScenarioDB.id == scenario_id)).first()

    if selected_scenario.timestep == "1H":
        frequenz = Frequencies.hourly

    energysystem_oemof = EnEnergysystem(
        frequenz=frequenz,
        start_date=str(selected_scenario.simulation_year),
        time_steps=selected_scenario.period
    )

    energysystem_api = ApiEnergysystem(**selected_scenario.energysystem_model)
    energysystem_oemof = energysystem_api.to_EnEnergysystem(energysystem_oemof)

    simulation_model = EnModel(
        energysystem=energysystem_oemof,
        solver=Solver.gurobi,
        solver_verbose=True,
    )

    energysystem_json = json.dumps(selected_scenario.energysystem_model)

    # TODO: build components and somehow store the shit in the simulation data folder
    simulation_token = str(uuid.uuid4())
    # NOTE: Internal for Docker container
    simulation_folder = os.path.join("app", "data", "simulations", simulation_token)

    os.makedirs(
        name=simulation_folder,
        exist_ok=True
    )

    with open(os.path.join(simulation_folder, "energysystem.json"), "wt") as f:
        f.write(simulation_model.model_dump_json())

    # TODO: simulation starten



    # Get old Simulation and stop it
    running_simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id).where(EnSimulationDB.status == "Started")).all()

    if running_simulations:
        for running_simulation in running_simulations:
            running_simulation.status = "Stopped"
            running_simulation.end_date = datetime.now()
            db.commit()

    # Create new Simulation
    simulation = EnSimulationDB(
        sim_token=simulation_token,
        start_date=datetime.now(),
        end_date=None,
        scenario_id=scenario_id,
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

    simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.status == "Started").where(EnSimulationDB.scenario_id == scenario_id)).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if len(simulations) > 1:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mehr als 2 Simulationen laufen, du Bob hast vergessen beim Starten die alte zu beenden!")

    for simulation in simulations:
        simulation.status = "Stopped"
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
        data=simulations,
        success=True,
    )

@simulation_router.get("/{simulation_id}", response_model=CustomResponse)
async def get_simulation(simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.exec(select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)).first()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    # TODO: Simulationsenden abdecken!
    if simulation.status != "Finished":
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

    simulation = db.get(EnSimulationDB, simulation_id)
    db.delete(simulation)
    db.commit()

    return CustomResponse(
        data="Simulation deleted.",
        success=True,
        errors=None
    )
