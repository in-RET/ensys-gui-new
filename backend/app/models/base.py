from typing import Any

from pydantic import BaseModel, Field


class ErrorModel(BaseModel):
    """
    Represents an error model containing details of an error.

    This class is used to encapsulate metadata for error conditions, such as
    the error code and the error message. It provides a structured way to
    convey error information within applications or across systems.

    :ivar code: Error code for the error.
    :type code: int
    :ivar message: Error message for the error.
    :type message: str
    """
    code: int = Field(
        description="Error code for the error.",
    )
    message: str = Field(
        description="Error message for the error.",
    )


class GeneralDataModel(BaseModel):
    """
    Represents a general data model with a collection of items and the total count of items.

    This class is used to encapsulate a collection of items along with their total count in a
    data structure. It serves as a general-purpose representation of data collections and is
    flexible in handling any type of items within the list.

    :ivar items: A list of items representing the data collection.
    :type items: list[Any]
    :ivar totalCount: The total number of items in the collection.
    :type totalCount: Int
    """
    items: list[Any] = Field(..., description="A list of items representing the data collection.")
    totalCount: int = Field(..., description="The total number of items in the collection.")
