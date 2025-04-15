from importlib import import_module
from typing import Any, ClassVar

from sqlmodel import SQLModel, Field, ARRAY, String, Column


class EnComponentsTemplate(SQLModel):
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

class EnComponent(EnComponentsTemplate):
    fields: ClassVar[list[str]]
    data: dict[str, Any] = Field(sa_column=Column(ARRAY(String)))
    pos_x: float = Field(nullable=False, default=0.0)
    pos_y: float = Field(nullable=False, default=0.0)
    scenario_id: int = Field(foreign_key="scenarios.id", nullable=False)

class EnComponentDB(EnComponent, table=True):
    __tablename__ = "components_in_design"

    id: int = Field(primary_key=True)

class EnComponentsTemplateDB(EnComponentsTemplate, table=True):
    __tablename__ = "components_template"

    id: int = Field(primary_key=True)


class EnComponentUpdate(EnComponent):
    name: str | None = None
    data: dict[str, Any] | None = None
    pos_x: float | None = None
    pos_y: float | None = None
