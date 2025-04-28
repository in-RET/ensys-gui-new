from typing import Any

from pydantic import BaseModel
from sqlalchemy import Column, JSON
from sqlmodel import SQLModel, Field


class EnFlow(BaseModel):
    name: str = Field(min_length=1, max_length=30)
    component_id: int
    data: dict[str, Any] = Field(default={})

class EnFlowDB(SQLModel, table=True):
    __tablename__ = "flows_in_design"
    id: int = Field(primary_key=True)
    name: str = Field(min_length=1, max_length=30)
    component_id: int = Field(foreign_key="components_in_design.id")
    data: dict[str, Any] = Field(sa_column=Column(JSON), default={})
    scenario_id: int = Field(foreign_key="scenarios.id", nullable=False)

class EnFlowUpdate(EnFlow):
    name: str | None = None
    component: int | None = None
    data: dict[str, Any] | None = None
