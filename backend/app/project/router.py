from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnProject, EnProjectDB, EnProjectUpdate
from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..responses import DataResponse, MessageResponse
from ..security import decode_token, oauth2_scheme
from ..user.model import EnUserDB

projects_router = APIRouter(
    prefix="/project",
    tags=["project"],
)

def validate_project_owner(project_id: int, token: str, db):
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
async def create_project(token: Annotated[str, Depends(oauth2_scheme)], project_data: EnProject, db: Session = Depends(get_db_session)) -> MessageResponse:
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
async def read_projects(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> DataResponse:
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
async def read_project(project_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> DataResponse:
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

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Not authorized."
        #     )],
        # )

    return DataResponse(
        data=GeneralDataModel(
            items=[db.get(EnProjectDB, project_id).get_return_data()],
            totalCount=1,
        ),
        success=True
    )

@projects_router.patch("/{project_id}", response_model=MessageResponse)
async def update_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, project_data: EnProjectUpdate, db: Session = Depends(get_db_session)) -> MessageResponse:
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

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return DataResponse(
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
        # return DataResponse(
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

    return MessageResponse(
        data="Project Updated.",
        success=True
    )

@projects_router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)) -> MessageResponse:
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

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return DataResponse(
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

    return MessageResponse(
        data="Project deleted.",
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
