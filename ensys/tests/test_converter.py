import pytest
from oemof import solph

from ensys.components.converter import EnConverter
from ensys.components.flow import EnFlow
from .fixtures import mock_oe_energysystem, sample_oe_energysystem


@pytest.fixture
def sample_ensys_converter() -> EnConverter:
    return EnConverter(
        label="Converter",
        inputs={
            "Bus1": EnFlow(nominal_value=100),
        },
        outputs={
            "Bus2": EnFlow(nominal_value=80),
        },
        conversion_factors={
            "Bus1": 0.8,
            "Bus2": 0.42
        }
    )


def test_enconverter_initialization(sample_ensys_converter):
    assert sample_ensys_converter.label == "Converter"
    assert "Bus1" in sample_ensys_converter.inputs
    assert "Bus2" in sample_ensys_converter.outputs
    assert sample_ensys_converter.conversion_factors["Bus1"] == 0.8
    assert sample_ensys_converter.conversion_factors["Bus2"] == 0.42


def test_enconverter_to_oemof(mock_oe_energysystem, sample_oe_energysystem, sample_ensys_converter):
    ie_converter = sample_ensys_converter.to_oemof(mock_oe_energysystem)
    oe_converter = sample_oe_energysystem.groups["Converter"]

    assert isinstance(ie_converter, solph.components.Converter)
    assert ie_converter.conversion_factors is not None

    assert oe_converter.label == ie_converter.label

    # TODO: Conversion_factors vergleichen


def test_enconverter_missing_conversion_factors():
    converter = EnConverter(
        label="Incomplete Converter",
        inputs={
            "Bus1": EnFlow(nominal_value=50),
        },
        outputs={
            "Bus3": EnFlow(nominal_value=40),
        },
        conversion_factors={}
    )
    assert converter.label == "Incomplete Converter"
    assert "Bus1" in converter.inputs
    assert "Bus3" in converter.outputs
    assert converter.conversion_factors == {}
