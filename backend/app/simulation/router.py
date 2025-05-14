import os
import uuid
from datetime import datetime
from typing import Annotated

import docker
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from oemof import solph
from sqlmodel import Session, select
from starlette import status

from .model import EnSimulationDB, Status
from ..db import get_db_session
from ..ensys.components import EnEnergysystem, EnModel
from ..project.model import EnProjectDB
from ..project.router import validate_project_owner
from ..responses import CustomResponse
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


def check_container_status(docker_container, simulation_id, db):
    result_dict = docker_container.wait()

    simulation = db.get(EnSimulationDB, simulation_id)

    if result_dict["StatusCode"] > 0:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=docker_container.logs())
    else:
        simulation.status = "Finished"
        simulation.end_date = datetime.now()
        db.commit()
        db.refresh(simulation)


def simulation_task(simulation_model: EnModel, simulation_token, simulation_id, db):
    oemof_es: solph.EnergySystem = solph.EnergySystem(
        timeindex=solph.create_time_index(
            year=simulation_model.simulation_year,
            interval=simulation_model.interval,
            number=simulation_model.time_steps,
            start=simulation_model.start_date
        ),
        infer_last_interval=True
    )

    oemof_es = EnModel.energysystem.to_oemof_energysystem(oemof_es)

    # create the model for optimization
    oemof_model = solph.Model(oemof_es)

    # solve the optimization model
    oemof_model.solve(
        solver=str(simulation_model.solver),
        solve_kwargs=simulation_model.solve_kwargs,
    )

    # write the lp file for specific analysis
    oemof_model.write(
        filename=os.path.join(os.getenv("LOCAL_DATADIR"), "oemof_model.lp")
    )

    oemof_es.results["main"] = solph.processing.results(oemof_model)
    oemof_es.results["meta"] = solph.processing.meta_results(oemof_model)

    oemof_es.dump(
        dpath=os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token),
        filename="oemof_es.dump"
    )

    simulation = db.get(EnSimulationDB, simulation_id)
    simulation.status = Status.FINISHED
    simulation.end_date = datetime.now()
    db.commit()
    db.refresh(simulation)

@simulation_router.post("/start/{scenario_id}", response_model=CustomResponse)
async def start_simulation(scenario_id: int, background_tasks: BackgroundTasks,
                           token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session), ):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    # TODO: oemof-energy-system erstellen
    selected_scenario = db.exec(select(EnScenarioDB).where(EnScenarioDB.id == scenario_id)).first()

    # Create Energysystem to be stored
    energysystem_api = EnEnergysystem(**selected_scenario.energysystem_model)
    simulation_model = EnModel(
        energysystem=energysystem_api
    )

    simulation_token = str(uuid.uuid4())
    simulation_folder = os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token)
    os.makedirs(
        name=simulation_folder,
        exist_ok=True
    )

    with open(os.path.join(simulation_folder, "ensys_energysystem.json"), "wt") as f:
        f.write(simulation_model.model_dump_json())

    # Get old Simulation and stop it
    running_simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id).where(
        EnSimulationDB.status == Status.STARTED)).all()

    if running_simulations:
        for running_simulation in running_simulations:
            running_simulation.status = Status.CANCELLED
            running_simulation.end_date = datetime.now()
            db.commit()

    # Create a new Simulation
    simulation = EnSimulationDB(
        sim_token=simulation_token,
        start_date=datetime.now(),
        end_date=None,
        scenario_id=scenario_id,
    )

    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    # TODO: Einen Backgroundtask starten,
    #       welcher die Simulation starten und überwacht und dann das Enddatum in die DB schreibt
    background_tasks.add_task(simulation_task, simulation_model, simulation_token, simulation.id, db)

    return CustomResponse(
        data={
            "message": "Simulation started.",
            "simulation": simulation
        },
        success=True
    )

@simulation_router.get("/status/{scenario_id}", response_model=CustomResponse)
async def get_simulation_status(simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                                db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.exec(select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)).first()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    selected_simulation = db.get(EnSimulationDB, simulation_id)

    return CustomResponse(
        data=selected_simulation.status,
        success=True
    )

@simulation_router.post("/stop/{scenario_id}", response_model=CustomResponse)
async def stop_simulation(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                          db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.status == "Started").where(
        EnSimulationDB.scenario_id == scenario_id)).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if len(simulations) > 1:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Mehr als 2 Simulationen laufen, du Bob hast vergessen beim Starten die alte zu beenden!")

    # TODO: Wie stoppe ich Background-Tasks?

    return CustomResponse(
        data={
            "message": "Simulation stopped.",
            "simulation": simulations
        },
        success=True
    )

@simulation_router.get("s/{scenario_id}", response_model=CustomResponse)
async def get_simulations(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                          db: Session = Depends(get_db_session)):
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
async def get_simulation(simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                         db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.exec(select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)).first()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return CustomResponse(
        data=simulation,
        success=True
    )


@simulation_router.delete("/{simulation_id}")
async def delete_simulation(token: Annotated[str, Depends(oauth2_scheme)], simulation_id: int,
                            db: Session = Depends(get_db_session)) -> CustomResponse:
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
        success=True
    )
