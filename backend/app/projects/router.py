from datetime import datetime
from typing import Annotated, Any, Coroutine

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnProject, EnProjectDB, EnProjectUpdate
from ..db import get_db_session
from ..responses import CustomResponse, ErrorModel
from ..security import decode_token, oauth2_scheme
from ..users.model import EnUserDB

projects_router = APIRouter(
    prefix="/project",
    tags=["project"],
)

def validate_project_owner(project_id: int, token, db):
    # Get Database-Session and token-data
    token_data = decode_token(token)

    # Get User-data from the Database
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    # get the mentioned project-data
    project = db.get(EnProjectDB, project_id)

    # check if project_id and token_id is the same and return value
    return project.user_id == token_user.id

@projects_router.post("/")
async def create_project(token: Annotated[str, Depends(oauth2_scheme)], project_data: EnProject, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()
    project = EnProjectDB(**project_data.model_dump())

    # set auxillary data
    project.user_id = token_user.id
    project.date_created = datetime.now()

    db.add(project)
    db.commit()

    return CustomResponse(
        data={"message": "Project created."},
        success=True,
        errors=None
    )

@projects_router.get("s/")
async def read_projects(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> CustomResponse:
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

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    statement = select(EnProjectDB).where(EnProjectDB.user_id == token_user.id)
    projects = db.exec(statement)

    response_data = []
    for project in projects:
        response_data.append(project.get_return_data())

    return CustomResponse(
        data={"projects": response_data},
        success=True,
        errors=None
    )

@projects_router.get("/{project_id}")
async def read_project(project_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> CustomResponse:
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

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Not authorized."
        #     )],
        # )

    return CustomResponse(
        data={"projects": db.get(EnProjectDB, project_id).get_return_data()},
        success=True,
        errors=None
    )

@projects_router.patch("/{project_id}")
async def update_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, project_data: EnProjectUpdate, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Not authorized."
        #     )],
        # )
    db_project = db.get(EnProjectDB, project_id)
    if not db_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="Project not found."
        #     )]
        # )

    new_project_data = project_data.model_dump(exclude_none=True)
    print(new_project_data)

    db_project.sqlmodel_update(new_project_data)
    db_project.date_updated = datetime.now()

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return CustomResponse(
        data={"message": "Project Updated."},
        success=True,
        errors=None
    )

@projects_router.delete("/{project_id}")
async def delete_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Not authorized."
        #     )],
        # )
    project = db.get(EnProjectDB, project_id)
    db.delete(project)
    db.commit()

    return CustomResponse(
        data={"message": "Project deleted."},
        success=True,
        errors=None
    )

@projects_router.post("/duplicate", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def duplicate_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)) -> None:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")

@projects_router.post("/share", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def share_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, user_id: int, db: Session = Depends(get_db_session)) -> None:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")

@projects_router.post("/unshare", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def unshare_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, user_id: int, db: Session = Depends(get_db_session)) -> None:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")
