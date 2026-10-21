"""Test Sink module."""

import pytest
from oemof import solph

from ensys.components import EnSink, EnFlow
from .fixtures import sample_oe_energysystem, mock_oe_energysystem


@pytest.fixture
def sample_ensys_sink() -> EnSink:
    """Return a sample sink model."""

    return EnSink(
        label='Sink',
        inputs={"Bus2": EnFlow()}
    )


def test_sink_initialization(sample_ensys_sink: EnSink):
    """Test the described behavior."""

    assert sample_ensys_sink.label == "Sink"
    assert sample_ensys_sink.inputs == {"Bus2": EnFlow()}


def test_sink_to_oemof(mock_oe_energysystem, sample_oe_energysystem, sample_ensys_sink):
    """Test the described behavior."""

    ie_sink = sample_ensys_sink.to_oemof(mock_oe_energysystem)
    oe_sink = sample_oe_energysystem.groups["Sink"]

    assert isinstance(ie_sink, solph.components.Sink)
    assert ie_sink.label == "Sink"

    # TODO: Weitere Tests
