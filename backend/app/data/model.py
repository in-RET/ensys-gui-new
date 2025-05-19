from typing import Any

from pydantic import BaseModel


class GeneralDataModel(BaseModel):
    items: list[Any]
    totalCount: int
