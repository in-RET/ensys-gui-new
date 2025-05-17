import logging
import os
from datetime import datetime

from celery import Celery
from oemof import solph
from prometheus_client import Counter, Gauge, start_http_server
from sqlalchemy import create_engine
from sqlmodel import select, Session

from .ensys.components import EnModel
from .logger import EnsysLogger
from .scenario.model import EnScenarioDB
from .simulation.model import EnSimulationDB, Status

celery_app = Celery(
    "Sellerie",
    broker=f"redis://redis:{os.getenv("REDIS_PORT")}",
    backend=f"redis://redis:{os.getenv("REDIS_PORT")}",
)
start_http_server(8000)

task_counter = Counter('celery_tasks_total', 'Total number of Celery tasks')
task_in_progress = Gauge('celery_tasks_in_progress', 'Number of Celery tasks in progress')

@celery_app.task(name="ensys.simulation.optimization.run")
def simulation_task(scenario_id: int, simulation_id: int):
    task_counter.inc()
    task_in_progress.inc()

    db = Session(create_engine(os.getenv("DATABASE_URL")))
    scenario = db.get(EnScenarioDB, scenario_id)
    simulation = db.get(EnSimulationDB, simulation_id)
    simulation_token = simulation.sim_token

    dump_path = os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token, "dump")
    log_path = os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token, "log")
    os.makedirs(dump_path, exist_ok=True)
    os.makedirs(log_path, exist_ok=True)

    logger = EnsysLogger(
        name=simulation_token,
        filename=os.path.join(log_path, f"{simulation_token}.log"),
        level=logging.DEBUG
    )

    # Create Energysystem to be stored
    energysystem_api = scenario.energysystem_model
    simulation_model = EnModel(
        energysystem=energysystem_api
    )

    simulation_folder = os.path.abspath(os.path.join(os.getenv("LOCAL_DATADIR"), simulation_token))
    os.makedirs(
        name=simulation_folder,
        exist_ok=True
    )

    with open(os.path.join(simulation_folder, "es_" + simulation_token + ".json"), "wt") as f:
        f.write(simulation_model.model_dump_json())

    logger.info("read scenario data from database")
    scenario = db.exec(select(EnScenarioDB).where(EnScenarioDB.id == scenario_id)).first()

    logger.info("create oemof energy system")
    oemof_es: solph.EnergySystem = solph.EnergySystem(
        timeindex=solph.create_time_index(
            year=scenario.simulation_year,
            interval=scenario.interval,
            number=scenario.time_steps,
            start=scenario.start_date
        ),
        infer_last_interval=True
    )

    oemof_es = simulation_model.energysystem.to_oemof_energysystem(oemof_es)

    # create the model for optimization
    logger.info("create simulation model")
    oemof_model = solph.Model(oemof_es)

    # solve the optimization model
    logger.info("solve optimization model")
    oemof_model.solve(
        solver=str(simulation_model.solver.value),
        solve_kwargs=simulation_model.solver_kwargs if hasattr(simulation_model, "solver_kwargs") else {"tee": True},
        cmdline_opts={"logfile": os.path.join(log_path, "solver.log")}
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
    # try:
    #
    # except Exception as ex:
    #     logger.critical("error - aborting task")
    #     logger.critical(ex)
    #
    #     simulation.status = Status.FAILED.value
    #     simulation.end_date = datetime.now()
    #     db.commit()
    #     db.refresh(simulation)
    #
    #     logger.info("backgroundtask finished")
    #
    #     task_in_progress.dec()
