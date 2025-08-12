import pytest
from oemof import solph

from backend.app.ensys.components.bus import EnBus
from backend.app.ensys.components.constraints import EnConstraints
from backend.app.ensys.components.converter import EnConverter
from backend.app.ensys.components.energysystem import EnEnergysystem
from backend.app.ensys.components.genericstorage import EnGenericStorage
from backend.app.ensys.components.sink import EnSink
from backend.app.ensys.components.source import EnSource


@pytest.fixture
def mock_ensys_enerygysystem() -> EnEnergysystem:
    return EnEnergysystem()


def test_add_bus(mock_ensys_enerygysystem):
    test_bus = EnBus(label="Test Bus")
    mock_ensys_enerygysystem.add(test_bus)
    assert len(mock_ensys_enerygysystem.busses) == 1
    assert mock_ensys_enerygysystem.busses[0].label == "Test Bus"


def test_add_sink(mock_ensys_enerygysystem):
    test_sink = EnSink(label="Test Sink", inputs={})
    mock_ensys_enerygysystem.add(test_sink)
    assert len(mock_ensys_enerygysystem.sinks) == 1
    assert mock_ensys_enerygysystem.sinks[0].label == "Test Sink"


def test_add_source(mock_ensys_enerygysystem):
    test_source = EnSource(label="Test Source", outputs={})
    mock_ensys_enerygysystem.add(test_source)
    assert len(mock_ensys_enerygysystem.sources) == 1
    assert mock_ensys_enerygysystem.sources[0].label == "Test Source"


def test_add_converter(mock_ensys_enerygysystem):
    test_converter = EnConverter(label="Test Converter", inputs={}, outputs={}, conversion_factors={})
    mock_ensys_enerygysystem.add(test_converter)
    assert len(mock_ensys_enerygysystem.converters) == 1
    assert mock_ensys_enerygysystem.converters[0].label == "Test Converter"


def test_add_genericstorage(mock_ensys_enerygysystem):
    test_storage = EnGenericStorage(
        label="Test Storage",
        inputs={},
        outputs={},
        nominal_storage_capacity=100.0,
        loss_rate=0.01,
        inflow_conversion_factor=0.9,
        outflow_conversion_factor=0.9,
        min_storage_level=0.1,
        max_storage_level=1.0
    )
    mock_ensys_enerygysystem.add(test_storage)
    assert len(mock_ensys_enerygysystem.generic_storages) == 1
    assert mock_ensys_enerygysystem.generic_storages[0].label == "Test Storage"


def test_add_constraints(mock_ensys_enerygysystem):
    test_constraint = EnConstraints()
    mock_ensys_enerygysystem.add(test_constraint)
    assert len(mock_ensys_enerygysystem.constraints) == 1


def test_add_invalid_component(mock_ensys_enerygysystem):
    with pytest.raises(Exception) as exc_info:
        mock_ensys_enerygysystem.add("Invalid Component")
    assert str(exc_info.value) == "Unknown Type given!"


def test_to_oemof(mock_ensys_enerygysystem):
    test_bus = EnBus(label="Bus Oemof Test")
    mock_ensys_enerygysystem.add(test_bus)

    oemof_system = solph.EnergySystem()
    oemof_system = mock_ensys_enerygysystem.to_oemof(oemof_system)

    assert isinstance(oemof_system, solph.EnergySystem)
    assert len(oemof_system.nodes) == 1
    assert "Bus Oemof Test" in oemof_system.groups
