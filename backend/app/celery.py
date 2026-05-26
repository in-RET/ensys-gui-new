"""
Celery Task Configuration and Management
======================================

This module configures and manages Celery tasks for the EnSys application,
particularly focusing on energy system simulations and optimizations.

The module provides:
    - Celery application configuration
    - Prometheus metrics for task monitoring
    - Logging setup for task execution
    - Core simulation task implementation
"""

# Standard Library
import json
import logging
import os
import pathlib
from datetime import datetime

from celery.signals import after_setup_logger
from celery.utils.log import get_task_logger
from fastapi import HTTPException
from oemof import solph
from prometheus_client import Counter, Gauge
from sqlalchemy.exc import IntegrityError
from starlette import status

# Third Party
from celery import Celery
# Local Application
from ensys.components import EnModel
from .auxillary import convert_gui_json_to_ensys
from .core.config import get_settings
from .db import SessionLocal
from .scenario.model import EnScenarioDB
from .simulation.model import EnSimulationDB, Status

_settings = get_settings()

celery_app = Celery(
    "Sellerie",
    broker=_settings.redis_url,
    backend=_settings.redis_url,
)

# Prometheus metrics for monitoring
task_counter = Counter("celery_tasks_total", "Total number of Celery tasks")
task_in_progress = Gauge(
    "celery_tasks_in_progress", "Number of Celery tasks in progress"
)

logger = logging.getLogger(__name__)


@after_setup_logger.connect
def setup_loggers(logger, *args, **kwargs):
    """Attach file logging for Celery workers.

    - param logger: celery logger instance
    - returns: None
    """
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    fh = logging.FileHandler(
        os.path.abspath(os.path.join(_settings.local_datadir, "celery.log"))
    )
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(formatter)
    logger.addHandler(fh)


def start_task(simulation: EnSimulationDB):
    """Dispatch the simulation Celery task with a custom task_id.

    - param simulation: EnSimulationDB containing scenario_id and sim_token
    - returns: AsyncResult from Celery
    """
    # Start Celery task
    task = simulation_task.apply_async(
        (simulation.scenario_id, simulation.id), task_id=simulation.sim_token
    )

    return task


