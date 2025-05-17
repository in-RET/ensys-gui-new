from datetime import datetime
from typing import Annotated

from celery.worker.control import revoke
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from oemof.tools import logger
from sqlmodel import Session, select
from starlette import status
from celery import uuid

from .model import EnSimulationDB, Status
from ..celery import simulation_task
from ..db import get_db_session
from ..project.model import EnProjectDB
from ..project.router import validate_project_owner
from ..responses import DataResponse, ErrorModel
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
        simulation.status = Status.FINISHED.value
        simulation.end_date = datetime.now()
        db.commit()
        db.refresh(simulation)



@simulation_router.post("/start/{scenario_id}", response_model=DataResponse)
async def start_simulation(scenario_id: int, background_tasks: BackgroundTasks,
                           token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session), ):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    # Get old Simulation and stop it
    running_simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id).where(
        EnSimulationDB.status == Status.STARTED.value)).all()

    if running_simulations:
        for running_simulation in running_simulations:
            running_simulation.status = Status.CANCELED.value
            running_simulation.end_date = datetime.now()
            db.commit()


    simulation_token = uuid()

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

    # Start eines Celery Tasks für die Durchführung der Simulation
    task = simulation_task.apply_async((scenario_id, simulation.id), task_id=simulation_token)
    logger.info("Task UUID:", task.id)

    return DataResponse(
        data=f"Simulation with id:{simulation.id} and task id:{task.id} started.",
        success=True
    )

@simulation_router.get("/status/{simulation_id}", response_model=DataResponse)
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

    return DataResponse(
        data=selected_simulation.status,
        success=True
    )

@simulation_router.post("s/stop/{scenario_id}", response_model=DataResponse)
async def stop_simulations(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                          db: Session = Depends(get_db_session)):
    errors = []
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.status == Status.STARTED.value).where(
        EnSimulationDB.scenario_id == scenario_id)).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if len(simulations) > 1:
        errors.append(ErrorModel(
            code=status.HTTP_409_CONFLICT,
            message="Mehr als 2 Simulationen laufen, du Bob hast vergessen beim Starten die alte zu beenden!"
        ))

    # TODO: Wie stoppe ich Background-Tasks?
    # Task manuell stoppen
    for simulation in simulations:
        revoke(simulation.sim_token, terminate=True)

    return DataResponse(
        data=f"Simulation stopped.",
        success=True,
        errors=errors
    )

@simulation_router.post("/stop/{simulation_id}", response_model=DataResponse)
async def stop_simulation(simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                          db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.get(EnSimulationDB, simulation_id)
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    # Task manuell stoppen
    revoke(simulation.sim_token, terminate=True)

    return DataResponse(
        data=f"Simulation with id:{simulation.sim_token} stopped.",
        success=True,
    )

@simulation_router.get("s/{scenario_id}", response_model=DataResponse)
async def get_simulations(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                          db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id)).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulations found.")

    return DataResponse(
        data=simulations,
        success=True,
    )

@simulation_router.get("/{simulation_id}", response_model=DataResponse)
async def get_simulation(simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                         db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.exec(select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)).first()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return DataResponse(
        data=simulation,
        success=True
    )


@simulation_router.delete("/{simulation_id}")
async def delete_simulation(token: Annotated[str, Depends(oauth2_scheme)], simulation_id: int,
                            db: Session = Depends(get_db_session)) -> DataResponse:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
        # return DataResponse(
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

    return DataResponse(
        data="Simulation deleted.",
        success=True
    )
