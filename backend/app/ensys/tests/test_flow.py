from oemof import solph

from backend.app.ensys.components import EnNonConvex
from backend.app.ensys.components.flow import EnFlow
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
