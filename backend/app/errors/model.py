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
