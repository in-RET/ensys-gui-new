from typing import Optional

from pydantic import BaseModel
from sqlmodel import SQLModel, Field


class EnComponent(BaseModel):
    name: str
    oemof_type: str
    fields: list[str]

class EnComponentDB(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    oemof_type: str
    fields: list[str]
