from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from .model import EnScenario, EnScenarioUpdate, EnScenarioDB
from ..db import get_db_session
from ..project.router import validate_project_owner
from ..responses import CustomResponse, ErrorModel
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
        return True, ""
    else:
        return False, status.HTTP_401_UNAUTHORIZED, "User not authorized."

@scenario_router.post("/")
async def create_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_data: EnScenario, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    project_id = scenario_data.project_id

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

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

    scenario = EnScenarioDB(**scenario_data.model_dump())
    scenario.user_id = token_user.id

    db.add(scenario)
    db.commit()

    return CustomResponse(
        data="Scenario created.",
        success=True
    )

@scenario_router.get("s/{project_id}")
async def read_scenarios(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    statement = select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
    scenarios = db.exec(statement)

    response_data = []
    for scenario in scenarios:
        response_data.append(scenario.model_dump())

    return CustomResponse(
        data=response_data,
        success=True
    )


@scenario_router.get("/{scenario_id}")
async def read_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db, token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return CustomResponse(
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
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Scenario not found."
        #     )],
        # )

    if not validate_project_owner(scenario.project_id, db, token):
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
        data=scenario.model_dump(),
        success=True,
        errors=None
    )

@scenario_router.patch("/{scenario_id}")
async def update_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int, scenario_data: EnScenarioUpdate, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db, token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return CustomResponse(
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
        # return CustomResponse(
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

    return CustomResponse(
        data="Scenario updated.",
        success=True,
        errors=None
    )


@scenario_router.delete("/{scenario_id}")
async def delete_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    validate_scenario_result, validate_scenario_code, validate_scenario_msg = validate_scenario_owner(scenario_id, db, token)
    if not validate_scenario_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")
        # return CustomResponse(
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

    return CustomResponse(
        data="Scenario deleted.",
        success=True,
        errors=None
    )
