import pytest
from oemof import solph

from ensys.components import EnInvestment
from .fixtures import mock_oe_energysystem


@pytest.fixture
def sample_regular_investment(mock_oe_energysystem) -> solph.Investment:
    return EnInvestment(
        ep_costs=1239.3,
        maximum=10000,
        minimum=100,
        existing=85,
    ).to_oemof(mock_oe_energysystem)


@pytest.fixture
def sample_nonconvex_investment(mock_oe_energysystem) -> solph.Investment:
    return EnInvestment(
        ep_costs=1239.3,
        maximum=10000,
        minimum=100,
        nonconvex=True,
        offset=42
    ).to_oemof(mock_oe_energysystem)


def test_investment_to_oemof(sample_regular_investment, sample_nonconvex_investment):
    assert isinstance(sample_regular_investment, solph.Investment)
    assert isinstance(sample_nonconvex_investment, solph.Investment)

    # TODO: Weitere Tests


def test_regular_investement_initialization(sample_regular_investment):
    # assert sample_regular_investment.ep_costs == sequence(1239.3)
    # assert sample_regular_investment.maximum == sequence(10000)
    # assert sample_regular_investment.minimum == sequence(100)
    assert sample_regular_investment.nonconvex == False


def test_nonconvex_investement_initialization(sample_nonconvex_investment):
    # assert sample_nonconvex_investment.ep_costs == sequence(1239.3)
    # assert sample_nonconvex_investment.maximum == sequence(10000)
    # assert sample_nonconvex_investment.minimum == sequence(100)
    # assert sample_nonconvex_investment.offset == sequence(42.0)
    assert sample_nonconvex_investment.nonconvex == True
