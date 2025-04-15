from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from starlette import status

from ..db import get_db_session
from ..link.model import EnLinkDB, EnLinkUpdate
from ..responses import CustomResponse
from ..security import decode_token, oauth2_scheme

simulation_router = APIRouter(
    prefix="/simulations",
    tags=["simulations"]
)

@simulation_router.post("/start/{scenario_id}", response_model=CustomResponse)
async def start_simulation(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    #TODO: Check ob Szenario dem User gehört
    #TODO: Check ob das Projket dem User gehört
    #TODO: oemof-energy-system erstellen

    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")

@simulation_router.post("/stop/{scenario_id}", response_model=CustomResponse)
async def start_simulation(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    #TODO: Check ob Szenario dem User gehört
    #TODO: Check ob das Projket dem User gehört
    #TODO: simulation stoppen

    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")


@simulation_router.get("/{scenario_id}", response_model=CustomResponse)
async def get_simulation(scenario_id: int, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    # TODO: Check ob Szenario dem User gehört
    # TODO: Check ob das Projket dem User gehört

    # TODO: Check ob die Simulation fertig ist --> Datenbank
    # TODO: Daten zurück geben --> Wie?

    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented.")

@simulation_router.delete("/{simulation_id}")
async def delete_link(token: Annotated[str, Depends(oauth2_scheme)], simulation_id: int, db: Session = Depends(get_db_session)) -> CustomResponse:
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

    simulation = db.get(EnLinkDB, simulation_id)
    db.delete(simulation)
    db.commit()

    return CustomResponse(
        data={"message": "Simulation deleted."},
        success=True,
        errors=None
    )
