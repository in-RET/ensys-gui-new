import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from numpy import nan_to_num
from oemof import solph
from sqlmodel import Session
from starlette import status

from .model import EnDataFrame, EnTimeSeries, ResultDataModel
from ..db import get_db_session
from ..responses import ErrorModel, ErrorResponse, ResultResponse
from ..security import oauth2_scheme
from ..simulation.model import EnSimulationDB, Status

results_router = APIRouter(
    prefix="/results",
    tags=["results"],
)


def get_results_from_dump(simulation_id: int, db: Session) -> ResultDataModel:
    """
    Fetches results from a simulation dump file based on the simulation ID. This function
    retrieves the energy system data from a serialized dump file stored in the local directory
    based on a simulation token. It processes the dump files, restores the energy system,
    and aggregates result sequences for each identified energy bus into structured data.
    The results are returned in the form of a ResultDataModel.

    :param simulation_id: ID of the simulation for which results are being fetched
    :type simulation_id: int
    :param db: Database session used to query the simulation information
    :type db: Session
    :return: A ResultDataModel containing the result data extracted from the dump and the
        total count of data entries
    :rtype: ResultDataModel

    :raises HTTPException: Raised with status code 404 if the simulation ID does not exist
        or if the required dump file is not found
    """
    simulation = db.get(EnSimulationDB, simulation_id)

    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    simulation_token = simulation.sim_token
    simulations_path = os.path.abspath(os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token, "dump"))
    # print(f"simulations_path: {simulations_path}")

    if not os.path.isfile(os.path.join(simulations_path, "oemof_es.dump")):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dumpfile not found")

    es = solph.EnergySystem()
    es.restore(
        dpath=simulations_path,
        filename='oemof_es.dump'
    )

    busses = []
    result_data = []

    for node in es.nodes:
        if isinstance(node, solph.Bus):
            print(f"Bus: {node}")
            busses.append(node)

    # TODO: Dat muss nochmal überdacht werden. Schon gut, aber irgendwie weird.
    for bus in busses:
        graph_data = []

        for t, g in solph.views.node(es.results["main"], node=bus)["sequences"].items():
            print(f"G:{len(g)}")
            idx_asset = abs(t[0].index(bus) - 1)
            if idx_asset > 0:
                time_series = EnTimeSeries(
                    name=str(t[0][1]),
                    data=nan_to_num(g.values) * pow(-1, idx_asset)
                )
            else:
                time_series = EnTimeSeries(
                    name=str(t[0][0]),
                    data=nan_to_num(g.values) * pow(-1, idx_asset)
                )

            graph_data.append(time_series)

        bus_data: EnDataFrame = EnDataFrame(
            name=f"{bus}",
            index=es.timeindex.to_pydatetime(),
            data=graph_data
        )

        result_data.append(bus_data)

    return_data: ResultDataModel = ResultDataModel(
        items=result_data,
        totalCount=len(result_data),
    )

    return return_data


@results_router.get("/{simulation_id}", response_model=ResultResponse | ErrorResponse)
async def get_results(
        simulation_id: int, token: Annotated[str, Depends(oauth2_scheme)],
        db: Session = Depends(get_db_session)
) -> ResultResponse | ErrorResponse:
    """
    Retrieve the results of a simulation based on the given simulation id. This endpoint checks
    the current status of the simulation and provides appropriate responses based on that status.
    If the simulation is finished, the results are returned. If the status indicates in-progress,
    failed, or canceled, it responds with corresponding error messages. Errors are also returned
    if the simulation does not exist or if the request is unauthenticated.

    :param simulation_id: The unique identifier of the simulation.
    :type simulation_id: int
    :param token: The OAuth2 token for authentication.
    :type token: str
    :param db: Database session dependency, used to query the database.
    :type db: Session
    :return: A ResultResponse object containing simulation results if successful, or an
             ErrorResponse object containing error details if an error occurs.
    :rtype: ResultResponse | ErrorResponse

    :raises HTTPException: If the request is unauthenticated.
    :raises HTTPException: If the simulation does not exist.
    :raises HTTPException: If the simulation status is unknown.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    simulation = db.get(EnSimulationDB, simulation_id)
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    if simulation.status == Status.STARTED.value:
        return ErrorResponse(
            errors=[ErrorModel(
                code=status.HTTP_425_TOO_EARLY,
                message=f"Simulation {simulation_id} has not finished yet."
            )]
        )
    elif simulation.status == Status.FAILED.value:
        # TODO: Bessere Rückgabe von Fehlern bei "failed"
        return ErrorResponse(
            errors=[ErrorModel(
                code=status.HTTP_409_CONFLICT,
                message=f"Simulation {simulation_id} has failed."
            )]
        )
    elif simulation.status == Status.CANCELED.value:
        return ErrorResponse(
            errors=[ErrorModel(
                code=status.HTTP_409_CONFLICT,
                message=f"Simulation {simulation_id} has cancelled."
            )]
        )
    elif simulation.status == Status.FINISHED.value:
        return ResultResponse(
            data=get_results_from_dump(simulation.id, db),
            success=True
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation unknown status.")
