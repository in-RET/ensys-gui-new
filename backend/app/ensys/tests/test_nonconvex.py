import pytest
from oemof import solph
from oemof.solph._plumbing import _FakeSequence

from backend.app.ensys.components import EnNonConvex


@pytest.fixture
def oe_nonconvex() -> solph.NonConvex:
    return solph.NonConvex(initial_status=0,
                           minimum_uptime=12,
                           minimum_downtime=6,
                           maximum_startups=3,
                           maximum_shutdowns=3)


@pytest.fixture
def ie_nonconvex() -> EnNonConvex:
    return EnNonConvex(initial_status=0,
                       minimum_uptime=12,
                       minimum_downtime=6,
                       maximum_startups=3,
                       maximum_shutdowns=3)


def test_nonconvex(oe_nonconvex: solph.NonConvex, ie_nonconvex: EnNonConvex):
    assert isinstance(oe_nonconvex, solph.NonConvex)
    assert isinstance(ie_nonconvex, EnNonConvex)

    es = solph.EnergySystem()
    oe_ie_nonconvex = ie_nonconvex.to_oemof(es)

    assert oe_ie_nonconvex is not None
    assert isinstance(oe_ie_nonconvex, solph.NonConvex)

    assert isinstance(oe_ie_nonconvex.shutdown_costs, _FakeSequence)
    assert isinstance(oe_ie_nonconvex.minimum_downtime, _FakeSequence)
    assert isinstance(oe_ie_nonconvex.minimum_uptime, _FakeSequence)

    assert oe_nonconvex.maximum_startups == oe_ie_nonconvex.maximum_startups
    assert oe_nonconvex.maximum_shutdowns == oe_ie_nonconvex.maximum_shutdowns

    assert oe_nonconvex.initial_status == oe_ie_nonconvex.initial_status
