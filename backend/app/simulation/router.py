from datetime import datetime
from typing import Annotated

from celery import uuid
from celery.worker.control import revoke
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from oemof.tools import logger
from sqlmodel import Session, select
from starlette import status

from .model import EnSimulationDB, Status
from ..auxillary import validate_user_rights
from ..celery import simulation_task
from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..responses import DataResponse, ErrorModel, MessageResponse
from ..security import oauth2_scheme

simulation_router = APIRouter(
    prefix="/simulation",
    tags=["simulation"]
)


@simulation_router.post("/start/{scenario_id}", response_model=MessageResponse)
async def start_simulation(
    scenario_id: int, background_tasks: BackgroundTasks,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session)
) -> MessageResponse:
    """
    Starts a new simulation for a given scenario and ensures any currently running simulations
    for the same scenario are stopped. It creates a new simulation entry in the database, generates
    a unique task ID, and initiates the simulation task.

    :param scenario_id: The ID of the scenario for which the simulation is being started.
    :type scenario_id: int
    :param background_tasks: The background tasks object provided by FastAPI's dependency injection.
    :type background_tasks: BackgroundTasks
    :param token: The authentication token used to authenticate and authorize the user.
    :type token: str
    :param db: The session used for database interaction, provided by dependency injection.
    :type db: Session
    :return: A response containing success information and details of the initiated task.
    :rtype: MessageResponse
    :raises HTTPException: If authentication or authorization fails.
    """
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    # Get old Simulation and stop it
    running_simulations = db.exec(
        select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id).where(
            EnSimulationDB.status == Status.STARTED.value
        )
    ).all()

    if running_simulations:
        for running_simulation in running_simulations:
            running_simulation.status = Status.STOPPED.value
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

    return MessageResponse(
        data=f"Simulation with id:{simulation.id} and task id:{task.id} started.",
        success=True
    )


