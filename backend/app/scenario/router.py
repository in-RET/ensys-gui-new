import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .auxillary import validate_scenario_owner
from .model import EnScenario, EnScenarioDB, EnScenarioUpdate
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


@scenario_router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(
        token: Annotated[str, Depends(oauth2_scheme)], scenario_data: EnScenario,
        db: Session = Depends(get_db_session)
) -> DataResponse:
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

    possible_duplicates = db.exec(
        select(EnScenarioDB).where(EnScenarioDB.name == scenario.name).where(EnScenarioDB.project_id == project_id)
    ).all()

    if len(possible_duplicates) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Scenario name already exists.")
    else:
        db.add(scenario)
        db.commit()

        return DataResponse(
            data=GeneralDataModel(
                items=[{
                    "message": "Scenario created.",
                    "id": scenario.id
                }],
                totalCount=1
            ),
         success=True
        )


@scenario_router.get("s/{project_id}", response_model=DataResponse)
async def read_scenarios(
        project_id: int, token: Annotated[str, Depends(oauth2_scheme)],
        db: Session = Depends(get_db_session)
) -> DataResponse:
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

    response_data = [scenario.model_dump(exclude=['energysystem']) for scenario in scenarios]
    return DataResponse(
        data=GeneralDataModel(
            items=response_data,
            totalCount=len(response_data)
        ),
        success=True
    )


@scenario_router.get("/{scenario_id}", response_model=DataResponse)
async def read_scenario(
        scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)],
        db: Session = Depends(get_db_session)
) -> DataResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(
        scenario_id, db,
        token
    )
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = db.get(EnScenarioDB, scenario_id)
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    if not validate_project_owner(scenario.project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    response_data = scenario.model_dump(exclude=["energysystem"])
    return DataResponse(
        data=GeneralDataModel(
            items=[response_data],
            totalCount=1
        ),
        success=True
    )


@scenario_router.patch("/{scenario_id}", response_model=MessageResponse)
async def update_scenario(
        token: Annotated[str, Depends(oauth2_scheme)],
        scenario_id: int,
        scenario_data: EnScenarioUpdate,
        db: Session = Depends(get_db_session)
) -> MessageResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(
        scenario_id, db,
        token
    )
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    db_scenario = db.get(EnScenarioDB, scenario_id)
    if not db_scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    # Note: Now it's a dict, not a EnScenarioUpdate
    new_scenario_data = scenario_data.model_dump(exclude_unset=True)

    possible_duplicates = db.exec(
        select(EnScenarioDB).where(EnScenarioDB.name == new_scenario_data.name)
    ).all()

    if len(possible_duplicates) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Scenario name already exists.")
    else:
        db_scenario.sqlmodel_update(new_scenario_data)

        db.add(db_scenario)
        db.commit()
        db.refresh(db_scenario)

        return MessageResponse(
            data="Scenario updated.",
            success=True
        )


@scenario_router.delete("/{scenario_id}", response_model=MessageResponse)
async def delete_scenario(
        token: Annotated[str, Depends(oauth2_scheme)],
        scenario_id: int,
        db: Session = Depends(get_db_session)
) -> MessageResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(
        scenario_id, db,
        token
    )
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = db.get(EnScenarioDB, scenario_id)
    db.delete(scenario)
    db.commit()

    return MessageResponse(
        data="Scenario deleted.",
        success=True
    )
