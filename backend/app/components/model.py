from typing import Any

from sqlalchemy import Column
from sqlmodel import SQLModel, Field, ARRAY, String
from importlib import import_module
from oemof import solph

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
        self.fields = self.__populate_fields__()

    def __populate_fields__(self) -> list[str]:
        tmp_fields = []

        if not self.oemof_type in ["Bus", "Flow", "Investment", "NonConvex"]:
            module = import_module("oemof.solph.components")
            class_ = getattr(module, self.oemof_type)
        else:
            module = import_module("oemof.solph")
            class_ = getattr(module, self.oemof_type)()

        for attr in dir(class_):
            if not attr.startswith("_"):
                tmp_fields.append(attr)

        return tmp_fields


class EnComponentDB(EnComponent, table=True):
    __tablename__ = "components"

    id: int = Field(primary_key=True)
