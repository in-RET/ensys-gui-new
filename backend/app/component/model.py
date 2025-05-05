from importlib import import_module
from typing import Any, ClassVar

from pydantic import BaseModel
from sqlalchemy import JSON
from sqlmodel import SQLModel, Field, ARRAY, String, Column


class EnComponentsTemplate(SQLModel, table=True):
    __tablename__ = "components_template"

    id: int = Field(primary_key=True)
    oemof_type: str = Field(min_length=1, max_length=50)
    fields: dict[str, str] = Field(sa_column=Column(JSON))

    class Config:
        arbitrary_types_allowed = True

class EnComponent(BaseModel):
    name: str
    oemof_type: str = ""
    position: dict[str, float] = {"x": 0.0, "y": 0.0}
    data: dict[str, Any] = {}

# class EnComponentDB(SQLModel, table=True):
#     __tablename__ = "components_in_design"
#
#     id: int = Field(primary_key=True)
#     name: str = Field(min_length=1, max_length=30)
#     oemof_type: str = Field(min_length=1, max_length=50)
#     position: dict[str, float] = Field(sa_column=Column(JSON), default={"x": 0.0, "y": 0.0})
#     data: dict[str, Any] = Field(sa_column=Column(JSON), default={})
#     scenario_id: int = Field(foreign_key="scenarios.id", nullable=False)

class EnComponentUpdate(EnComponent):
    name: str | None = None
    data: dict[str, Any] | None = None
    position: dict[str, float] | None = None
