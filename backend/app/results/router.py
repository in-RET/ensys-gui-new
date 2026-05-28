import os
import zipfile
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from numpy import nan_to_num
from oemof import solph
from oemof.solph import views
from sqlmodel import Session
from starlette import status
from starlette.responses import FileResponse

from .automatic_cost_calc import cost_calculation_from_energysystem
from .model import EnDataFrame, EnTimeSeries, EnTableResult, ResultDataModel
from ..db import get_db_session, SessionLocal
from ..models.base import GeneralDataModel, ErrorModel
from ..models.response import ErrorResponse, ResultResponse
from ..project.model import EnProjectDB
from ..scenario.model import EnScenarioDB
from ..security import oauth2_scheme
from ..simulation.model import EnSimulationDB, Status

results_router = APIRouter(
    prefix="/results",
    tags=["results"],
)


def get_results_from_dump(simulation_id: int, db: Session = SessionLocal()) -> GeneralDataModel:
    """Load simulation results from the dump on disk.

    - param simulation_id: simulation id whose dump to read
    - param db: Session for fetching simulation metadata
    - returns: GeneralDataModel with ResultDataModel entries
    - raises: HTTPException 404 when simulation or dump is missing
    """
    simulation = db.get(EnSimulationDB, simulation_id)
    sim_scenario = db.get(EnScenarioDB, simulation.scenario_id)
    sim_project = db.get(EnProjectDB, sim_scenario.project_id)

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found"
        )

    simulation_token = simulation.sim_token
    simulations_path = os.path.abspath(
        os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token, "dump")
    )
    print(f"simulations_path: {simulations_path}")

    if not os.path.isfile(os.path.join(simulations_path, "oemof_es.dump")):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dumpfile not found"
        )

    es = solph.EnergySystem()
    es.restore(dpath=simulations_path, filename="oemof_es.dump")

    es_results = es.results["main"]

    busses = []
    components = []
    result_data = []
    result_components = []

    for node in es.nodes:
        if isinstance(node, solph.Bus):
            print(f"Bus: {node}")
            busses.append(node)
        else:
            components.append(node)

    # TODO: Dat muss nochmal überdacht werden. Schon gut, aber irgendwie weird.
    for bus in busses:
        graph_data = []

        for t, g in solph.views.node(es_results, node=bus)["sequences"].items():
            idx_asset = abs(t[0].index(bus) - 1)

            series_name = str(t[0][0]) + " > " + str(t[0][1])

            if sim_project.unit_energy == "MW/MWh":
                time_series_data = nan_to_num(g.values) * pow(-1, idx_asset)
                time_series_unit = "MWh"
            else:
                time_series_data = nan_to_num(g.values) * pow(-1, idx_asset) * 1000
                time_series_unit = "kWh"

            time_series = EnTimeSeries(
                name=series_name, data=time_series_data
            )

            result_components.append(
                EnTableResult(
                    name=series_name,
                    value=round(time_series_data.sum(), 4),
                    unit=time_series_unit,
                    type="Energy"
                )
            )

            graph_data.append(time_series)

        bus_data: EnDataFrame = EnDataFrame(
            name=f"{bus}", index=es.timeindex.to_pydatetime(), data=graph_data
        )

        result_data.append(bus_data)

    for component in components:
        result_component_data = {}
        component_data = solph.views.node(es.results["main"], node=component)

        if "scalars" in component_data:
            if sim_project.unit_energy == "MW/MWh":
                if type(component) == solph.components.GenericStorage:
                    result_component_data = EnTableResult(
                        name=str(component),
                        value=round(list(component_data["scalars"])[0], 2),
                        unit="MWh",
                        type="Power"
                    )
                else:
                    result_component_data = EnTableResult(
                        name=str(component),
                        value=round(list(component_data["scalars"])[0], 2),
                        unit="MW",
                        type="Power"
                    )
            else:
                if type(component) == solph.components.GenericStorage:
                    result_component_data = EnTableResult(
                        name=str(component),
                        value=round(list(component_data["scalars"])[0] * 1000, 2),
                        unit="kWh",
                        type="Power"
                    )
                else:
                    result_component_data = EnTableResult(
                        name=str(component),
                        value=round(list(component_data["scalars"])[0] * 1000, 2),
                        unit="kW",
                        type="Power"
                    )

        if result_component_data != {}:
            result_components.append(result_component_data)

    costs = cost_calculation_from_energysystem(es)
    print(f"Costs: {costs}")

    # for key in costs.keys():
    #     for index in costs.index:
    #         data = costs.loc[index, key]
    #
    #         if not math.isnan(data):
    #             result_components.append(EnTableResult(
    #                 name=f"{index} ({key})",
    #                 value=round(data, 2),
    #                 unit="EUR"
    #             ))

    result_components.append(
        EnTableResult(name="Costs", value=round(costs.sum().sum(), 2), unit="EUR/a", type="Costs")
    )

    if "Emissions" in es.results.keys():
        result_components.append(
            EnTableResult(name="Emissions", value=round(es.results["emissions"], 2), unit=sim_project.unit_co2, type="Emissions")
        )

    return_data = [ResultDataModel(static=result_components, graphs=result_data)]

    return GeneralDataModel(items=return_data, totalCount=len(return_data))


