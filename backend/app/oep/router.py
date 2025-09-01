import os
from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Path
from oemof.tools import economics
from oep_client.oep_client import OepClient
from starlette import status

from ..data.model import GeneralDataModel
from ..responses import DataResponse
from ..security import oauth2_scheme
from ..types import oemofBlockTypes, oepTypes, oepTypesData

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
async def get_oep_data(
        token: Annotated[str, Depends(oauth2_scheme)], table_name: str,
        oep_cli: Annotated[OepClient, Depends(get_oep_client)]
) -> DataResponse:
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
async def get_oep_metadata(
        token: Annotated[str, Depends(oauth2_scheme)],
        table_name: str,
        oep_cli: Annotated[OepClient, Depends(get_oep_client)]
) -> DataResponse:
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
async def get_local_oep_schemas(
        token: Annotated[str, Depends(oauth2_scheme)],
        block_type: Annotated[str, Path(
            enum=list(oemofBlockTypes),
            description="Block type to identify the schema."
        )]
) -> DataResponse:
    """
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

    schema_list = oepTypesData[oemofBlockTypes[block_type]]

    return DataResponse(
        data=GeneralDataModel(
            items=schema_list,
            totalCount=len(schema_list)
        ),
        success=True
    )


@oep_router.get("/local_data/{oep_name}/{simulation_year}")
async def get_local_oep_data(
        token: Annotated[str, Depends(oauth2_scheme)],
        oep_name: Annotated[str, Path(
            enum=list(oepTypes),
            description="Selected parameter set for the OEP data."
        )],
        simulation_year: Annotated[int, Path(
            enum=[2025, 2030, 2035, 2040, 2045, 2050],
            description="Simulation year from the scenario."
        )]
) -> DataResponse:
    """
    Fetch localized Open Energy Platform (OEP) data for a specific simulation year and type.

    This function reads and processes data files related to ports, parameters, and timeseries
    for a given OEP type and simulation year. The processed data includes calculations for
    economic parameters like EPC (Equivalent Policy Costs) costs associated with flows.

    It ensures that correct files exist for the specified parameters and type while also
    validating inputs against permitted values. The data is returned in a structured response
    object that organizes inputs and outputs for further processing.

    :param token: Authentication token required for access.
    :type token: str
    :param oep_type: Type of OEP data being requested.
    :type oep_type: str
    :param simulation_year: The specific year for which simulation data is being requested.
    :type simulation_year: int
    :return: A structured response containing processed OEP data and file information.
    :rtype: DataResponse
    :raises HTTPException: If the token is invalid, the simulation year is unsupported, or any required file is missing.
    """

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    if simulation_year not in [2025, 2030, 2035, 2040, 2045, 2050]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid simulation year.")

    print(f"simulation_year: {simulation_year}")
    print(f"oep_type: {oep_name}")

    for type in oepTypesData.keys():
        item_list = oepTypesData[type]

        for item in item_list:
            if item["name"] == oep_name:
                oep_type = type.value
                break

    root_path = os.path.abspath(
        os.path.join(os.getcwd(), "data", "oep", oep_type.lower())
    )

    port_data_path = os.path.join(root_path, "ports", f"{oep_name.lower()}.csv")
    parameter_data_path = os.path.join(root_path, "parameter", f"{oep_name.lower()}.csv")
    timeseries_data_path = os.path.join(root_path, "timeseries", f"{oep_name.lower()}.csv")

    # Einlesen der Portdaten
    if not os.path.isfile(port_data_path):
        raise HTTPException(status_code=404, detail="File with port specification not found.")
    else:
        with open(port_data_path, "r") as f:
            ports_data = pd.read_csv(f, index_col=0, decimal=",", delimiter=";").to_dict(orient="records")

    # Einlesen der Parameter
    if not os.path.isfile(parameter_data_path):
        raise HTTPException(status_code=404, detail="File with parameter data not found.")
    else:
        with open(parameter_data_path, "r") as f:
            parameter_data = pd.read_csv(f, index_col=0, decimal=",", delimiter=";").to_dict(orient="index")

    # Einlesen der Zeitreihe#
    if ((oep_type.lower() == "sink" or
         oep_type.lower() == "source") and
            not oep_name.lower() == "electricity_export"
    ):
        # print(f"timeseries_data_path: {timeseries_data_path}")
        if not os.path.isfile(timeseries_data_path):
            raise HTTPException(status_code=404, detail="File with timeseries not found.")
        else:
            with open(timeseries_data_path, "r") as f:
                timeseries_data = list(pd.read_csv(f, index_col=0, decimal=",", delimiter=";").loc[:, "data"])
    else:
        timeseries_data = None

    parameter_year_select: dict = parameter_data[simulation_year]

    # Hier hat man die Parameter für das ausgewählte Jahr eingelesen
    param_keys = parameter_year_select.keys()

    # ep_costs berechnen für den Flow
    if "investment_costs" in param_keys and \
            "interest_rate" in param_keys and \
            "operating_costs" in param_keys and \
            "lifetime" in param_keys:
        # Calculate EPC costs for flow
        capex = parameter_year_select["investment_costs"]
        opex = parameter_year_select["investment_costs"] * (parameter_year_select["operating_costs"] / 100)
        interest_rate = parameter_year_select["interest_rate"] / 100

        annuity = economics.annuity(
            capex=capex,
            wacc=interest_rate,
            n=parameter_year_select["lifetime"]
        )
        flow_ep_costs = annuity + opex
    else:
        flow_ep_costs = None

    # Anlegen der Flow-Daten mit Zeitreihe oder ohne
    if timeseries_data is not None:
        flow_data = {
            "fix": timeseries_data
        }
    else:
        flow_data = {}

    if flow_ep_costs is not None:
        flow_data["investment"] = {
            "ep_costs": flow_ep_costs
        }

    # flow-daten die wichtig sind, zum Filtern bei der storage-daten
    flow_data_keys = ["nominal_value",
                      "variable_costs",
                      "min",
                      "max",
                      "fix",
                      "positive_gradient_limit",
                      "negative_gradient_limit",
                      "full_load_time_max",
                      "full_load_time_min",
                      "integer",
                      "nonconvex",
                      "fixed_costs",
                      "age",
                      "lifetime"]

    # Löschen der nicht relevanten Einträge
    parameter_ys_cleaned = parameter_year_select
    for key in ["investment_costs", "operating_costs", "lifetime", "interest_rate", "efficiency_el",
                "efficiency_th"]:
        if key in parameter_ys_cleaned.keys():
            del parameter_ys_cleaned[key]

    for key in flow_data_keys:
        if key in parameter_ys_cleaned.keys() and not key in flow_data.keys():
            flow_data[key] = parameter_ys_cleaned[key]
            del parameter_ys_cleaned[key]
        elif key in parameter_ys_cleaned.keys() and key in flow_data.keys():
            del parameter_ys_cleaned[key]

    # TODO: how do i write the flow data in the right port? Sink/Source/Rest
    for port in ports_data:
        if port["controlled_flow"]:
            port["flow_data"] = flow_data
        else:
            print(f"Nicht steuernder Port: {port}")

        del port["investment"]
        del port["controlled_flow"]

    if "efficiencey_el" in param_keys and port["name"] == "electricity" and port["type"] == "output":
        port["efficiency"] = parameter_year_select["efficiency_el"]

    if "efficiencey_th" in param_keys and port["name"] == "heat" and port["type"] == "output":
        port["efficiency"] = parameter_year_select["efficiency_th"]

    # Ab hier starten die Sonderwünsche
    sorted_port_data = {
        "inputs" : [],
        "outputs": []
    }

    for item in ports_data:
        tmp_type = item["type"]
        del item["type"]

        if tmp_type == "input":
            sorted_port_data["inputs"].append(item)
        elif tmp_type == "output":
            sorted_port_data["outputs"].append(item)

    return_data = [{
        "node_data" : parameter_ys_cleaned,
        "ports_data": sorted_port_data
    }]

    return DataResponse(
        data=GeneralDataModel(
            items=return_data,
            totalCount=len(return_data)
        ),
        success=True
    )