@simulation_router.get("/status/{simulation_id}", response_model=MessageResponse)
async def get_simulation_status(
    simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session)
) -> MessageResponse:
    """
    This function retrieves the status of a specific simulation based on the provided simulation ID.
    It performs authentication and authorization checks to ensure proper access control. If the
    simulation exists and the user has the required access permissions, it fetches and returns
    the simulation's status wrapped in a success response.

    :param simulation_id: ID of the simulation to retrieve status for.
    :type simulation_id: Int
    :param token: Access token provided by the client for authorization.
    :type token: Str
    :param db: Database session is required to access simulation data. Dependency injection.
    :type db: Session
    :return: A `MessageResponse` instance containing the simulation's status if found and accessible.
    :rtype: MessageResponse

    :raises HTTPException:
        - 401 Unauthorized if the provided token is invalid or the user lacks appropriate rights.
        - 404 Not Found if the simulation with the specified ID does not exist.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.exec(select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)).first()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    selected_simulation = db.get(EnSimulationDB, simulation_id)

    return MessageResponse(
        data=f"{selected_simulation.status} -- {selected_simulation.status_message}",
        success=True
    )


@simulation_router.post("s/stop/{scenario_id}", response_model=MessageResponse)
async def stop_simulations(
    scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session)
) -> MessageResponse:
    """
    Stop active simulations for a specified scenario.

    This endpoint allows stopping all running simulations associated with a specific
    scenario. Authorization and user permission checks are performed before proceeding.
    If more than one simulation is found, a conflict error is reported. Additionally,
    background tasks associated with the simulations are terminated.

    :param scenario_id: ID of the scenario whose simulations are to be stopped.
    :type scenario_id: Int
    :param token: Authentication token for user validation.
    :type token: Str
    :param db: Database session for querying and updating simulation data.
    :type db: Session
    :return: Response object indicating the success or failure of the operation along
             with details of any encountered errors.
    :rtype: MessageResponse
    """
    errors = []
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    simulations = db.exec(
        select(EnSimulationDB).where(EnSimulationDB.status == Status.STARTED.value).where(
            EnSimulationDB.scenario_id == scenario_id
        )
    ).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if len(simulations) > 1:
        errors.append(
            ErrorModel(
                code=status.HTTP_409_CONFLICT,
                message="Mehr als 2 Simulationen laufen, du Bob hast vergessen beim Starten die alte zu beenden!"
            )
        )

    # TODO: Wie stoppe ich Background-Tasks?
    # Task manuell stoppen
    for simulation in simulations:
        revoke(simulation.sim_token, terminate=True)

        simulation.status = Status.STOPPED.value
        simulation.status_message = "Simulation was canceled by user request."
        simulation.end_date = datetime.now()
        db.commit()
        db.refresh(simulation)

    return MessageResponse(
        data=f"Simulation stopped.",
        success=True,
        errors=errors
    )


@simulation_router.post("/stop/{simulation_id}", response_model=MessageResponse)
async def stop_simulation(
    simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session)
) -> MessageResponse:
    """
    Stops a simulation with the specified simulation ID. This operation first
    validates the user's authentication and authorization using the provided
    token, then retrieves the simulation from the database. If the simulation is
    found and the user has the appropriate rights, the simulation task is
    manually stopped through the 'revoke' method. A success message is returned
    upon successful completion.

    :param simulation_id: The identifier of the simulation to be stopped.
    :type simulation_id: Int
    :param token: A token to validate user authentication and authorization.
    :type token: Str
    :param db: The database session is used to access and query the
        database. Dependency injection.
    :type db: Session
    :return: A message response indicating a success message and the ID of the
        stopped simulation.
    :rtype: MessageResponse
    :raises HTTPException: Raises a 401 Unauthorized error if the token is missing
        or invalid, or if the user is not authorized. Raises a 404 Not Found error
        if the specified simulation ID does not exist.
    """
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.get(EnSimulationDB, simulation_id)
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    # Task manuell stoppen
    revoke(simulation.sim_token, terminate=True)

    simulation.status = Status.STOPPED.value
    simulation.status_message = "Simulation was canceled by user request."
    simulation.end_date = datetime.now()
    db.commit()
    db.refresh(simulation)

    return MessageResponse(
        data=f"Simulation with id:{simulation.sim_token} stopped.",
        success=True,
    )


@simulation_router.get("s/{scenario_id}", response_model=DataResponse)
async def get_simulations(
    scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session)
) -> DataResponse:
    """
    Retrieve a list of simulations associated with a specific scenario.

    This function fetches simulations from the database that are linked to the
    given `scenario_id`. It authenticates the request using a token and validates
    the user's rights for the specified scenario. If no simulations are found,
    an appropriate HTTP error is raised.

    :param scenario_id: Identifier of the scenario for which simulations are requested.
    :type scenario_id: int
    :param token: A string token used for authentication and authorization.
    :type token: str
    :param db: A database session used for querying the simulations. Dependency injection.
    :type db: Session
    :return: A DataResponse object containing the list of simulations matched
        to the specified scenario, the total count of simulations, and a success flag.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_user_rights(token=token, scenario_id=scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    simulations = db.exec(select(EnSimulationDB).where(EnSimulationDB.scenario_id == scenario_id)).all()
    if not simulations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulations found.")

    return DataResponse(
        data=GeneralDataModel(
            items=list(simulations),
            totalCount=len(list(simulations)),
        ),
        success=True,
    )


@simulation_router.get("/{simulation_id}", response_model=DataResponse)
async def get_simulation(
    simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session)
) -> DataResponse:
    """
    Fetches and returns simulation data based on the specified simulation ID. The request
    must include a valid authentication token. The function verifies user rights before
    retrieving the simulation. If the simulation does not exist or the user lacks the
    necessary permissions, appropriate HTTP exceptions are raised.

    :param simulation_id: The ID of the simulation to be fetched.
    :type simulation_id: Int
    :param token: The authentication token for validating the request.
    :type token: Str
    :param db: Database session to access the database. Dependency injection.
    :type db: Session
    :return: A `DataResponse` object containing the simulation data and metadata.
    :raises HTTPException: If the user is not authorized.
    :raises HTTPException: If the specified simulation does not exist.
    :raises HTTPException: If the user does not have access to the simulation.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.exec(select(EnSimulationDB).where(EnSimulationDB.id == simulation_id)).first()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Simulation found.")

    if not validate_user_rights(token=token, scenario_id=simulation.scenario_id, db=db):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return DataResponse(
        data=GeneralDataModel(
            items=[simulation],
            totalCount=1,
        ),
        success=True
    )


@simulation_router.delete("/{simulation_id}")
async def delete_simulation(
    token: Annotated[str, Depends(oauth2_scheme)], simulation_id: int,
    db: Session = Depends(get_db_session)
) -> MessageResponse:
    """
    Deletes a simulation from the database based on the given simulation ID. The user must be authenticated
    via a token for the operation to proceed.

    :param token: The authenticated token required to access the endpoint.
    :type token: Str
    :param simulation_id: The ID of the simulation to be deleted.
    :type simulation_id: Int
    :param db: The database session is used to retrieve and delete the simulation record. Dependency injection.
    :type db: Session

    :return: A response indicating whether the simulation was successfully deleted.
    :rtype: MessageResponse

    :raises HTTPException: If the user is not authenticated
    """
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

    return MessageResponse(
        data="Simulation deleted.",
        success=True
    )
