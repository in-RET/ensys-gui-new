from typing import Any

from pydantic import BaseModel


class ErrorModel(BaseModel):
    code: int
    message: str

class ReturnDataModel(BaseModel):
    items: list[Any]
    totalCount: int

class DataResponse(BaseModel):
    data: Any | ReturnDataModel
    success: bool
    errors: list[ErrorModel] | None = None

class CustomException(Exception):
    def __init__(self, code: int, message: str) -> None:
        self.error = ErrorModel(code=code, message=message)



