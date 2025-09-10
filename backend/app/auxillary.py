from datetime import datetime

from fastapi import HTTPException
from sqlmodel import select, Session
from starlette import status

from ensys.components import *
from .db import db_engine
from .project.model import EnProjectDB
from .scenario.model import EnScenarioDB
from .security import decode_token
from .simulation.model import EnSimulationDB, Status
from .user.model import EnUserDB


def validate_project_owner(project_id: int, token: str, db: Session = Session(db_engine)):
    """
    Validates whether the user associated with a given token is the owner of a project
    identified by the provided project_id. Verifies the token's authenticity, fetches
    the project from the database, and compares its ownership details to ensure the user
    has the necessary permissions to access or modify the project.

    :param project_id: ID of the project whose ownership is being validated
    :type project_id: int
    :param token: JWT token provided for authentication and identifying the user
    :type token: str
    :param db: Database session object used to query project and user information. Dependency injection.
    :type db: Session
    :return: Returns True if the token user is the owner of the project, otherwise raises an exception
    :rtype: bool

    :raises HTTPException: If the project is not found in the database (404)
    :raises HTTPException: If the user associated with the token does not own the project (403)
    """
    # Get Database-Session and token-data
    token_data = decode_token(token)

    # Get User-data from the Database
    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    token_user = db.exec(statement).first()

    # get the mentioned project-data
    project = db.get(EnProjectDB, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # check if the project_id and the token_id are the same and return the value
    if token_user.is_staff:
        return True
    elif project.user_id == token_user.id:
        return True
    else:
        raise HTTPException(status_code=403, detail="Permission denied")


def validate_scenario_owner(scenario_id, token, db: Session = Session(db_engine)) -> (bool, int, str):
    """
    Validates whether the owner of a given scenario matches the user from the provided
    authentication token. This function ensures that the logged-in user has the
    authorization to access or modify the scenario.

    :param scenario_id: ID of the scenario to validate ownership for.
    :type scenario_id: Int
    :param db: Database session for executing queries and retrieving data. Dependency injection.
    :type db: Session
    :param token: Authentication token representing the logged-in user.
    :type token: Str
    :return: A tuple containing three values:
             - A boolean indicating whether the user is the owner of the scenario.
             - An HTTP status code indicating the result of the validation.
             - A string message explaining the result (empty string if validation
               is successful).
    :rtype: Tuple(bool, int, str)
    """
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()
    if not user:
        return False, status.HTTP_404_NOT_FOUND, "User not found."

    scenario = db.get(EnScenarioDB, scenario_id)
    if scenario is None:
        return False, status.HTTP_404_NOT_FOUND, "Scenario not found."

    if user.is_staff:
        return True, status.HTTP_200_OK, ""
    elif scenario.user_id == user.id:
        return True, status.HTTP_200_OK, ""
    else:
        return False, status.HTTP_401_UNAUTHORIZED, "User not authorized."


def validate_user_rights(token, scenario_id, db: Session = Session(db_engine)) -> bool:
    """
    Validates a user's rights to access a specific scenario within a project. The function first
    validates whether the user is the owner of the given scenario and subsequently verifies ownership of the
    associated project. Raises appropriate HTTP exceptions if the user is unauthorized or if the specified
    scenario or project does not exist.

    :param token: Authentication token of the user.
    :type token: Str
    :param scenario_id: ID of the scenario to validate access for.
    :type scenario_id: Int
    :param db: Database session/connection object used for querying related data. Dependency injection.
    :type db: Session

    :return: A boolean indicating whether the user is authorized to access the scenario.
    :rtype: Bool

    :raises HTTPException: If the user is unauthorized or the specified scenario or project is not found.
    """

    validation_scenario = validate_scenario_owner(
        token=token,
        scenario_id=scenario_id
    )
    if not validation_scenario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    scenario = db.get(EnScenarioDB, scenario_id)
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    project = db.get(EnProjectDB, scenario.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    validation_project = validate_project_owner(
        token=token,
        project_id=project.id
    )
    if not validation_project:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized.")

    return True


def check_flow_investment(flow_data):
    """
    Checks the investment data in the provided flow data and determines if an investment
    object should be created. If the "investment" flag in the flow data is set to True,
    it constructs and returns an `EnInvestment` object using the relevant attributes from
    the flow data. Otherwise, it returns None.

    :param flow_data: Dictionary containing configuration parameters for the investment.
        Must include the following keys: "investment", "maximum", "minimum", "ep_costs",
        "existing", "nonconvex", "offset", "overall_maximum", "overall_minimum",
        "lifetime", "age", "interest_rate", "fixed_costs".
        Each key should map to its respective value used for creating an `EnInvestment` object.

    :return: Returns an `EnInvestment` object if the "investment" key in `flow_data` is ``True``.
        Otherwise, returns ``None``.
    """
    if flow_data["investment"] is True:
        return EnInvestment(
            maximum=flow_data["maximum"],
            minimum=flow_data["minimum"],
            ep_costs=flow_data["ep_costs"],
            existing=flow_data["existing"],
            nonconvex=flow_data["nonconvex"],
            offset=flow_data["offset"],
            overall_maximum=flow_data["overall_maximum"],
            overalL_minimum=flow_data["overall_minimum"],
            lifetime=flow_data["lifetime"],
            age=flow_data["age"],
            interest_rate=flow_data["interest_rate"],
            fixed_costs=flow_data["fixed_costs"],
            # custom_attributes="to be done"
        )
    else:
        return None


def create_io_data(flowchart_data, flowchart_component) -> (dict, dict):
    """
    Builds dictionaries representing input and output data for a given flowchart component by
    matching connections in the flowchart data with their respective input and output flows.
    The function also checks for possible investments in the flows and updates their
    attributes if applicable.

    :param flowchart_data: The dictionary representing the complete flowchart, where each
        key is a node ID, and the value is the node's details such as name and connections.
    :type flowchart_data: dict

    :param flowchart_component: The specific component in the flowchart for which input and
        output flow data need to be constructed. Contains information about the component's
        inputs, outputs, and associated data.
    :type flowchart_component: dict

    :returns: A tuple containing two dictionaries:
        - **input_data**: Maps input bus names to their corresponding `EnFlow` objects
          created with flow parameters.
        - **output_data**: Maps output bus names to their corresponding `EnFlow` objects
          created with flow parameters.
    :rtype: tuple[dict, dict]
    """
    # build component_data["inputs"]
    component_data = flowchart_component["data"]

    input_data = {}
    if len(flowchart_component["inputs"]) > 0:
        for input_name in flowchart_component["inputs"]:
            print(f"input_name: {input_name}")
            target_bus_id = flowchart_component["inputs"][input_name]['connections'][0]["node"]
            target_bus_name = flowchart_data[target_bus_id]["name"]

            # flow_data = component_data["connections"]["inputs"][input_name]["formInfo"]
            for node_input in component_data["connections"]["inputs"]:
                if input_name in node_input:
                    flow_data = node_input[input_name]["formInfo"]

                    if flow_data["investment"] is True:
                        flow_data["nominal_value"] = EnInvestment(
                            maximum=flow_data["maximum"],
                            minimum=flow_data["minimum"],
                            ep_costs=flow_data["ep_costs"],
                            existing=flow_data["existing"],
                            nonconvex=flow_data["nonconvex"],
                            offset=flow_data["offset"],
                            overall_maximum=flow_data["overall_maximum"],
                            overalL_minimum=flow_data["overall_minimum"],
                            lifetime=flow_data["lifetime"],
                            age=flow_data["age"],
                            interest_rate=flow_data["interest_rate"],
                            fixed_costs=flow_data["fixed_costs"],
                            # custom_attributes="to be done"
                        )

            input_data[target_bus_name] = EnFlow(**flow_data)

    # build component_data["outputs"]
    output_data = {}

    if len(flowchart_component["outputs"]) > 0:
        for output_name in flowchart_component["outputs"]:
            target_bus_id = flowchart_component["outputs"][output_name]['connections'][0]["node"]
            target_bus_name = flowchart_data[target_bus_id]["name"]

            # print(f"target_bus_name: {target_bus_name}")
            # print(f"output_name: {output_name}")

            for output in component_data["connections"]["outputs"]:
                # print(f"output: {output}")
                if output_name in output:
                    flow_data = output[output_name]["formInfo"]

                    if flow_data["investment"] is True:
                        flow_data["nominal_value"] = EnInvestment(
                            maximum=flow_data["maximum"],
                            minimum=flow_data["minimum"],
                            ep_costs=flow_data["ep_costs"],
                            existing=flow_data["existing"],
                            nonconvex=flow_data["nonconvex"],
                            offset=flow_data["offset"],
                            overall_maximum=flow_data["overall_maximum"],
                            overalL_minimum=flow_data["overall_minimum"],
                            lifetime=flow_data["lifetime"],
                            age=flow_data["age"],
                            interest_rate=flow_data["interest_rate"],
                            fixed_costs=flow_data["fixed_costs"],
                            # custom_attributes="to be done"
                        )

            output_data[target_bus_name] = EnFlow(**flow_data)

    return input_data, output_data


def build_conversion_factors(flowchart_data, flowchart_component) -> dict:
    """
    Builds a dictionary of conversion factors for a flowchart component based on its input and output ports.

    This function processes the `flowchart_component` to extract information about its `inputs` and
    `outputs` ports. It matches the port connections using `flowchart_data` and maps the relevant
    conversion values to their associated target buses. The result is a dictionary where keys represent
    target bus names and values correspond to the conversion factors.

    :param flowchart_data: Dict containing metadata and connection details for all components and buses
                           in the flowchart.
    :type flowchart_data: dict
    :param flowchart_component: Dict describing the current flowchart component including its input/output
                                port configurations and respective conversion values.
    :type flowchart_component: dict
    :return: A dictionary mapping target bus names to conversion factors based on the flowchart component's
             input and output port configurations.
    :rtype: dict
    """
    component_ports = flowchart_component["data"]["ports"]
    conversion_factors = {}

    # build conversion_factors
    for input_port in component_ports["inputs"]:
        input_name = component_ports["inputs"][input_port["id"]]["code"]

        target_bus_id = flowchart_component["inputs"][input_name]['connections'][0]["node"]
        target_bus_name = flowchart_data[target_bus_id]["name"]

        conversion_value = component_ports["inputs"][input_port["id"]]["number"]
        if conversion_value is not None:
            conversion_factors[target_bus_name] = conversion_value

    for output_port in component_ports["outputs"]:
        output_name = component_ports["outputs"][output_port["id"]]["code"]

        target_bus_id = flowchart_component["outputs"][output_name]['connections'][0]["node"]
        target_bus_name = flowchart_data[target_bus_id]["name"]

        conversion_value = component_ports["outputs"][output_port["id"]]["number"]
        if conversion_value is not None:
            conversion_factors[target_bus_name] = conversion_value

    return conversion_factors


def convert_gui_json_to_ensys(flowchart_data: dict) -> EnEnergysystem:
    """
    Converts a given GUI JSON representation of a flowchart into an energy system object
    compatible with the EnEnergysystem framework. The function processes the input data,
    creates corresponding energy system components such as converters, sinks, sources,
    buses, and storage units, and integrates these components into an energy system.

    :param flowchart_data: A dictionary representation of the flowchart data containing
        the components, their classifications, and associated properties.
    :type flowchart_data: dict

    :return: An EnEnergysystem object containing the constructed components from the
        provided flowchart data.
    :rtype: EnEnergysystem
    """
    ensys_es = EnEnergysystem()

    for flowchart_index in flowchart_data:
        flowchart_component = flowchart_data[flowchart_index]

        component_data = flowchart_component["data"]

        if flowchart_component["class"] != "bus":
            input_data, output_data = create_io_data(flowchart_data, flowchart_component)
            component_data["inputs"] = input_data
            component_data["outputs"] = output_data

            # change name to label
            component_data["label"] = component_data["name"]
            del component_data["name"]

        if flowchart_component["class"] in ["converter", "transformer"]:
            conversion_factors = build_conversion_factors(flowchart_data, flowchart_component)
            component_data["conversion_factors"] = conversion_factors

            ensys_component = EnConverter(**component_data)

        elif flowchart_component["class"] == "sink":
            ensys_component = EnSink(**component_data)

        elif flowchart_component["class"] == "source":
            ensys_component = EnSource(**component_data)

        elif flowchart_component["class"] == "genericStorage":
            ensys_component = EnGenericStorage(**component_data)

        elif flowchart_component["class"] == "bus":
            ensys_component = EnBus(label=flowchart_component["name"])

        else:
            raise Exception(f"Component {flowchart_component["name"]} is not supported yet")

        ensys_es.add(ensys_component)

    return ensys_es


def check_container_status(docker_container, simulation_id, db: Session = Session(db_engine)):
    """
    Check the status of a Docker container and update the status of an associated simulation
    in the database accordingly.

    This function waits for the completion of a Docker container and retrieves its exit code.
    If the exit code indicates an error, an HTTPException is raised with the container logs.
    Otherwise, it updates the simulation's status to finished, sets the end date, and commits
    the changes to the database.

    :param docker_container: Docker container object representing the container to be monitored
    :type docker_container: DockerContainer
    :param simulation_id: The unique identifier of the simulation associated with the Docker container
    :type simulation_id: int
    :param db: Database session object used for querying and persisting updates. Dependency injection.
    :type db: Session
    :return: None
    :rtype: None
    """
    result_dict = docker_container.wait()

    simulation = db.get(EnSimulationDB, simulation_id)

    if result_dict["StatusCode"] > 0:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=docker_container.logs())
    else:
        simulation.status = Status.FINISHED.value
        simulation.end_date = datetime.now()
        db.commit()
        db.refresh(simulation)
