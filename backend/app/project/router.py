from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnProject, EnProjectDB, EnProjectUpdate
from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..responses import DataResponse, MessageResponse
from ..scenario.model import EnScenarioDB
from ..security import decode_token, oauth2_scheme
from ..user.model import EnUserDB

projects_router = APIRouter(
    prefix="/project",
    tags=["project"],
)


def validate_project_owner(project_id: int, token: str, db):
    """
    Validates whether the user associated with a given token is the owner of a project
    identified by the provided project_id. Verifies the token's authenticity, fetches
    the project from the database, and compares its ownership details to ensure the user
    has the necessary permissions to access or modify the project.

    :param project_id: ID of the project whose ownership is being validated
    :type project_id: int
    :param token: JWT token provided for authentication and identifying the user
    :type token: str
    :param db: Database session object used to query project and user information. Dependency injection.
    :type db: Session
    :return: Returns True if the token user is the owner of the project, otherwise raises an exception
    :rtype: bool

    :raises HTTPException: If the project is not found in the database (404)
    :raises HTTPException: If the user associated with the token does not own the project (403)
    """
    # Get Database-Session and token-data
    token_data = decode_token(token)

    # Get User-data from the Database
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    # get the mentioned project-data
    project = db.get(EnProjectDB, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # check if the project_id and the token_id are the same and return the value
    if project.user_id == token_user.id:
        return True
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


@projects_router.post("/", response_model=MessageResponse)
async def create_project(token: Annotated[str, Depends(oauth2_scheme)], project_data: EnProject,
                         db: Session = Depends(get_db_session)) -> MessageResponse:
    """
    Creates a new project and stores it in the database. The function checks
    the authentication token, decodes it, retrieves the authenticated user's
    details, and associates the project data with the user. The new project is
    saved to the database, and a success response is returned.

    :param token: Authentication token obtained from the user. Used to validate
                  user identity and permission.
    :type token: Str
    :param project_data: Project data containing information required to create a
                         new project in the database.
    :type project_data: EnProject
    :param db: Database session dependency. Used for interacting with the database. Dependency injection.
    :type db: Session
    :raises HTTPException: Raised with a 401 status code if the user is not
                           authenticated due to a missing or invalid token.
    :return: An object containing a success message indicating the project has
             been created.
    :rtype: MessageResponse
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()
    project = EnProjectDB(**project_data.model_dump())

    # set auxiliary data
    project.user_id = token_user.id
    project.date_created = datetime.now()

    db.add(project)
    db.commit()

    return MessageResponse(
        data="Project created.",
        success=True
    )


@projects_router.get("s/", response_model=DataResponse)
async def read_projects(token: Annotated[str, Depends(oauth2_scheme)],
                        db: Session = Depends(get_db_session)) -> DataResponse:
    """
    Fetches and returns a list of projects associated with the authenticated user.
    The function validates the provided token, retrieves the associated user
    details, and fetches all projects corresponding to the user. The result
    includes details of all retrieved projects wrapped in a standardized response.

    :param token: The authentication token is extracted from the request.
    :type token: Str
    :param db: The database session dependency used to execute queries. Dependency injection.
    :type db: Session
    :return: A standardized response containing a list of projects for
        the authenticated user, along with the total count of projects.
    :rtype: DataResponse
    :raises HTTPException: If the provided token is missing or invalid.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    statement = select(EnProjectDB).where(EnProjectDB.user_id == token_user.id)
    projects = db.exec(statement)

    response_data = []
    for project in projects:
        response_data.append(project.get_return_data())

    return DataResponse(
        data=GeneralDataModel(
            items=response_data,
            totalCount=len(response_data)
        ),
        success=True
    )


@projects_router.get("/{project_id}", response_model=DataResponse)
async def read_project(project_id: int, token: Annotated[str, Depends(oauth2_scheme)],
                       db: Session = Depends(get_db_session)) -> DataResponse:
    """
    Retrieves project details by the given project ID. This endpoint fetches details about a
    project from the database after validating the provided authentication token and confirming
    ownership of the project by the authenticated user.

    :param project_id: The unique identifier of the project to retrieve.
    :type project_id: Int
    :param token: Authentication token provided by the user for accessing the endpoint.
    :type token: Str
    :param db: Database session used for accessing stored data. Dependency injection.
    :type db: Session
    :return: The response containing project data wrapped in a structured response model.
    :rtype: DataResponse
    :raises HTTPException: If authentication fails or if the user is not authorized to access
        the specified project.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return DataResponse(
        data=GeneralDataModel(
            items=[db.get(EnProjectDB, project_id).get_return_data()],
            totalCount=1,
        ),
        success=True
    )


@projects_router.patch("/{project_id}", response_model=MessageResponse)
async def update_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, project_data: EnProjectUpdate,
                         db: Session = Depends(get_db_session)) -> MessageResponse:
    """
    Updates the details of an existing project. This endpoint allows authenticated
    and authorized users to modify the properties of a given project. The function
    fetches the project by its ID, validates the user's ownership of the project,
    and updates the provided information in the database.

    :param token: The authentication token of the user making the request.
    :type token: Str
    :param project_id: The unique identifier of the project to be updated.
    :type project_id: Int
    :param project_data: The new data to update the project with.
    :type project_data: EnProjectUpdate
    :param db: The database session used for querying and updating project details. Dependency injection.
    :type db: Session
    :return: A `MessageResponse` object indicating the success of the operation.
    :rtype: MessageResponse
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    db_project = db.get(EnProjectDB, project_id)
    if not db_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    new_project_data = project_data.model_dump(exclude_none=True)

    db_project.sqlmodel_update(new_project_data)
    db_project.date_updated = datetime.now()

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return MessageResponse(
        data="Project Updated.",
        success=True
    )


@projects_router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int,
                         db: Session = Depends(get_db_session)) -> MessageResponse:
    """
    Deletes a project and all associated scenarios from the database.

    This endpoint allows the authenticated user to delete a specified project
    and its associated scenarios, provided they have the necessary authorization
    and ownership. The function validates the user's token and ownership of the
    specified project before deleting it and committing the changes to the database.

    :param token: A string representing the user's authentication token.
    :type token: Str
    :param project_id: Integer representing the ID of the project to be deleted.
    :type project_id: Int
    :param db: The session instance for interacting with the database. Dependency injection.
    :type db: Session
    :return: A MessageResponse object containing a confirmation message and the
             success status of the operation.
    :rtype: MessageResponse
    :raises HTTPException: If the user is not authenticated or if they are not authorized to delete the project.
    :raises HTTPException: If the project is not found in the database.
    :raises HTTPException: If the project is not owned by the user.
    :raises HTTPException: If there are associated scenarios in the project.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    project = db.get(EnProjectDB, project_id)

    scenarios = db.exec(select(EnScenarioDB).where(EnScenarioDB.project_id == project.id))
    for scenario in scenarios:
        db.delete(scenario)

    db.delete(project)
    db.commit()

    return MessageResponse(
        data="Project deleted and all scenarios deleted.",
        success=True
    )

# @projects_router.post("/duplicate", status_code=status.HTTP_501_NOT_IMPLEMENTED)
# async def duplicate_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)) -> None:
#     raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")
#
# @projects_router.post("/share", status_code=status.HTTP_501_NOT_IMPLEMENTED)
# async def share_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, user_id: int, db: Session = Depends(get_db_session)) -> None:
#     raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")
#
# @projects_router.post("/unshare", status_code=status.HTTP_501_NOT_IMPLEMENTED)
# async def unshare_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, user_id: int, db: Session = Depends(get_db_session)) -> None:
#     raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")
