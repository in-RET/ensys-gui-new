from pydantic import BaseModel


class ErrorModel(BaseModel):
    code: int
    message: str
