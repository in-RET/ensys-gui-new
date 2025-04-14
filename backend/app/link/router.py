from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnLink, EnLinkUpdate, EnLinkDB
from ..db import get_db_session
from ..responses import CustomResponse
from ..security import decode_token, oauth2_scheme

link_router = APIRouter(
    prefix="/link",
    tags=["link"],
)

@link_router.get("s/", response_model=CustomResponse)
async def get_links(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    linklist = db.exec(select(EnLinkDB)).all()
    print(linklist)

    return CustomResponse(
        data={"links": linklist},
        success=True
    )

@link_router.get("/{link_id}", response_model=CustomResponse)
async def get_link(link_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    link = db.get(EnLinkDB, link_id)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="link not found")

    return CustomResponse(
        data={"link": link},
        success=True
    )

@link_router.post("/", response_model=CustomResponse)
async def create_link(link_data: EnLink, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    link = EnLink(**link_data.dict())
    db.add(link)
    db.commit()
    db.refresh(link)

    return CustomResponse(
        data={"link": link},
        success=True
    )

@link_router.patch("/{link_id}", response_model=CustomResponse)
async def update_link(link_id: int, link_data: EnLinkUpdate, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    db_link = db.get(EnLinkDB, link_id)
    if not db_link:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="link not found")

    new_link_data = link_data.model_dump(exclude_none=True)

    db_link.sqlmodel_update(new_link_data)
    db.add(db_link)
    db.commit()
    db.refresh(db_link)

    return CustomResponse(
        data={"link": db_link},
        success=True
    )

@link_router.delete("/{link_id}")
async def delete_link(token: Annotated[str, Depends(oauth2_scheme)], link_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    link = db.get(EnLinkDB, link_id)
    db.delete(link)
    db.commit()

    return CustomResponse(
        data={"message": "Link deleted."},
        success=True,
        errors=None
    )
