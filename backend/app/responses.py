from typing import Any

from pydantic import BaseModel

from .data.model import GeneralDataModel
from .errors.model import ErrorModel
from .results.model import ResultDataModel


class GeneralResponse(BaseModel):
    data: None
    success: bool
    errors: list[ErrorModel] | None = None

class DataResponse(GeneralResponse):
    data: GeneralDataModel

class MessageResponse(GeneralResponse):
    data: str

class ErrorResponse(GeneralResponse):
    data: None = None
    success: bool = False

class ResultResponse(GeneralResponse):
    data: ResultDataModel

