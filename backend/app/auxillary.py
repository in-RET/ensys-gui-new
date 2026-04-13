"""
Auxiliary Functions Module
========================

This module provides supporting functionality for the EnSys application,
including data conversion and utility functions for various application components.

The module provides:
    - Energy system data conversion
    - Model conversion utilities
    - Database utility functions
"""

from datetime import datetime

from fastapi import HTTPException, Depends
from sqlmodel import Session
from starlette import status

from ensys.components import *
from .db import get_db_session
from .simulation.model import EnSimulationDB, Status


def check_flow_investment(flow_data):
    """Create an `EnInvestment` when a flow is marked as investable.

    - param flow_data: flow config dict with investment flags and bounds
    - returns: EnInvestment or None
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
    """Build input/output flow mappings for a flowchart component.

    - param flowchart_data: full flowchart node/connection map
    - param flowchart_component: component node with input/output ports
    - returns: tuple of input_data, output_data keyed by bus name
    """
    # build component_data["inputs"]
    component_data = flowchart_component["data"]

    print(f"Component Data: {component_data}")
    if component_data["connections"] is not None:
        print(f"Number of Connections: {len(component_data["connections"])}")
    else:
        print(f"Number of Connections: {component_data["connections"]}")

    if component_data["connections"] is not None:
        input_data = {}
        if len(flowchart_component["inputs"]) > 0:
            for input_name in flowchart_component["inputs"]:
                flow_data = None

                target_bus_id = flowchart_component["inputs"][input_name]['connections'][0]["node"]
                target_bus_name = flowchart_data[target_bus_id]["name"]

                # flow_data = component_data["connections"]["inputs"][input_name]["formInfo"]
                for node_input in component_data["connections"]["inputs"]:
                    if input_name in node_input:
                        flow_data = node_input[input_name]["formInfo"]

                        if flow_data is None:
                            raise ValueError("Flow Data is None")

                        flow_data["nominal_value"] = check_flow_investment(flow_data)

                input_data[target_bus_name] = EnFlow(**flow_data)

        # build component_data["outputs"]
        output_data = {}

        if len(flowchart_component["outputs"]) > 0:
            for output_name in flowchart_component["outputs"]:
                flow_data = None

                target_bus_id = flowchart_component["outputs"][output_name]['connections'][0]["node"]
                target_bus_name = flowchart_data[target_bus_id]["name"]

                for output in component_data["connections"]["outputs"]:
                    if output_name in output:
                        flow_data = output[output_name]["formInfo"]

                        if flow_data is None:
                            raise ValueError("Flow Data is None")

                        flow_data["nominal_value"] = check_flow_investment(flow_data)

                output_data[target_bus_name] = EnFlow(**flow_data)

        return input_data, output_data

    else:
        return {}, {}


def build_conversion_factors(flowchart_data, flowchart_component) -> dict:
    """Compute conversion factors per bus for a component's ports.

    - param flowchart_data: flowchart metadata indexed by node id
    - param flowchart_component: component node with port definitions
    - returns: mapping of bus name to conversion factor
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
    """Convert GUI flowchart JSON into an `EnEnergysystem` graph.

    - param flowchart_data: dict of nodes/ports from the UI flowchart
    - returns: populated `EnEnergysystem` with buses, flows, and assets
    """
    ensys_es = EnEnergysystem()

    for flowchart_index in flowchart_data:
        ensys_data = {}

        flowchart_component = flowchart_data[flowchart_index]

        component_data = flowchart_component["data"]

        if flowchart_component["class"] != "bus":
            input_data, output_data = create_io_data(flowchart_data, flowchart_component)
            ensys_data["inputs"] = input_data
            ensys_data["outputs"] = output_data

            # change name to label
            ensys_data["label"] = component_data["name"]

            del component_data["name"]

        if flowchart_component["class"] in ["converter", "transformer"]:
            conversion_factors = build_conversion_factors(flowchart_data, flowchart_component)
            ensys_data["conversion_factors"] = conversion_factors

            ensys_component = EnConverter(**ensys_data)

        elif flowchart_component["class"] == "sink":
            ensys_component = EnSink(**ensys_data)

        elif flowchart_component["class"] == "source":
            ensys_component = EnSource(**ensys_data)

        elif flowchart_component["class"] == "genericStorage":
            if component_data["investment"] is True:
                ensys_data["nominal_storage_capacity"] = EnInvestment(
                    maximum=component_data["maximum"] if component_data["maximum"] else None,
                    minimum=component_data["minimum"] if component_data["minimum"] else None,
                    ep_costs=component_data["ep_costs"] if component_data["ep_costs"] else None,
                    existing=component_data["existing"] if component_data["existing"] else None,
                    nonconvex=component_data["nonconvex"] if component_data["nonconvex"] else None,
                    offset=component_data["offset"] if component_data["offset"] else None,
                    overall_maximum=component_data["overall_maximum"] if component_data["overall_maximum"] else None,
                    overalL_minimum=component_data["overall_minimum"] if component_data["overall_minimum"] else None,
                )
            else:
                ensys_data["nominal_storage_capacity"] = component_data["nominal_storage_capacity"]

            ensys_data["invest_relation_input_capacity"] = component_data["invest_relation_input_capacity"] if \
                component_data["invest_relation_input_capacity"] else None
            ensys_data["invest_relation_output_capacity"] = component_data["invest_relation_output_capacity"] if \
                component_data["invest_relation_output_capacity"] else None
            ensys_data["initial_storage_level"] = component_data["initial_storage_level"] if component_data[
                "initial_storage_level"] else None
            ensys_data["balanced"] = component_data["balanced"] if component_data["balanced"] else None
            ensys_data["loss_rate"] = component_data["loss_rate"] if component_data["loss_rate"] else None
            ensys_data["fixed_losses_relative"] = component_data["fixed_losses_relative"] if component_data[
                "fixed_losses_relative"] else None
            ensys_data["fixed_losses_absolute"] = component_data["fixed_losses_absolute"] if component_data[
                "fixed_losses_absolute"] else None
            ensys_data["inflow_conversion_factor"] = component_data["inflow_conversion_factor"] if component_data[
                "inflow_conversion_factor"] else None
            ensys_data["outflow_conversion_factor"] = component_data["outflow_conversion_factor"] if component_data[
                "outflow_conversion_factor"] else None
            ensys_data["min_storage_level"] = component_data["min_storage_level"] if component_data[
                "min_storage_level"] else None
            ensys_data["max_storage_level"] = component_data["max_storage_level"] if component_data[
                "max_storage_level"] else None
            ensys_data["storage_costs"] = component_data["storage_costs"] if component_data["storage_costs"] else None

            ensys_component = EnGenericStorage(**ensys_data)

            print(f"ensys_component: {ensys_component.model_dump_json(indent=2)}")
        elif flowchart_component["class"] == "bus":
            ensys_component = EnBus(label=flowchart_component["name"])
        else:
            raise Exception(f"Component {flowchart_component["name"]} is not supported yet")

        ensys_es.add(ensys_component)

    return ensys_es


def check_container_status(docker_container, simulation_id, db: Session = Depends(get_db_session())):
    """Update simulation status based on a Docker container result.

    - param docker_container: container handle to await
    - param simulation_id: id of the related simulation
    - param db: SQLModel session dependency
    - raises: HTTPException 500 when the container exits with error
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
