from typing import Any

from pydantic import BaseModel, Field


class ErrorModel(BaseModel):
    """Error payload with numeric code and message."""
    code: int = Field(
        description="Error code for the error.",
    )
    message: str = Field(
        description="Error message for the error.",
    )


class GeneralDataModel(BaseModel):
    """List payload wrapper exposing items and totalCount."""
    items: list[Any] = Field(..., description="A list of items representing the data collection.")
    totalCount: int = Field(..., description="The total number of items in the collection.")
