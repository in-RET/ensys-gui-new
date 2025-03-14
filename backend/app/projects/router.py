from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Form, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnProject, EnProjectDB
from ..constants import db_engine, oauth2_scheme, decode_token, get_db_session
from ..users.model import EnUserDB

projects_router = APIRouter(
    prefix="/projects",
    tags=["projects"],
)

def validate_project_owner(project_id: int, token, db: Session = Depends(get_db_session)):
    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    project = db.get(EnProjectDB, project_id)

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

    if validate_project_owner(project_id, token):
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
async def update_project(token: Annotated[str, Depends(oauth2_scheme)], form_data: Annotated[EnProject, Form()], project_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if validate_project_owner(project_id, token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")



    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    statement = select(EnProjectDB).where(EnProjectDB.user_id == token_user.id)
    results = db.exec(statement)



    return JSONResponse(
        content={"message": "Update"},
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
    )


@projects_router.delete("/delete", response_model=EnProject)
async def delete_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    project = db.get(EnProjectDB, project_id)
    db.delete(project)

    print("Deleted project:", project)

    return JSONResponse(
        content={"message": "Project deleted"},
        status_code=status.HTTP_200_OK,
    )
