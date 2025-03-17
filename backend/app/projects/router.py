from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Form, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnProject, EnProjectDB, EnProjectUpdate
from ..constants import oauth2_scheme, decode_token, get_db_session
from ..users.model import EnUserDB

projects_router = APIRouter(
    prefix="/projects",
    tags=["projects"],
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

@projects_router.post("/create", response_model=EnProject)
async def create_project(token: Annotated[str, Depends(oauth2_scheme)], form_data: Annotated[EnProject, Form()], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()
    project = EnProjectDB(**form_data.model_dump())

    # set auxillary data
    project.user_id = token_user.id
    project.date_created = datetime.now()

    db.add(project)
    db.commit()

    return JSONResponse(
        content={"message": "Project created"},
        status_code=status.HTTP_200_OK,
    )

@projects_router.get("/read", response_model=EnProject)
async def read_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return JSONResponse(
        content={"projects": db.get(EnProjectDB, project_id).get_return_data()},
        status_code=status.HTTP_200_OK,
    )

@projects_router.get("/read_all", response_model=list[dict])
async def read_projects(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    statement = select(EnProjectDB).where(EnProjectDB.user_id == token_user.id)
    results = db.exec(statement)

    response_data = []
    for result in results:
        response_data.append(result.get_return_data())

    return JSONResponse(
        content={"projects": response_data},
        status_code=status.HTTP_200_OK,
    )

@projects_router.patch("/update", response_model=EnProject)
async def update_project(token: Annotated[str, Depends(oauth2_scheme)], form_data: Annotated[EnProjectUpdate, Form()], project_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    db_project = db.get(EnProjectDB, project_id)
    if not db_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    new_project_data = form_data.model_dump(exclude_unset=True)

    db_project.sqlmodel_update(new_project_data)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return JSONResponse(
        content={"message": "Project Updated."},
        status_code=status.HTTP_200_OK,
    )


@projects_router.delete("/delete", response_model=EnProject)
async def delete_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    project = db.get(EnProjectDB, project_id)
    db.delete(project)

    return JSONResponse(
        content={"message": "Project deleted."},
        status_code=status.HTTP_200_OK,
    )
