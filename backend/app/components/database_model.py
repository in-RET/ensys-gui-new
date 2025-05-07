from pydantic import BaseModel
from sqlalchemy import JSON
from sqlmodel import SQLModel, Field, Column


class EnComponentsTemplate(SQLModel, table=True):
    __tablename__ = "components_template"

    id: int = Field(primary_key=True)
    oemof_type: str = Field(min_length=1, max_length=50)
    fields: dict[str, str] = Field(sa_column=Column(JSON))

    class Config:
        arbitrary_types_allowed = True

class EnComponent(BaseModel):
    pass
