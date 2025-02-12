from datetime import datetime

from sqlmodel import SQLModel, Field


class EnProject(SQLModel):
    name: str
    description: str | None
    country: str
    unit_energy: str
    unit_co2: str
    user_id: int
    date_created: datetime
    date_updated: datetime | None
    #viewers: list[int] = Field(default=None, nullable=True)

class EnProjectDB(EnProject, table=True):
    __tablename__ = "projects"

    id: int = Field(default=None, primary_key=True)
