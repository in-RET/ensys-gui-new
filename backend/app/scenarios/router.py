from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnScenario, EnScenarioUpdate, EnScenarioDB
from ..constants import get_db_session, oauth2_scheme, decode_token
from ..projects.router import validate_project_owner
from ..users.model import EnUserDB

scenario_router = APIRouter(
    prefix="/scenarios",
    tags=["scenarios"],
)

def validate_scenario_owner(scenario_id, db, token):
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    scenario = db.get(EnScenarioDB, scenario_id)

    if scenario.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authorized.")
    else:
        return True

@scenario_router.post("/create")
async def create_scenario(token: Annotated[str, Depends(oauth2_scheme)], form_data: Annotated[EnScenario, Form()], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    project_id = form_data.project_id

    token_data = decode_token(token)
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = EnScenarioDB(**form_data.model_dump())
    scenario.user_id = token_user.id

    db.add(scenario)
    db.commit()

    return JSONResponse(
        content={
            "message": "Scenario created.",
        },
        status_code=status.HTTP_200_OK,
    )

@scenario_router.get("/read_all")
async def read_scenarios(token: Annotated[str, Depends(oauth2_scheme)], project_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_project_owner(project_id, token, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    statement = select(EnScenarioDB).where(EnScenarioDB.project_id == project_id)
    scenarios = db.exec(statement)

    response_data = []
    for scenario in scenarios:
        response_data.append(scenario.model_dump())

    return JSONResponse(
        content={"scenarios": response_data},
        status_code=status.HTTP_200_OK,
    )

@scenario_router.get("/read")
async def read_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_scenario_owner(scenario_id, db, token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = db.get(EnScenarioDB, scenario_id)
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    if not validate_project_owner(scenario.project_id, db, token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")


    return JSONResponse(
        content={
            "scenario": scenario.model_dump_json(),
        },
        status_code=status.HTTP_200_OK,
    )

@scenario_router.patch("/update")
async def update_scenario(token: Annotated[str, Depends(oauth2_scheme)], form_data: Annotated[EnScenarioUpdate, Form()], scenario_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_scenario_owner(scenario_id, db, token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    db_scenario = db.get(EnScenarioDB, scenario_id)
    if not db_scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    new_scenario_data = form_data.model_dump(exclude_unset=True)

    db_scenario.sqlmodel_update(new_scenario_data)

    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)

    return JSONResponse(
        content={"message": "Scenario updated."},
        status_code=status.HTTP_200_OK,
    )


@scenario_router.delete("/delete")
async def delete_scenario(token: Annotated[str, Depends(oauth2_scheme)], scenario_id: int, db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if not validate_scenario_owner(scenario_id, db, token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = db.get(EnScenarioDB, scenario_id)
    db.delete(scenario)
    db.commit()

    return JSONResponse(
        content={"message": "Scenario deleted."},
        status_code=status.HTTP_200_OK,
    )
