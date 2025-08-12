import pytest
from oemof import solph

from backend.app.ensys.components import EnSource, EnFlow
from .fixtures import sample_oe_energysystem, mock_oe_energysystem


@pytest.fixture
def sample_ensys_source() -> EnSource:
    return EnSource(
        label='Source',
        outputs={"Bus2": EnFlow()}
    )


def test_source_initialization(sample_ensys_source: EnSource):
    assert sample_ensys_source.label == "Source"
    assert sample_ensys_source.outputs == {"Bus2": EnFlow()}


def test_source_to_oemof(mock_oe_energysystem, sample_oe_energysystem, sample_ensys_source):
    ie_source = sample_ensys_source.to_oemof(mock_oe_energysystem)
    oe_source = sample_oe_energysystem.groups["Source"]

    assert isinstance(ie_source, solph.components.Source)
    assert ie_source.label == "Source"

    # TODO: Weitere Tests
