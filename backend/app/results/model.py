from datetime import datetime

from pydantic import BaseModel
import pandas as pd

from ..responses import GeneralDataModel


class EnTimeSeries(BaseModel):
    name: str
    data: list[float]

class EnDataFrame(BaseModel):
    name: str
    index: list[datetime]
    data: list[EnTimeSeries]

class ResultDataModel(GeneralDataModel):
    items: list[EnDataFrame]