@results_router.get("/{simulation_id}", response_model=ResultResponse | ErrorResponse)
async def get_results(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> ResultResponse | ErrorResponse:
    """Return simulation results or status-aware errors.

    - param simulation_id: simulation id to inspect
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: ResultResponse on finished, ErrorResponse otherwise
    - raises: HTTPException 401/404 on auth or missing simulation
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated."
        )

    simulation = db.get(EnSimulationDB, simulation_id)
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found"
        )

    if simulation.status == Status.STARTED.value:
        return ErrorResponse(
            errors=[
                ErrorModel(
                    code=status.HTTP_425_TOO_EARLY,
                    message=f"Simulation {simulation_id} has not finished yet.",
                )
            ]
        )
    elif simulation.status == Status.FAILED.value:
        # TODO: Bessere Rückgabe von Fehlern bei "failed"
        return ErrorResponse(
            errors=[
                ErrorModel(
                    code=status.HTTP_409_CONFLICT,
                    message=f"Simulation {simulation_id} has failed.",
                )
            ]
        )
    elif simulation.status == Status.STOPPED.value:
        return ErrorResponse(
            errors=[
                ErrorModel(
                    code=status.HTTP_409_CONFLICT,
                    message=f"Simulation {simulation_id} has stopped.",
                )
            ]
        )

    elif simulation.status == Status.FINISHED.value:
        return ResultResponse(
            data=get_results_from_dump(simulation.id, db), success=True
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Simulation unknown status."
        )

@results_router.get("/{simulation_id}/dump")
async def get_dumpfile(
    simulation_id: int,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
):
    """Return simulation results or status-aware errors.

    - param simulation_id: simulation id to inspect
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: ResultResponse on finished, ErrorResponse otherwise
    - raises: HTTPException 401/404 on auth or missing simulation
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated."
        )

    simulation = db.get(EnSimulationDB, simulation_id)
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found"
        )

    if simulation.status == Status.STARTED.value:
        return ErrorResponse(
            errors=[
                ErrorModel(
                    code=status.HTTP_425_TOO_EARLY,
                    message=f"Simulation {simulation_id} has not finished yet.",
                )
            ]
        )
    elif simulation.status == Status.FAILED.value:
        # TODO: Bessere Rückgabe von Fehlern bei "failed"
        return ErrorResponse(
            errors=[
                ErrorModel(
                    code=status.HTTP_409_CONFLICT,
                    message=f"Simulation {simulation_id} has failed.",
                )
            ]
        )
    elif simulation.status == Status.STOPPED.value:
        return ErrorResponse(
            errors=[
                ErrorModel(
                    code=status.HTTP_409_CONFLICT,
                    message=f"Simulation {simulation_id} has stopped.",
                )
            ]
        )

    elif simulation.status == Status.FINISHED.value:
        simulation_token = simulation.sim_token

        simulations_path = os.path.abspath(
            os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token)
        )

        dump_path = os.path.abspath(
            os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token, "dump")
        )

        results_path = os.path.abspath(
            os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token, "results")
        )


        if not os.path.isfile(os.path.join(dump_path, "oemof_es.dump")):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Dumpfile not found"
            )

        es = solph.EnergySystem()
        es.restore(dpath=dump_path, filename="oemof_es.dump")
        results = es.results["main"]

        os.makedirs(os.path.join(results_path), exist_ok=True)

        for node in es.nodes:
            if isinstance(node, solph.Bus):
                views.node(results, node.label)["sequences"].to_csv(
                    os.path.join(results_path, f"{node.label}.csv"),
                )

        zip = zipfile.ZipFile(
            file=os.path.join(simulations_path, 'simulation.zip'),
            mode='w'
        )

        for file in os.listdir(dump_path):
            print(f"file: {file}")
            zip.write(
                filename=os.path.join(dump_path, file),
                compress_type=zipfile.ZIP_DEFLATED,
                arcname=os.path.join("dump", file)
            )

        for file in os.listdir(results_path):
            print(f"file: {file}")
            zip.write(
                filename=os.path.join(results_path, file),
                compress_type=zipfile.ZIP_DEFLATED,
                arcname=os.path.join("results", file)
            )

        zip.close()

        return FileResponse(os.path.join(simulations_path, 'simulation.zip'), media_type='application/zip', filename=f'simulation_{simulation_id}.zip')
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Simulation unknown status."
        )
