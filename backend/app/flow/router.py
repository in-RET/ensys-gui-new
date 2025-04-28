from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnFlow, EnFlowUpdate, EnFlowDB
from ..db import get_db_session
from ..responses import CustomResponse
from ..security import decode_token, oauth2_scheme

flow_router = APIRouter(
    prefix="/flow",
    tags=["flow"],
)

@flow_router.post("/", response_model=CustomResponse)
async def create_flow(flow_data: EnFlow, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    flow = EnFlow(**flow_data.dict())
    db.add(flow)
    db.commit()
    db.refresh(flow)

    return CustomResponse(
        data={"flow": flow},
        success=True
    )

@flow_router.get("s/{scenario_id}", response_model=CustomResponse)
async def get_flows(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    flowlist = db.exec(select(EnFlowDB).where(EnFlowDB.scenario_id == scenario_id)).all()
    print(flowlist)

    return CustomResponse(
        data={"flows": flowlist},
        success=True
    )

@flow_router.get("/{flow_id}", response_model=CustomResponse)
async def get_flow(flow_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    flow = db.get(EnFlowDB, flow_id)
    if not flow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="flow not found")

    return CustomResponse(
        data={"flow": flow},
        success=True
    )

@flow_router.patch("/{flow_id}", response_model=CustomResponse)
async def update_flow(flow_id: int, flow_data: EnFlowUpdate, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    db_flow = db.get(EnFlowDB, flow_id)
    if not db_flow:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="flow not found")

    new_flow_data = flow_data.model_dump(exclude_none=True)

    db_flow.sqlmodel_update(new_flow_data)
    db.add(db_flow)
    db.commit()
    db.refresh(db_flow)

    return CustomResponse(
        data={"flow": db_flow},
        success=True
    )

@flow_router.delete("/{flow_id}")
async def delete_flow(token: Annotated[str, Depends(oauth2_scheme)], flow_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    flow = db.get(EnFlowDB, flow_id)
    db.delete(flow)
    db.commit()

    return CustomResponse(
        data={"message": "Flow deleted."},
        success=True,
        errors=None
    )
