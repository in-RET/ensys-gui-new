import os
from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from oep_client.oep_client import OepClient
from starlette import status
from oemof.tools import economics

from ..data.model import GeneralDataModel
from ..ensys.common.types import OepTypes
from ..responses import DataResponse
from ..security import oauth2_scheme

oep_router = APIRouter(
    prefix="/oep",
    tags=["oep"],
)


def get_oep_client():
    """
    Provides a generator function to yield an instance of the OepClient class.

    This function accesses environment variables to retrieve the necessary
    credentials and configurations required for creating an OepClient instance.
    It uses `os.getenv` to get the `OEP_TOKEN` and `OEP_TOPIC` values for
    authentication and topic management, respectively. The OepClient instance is
    yielded, allowing the caller to manage resources appropriately.

    :return:
        OepClient: A generator that yields an instance of the OepClient class
        configured with a token and a default schema retrieved from the
        environment variables.
    :rtype: OepClient
    """
    yield OepClient(
        token=os.getenv("OEP_TOKEN"),
        default_schema=os.getenv("OEP_TOPIC")
    )


@oep_router.get("/{table_name}")
async def get_oep_data(token: Annotated[str, Depends(oauth2_scheme)], table_name: str,
                       oep_cli: OepClient = Depends(get_oep_client)) -> DataResponse:
    """
    Get OEP Data from a specified table.

    This endpoint retrieves data from a specified table using the provided `table_name`.
    The OEP client instance is used to interact with the database, and token-based
    authentication is required for accessing the endpoint. The data response includes
    the retrieved items, their total count, and a success status indicator.

    :param token: A bearer token for authentication.
    :type token: str
    :param table_name: The name of the table to retrieve data from.
    :type table_name: str
    :param oep_cli: An instance of the OEP client to interact with the backend database. Dependency injection.
    :type oep_cli: OepClient
    :return: A `DataResponse` object containing the data, total count, and success status.
    :rtype: DataResponse

    :raises HTTPException: If the token is invalid or not provided.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    data = oep_cli.select_from_table(table=table_name)

    return DataResponse(
        data=GeneralDataModel(
            items=data,
            totalCount=len(data)
        ),
        success=True
    )


@oep_router.get("/meta/{table_name}")
async def get_oep_metadata(token: Annotated[str, Depends(oauth2_scheme)], table_name: str,
                           oep_cli: OepClient = Depends(get_oep_client)) -> DataResponse:
    """
    Retrieve metadata for a specific table.

    This endpoint fetches metadata for the provided table name using the OEP client.
    It requires authentication via the provided token. If the token is invalid or
    not provided, an authentication error will be raised.

    :param token: The authentication token obtained via the OAuth2 scheme.
    :param table_name: The name of the table for which metadata is to be retrieved.
    :param oep_cli: Instance of the OepClient dependency for interacting with the OEP API. Dependency injection.
    :return: A DataResponse containing the retrieved metadata and its total count.
    :rtype: DataResponse

    :raises HTTPException: If the token is invalid or not provided.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    data = oep_cli.get_metadata(table=table_name)

    return DataResponse(
        data=GeneralDataModel(
            items=data,
            totalCount=len(data)
        ),
        success=True
    )


@oep_router.get("/local_schemas/{block_type}")
async def get_local_oep_schemas(token: Annotated[str, Depends(oauth2_scheme)], block_type: str) -> DataResponse:
    """
    Retrieve local schemas based on a block type.

    This endpoint retrieves a list of local schemas that match the provided
    block type. It accepts a user authentication token to ensure the request
    is authenticated. The schemas are filtered from a predefined list based
    on the specified block type.

    :param token: An authentication token is required to request authorization.
    :param block_type: The type of block to filter the schemas by.
    :return: A DataResponse object containing the list of matching schemas and
        a success indicator.
    :raises HTTPException: Raises a 401 HTTP status code exception if the user
        is unauthorized or the token is invalid.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    schema_list = []
    for entry in OepTypes:
        # print(f"{entry.name} ==> {entry.value[1]}")
        if entry.value[1] == block_type.lower():
            schema_list.append(entry.name)

    return DataResponse(
        data=GeneralDataModel(
            items=schema_list,
            totalCount=len(schema_list)
        ),
        success=True
    )


@oep_router.get("/local_data/{block_schema}/{simulation_year}")
async def get_local_oep_data(token: Annotated[str, Depends(oauth2_scheme)], block_schema: str,
                             simulation_year: int) -> DataResponse:
    """
    Fetches local OEP (Open Energy Platform) data based on the provided schema type and simulation year.

    This function authenticates the user, validates the block schema,
    and reads simulation data for the requested year from local storage.

    :param token: Authentication token required to access the endpoint
    :param block_schema: Schema type of the data to retrieve
    :param simulation_year: Year of the simulation data to fetch
    :return: A DataResponse object containing the data items, total count, and a success flag
    :raises HTTPException: If token is invalid, if the block schema is not found, or
                           if there are issues with the requested data
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if simulation_year not in [2025, 2030, 2035, 2040, 2045, 2050]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid simulation year.")

    oep_type = OepTypes[block_schema]

    file_path = os.path.abspath(
        os.path.join(os.getcwd(), "data", "oep", oep_type.value[1].lower(), f"{oep_type.value[0]}.csv"))

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")
    else:
        with open(file_path, "r") as f:
            data = pd.read_csv(f, index_col=0, decimal=",", delimiter=";")
            year_selected_data = data.loc[simulation_year]

        # Calculate EPC costs
        capex = year_selected_data.loc["investment_costs"]
        opex = year_selected_data.loc["investment_costs"] * (year_selected_data.loc["operating_costs"] / 100)

        annuity = economics.annuity(
            capex=capex,
            wacc=0.05, # TODO: Make this configurable
            n=year_selected_data.loc["lifetime"]
        )
        ep_costs = annuity + opex

        # delete non-relevant columns
        return_data = year_selected_data.drop(columns=["investment_costs", "operating_costs", "lifetime"], inplace=True)
        if return_data is not None:
            return_data = return_data.to_dict()
            return_data["epc_costs"] = ep_costs
        else:
            return_data = {
                'ep_costs': ep_costs
            }

        # Form Data to list
        return_data = [return_data]

        return DataResponse(
            data=GeneralDataModel(
                items=return_data,
                totalCount=len(return_data)
            ),
            success=True
        )
