import pytest
from oemof import solph
from oemof.solph._plumbing import _FakeSequence
from pyomo.core import sequence

from ensys.components import EnNonConvex
from ensys.components.flow import EnFlow
from ensys.components.investment import EnInvestment


@pytest.fixture
def oe_energysystem():
    return solph.EnergySystem()


def test_flow_simple(oe_energysystem: solph.EnergySystem):
    oe_flow = solph.Flow()
    ie_flow = EnFlow()
    oe_ie_flow = ie_flow.to_oemof(oe_energysystem)

    assert isinstance(oe_flow, solph.Flow)
    assert isinstance(ie_flow, EnFlow)
    assert oe_ie_flow is not None
    assert isinstance(oe_ie_flow, solph.Flow)


def test_flow_extended(oe_energysystem):
    oe_flow: solph.Flow = solph.Flow(
        nominal_value=solph.Investment(
            maximum=1024.42,
            minimum=0
        ),
        nonconvex=solph.NonConvex(
            initial_status=0,
            minimum_uptime=12,
            maximum_startups=3
        )
    )

    ie_flow: EnFlow = EnFlow(
        nominal_value=EnInvestment(
            maximum=1024.42,
            minimum=0
        ),
        nonconvex=EnNonConvex(
            initial_status=0,
            minimum_uptime=12,
            maximum_startups=3
        )
    )

    oe_ie_flow: solph.Flow = ie_flow.to_oemof(oe_energysystem)

    assert isinstance(oe_flow, solph.Flow)
    assert isinstance(ie_flow, EnFlow)
    assert oe_ie_flow is not None
    assert isinstance(oe_ie_flow, solph.Flow)

    assert isinstance(oe_ie_flow.investment, solph.Investment)
    assert isinstance(oe_ie_flow.nonconvex, solph.NonConvex)

    assert isinstance(oe_ie_flow.investment.maximum, _FakeSequence)
    assert isinstance(oe_ie_flow.investment.minimum, _FakeSequence)
