import os
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from oep_client.oep_client import OepClient
from starlette import status

from ..data.model import GeneralDataModel
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
    It utilizes `os.getenv` to obtain the `OEP_TOKEN` and `OEP_TOPIC` values for
    authentication and topic management, respectively. The OepClient instance is
    yielded, allowing the caller to manage resources appropriately.

    :yield:
        OepClient: A generator that yields an instance of the OepClient class
        configured with a token and a default schema retrieved from the
        environment variables.
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
    :param table_name: The name of the table to retrieve data from.
    :param oep_cli: An instance of the OEP client to interact with the backend database.
    :return: A `DataResponse` object containing the data, total count, and success status.
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
    :param oep_cli: Instance of the OepClient dependency for interacting with the OEP API.
    :return: A DataResponse containing the retrieved metadata and its total count.
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
