from sqlmodel import SQLModel, Field
from oemof import solph

class EnComponent(SQLModel):
    name: str
    oemof_type: str
    fields: list[str]

class EnComponentDB(EnComponent, table=True):
    __tablename__ = "components"

    id: int = Field(default=None, primary_key=True)
