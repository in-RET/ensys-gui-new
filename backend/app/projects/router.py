from typing import Annotated

from fastapi import APIRouter, Form, Depends
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnProject
from ..constants import db_engine, oauth2_scheme

projects_router = APIRouter(
    prefix="/projects",
    tags=["projects"],
)

@projects_router.post("/create", response_model=EnProject)
async def create_project(token: Annotated[str, Depends(oauth2_scheme)], form_data: Annotated[EnProject, Form()]):
    project = EnProject(**form_data.model_dump())
    print(project.model_dump())

    with Session(db_engine) as session:
        session.add(project)
        session.commit()

        return JSONResponse(
            content={
                "message": "Project created",
                "project_data": project.model_dump(),
            },
            status_code=status.HTTP_200_OK,
        )

@projects_router.get("/read", response_model=list[EnProject])
async def read_project(token: Annotated[str, Depends(oauth2_scheme)]):
    return JSONResponse(
        content={
            "message": "Project not updated",
            "project_data": None,
        },
        status_code=status.HTTP_404_NOT_FOUND,
    )


@projects_router.patch("/update", response_model=EnProject)
async def update_project(token: Annotated[str, Depends(oauth2_scheme)], form_data: Annotated[EnProject, Form()]):
    return JSONResponse(
        content={
            "message": "Project not updated",
            "project_data": form_data.model_dump(),
        },
        status_code=status.HTTP_404_NOT_FOUND,
    )


@projects_router.delete("/delete/{project_id}", response_model=EnProject)
async def delete_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int):
    with Session(db_engine) as session:
        statement = select(EnProject).where(EnProject.id == project_id)
        results = session.exec(statement)
        user = results.one()
        session.delete(user)
        session.commit()
        session.close()

        print("Deleted hero:", user)

        return user
