from datetime import datetime

from sqlmodel import SQLModel, Field


class EnProject(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, min_length=1, max_length=255, nullable=True)
    country: str = Field(min_length=1, max_length=40)
    unit_energy: str = Field(min_length=1, max_length=10)
    unit_co2: str = Field(min_length=1, max_length=10)
    currency: str = Field(min_length=1, max_length=8)
    longitude: float = Field(nullable=True)
    latitude: float = Field(nullable=True)
    is_favorite: bool = Field(default=False)
    #viewers: list[int] = Field(default=None, nullable=True)

class EnProjectDB(EnProject, table=True):
    __tablename__ = "projects"

    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    date_created: datetime = Field(default=datetime.now)
    date_updated: datetime | None = Field(default=None)

    def get_return_data(self):
        return self.dict(exclude={"user_id", "date_created", "date_updated"})

class EnProjectUpdate(EnProject):
    name: str | None = Field(default=None, min_length=1, max_length=100, nullable=True)
    country: str | None = Field(default=None, min_length=1, max_length=40, nullable=True)
    unit_energy: str | None = Field(default=None, min_length=1, max_length=10, nullable=True)
    unit_co2: str | None = Field(default=None, min_length=1, max_length=10, nullable=True)
    currency: str | None = Field(min_length=1, max_length=8)
    longitude: float | None = Field(default=None, nullable=True)
    latitude: float | None = Field(default=None, nullable=True)
