from datetime import datetime

from pydantic import BaseModel

from ..responses import GeneralDataModel


class EnTimeSeries(BaseModel):
    """
    Represents a time series data model with a name and corresponding data points.

    This class provides a structure for storing time series data which includes
    a descriptive name and a list of numerical data points. It can be used for
    various time-based data analysis and storage requirements.

    :ivar name: The name of the time series.
    :type name: str
    :ivar data: A list of numerical data points representing the time series.
    :type data: list[float]
    """
    name: str
    data: list[float]


class EnInvestResult(BaseModel):
    """
    Represents an investment result with its details.

    This class is used to represent the result of an investment, including the
    name of the investment, the associated data value, and its corresponding unit.

    :ivar name: The name of the investment.
    :type name: str
    :ivar data: The numerical value of the investment result.
    :type data: float
    :ivar unit: The unit of measurement for the investment result.
    :type unit: str
    """
    name: str
    value: float
    unit: str

class EnDataFrame(BaseModel):
    """
    Represents a data model for a DataFrame-like structure with enhanced time series data.

    This class is designed to manage and store time series data associated with a specific
    name and a corresponding index of datetime values.

    :ivar name: Name of the data frame.
    :type name: str
    :ivar index: List of datetime objects representing the index of the data frame.
    :type index: list[datetime]
    :ivar data: List of EnTimeSeries objects representing the time series data.
    :type data: list[EnTimeSeries]
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
