import pytest
from oemof import solph


@pytest.fixture
def sample_oe_energysystem() -> solph.EnergySystem:
    bus1 = solph.Bus(label="Bus1")
    bus2 = solph.Bus(label="Bus2")

    oe_converter = solph.components.Converter(
        label="Converter",
        inputs={bus1: solph.Flow(nominal_value=100)},
        outputs={bus2: solph.Flow(nominal_value=80)},
        conversion_factors={
            bus1: 0.8,
            bus2: 0.42
        }
    )

    oe_sink = solph.components.Sink(
        label="Sink",
        inputs={bus1: solph.Flow(nominal_value=100)}
    )

    oe_source = solph.components.Source(
        label="Source",
        outputs={bus1: solph.Flow(nominal_value=100)},
    )

    es = solph.EnergySystem()
    es.add(bus1,
           bus2,
           oe_converter,
           oe_sink,
           oe_source
           )

    return es


@pytest.fixture
def mock_oe_energysystem():
    bus1 = solph.Bus(label="Bus1")
    bus2 = solph.Bus(label="Bus2")

    es = solph.EnergySystem()
    es.add(bus1, bus2)

    return es
