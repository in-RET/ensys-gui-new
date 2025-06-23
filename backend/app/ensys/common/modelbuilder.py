import json
import logging
import os.path
import time

import pandas as pd
from oemof import solph, tools

from .types import Constraints, Solver, Interval
from ..components import EnEnergysystem, EnModel


class ModelBuilder:
    """
    ModelBuilder is a class responsible for constructing and solving an energy system
    model based on a configuration file. It provides functionality to parse the input
    configuration, log necessary details, handle file operations, and integrate with
    oemof-solph for energy system modeling and optimization.

    The intended use case is to manage energy systems, build components from the
    provided configuration, apply constraints and run optimizations using a defined
    solver.

    :ivar WORKING_DIRECTORY: Path to the working directory where configurations and
        intermediate files will be stored.
    :type WORKING_DIRECTORY: str
    :ivar LOGGING_DIRECTORY: Path to the directory for storing log files.
    :type LOGGING_DIRECTORY: str
    :ivar DUMPING_DIRECTORY: Path to the directory for storing dump files.
    :type DUMPING_DIRECTORY: str
    :ivar logger: Logger instance for logging messages and events during energy
        system construction and solving.
    :type logger: logging.Logger
    """
    WORKING_DIRECTORY = os.getcwd()
    LOGGING_DIRECTORY = os.path.join(WORKING_DIRECTORY, "logs")
    DUMPING_DIRECTORY = os.path.join(WORKING_DIRECTORY, "dumps")
    logger = logging.getLogger(__name__)

    def __init__(self,
                 ConfigFile: str,
                 DumpFile: str,
                 wdir: str,
                 logdir: str,
                 dumpdir: str,
                 only_lp: bool = False
                 ) -> None:
        """
        Initializes an instance with specified configuration and directory settings. This constructor also handles the loading
        of the model configuration from a JSON file, sets up logging, and initiates the energy system building process based on
        the parameters provided. An exception is raised if the configuration file does not follow the expected JSON format.

        :param ConfigFile: Path to the JSON configuration file that defines the energy system model.
        :type ConfigFile: str
        :param DumpFile: File path where the results or intermediary data will be saved during the process.
        :type DumpFile: str
        :param wdir: Working directory path within the current directory to be used for intermediate processing.
        :type wdir: str
        :param logdir: Directory path for saving log files generated during execution.
        :type logdir: str
        :param dumpdir: Directory path for saving system dump files.
        :type dumpdir: str
        :param only_lp: Indicator for whether only linear programming should be used in the energy system solver.
        :type only_lp: bool, optional
        """

        self.WORKING_DIRECTORY = os.path.join(os.getcwd(), wdir)
        if not os.path.exists(self.WORKING_DIRECTORY):
            os.makedirs(self.WORKING_DIRECTORY)

        self.LOGGING_DIRECTORY = logdir
        if not os.path.exists(self.LOGGING_DIRECTORY):
            os.makedirs(self.LOGGING_DIRECTORY)

        self.DUMPING_DIRECTORY = dumpdir
        if not os.path.exists(self.DUMPING_DIRECTORY):
            os.makedirs(self.DUMPING_DIRECTORY)

        # handle various filetypes
        logfile = os.path.basename(ConfigFile)

        if ConfigFile.find(".json") > 0:
            logfile = logfile.replace(".json", ".log")

            xf = open(ConfigFile, 'rt')
            model_dict = json.load(xf)
            model = EnModel(**model_dict)
            xf.close()
        else:
            raise Exception("Fileformat is not valid!")

        tools.logger.define_logging(logpath=self.LOGGING_DIRECTORY, logfile=logfile, file_level=logging.INFO,
                                    screen_level=logging.INFO)
        self.logger.info("Start Building and solving")

        if hasattr(model, "solver_kwargs") and model.solver_kwargs is not None:
            cmdline_opts = model.solver_kwargs
        else:
            cmdline_opts = {}

        self.BuildEnergySystem(model.energysystem, DumpFile, model.solver, model.solver_verbose,
                               cmdline_opts=cmdline_opts, only_lp=only_lp)

    def BuildEnergySystem(self, es: EnEnergysystem, file: str, solver: Solver, solver_verbose: bool, cmdline_opts: dict,
                          only_lp: bool):
        """
        Builds an energy system from a configuration file and prepares it for optimization.
        The method constructs an oemof energy system based on the provided configuration,
        populates it with components, adds constraints if specified, prepares log and LP
        files, and optionally solves the optimization problem.

        :param es: The energy system configuration object containing attributes such as
            start_date, time_steps, frequenz, components, and constraints.
        :type es: EnEnergysystem
        :param file: The configuration file for building the energy system.
        :type file: str
        :param solver: The solver to be used for optimization.
        :type solver: Solver
        :param solver_verbose: Boolean flag indicating whether detailed output by the solver
            should be logged.
        :type solver_verbose: bool
        :param cmdline_opts: A dictionary of command-line options for the solver.
        :type cmdline_opts: dict
        :param only_lp: Boolean flag indicating if only the LP file should be stored without
            solving.
        :type only_lp: bool
        :return: None
        """
        logging.basicConfig(filename='ensys.log', level=logging.INFO)
        self.logger.info("Build an Energysystem from config file.")
        filename = os.path.basename(file)

        ##########################################################################
        # Build the oemof-energysystem
        ##########################################################################
        if es.frequenz is Interval.quarter_hourly:
            freq = "15min"
        elif es.frequenz is Interval.half_hourly:
            freq = "30min"
        elif es.frequenz is Interval.hourly:
            freq = "1h"
        else:
            freq = "H"

        timeindex = pd.date_range(start=es.start_date,
                                  periods=es.time_steps,
                                  freq=freq)

        oemof_es = solph.EnergySystem(
            timeindex=timeindex
        )

        except_vars = ["label", "start_date", "time_steps", "frequenz", "constraints"]

        for attr in vars(es):
            if attr not in except_vars:
                self.logger.info("Build " + attr)

                arg_value = getattr(es, attr)

                for value in arg_value:
                    oemof_obj = value.to_oemof(oemof_es)

                    if oemof_obj is not None:
                        oemof_es.add(oemof_obj)

        self.logger.info("Build completed.")

        # pre_dump_file = open(os.path.join(self.DUMPING_DIRECTORY, filename.replace(".dump", "_pre-dump.dump")), "wt")
        # json_str = json.dumps(oemof_es.__dict__)
        # pickle.dump(json_str, pre_dump_file)

        ##########################################################################
        # Initiate the energy system model
        ##########################################################################
        self.logger.info("Initiate the energy system model.")
        model = solph.Model(oemof_es, debug=False)

        ##########################################################################
        # Add Constraints to the model
        ##########################################################################
        self.logger.info("Adding constraints to the energy system model.")
        if hasattr(es, "constraints"):
            for constr in es.constraints:
                kwargs = constr.to_oemof()

                if constr.typ == Constraints.shared_limit:
                    solph.constraints.shared_limit(model=model, **kwargs)

                elif constr.typ == Constraints.investment_limit:
                    model = solph.constraints.investment_limit(model=model, **kwargs)

                elif constr.typ == Constraints.additional_investment_flow_limit:
                    model = solph.constraints.additional_investment_flow_limit(model=model, **kwargs)

                elif constr.typ == Constraints.generic_integral_limit:
                    model = solph.constraints.generic_integral_limit(om=model, **kwargs)

                elif constr.typ == Constraints.emission_limit:
                    solph.constraints.emission_limit(om=model, **kwargs)

                elif constr.typ == Constraints.limit_active_flow_count:
                    model = solph.constraints.limit_active_flow_count(model=model, **kwargs)

                elif constr.typ == Constraints.limit_active_flow_count_by_keyword:
                    model = solph.constraints.limit_active_flow_count_by_keyword(model=model, **kwargs)

                elif constr.typ == Constraints.equate_variables:
                    solph.constraints.equate_variables(model=model, **kwargs)

        ### Create Logfile for Solver
        logfile = os.path.join(self.LOGGING_DIRECTORY, filename.replace(".dump", "_solver.log"))
        self.logger.info("Logfile: " + self.LOGGING_DIRECTORY)

        ### Store LP files
        lp_filename = os.path.join(self.DUMPING_DIRECTORY, filename.replace(".dump", ".lp"))

        self.logger.info("Store lp-file in {0}.".format(lp_filename))
        model.write(lp_filename, io_options={"symbolic_solver_labels": True})
        ### Set Environmental Variables for the solver
        # map kwargs for pyomo.enviroment and later usage
        solve_kwargs = {"tee": solver_verbose}
        cmdline_opts["logfile"] = logfile

        if not only_lp:
            ##########################################################################
            # solving...
            ##########################################################################
            self.logger.info("Solve the optimization problem.")

            t_start = time.time()
            model.solve(solver=solver.value,
                        solve_kwargs=solve_kwargs,
                        cmdline_options=cmdline_opts)

            t_end = time.time()

            self.logger.info("Completed after " + str(round(t_end - t_start, 2)) + " seconds.")
            self.logger.info("Store the energy system with the results.")

            ##########################################################################
            # The processing module of the outputlib can be used to extract the results
            # from the model transfer them into a homogeneous structured dictionary.
            ##########################################################################
            oemof_es.results["main"] = solph.processing.results(model)
            oemof_es.results["meta"] = solph.processing.meta_results(model)
            oemof_es.results["df"] = solph.processing.create_dataframe(model)

            self.logger.info("Dump file with results to: " + os.path.join(self.DUMPING_DIRECTORY, filename))

            oemof_es.dump(dpath=self.DUMPING_DIRECTORY, filename=filename)
            self.logger.info("Fin.")
