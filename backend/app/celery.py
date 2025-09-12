import json
import logging
import os
import pathlib
from datetime import datetime

from celery import Celery
from celery.signals import after_setup_logger
from celery.utils.log import get_task_logger
from fastapi import HTTPException
from oemof import solph
from prometheus_client import Counter, Gauge
from sqlalchemy import create_engine
from sqlmodel import Session

from ensys.components import EnModel
from .auxillary import convert_gui_json_to_ensys
from .scenario.model import EnScenarioDB
from .simulation.model import EnSimulationDB, Status

celery_app = Celery(
    "Sellerie",
    broker=f"redis://redis:{os.getenv("REDIS_PORT")}",
    backend=f"redis://redis:{os.getenv("REDIS_PORT")}",
)

task_counter = Counter('celery_tasks_total', 'Total number of Celery tasks')
task_in_progress = Gauge('celery_tasks_in_progress', 'Number of Celery tasks in progress')

logger = logging.getLogger(__name__)

@after_setup_logger.connect
def setup_loggers(logger, *args, **kwargs):
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # add filehandler
    fh = logging.FileHandler(os.path.abspath(os.path.join(os.getenv("LOCAL_DATADIR"), "celery.log")))
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(formatter)
    logger.addHandler(fh)


@celery_app.task(name="ensys.optimization")
def simulation_task(scenario_id: int, simulation_id: int):
    """
    Perform simulation task including data preparation, energy system creation, optimization,
    and result processing.

    This function is a Celery task that interacts with a database to fetch simulation and
    scenario data. It creates an energy system model, optimizes using the oemof library,
    processes the results, and updates the database with the results of the simulation.

    Detailed actions performed by the function include:
    - Fetching scenario and simulation details from the database.
    - Preparing necessary directory structures and dumping input data.
    - Configuring and initializing the oemof energy system.
    - Solving an optimization model using specified solver parameters.
    - Writing optimization results to files for further analysis.
    - Updating the status of the simulation task in the database.

    :param scenario_id: Identifier of the scenario to be simulated.
    :type scenario_id: int
    :param simulation_id: Identifier of the simulation instance.
    :type simulation_id: int

    :return: None
    :rtype: NoneType
    """
    try:
        task_counter.inc()
        task_in_progress.inc()

        db = Session(create_engine(os.getenv("DATABASE_URL")))

        scenario = db.get(EnScenarioDB, scenario_id)
        simulation = db.get(EnSimulationDB, simulation_id)

        # create the necessary directories for dumping and logging
        sim_token = simulation.sim_token

        dump_path = os.path.join(os.getenv("LOCAL_DATADIR"), sim_token, "dump")
        log_path = os.path.join(os.getenv("LOCAL_DATADIR"), sim_token, "log")
        os.makedirs(dump_path, exist_ok=True)
        os.makedirs(log_path, exist_ok=True)

        simulation_folder = os.path.abspath(os.path.join(os.getenv("LOCAL_DATADIR"), sim_token))
        os.makedirs(
            name=simulation_folder,
            exist_ok=True
        )

        # Logger initialisieren
        logger = get_task_logger(__name__)

        # Log-Datei konfigurieren
        log_file = os.path.join(log_path, f"simulation_{simulation_id}.log")

        # Datei-Handler zu Logger hinzufügen
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        # convert modeling_data to energy system data
        logger.info("convert modeling_data to energy system data")
        modeling_data_json = json.loads(scenario.modeling_data)

        with open(os.path.join(simulation_folder, "modeling_data.json"), "w") as f:
            f.write(json.dumps(modeling_data_json, indent=4))

        converted_energy_system = convert_gui_json_to_ensys(modeling_data_json)

        # Create Energysystem to be stored
        logger.info("create energysystem to be stored")
        simulation_model = EnModel(
            energysystem=converted_energy_system
        )

        with open(os.path.join(simulation_folder, f"converted_model.json"), "wt") as f:
            f.write(simulation_model.model_dump_json(indent=4))

        logger.info(f"Scenario Interval:{scenario.interval}")
        logger.info(f"Scenario Timesteps:{scenario.time_steps}")
        logger.info(f"Scenario Startdate:{scenario.start_date}")
        logger.info(f"Scenario Simulation_Year:{scenario.start_date.year}")

        logger.info("create oemof energy system")
        timeindex = solph.create_time_index(
            start=scenario.start_date,
            number=scenario.time_steps,
            interval=scenario.interval,
        )

        oemof_es: solph.EnergySystem = solph.EnergySystem(
            timeindex=timeindex,
            infer_last_interval=False
        )

        oemof_es = simulation_model.energysystem.to_oemof(oemof_es)

        # create the model for optimization
        logger.info("create simulation model")
        oemof_model = solph.Model(oemof_es)

        # solve the optimization model
        # TODO: Dynamic solver kwargs
        # TODO: Dynamic solver selection

        gurobi_logfile = os.path.abspath(os.path.join(log_path, "solver.log"))
        pathlib.Path(gurobi_logfile).touch()
        print(gurobi_logfile)

        logger.info("solve optimization model")
        oemof_model.solve(
            solver=str(simulation_model.solver.value),
            #solve_kwargs={"tee": True},
            cmdline_opts={
                "LogFile": gurobi_logfile,
                "LogToConsole": 0,
                "OutputFlag": 1
            }
        )

        logger.info("simulation finished")
        # write the lp file for specific analysis
        logger.info("write lp file")
        oemof_model.write(
            filename=os.path.join(dump_path, "oemof_model.lp"),
            io_options={"symbolic_solver_labels": True}
        )

        logger.info("collect results")
        oemof_es.results["main"] = solph.processing.results(oemof_model)
        oemof_es.results["meta"] = solph.processing.meta_results(oemof_model)

        logger.info("dump results")
        oemof_es.dump(
            dpath=dump_path,
            filename="oemof_es.dump"
        )

        logger.info("update database")
        simulation.status = Status.FINISHED.value
        simulation.end_date = datetime.now()
        db.commit()
        db.refresh(simulation)
        logger.info("backgroundtask finished")

        task_in_progress.dec()

    except RuntimeError as runError:
        logger.critical("error - runtime error")
        logger.critical(runError)

        simulation.status = Status.FAILED.value
        simulation.status_message = str(runError)
        simulation.end_date = datetime.now()
        db.commit()
        db.refresh(simulation)

        task_in_progress.dec()

        raise HTTPException(status_code=500, detail=runError)

    except Exception as ex:
        logger.critical("error - aborting task")
        logger.critical(ex)

        task_in_progress.dec()

        raise HTTPException(status_code=500, detail=ex)
