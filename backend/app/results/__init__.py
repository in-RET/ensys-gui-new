"""
Results Management Module
======================

Handles all simulation results functionality including
- Result data storage and retrieval
- Result visualization and export
- Result analysis and comparison
- Cost calculations and analysis
"""

from .automatic_cost_calc import cost_calculation_from_energysystem
from .model import (
    EnDataFrame,
    EnTimeSeries,
    ResultDataModel,
    EnInvestResult
)
from .router import results_router, get_results_from_dump

__all__ = [
    'EnDataFrame',
    'EnTimeSeries',
    'ResultDataModel',
    'EnInvestResult',
    'results_router',
    'get_results_from_dump',
    'cost_calculation_from_energysystem'
]
