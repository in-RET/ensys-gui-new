"""Test Genericstorage module."""

import pytest
from pydantic import ValidationError

from ensys.components.flow import EnFlow
from ensys.components.genericstorage import EnGenericStorage


@pytest.fixture
def sample_generic_storage():
    """Return a sample generic storage model."""

    return EnGenericStorage(
        label="Test Storage",
        inputs={"Bus1": EnFlow()},
        outputs={"Bus1": EnFlow()},
        storage_costs=20,
        max_storage_level=1,
        min_storage_level=0,
        initial_storage_level=0.5,
        nominal_capacity=130,
        loss_rate=0.01,
        inflow_conversion_factor=1,
        outflow_conversion_factor=0.93,
    )


def test_oep_generic_storage_initialization(sample_generic_storage):
    """Test the described behavior."""

    assert sample_generic_storage.label == "Test Storage"
    assert sample_generic_storage.loss_rate == 0.01
    assert sample_generic_storage.inflow_conversion_factor == 1
    assert sample_generic_storage.outflow_conversion_factor == 0.93


def test_oep_generic_storage_missing_inputs():
    """Test the described behavior."""

    with pytest.raises(ValidationError):
        EnGenericStorage(
            label="Test Storage",
            outputs={"output1": EnFlow()},
        )