@celery_app.task(name="ensys.optimization")
def simulation_task(scenario_id: int, simulation_id: int):
    """Run the energy system optimization for a scenario.

    - param scenario_id: scenario database id
    - param simulation_id: simulation database id
    - returns: dict with simulation_id and timestamps
    - raises: HTTPException 404/409 on missing data or DB errors
    """

    task_counter.inc()
    task_in_progress.inc()

    db = SessionLocal()

    scenario = db.get(EnScenarioDB, scenario_id)
    simulation = db.get(EnSimulationDB, simulation_id)

    # create the necessary directories for dumping and logging
    sim_token = simulation.sim_token

    dump_path = os.path.join(_settings.local_datadir, sim_token, "dump")
    log_path = os.path.join(_settings.local_datadir, sim_token, "log")
    os.makedirs(dump_path, exist_ok=True)
    os.makedirs(log_path, exist_ok=True)

    simulation_folder = os.path.abspath(
        os.path.join(_settings.local_datadir, sim_token)
    )
    os.makedirs(name=simulation_folder, exist_ok=True)

    # Logger initialisieren
    task_logger = get_task_logger(__name__)

    # Log-Datei konfigurieren
    log_file = os.path.join(log_path, f"simulation_{simulation_id}.log")

    # Datei-Handler zu Logger hinzufügen
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    file_handler.setFormatter(formatter)
    task_logger.addHandler(file_handler)

    # convert modeling_data to energy system data
    task_logger.info("convert modeling_data to energy system data")
    modeling_data_json = json.loads(scenario.modeling_data)
    constraints_json = json.loads(scenario.constraints) if scenario.constraints != "" else None

    try:
        with open(os.path.join(simulation_folder, "modeling_data.json"), "w") as f:
            f.write(json.dumps(modeling_data_json, indent=4))

        converted_energy_system = convert_gui_json_to_ensys(
            flowchart_data=modeling_data_json
        )

        # Create Energysystem to be stored
        task_logger.info("create energysystem to be stored")
        simulation_model = EnModel(energysystem=converted_energy_system)

        with open(os.path.join(simulation_folder, f"converted_model.json"), "wt") as f:
            f.write(simulation_model.model_dump_json(indent=4))

        task_logger.info(f"Scenario Interval:{scenario.interval}")
        task_logger.info(f"Scenario Timesteps:{scenario.time_steps}")
        task_logger.info(f"Scenario Startdate:{scenario.start_date}")
        task_logger.info(f"Scenario Simulation_Year:{scenario.start_date.year}")

        task_logger.info("create oemof energy system")
        timeindex = solph.create_time_index(
            start=scenario.start_date,
            number=scenario.time_steps,
            interval=scenario.interval,
        )

        oemof_es: solph.EnergySystem = solph.EnergySystem(
            timeindex=timeindex, infer_last_interval=False
        )

        oemof_es = simulation_model.energysystem.to_oemof(oemof_es)

        # create the model for optimization
        task_logger.info("create simulation model")
        oemof_model = solph.Model(oemof_es)

        # add constraints
        if constraints_json is not None:
            for constraint in constraints_json:
                print(f"Constraint {constraint}")

                if constraint["enabled"]:
                    if constraint["type"] == "emission_limit":
                        solph.constraints.emission_limit(
                            om=oemof_model,
                            limit=float(constraint["values"]["limit"]),
                        )
                    # elif weitere constraints
                    else:
                        task_logger.warning(f"Constraint type {constraint['type']} not recognized or implemented.")

        # solve the optimization model
        # TODO: Dynamic solver kwargs
        # TODO: Dynamic solver selection

        gurobi_logfile = os.path.abspath(os.path.join(log_path, "solver.log"))
        pathlib.Path(gurobi_logfile).touch()

        task_logger.info("solve optimization model")
        oemof_model.solve(
            solver=str(simulation_model.solver.value),
            # solve_kwargs={"tee": True},
            cmdline_opts={
                "LogFile": gurobi_logfile,
                "LogToConsole": 0,
                "OutputFlag": 1,
            },
        )

        task_logger.info("simulation finished")
        # write the lp file for specific analysis
        task_logger.info("write lp file")
        oemof_model.write(
            filename=os.path.join(dump_path, "oemof_model.lp"),
            io_options={"symbolic_solver_labels": True},
        )

        task_logger.info("collect results")
        oemof_es.results["main"] = solph.processing.results(oemof_model)
        oemof_es.results["meta"] = solph.processing.meta_results(oemof_model)

        # Todo: Bei mehreren Constraints ist das hier eine Falle!

        if constraints_json is not None:
            for single_constraint in constraints_json:
                if single_constraint["type"] == "emission_limit" and single_constraint["enabled"]:
                    print(oemof_model.integral_limit_emission_factor())
                    oemof_es.results["emissions"] = oemof_model.integral_limit_emission_factor()

        task_logger.info("dump results")
        oemof_es.dump(dpath=dump_path, filename="oemof_es.dump")

        task_logger.info("update database")
        simulation.status = Status.FINISHED.value
        simulation.end_date = datetime.now()

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            # Generic handling; DB should ideally have unique constraints and proper messages
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Database integrity error at simulation task - 1",
            ) from exc

        db.refresh(simulation)
        task_logger.info("backgroundtask finished")

        task_in_progress.dec()

    except RuntimeError as runError:
        task_logger.critical(f"RuntimeError: {runError}")

        if simulation is not None:
            simulation.status = Status.FAILED.value
            simulation.status_message = str(runError)
            simulation.end_date = datetime.now()

            try:
                db.commit()
            except IntegrityError as exc:
                db.rollback()
                # Generic handling; DB should ideally have unique constraints and proper messages
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Database integrity error at simulation task - 2",
                ) from exc

            db.refresh(simulation)

        task_in_progress.dec()

        raise HTTPException(status_code=500, detail=str(runError))

    except KeyError as keyError:
        task_logger.critical(f"KeyError: {keyError}")

        if simulation is not None:
            simulation.status = Status.FAILED.value
            simulation.status_message = f"It appeared a KeyError for the Key {keyError}."
            simulation.end_date = datetime.now()

            try:
                db.commit()
            except IntegrityError as exc:
                db.rollback()
                # Generic handling; DB should ideally have unique constraints and proper messages
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Database integrity error at simulation task - 2",
                ) from exc

            db.refresh(simulation)

        task_in_progress.dec()

        raise HTTPException(status_code=500, detail=f"It appeared a KeyError for the Key {keyError}.")

    except Exception as ex:
        task_logger.critical(f"Another Exception: {ex}")

        if simulation is not None:
            simulation.status = Status.FAILED.value
            simulation.status_message = str(ex)
            simulation.end_date = datetime.now()

            try:
                db.commit()
            except IntegrityError as exc:
                db.rollback()
                # Generic handling; DB should ideally have unique constraints and proper messages
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Database integrity error at simulation task - 3",
                ) from exc

            db.refresh(simulation)

        task_in_progress.dec()

        raise HTTPException(status_code=500, detail=str(ex))
