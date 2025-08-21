import json

from sqlmodel import select
from starlette import status

from ensys.components import *
from .model import EnScenarioDB
from ..security import decode_token
from ..user.model import EnUserDB


def validate_scenario_owner(scenario_id, db, token) -> (bool, int, str):
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

    if scenario.user_id == user.id:
        return True, status.HTTP_200_OK, ""
    else:
        return False, status.HTTP_401_UNAUTHORIZED, "User not authorized."


def transform_flowchart_data_to_energysystem(flowchart_data: json):
    pass


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
    for input_name in flowchart_component["inputs"]:
        target_bus_id = flowchart_component["inputs"][input_name]['connections'][0]["node"]
        target_bus_name = flowchart_data[target_bus_id]["name"]

        flow_data = component_data["connections"]["inputs"][input_name]["formInfo"]
        possible_investment = check_flow_investment(flow_data)

        if possible_investment is not None:
            flow_data["nominal_value"] = possible_investment

        input_data[target_bus_name] = EnFlow(**flow_data)

    # build component_data["outputs"]
    output_data = {}
    for output_name in flowchart_component["outputs"]:
        target_bus_id = flowchart_component["outputs"][output_name]['connections'][0]["node"]
        target_bus_name = flowchart_data[target_bus_id]["name"]

        flow_data = component_data["connections"]["outputs"][output_name]["formInfo"]
        possible_investment = check_flow_investment(flow_data)

        if possible_investment is not None:
            flow_data["nominal_value"] = possible_investment

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
    for input in component_ports["inputs"]:
        input_name = component_ports["inputs"][input["id"]]["code"]

        target_bus_id = flowchart_component["inputs"][input_name]['connections'][0]["node"]
        target_bus_name = flowchart_data[target_bus_id]["name"]

        conversion_value = component_ports["inputs"][input["id"]]["number"]
        if conversion_value is not None:
            conversion_factors[target_bus_name] = conversion_value

    for output in component_ports["outputs"]:
        output_name = component_ports["outputs"][output["id"]]["code"]

        target_bus_id = flowchart_component["outputs"][output_name]['connections'][0]["node"]
        target_bus_name = flowchart_data[target_bus_id]["name"]

        conversion_value = component_ports["outputs"][output["id"]]["number"]
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
