"""
Pydantic models for simulation result payloads.
"""

from datetime import datetime

from pydantic import BaseModel


class EnTimeSeries(BaseModel):
    """Time series result with name and numeric data.

    - fields: name, data (list[float])
    """
    name: str
    data: list[float]


class EnTableResult(BaseModel):
    """Investment result entry with name/value/unit."""
    name: str
    value: float | str
    unit: str


class EnDataFrame(BaseModel):
    """Time-indexed result container with series list.

    - fields: name, index (datetime list), data (EnTimeSeries list)
    """
    name: str
    index: list[datetime]
    data: list[EnTimeSeries]


class ResultDataModel(BaseModel):
    """Aggregated results split into static and graph data."""
    static: list[EnTableResult]
    graphs: list[EnDataFrame]
