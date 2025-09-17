from oemof import solph

from ensys.components import EnBus


def test_bus():
    es = solph.EnergySystem()

    oe_bus = solph.Bus(label="Testbus", balanced=False)
    ie_bus = EnBus(label="Testbus", balanced=False).to_oemof(es)

    for attr in oe_bus.__dict__:
        assert getattr(ie_bus, attr) == getattr(ie_bus, attr)
