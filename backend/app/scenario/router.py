import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnScenario, EnScenarioUpdate, EnScenarioDB
from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..project.router import validate_project_owner
from ..responses import DataResponse, MessageResponse
from ..security import decode_token, oauth2_scheme
from ..user.model import EnUserDB

scenario_router = APIRouter(
    prefix="/scenario",
    tags=["scenario"],
)


def validate_scenario_owner(scenario_id, db, token) -> (bool, int, str):
    """
    Validates whether the owner of a given scenario matches the user from the provided
    authentication token. This function ensures that the logged-in user has the
    authorization to access or modify the scenario.

    :param scenario_id: ID of the scenario to validate ownership for.
    :type scenario_id: int
    :param db: Database session for executing queries and retrieving data. Dependency injection.
    :type db: Session
    :param token: Authentication token representing the logged-in user.
    :type token: str
    :return: A tuple containing three values:
             - A boolean indicating whether the user is the owner of the scenario.
             - An HTTP status code indicating the result of the validation.
             - A string message explaining the result (empty string if validation
               is successful).
    :rtype: tuple(bool, int, str)
    """
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()
    if not user:
        return False, status.HTTP_404_NOT_FOUND, "User not found."

    scenario = db.get(EnScenarioDB, scenario_id)

    if scenario.user_id == user.id:
        return True, status.HTTP_200_OK, ""
    else:
        return False, status.HTTP_401_UNAUTHORIZED, "User not authorized."


@scenario_router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_data: EnScenario,
                          db: Session = Depends(get_db_session)) -> MessageResponse:
    """
    Creates a new scenario and stores it in the database. The endpoint is
    protected and requires a valid token. It validates the ownership of the
    project before proceeding. This function adds a new scenario to the
    database and commits the changes.

    :param token: A valid authentication token to verify the user's identity.
    :type token: Str
    :param scenario_data: The data object containing the scenario details.
    :type scenario_data: EnScenario
    :param db: The database session dependency for executing queries. Dependency injection.
    :type db: Session
    :return: A response indicating the success of the scenario creation.
    :rtype: MessageResponse
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    project_id = scenario_data.project_id

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = EnScenarioDB(**scenario_data.model_dump())
    scenario.user_id = token_user.id

    with open(os.path.join(os.getenv("LOCAL_DATADIR"), "debug.json"), "wt") as f:
        f.write(scenario.model_dump_json())

    db.add(scenario)
    db.commit()

    return MessageResponse(
        data="Scenario created.",
        success=True
    )


@scenario_router.get("s/{project_id}", response_model=DataResponse)
async def read_scenarios(project_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                         db: Session = Depends(get_db_session)) -> DataResponse:
    """
    Reads scenarios associated with a specific project based on the provided project ID.
    This route ensures that the user is both authenticated and authorized before retrieving
    the scenarios, which are fetched from the database using the project ID.

    :param project_id: The ID of the project whose scenarios need to be retrieved.
    :type project_id: Int
    :param token: OAuth2-compliant access token used for user authentication.
    :type token: Str
    :param db: The database session dependency is used to access database functions. Dependency injection.
    :type db: Session
    :return: A structured response containing the scenario data and a success flag.
    :rtype: DataResponse

    :raises HTTPException: If the user is not authenticated (HTTP 401).
    :raises HTTPException: If the user is not authorized to access the project (HTTP 401).
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    statement = select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
    scenarios = db.exec(statement)

    response_data = []
    for scenario in scenarios:
        response_data.append(scenario.model_dump())

    return DataResponse(
        data=GeneralDataModel(
            items=response_data,
            totalCount=len(response_data)
        ),
        success=True
    )


@scenario_router.get("/{scenario_id}", response_model=DataResponse)
async def read_scenario(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                        db: Session = Depends(get_db_session)) -> DataResponse:
    """
    Retrieve scenario details by scenario ID.

    This endpoint allows an authenticated user to fetch information about a specific scenario
    based on its ID. It first validates the user's authentication and ownership of the scenario
    and associated project before retrieving the data. If the authentication or ownership checks
    fail, appropriate HTTP exceptions are raised.

    :param scenario_id: ID of the scenario to fetch
    :type scenario_id: int
    :param token: Authentication token for the user
    :type token: str
    :param db: Database session dependency. Dependency injection.
    :type db: Session
    :return: Response containing the scenario data
    :rtype: DataResponse
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db,
                                                                                                      token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = db.get(EnScenarioDB, scenario_id)
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    if not validate_project_owner(scenario.project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return DataResponse(
        data=GeneralDataModel(
            items=[scenario.model_dump()],
            totalCount=1
        ),
        success=True
    )


@scenario_router.patch("/{scenario_id}", response_model=MessageResponse)
async def update_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int,
                          scenario_data: EnScenarioUpdate, db: Session = Depends(get_db_session)) -> MessageResponse:
    """
    Updates an existing scenario identified by its ID. This endpoint allows updating
    specific fields of a scenario with new data provided in the `scenario_data` object.
    The function requires authentication and ownership validation to proceed. If the
    provided token is invalid or the user is not authorized, the operation will not
    be performed. Additionally, it checks whether the specified scenario exists in
    the database before attempting any updates.

    :param token: A bearer token for authorization that validates the user's access
                  and ownership of the scenario.
    :type token: str
    :param scenario_id: The unique identifier of the scenario to be updated.
    :type scenario_id: int
    :param scenario_data: Data for updating the specified scenario. Only fields that
                          are included in this object and are allowed to be updated
                          will be modified.
    :type scenario_data: EnScenarioUpdate
    :param db: A database session to interact with the scenario database. Dependency injection.
    :type db: Session
    :return: A `MessageResponse` indicating the success status of the operation
             and a message confirming the update.
    :rtype: MessageResponse
    :raises HTTPException: Raised when the token is invalid, the user is unauthorized,
                           the scenario does not exist in the database, or any other
                           issue preventing the update operation occurs.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db,
                                                                                                      token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    db_scenario = db.get(EnScenarioDB, scenario_id)
    if not db_scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    new_scenario_data = scenario_data.model_dump(exclude_unset=True)

    db_scenario.sqlmodel_update(new_scenario_data)

    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)

    return MessageResponse(
        data="Scenario updated.",
        success=True
    )


@scenario_router.delete("/{scenario_id}", response_model=MessageResponse)
async def delete_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int,
                          db: Session = Depends(get_db_session)) -> MessageResponse:
    """
    Deletes a scenario by its ID for authorized users only. This endpoint ensures that the caller
    owns the specified scenario before performing the deletion. If the scenario exists and the
    authorization is confirmed, it is removed from the database, and a success message is returned.

    :param token: Access token for authentication and authorization.
    :type token: str
    :param scenario_id: Unique identifier of the scenario to be deleted.
    :type scenario_id: int
    :param db: Database session used for querying and deleting the scenario. Dependency injection.
    :type db: Session
    :return: MessageResponse confirming successful deletion.
    :rtype: MessageResponse
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db,
                                                                                                      token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = db.get(EnScenarioDB, scenario_id)
    db.delete(scenario)
    db.commit()

    return MessageResponse(
        data="Scenario deleted.",
        success=True
    )
