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
    :param db: Database session for executing queries and retrieving data.
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
    Handles the creation of a new scenario within the system. It performs authentication, validates
    whether the token corresponds to an authorized user for the given project, and inserts the new
    scenario data into the database if all checks pass. Additionally, for debugging purposes, it
    saves the scenario data into a local JSON file.

    :param token: Bearer token used for authentication and validation of the user request
    :type token: str
    :param scenario_data: Instance of EnScenario containing details of the scenario to be created
    :type scenario_data: EnScenario
    :param db: Database session object used to perform database operations
    :type db: Session
    :return: A MessageResponse object indicating whether the scenario creation was successful,
             along with a success status
    :rtype: MessageResponse
    :raises HTTPException: Raised with status code 401 for scenarios such as missing authentication
                           or unauthorized access
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
    Reads and retrieves scenarios associated with the given project identifier.
    The function requires the user to be authenticated and authorized as the
    owner of the project. It fetches scenarios from the database, maps them
    to the required model, and returns the response encapsulated in a data model.

    :param project_id: The unique identifier of the project whose scenarios are to be retrieved.
    :param token: The bearer token used for authentication and authorization.
    :param db: The SQLAlchemy Session dependency used to interact with the database.
    :return: A DataResponse object containing the retrieved scenarios, the total count
        of scenarios, and a success status.
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
    Handles the retrieval of a specific scenario by its ID. It validates the user's
    authentication and ownership of the scenario and its associated project before
    returning the scenario details.

    :param scenario_id: The ID of the scenario to be retrieved.
    :type scenario_id: int
    :param token: Bearer token for user authentication and authorization.
    :type token: str
    :param db: SQLAlchemy database session dependency.
    :type db: Session
    :return: A response containing the scenario details, wrapped in a DataResponse.
    :rtype: DataResponse
    :raises HTTPException: Raised with status 401 if the token is invalid, the user
        is not authenticated, or not authorized to access the scenario.
    :raises HTTPException: Raised with status 404 if the specified scenario is not found.
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
    Updates an existing scenario given its ID. This function verifies the authentication token,
    validates scenario ownership, and checks the existence of the scenario in the database.
    The scenario details are updated only if all validations pass. The updated data is then
    saved to the database.

    :param token: Authentication bearer token for verifying the user's session.
    :type token: str
    :param scenario_id: Integer representing the unique identifier of the scenario to update.
    :type scenario_id: int
    :param scenario_data: Pydantic model object containing the updated scenario data fields.
    :type scenario_data: EnScenarioUpdate
    :param db: Dependency-injected SQLAlchemy database session object.
    :type db: Session
    :return: A response message indicating whether the scenario was updated successfully.
    :rtype: MessageResponse
    :raises HTTPException: Raised with appropriate status codes if authentication fails,
                           ownership validation fails, or the scenario is not found.
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
    :param db: Database session used for querying and deleting the scenario.
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
