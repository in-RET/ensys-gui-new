import pandas as pd
import pytest
from oemof import solph

from backend.app.ensys.common.types import OepTypes
from backend.app.ensys.components import EnNonConvex
from backend.app.ensys.components.flow import OepFlow, EnFlow
from backend.app.ensys.components.investment import EnInvestment


def test_flow_simple():
    es = solph.EnergySystem()

    oe_flow = solph.Flow(
        nominal_value=103.0
    )

    ie_flow = EnFlow(
        nominal_value=103
    ).to_oemof(es)

    assert ie_flow.__dict__ == oe_flow.__dict__


def test_flow_extended():
    es = solph.EnergySystem()

    oe_flow = solph.Flow(
        nominal_value=solph.Investment(maximum=1024.42, minimum=0),
        nonconvex=solph.NonConvex(initial_status=0, minimum_uptime=12, maximum_startups=3)
    )

    ie_flow = EnFlow(
        nominal_value=EnInvestment(maximum=1024.42, minimum=0),
        nonconvex=EnNonConvex(initial_status=0, minimum_uptime=12, maximum_startups=3)
    ).to_oemof(es)

    assert oe_flow.__dict__ == ie_flow.__dict__


@pytest.mark.parametrize("flow_type", [
    OepTypes.storage_electricity,
    OepTypes.solar_thermal_power_plant,
    OepTypes.onshore_wind_power_plant,
])
def test_create_non_oep_kwargs_valid_type(flow_type):
    energy_system = solph.EnergySystem(timeindex=pd.date_range("2025-01-01", periods=24, freq="H"))
    flow = OepFlow(type=flow_type)

    kwargs = flow.create_non_oep_kwargs(es=energy_system)
    assert isinstance(kwargs, dict)


@pytest.mark.parametrize("flow_type", [
    OepTypes.storage_hydrogen,
    OepTypes.methanation,
])
def test_to_oemof(flow_type):
    energy_system = solph.EnergySystem(timeindex=pd.date_range("2025-01-01", periods=24, freq="H"))
    flow = OepFlow(type=flow_type)

    oemof_flow = flow.to_oemof(energysystem=energy_system)
    assert isinstance(oemof_flow, solph.Flow)


@pytest.mark.parametrize("flow_type", [
    OepTypes.biogas_upgrading_plant,
    OepTypes.electrolysis,
])
def test_create_non_oep_kwargs_invalid_data(flow_type):
    energy_system = solph.EnergySystem(timeindex=pd.date_range("2025-01-01", periods=24, freq="H"))
    flow = OepFlow(type=flow_type)

    with pytest.raises(ValueError):
        flow.create_non_oep_kwargs(es=energy_system)
