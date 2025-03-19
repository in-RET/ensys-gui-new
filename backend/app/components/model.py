from typing import Any

from sqlalchemy import Column
from sqlmodel import SQLModel, Field, ARRAY, String


class EnComponent(SQLModel):
    name: str = Field(min_length=1, max_length=30)
    oemof_type: str = Field(min_length=1, max_length=50)
    fields: list[str] = Field(sa_column=Column(ARRAY(String)))

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, name: str, oemof_type: str, **kwargs: Any):
        super().__init__(**kwargs)
        self.name = name
        self.oemof_type = oemof_type
        self.fields = self.populate_fields(oemof_type)

    def populate_fields(self, oemof_type: str) -> list[str]:
        pass


class EnComponentDB(EnComponent, table=True):
    __tablename__ = "components"

    id: int = Field(primary_key=True)
