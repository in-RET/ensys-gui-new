from typing import Optional

from sqlmodel import SQLModel, Field


class EnComponent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    oemof_type: str
    fields: list[str]
