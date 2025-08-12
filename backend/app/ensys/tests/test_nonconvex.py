from oemof import solph

from backend.app.ensys.components import EnNonConvex


def test_nonconvex_extended():
    es = solph.EnergySystem()

    oe_nonconvex = solph.NonConvex(initial_status=0, minimum_uptime=12, minimum_downtime=6, maximum_startups=3,
                                   maximum_shutdowns=3)
    ie_nonconvex = EnNonConvex(initial_status=0, minimum_uptime=12, minimum_downtime=6, maximum_startups=3,
                               maximum_shutdowns=3).to_oemof(es)

    for attr in oe_nonconvex.__dict__:
        assert getattr(oe_nonconvex, attr) == getattr(ie_nonconvex, attr)
