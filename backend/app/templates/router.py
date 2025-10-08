from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..project.model import EnProjectDB
from ..project.router import duplicate_project
from ..responses import DataResponse, MessageResponse
from ..security import oauth2_scheme, decode_token
from ..user.model import EnUserDB

templates_router = APIRouter(
    prefix="/templates",
    tags=["templates"]
)


async def create_getting_started_project(token: Annotated[str, Depends(oauth2_scheme)],
                                   db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    token_data = decode_token(token)

    user_db = db.exec(select(EnUserDB).where(EnUserDB.username == token_data["username"])).first()
    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    template_project = db.exec(select(EnProjectDB).where(EnProjectDB.is_template == True)).first()

    await duplicate_project(
        token=token,
        project_id=template_project.id,
        db=db,
        user_id=user_db.id
    )

    return MessageResponse(
        data="Getting started project created.",
        success=True
    )


@templates_router.get("/")
async def get_templates(token: Annotated[str, Depends(oauth2_scheme)],
                        db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    template_projects = db.exec(select(EnProjectDB).where(EnProjectDB.is_template == True)).all()

    return DataResponse(
        data=GeneralDataModel(
            items=list(template_projects),
            totalCount=len(template_projects)
        ),
        success=True,
    )

@templates_router.post("/")
async def create_project_from_template(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session)
) -> MessageResponse:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")
