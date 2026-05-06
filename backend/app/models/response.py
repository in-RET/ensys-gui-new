from pydantic import BaseModel, Field

from ..models.base import ErrorModel, GeneralDataModel


class GeneralResponse(BaseModel):
    """Standard API envelope with data, success flag, and errors."""

    data: None = Field(default=None, description="Data returned by the request.")
    success: bool = Field(
        default=True, description="Indicates whether the request was successful or not."
    )
    errors: list[ErrorModel] | None = Field(
        default=None, description="List of errors encountered during the request."
    )


class DataResponse(GeneralResponse):
    """Response containing a populated `GeneralDataModel`."""

    data: GeneralDataModel = Field(...)

class AuthResponse(GeneralResponse):
    data: GeneralDataModel = Field(...)
    access_token: str = Field(...)

class MessageResponse(GeneralResponse):
    """Response carrying a message string."""

    data: str = Field(...)


class ErrorResponse(GeneralResponse):
    """Error response with success False and optional data payload."""

    data: GeneralDataModel | None = Field(
        default=None, description="Data returned by the request."
    )
    success: bool = Field(
        default=False,
        description="Indicates whether the request was successful or not.",
    )


class ResultResponse(GeneralResponse):
    """Success response carrying result data."""

    data: GeneralDataModel = Field(
        ..., description="The result data returned by the request."
    )
    success: bool = Field(
        default=True, description="Indicates whether the request was successful or not."
    )
