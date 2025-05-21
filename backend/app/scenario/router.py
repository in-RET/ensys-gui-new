import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnScenario, EnScenarioUpdate, EnScenarioDB
from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..project.router import validate_project_owner
from ..responses import DataResponse, MessageResponse
from ..security import decode_token, oauth2_scheme
from ..user.model import EnUserDB

scenario_router = APIRouter(
    prefix="/scenario",
    tags=["scenario"],
)

def validate_scenario_owner(scenario_id, db, token) -> (bool, int, str):
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()
    if not user:
        return False, status.HTTP_404_NOT_FOUND, "User not found."

    scenario = db.get(EnScenarioDB, scenario_id)

    if scenario.user_id == user.id:
        return True, status.HTTP_200_OK, ""
    else:
        return False, status.HTTP_401_UNAUTHORIZED, "User not authorized."

@scenario_router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_data: EnScenario, db: Session = Depends(get_db_session)) -> MessageResponse:
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

    project_id = scenario_data.project_id

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

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


    scenario = EnScenarioDB(**scenario_data.model_dump())
    scenario.user_id = token_user.id

    with open(os.path.join(os.getenv("LOCAL_DATADIR"), "debug.json"), "wt") as f:
        f.write(scenario.model_dump_json())


    db.add(scenario)
    db.commit()

    return MessageResponse(
        data="Scenario created.",
        success=True
    )

@scenario_router.get("s/{project_id}", response_model=DataResponse)
async def read_scenarios(project_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> DataResponse:
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

    statement = select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
    scenarios = db.exec(statement)

    response_data = []
    for scenario in scenarios:
        response_data.append(scenario.model_dump())

    return DataResponse(
        data=GeneralDataModel(
            items=response_data,
            totalCount=len(response_data)
        ),
        success=True
    )


@scenario_router.get("/{scenario_id}", response_model=DataResponse)
async def read_scenario(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> DataResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db, token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=validate_scenario_code,
        #         message=validate_scenario_msg
        #     )],
        # )

    scenario = db.get(EnScenarioDB, scenario_id)
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Scenario not found."
        #     )],
        # )

    if not validate_project_owner(scenario.project_id, token, db):
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
            items=[scenario.model_dump()],
            totalCount=1
        ),
        success=True
    )

@scenario_router.patch("/{scenario_id}", response_model=MessageResponse)
async def update_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int, scenario_data: EnScenarioUpdate, db: Session = Depends(get_db_session)) -> MessageResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db, token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=validate_scenario_code,
        #         message=validate_scenario_msg
        #     )],
        # )

    db_scenario = db.get(EnScenarioDB, scenario_id)
    if not db_scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="Scenario not found."
        #     )],
        # )

    new_scenario_data = scenario_data.model_dump(exclude_unset=True)

    db_scenario.sqlmodel_update(new_scenario_data)

    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)

    return MessageResponse(
        data="Scenario updated.",
        success=True
    )


@scenario_router.delete("/{scenario_id}", response_model=MessageResponse)
async def delete_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int, db: Session = Depends(get_db_session)) -> MessageResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db, token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=validate_scenario_code,
        #         message=validate_scenario_msg
        #     )],
        # )

    scenario = db.get(EnScenarioDB, scenario_id)
    db.delete(scenario)
    db.commit()

    return MessageResponse(
        data="Scenario deleted.",
        success=True
    )
