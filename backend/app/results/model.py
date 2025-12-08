"""
Energy System Results Models
==========================

This module provides data models for representing various types of results
from energy system simulations and analyses.

The module includes:
    - Time series data representations
    - Investment result models
    - DataFrame-like structures
    - Comprehensive result data containers

All models use Pydantic for validation and serialization.
"""

from datetime import datetime

from pydantic import BaseModel


class EnTimeSeries(BaseModel):
    """
    Time series data model for energy system results.

    Provides a structure for storing time series data including a descriptive
    name and corresponding numerical data points. Used for representing temporal
    data such as power flows, consumption patterns, or generation profiles.

    :param name: Identifying name for the time series
    :type name: str
    :param data: List of numerical values representing the time series data
    :type data: list[float]
    """
    name: str
    data: list[float]


class EnInvestResult(BaseModel):
    """
    Investment result model for energy system components.

    Represents investment-related results including costs, capacities, and
    their associated units. Used for economic analysis and optimization results.

    :param name: Identifier of the investment component
    :type name: str
    :param value: Numerical result of the investment calculation
    :type value: float
    :param unit: Unit of measurement (e.g., "EUR", "kW", "kWh")
    :type unit: str
    """
    name: str
    value: float
    unit: str


class EnDataFrame(BaseModel):
    """
    DataFrame-like structure for time-indexed energy system data.

    Manages time series data with explicit time indexing and units. Suitable
    for storing and analyzing temporal data with associated metadata.

    :param name: Identifier for the data frame
    :type name: str
    :param index: Time points corresponding to the data values
    :type index: list[datetime]
    :param data: Time series values
    :type data: list[float]
    :param unit: Unit of measurement for the data
    :type unit: str
    """
    name: str
    index: list[datetime]
    data: list[EnTimeSeries]


class ResultDataModel(BaseModel):
    """
    Represents a specialized data model for storing results.

    Inherits from the `GeneralDataModel` and is used specifically
    for storing a collection of `EnDataFrame` objects. This class
    helps organize and manage the result data in a structured manner.

    :ivar items: A collection of `EnDataFrame` objects representing
        the data stored in the model.
    :type items: list[EnDataFrame]
    """
    static: list[EnInvestResult]
    graphs: list[EnDataFrame]
