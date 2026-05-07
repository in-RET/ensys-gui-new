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

from ensys.components import *


def check_flow_investment(flow_data):
    """Create an `EnInvestment` when a flow is marked as investable.

    - param flow_data: flow config dict with investment flags and bounds
    - returns: EnInvestment or None
    """
    if flow_data["investment"] is True:
        del flow_data["investment"]

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
        return flow_data["nominal_value"]


def create_io_data(flowchart_data, flowchart_component) -> tuple[dict, dict]:
    """Build input/output flow mappings for a flowchart component.

    - param flowchart_data: full flowchart node/connection map
    - param flowchart_component: component node with input/output ports
    - returns: tuple of input_data, output_data keyed by bus name
    """
    # build component_data["inputs"]
    component_data = flowchart_component["data"]

    input_data = {}
    output_data = {}

    if component_data["connections"] is not None:
        # build component_data["inputs"]
        for input_name in flowchart_component["inputs"]:
            print(len(flowchart_component["inputs"][input_name]['connections']))
            if len(flowchart_component["inputs"][input_name]['connections']) > 0:
                target_bus_id = flowchart_component["inputs"][input_name]['connections'][0]["node"]
                target_bus_name = flowchart_data[target_bus_id]["name"]

                # flow_data = component_data["connections"]["inputs"][input_name]["formInfo"]
                for node_input in component_data["connections"]["inputs"]:
                    flow_data = node_input["formInfo"]
                    flow_data["nominal_value"] = check_flow_investment(flow_data)

                    input_data[target_bus_name] = EnFlow(**flow_data)

        # build component_data["outputs"]
        for output_name in flowchart_component["outputs"]:
            if len(flowchart_component["outputs"][output_name]['connections']) > 0:
                target_bus_id = flowchart_component["outputs"][output_name]['connections'][0]["node"]
                target_bus_name = flowchart_data[target_bus_id]["name"]

                for output in component_data["connections"]["outputs"]:
                    flow_data = output["formInfo"]
                    flow_data["nominal_value"] = check_flow_investment(flow_data)

                    output_data[target_bus_name] = EnFlow(**flow_data)

    return input_data, output_data


def build_conversion_factors(flowchart_data, flowchart_component) -> dict:
    """Compute conversion factors per bus for a component's ports.

    - param flowchart_data: flowchart metadata indexed by node id
    - param flowchart_component: component node with port definitions
    - returns: mapping of bus name to conversion factor
    """
    component_ports = flowchart_component["data"]["ports"]
    conversion_factors = {}

    print(component_ports)

    # build conversion_factors
    for input_port in component_ports["inputs"]:
        input_name = component_ports["inputs"][input_port["id"]]["code"]

        if len(flowchart_component["inputs"][input_name]['connections']) > 0:
            target_bus_id = flowchart_component["inputs"][input_name]['connections'][0]["node"]
            target_bus_name = flowchart_data[target_bus_id]["name"]

            conversion_value = component_ports["inputs"][input_port["id"]]["timeSeries"]
            if conversion_value is not None:
                conversion_factors[target_bus_name] = conversion_value

    for output_port in component_ports["outputs"]:
        output_name = component_ports["outputs"][output_port["id"]]["code"]

        if len(flowchart_component["outputs"][output_name]['connections']) > 0:
            target_bus_id = flowchart_component["outputs"][output_name]['connections'][0]["node"]
            target_bus_name = flowchart_data[target_bus_id]["name"]

            conversion_value = component_ports["outputs"][output_port["id"]]["timeSeries"]

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

                investment_dict = {
                    "overall_maximum": component_data["overall_maximum"] if component_data["overall_maximum"] else None,
                    "overalL_minimum": component_data["overall_minimum"] if component_data["overall_minimum"] else None
                }

                if component_data["maximum"] is not None:
                    investment_dict["maximum"] = component_data["maximum"]

                if component_data["minimum"] is not None:
                    investment_dict["minimum"] = component_data["minimum"]
                if component_data["offset"] is not None:
                    investment_dict["offset"] = component_data["offset"]
                if component_data["ep_costs"] is not None:
                    investment_dict["ep_costs"] = component_data["ep_costs"]
                if component_data["existing"] is not None:
                    investment_dict["existing"] = component_data["existing"]
                if component_data["nonconvex"] is not None:
                    investment_dict["nonconvex"] = component_data["nonconvex"]

                ensys_data["nominal_storage_capacity"] = EnInvestment(**investment_dict)
            else:
                ensys_data["nominal_storage_capacity"] = component_data["nominal_storage_capacity"]

            ensys_data["invest_relation_input_capacity"] = component_data["invest_relation_input_capacity"] if component_data["invest_relation_input_capacity"] else None
            ensys_data["invest_relation_output_capacity"] = component_data["invest_relation_output_capacity"] if component_data["invest_relation_output_capacity"] else None
            ensys_data["initial_storage_level"] = component_data["initial_storage_level"] if component_data["initial_storage_level"] else None
            ensys_data["balanced"] = component_data["balanced"] if component_data["balanced"] else None
            ensys_data["loss_rate"] = component_data["loss_rate"] if component_data["loss_rate"] else None
            ensys_data["fixed_losses_relative"] = component_data["fixed_losses_relative"] if component_data["fixed_losses_relative"] else None
            ensys_data["fixed_losses_absolute"] = component_data["fixed_losses_absolute"] if component_data["fixed_losses_absolute"] else None
            ensys_data["inflow_conversion_factor"] = component_data["inflow_conversion_factor"] if component_data["inflow_conversion_factor"] else None
            ensys_data["outflow_conversion_factor"] = component_data["outflow_conversion_factor"] if component_data["outflow_conversion_factor"] else None
            ensys_data["min_storage_level"] = component_data["min_storage_level"] if component_data["min_storage_level"] else None
            ensys_data["max_storage_level"] = component_data["max_storage_level"] if component_data["max_storage_level"] else None
            ensys_data["storage_costs"] = component_data["storage_costs"] if component_data["storage_costs"] else None

            ensys_component = EnGenericStorage(**ensys_data)
        elif flowchart_component["class"] == "bus":
            ensys_component = EnBus(label=flowchart_component["name"])
        else:
            raise Exception(f"Component {flowchart_component["name"]} is not supported yet")

        ensys_es.add(ensys_component)

    return ensys_es
