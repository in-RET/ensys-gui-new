"""
This module defines the router for auxiliary endpoints in the FastAPI application. It includes the necessary imports and sets up the router with a specified prefix and tags for organization.
"""
from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends
from starlette import status

from .service import calculate_ep_costs
from ..models.base import GeneralDataModel
from ..models.response import DataResponse
from ..security import oauth2_scheme

auxiliary_router = APIRouter(
    prefix="/auxiliary",
    tags=["auxiliary"],
)


@auxiliary_router.get("/calculate_ep_costs")
async def calculate_ep_costs_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    capex: float,
    opex: float,
    interest_rate: float,
    lifetime: int,
    deprecation: int | None = None,
) -> DataResponse:
    """
    Endpoint to calculate EP costs.

    - returns: DataResponse with calculated EP costs
    """

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated."
        )

    ep_costs = calculate_ep_costs(
        capex=capex,
        opex=opex,
        interest_rate=interest_rate,
        lifetime=lifetime,
        deprecation=deprecation,
    )

    result_dict = {
        "ep_costs": ep_costs
    }

    return DataResponse(
        data=GeneralDataModel(
            items=[result_dict],
            totalCount=1
        )
    )
