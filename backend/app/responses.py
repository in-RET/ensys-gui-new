from pydantic import BaseModel, Field

from .data.model import GeneralDataModel
from .errors.model import ErrorModel
from .results.model import ResultDataModel


class GeneralResponse(BaseModel):
    """
    Represents the general response structure for API requests.

    This class encapsulates the standard response format, including the data
    returned, success status, and any errors that occurred during the request.
    It is utilized as the base model for structuring API responses.

    :ivar data: Data returned by the request.
    :type data: None
    :ivar success: Indicates whether the request was successful or not.
    :type success: bool
    :ivar errors: List of errors encountered during the request.
    :type errors: list[ErrorModel] | None
    """
    data: None = Field(
        default=None,
        description="Data returned by the request."
    )
    success: bool = Field(
        default=True,
        description="Indicates whether the request was successful or not."
    )
    errors: list[ErrorModel] | None = Field(
        default=None,
        description="List of errors encountered during the request."
    )


class DataResponse(GeneralResponse):
    """
    Represents a response containing general data, inheriting from the
    GeneralResponse.

    This class is used for defining a response structure that includes the
    general data model. It enforces the inclusion of the general data field,
    ensuring proper structure and expected data handling as part of the response.
    It can be extended or utilized wherever a general data response entity
    is required.

    :ivar data: The general data model that represents the main content of
                the response.
    :type data: GeneralDataModel
    """
    data: GeneralDataModel = Field(...)


class MessageResponse(GeneralResponse):
    """
    Represents a response message inheriting properties from `GeneralResponse`.

    This class is used to handle message responses with associated data and extends
    the general response functionality by including a specific 'data' attribute.

    :ivar data: The content of the response message.
    :type data: str
    """
    data: str = Field(...)


class ErrorResponse(GeneralResponse):
    """
    Represents an error response detailing the result of a failed operation.

    This class extends the GeneralResponse and is intended to provide a standard
    structure for reporting errors or unsuccessful operations in the application.
    It includes attributes that indicate the success status and any data related
    to the error response.

    :ivar data: Data returned by the request. Default is None.
    :type data: None
    :ivar success: Indicates whether the request was successful or not. Default is False.
    :type success: bool
    """
    data: None = Field(
        default=None,
        description="Data returned by the request."
    )
    success: bool = Field(
        default=False,
        description="Indicates whether the request was successful or not."
    )


class ResultResponse(GeneralResponse):
    """
    Represents a response containing result data, inheriting from GeneralResponse.

    This class is used to encapsulate response data specific to result information.
    It extends the functionality provided by GeneralResponse and includes additional
    data fields related to results. The purpose of this class is to standardize the
    structure of result-related responses and ensure consistent access to result
    data in the response object.

    :ivar data: Contains the specific result data encapsulated in the ResultDataModel.
    :type data: ResultDataModel
    """
    data: ResultDataModel
