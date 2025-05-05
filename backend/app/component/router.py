from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnComponentsTemplate
from ..db import get_db_session
from ..responses import CustomResponse
from ..security import oauth2_scheme

component_router = APIRouter(
    prefix="/component",
    tags=["component"],
)

# @component_router.post("/", response_model=CustomResponse)
# async def create_component(component_data: EnComponent, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
#     if not token:
#         raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
#
#     component = EnComponent(**component_data.model_dump())
#     db.add(component)
#     db.commit()
#     db.refresh(component)
#
#     return CustomResponse(
#         data={"component": component},
#         success=True
#     )

@component_router.get("/{oemof_type}", response_model=CustomResponse)
async def get_component_templates(oemof_type: str, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    component_template = db.exec(select(EnComponentsTemplate).where(EnComponentsTemplate.oemof_type == str.lower(oemof_type))).first()
    if not component_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component template not found.")
    print(component_template)

    return CustomResponse(
        data={"fields": component_template.fields},
        success=True
    )


# @component_router.get("s/{scenario_id}", response_model=CustomResponse)
# async def get_components(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
#     if not token:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
#
#     componentlist = db.exec(select(EnComponentDB).where(EnComponentDB.scenario_id == scenario_id)).all()
#
#     return CustomResponse(
#         data={"components": componentlist},
#         success=True
#     )
#
# @component_router.get("/{component_id}", response_model=CustomResponse)
# async def get_component(component_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
#     if not token:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
#
#     component = db.get(EnComponentDB, component_id)
#     if not component:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
#
#     return CustomResponse(
#         data={"component": component},
#         success=True
#     )
#
# @component_router.patch("/{component_id}", response_model=CustomResponse)
# async def update_component(component_id: int, component_data: EnComponentUpdate, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
#     if not token:
#         raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
#
#     db_component = db.get(EnComponentDB, component_id)
#     if not db_component:
#         raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Component not found")
#
#     new_component_data = component_data.model_dump(exclude_none=True)
#
#     db_component.sqlmodel_update(new_component_data)
#     db.add(db_component)
#     db.commit()
#     db.refresh(db_component)
#
#     return CustomResponse(
#         data={"component": db_component},
#         success=True
#     )
#
# @component_router.delete("/{component_id}")
# async def delete_component(token: Annotated[str, Depends(oauth2_scheme)], component_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
#     if not token:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
#         # return CustomResponse(
#         #     data=None,
#         #     success=False,
#         #     errors=[ErrorModel(
#         #         code=status.HTTP_401_UNAUTHORIZED,
#         #         message="Not authenticated."
#         #     )],
#         # )
#
#     component = db.get(EnComponentDB, component_id)
#     db.delete(component)
#     db.commit()
#
#     return CustomResponse(
#         data={"message": "Component deleted."},
#         success=True,
#         errors=None
#     )
