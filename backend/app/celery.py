import os
from datetime import datetime

from celery import Celery
from celery.utils.log import get_task_logger
from oemof import solph
from prometheus_client import Counter, Gauge
from sqlalchemy import create_engine
from sqlmodel import select, Session

from ensys.components import EnModel
from .scenario.model import EnScenarioDB
from .simulation.model import EnSimulationDB, Status

celery_app = Celery(
    "Sellerie",
    broker=f"redis://redis:{os.getenv("REDIS_PORT")}",
    backend=f"redis://redis:{os.getenv("REDIS_PORT")}",
)

task_counter = Counter('celery_tasks_total', 'Total number of Celery tasks')
task_in_progress = Gauge('celery_tasks_in_progress', 'Number of Celery tasks in progress')


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

    logger = get_task_logger(__name__)

    # Create Energysystem to be stored
    simulation_model = EnModel(
        energysystem=scenario.energysystem
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

    print(f"Scenario Interval:{scenario.interval}")
    print(f"Scenario Timesteps:{scenario.time_steps}")
    print(f"Scenario Startdate:{scenario.start_date}")
    print(f"Scenario Startdate:{type(scenario.start_date)}")
    print(f"Scenario Startdate:{scenario.start_date.year}")

    logger.info("create oemof energy system")
    timeindex = solph.create_time_index(
        start=scenario.start_date,
        number=scenario.time_steps,
        interval=scenario.interval,
    )

    print(f"timeindex:{timeindex}")
    oemof_es: solph.EnergySystem = solph.EnergySystem(
        timeindex=timeindex,
        infer_last_interval=False
    )

    oemof_es = simulation_model.energysystem.to_oemof(oemof_es)

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
