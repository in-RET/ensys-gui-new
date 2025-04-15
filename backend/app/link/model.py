from typing import Any

from sqlmodel import SQLModel, Field


class EnLink(SQLModel):
    source: int = Field(foreign_key="components_in_design.id")
    target: int = Field(foreign_key="components_in_design.id")
    scenario_id: int = Field(foreign_key="scenarios.id", nullable=False)

class EnLinkDB(EnLink, table=True):
    __tablename__ = "links_in_design"

    id: int = Field(primary_key=True)

class EnLinkUpdate(EnLink):
    name: str | None = None
    data: dict[str, Any] | None = None
    pos_x: float | None = None
    pos_y: float | None = None
