########################################################################
# database settings
########################################################################
import os
from enum import Enum

from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel

db_link = os.getenv("DATABASE_URL")
db_engine = create_engine(db_link)

def get_db_session():
    with Session(db_engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(db_engine)

class USER_MODE(Enum):
    MINIMAL = 0
    MAXIMAL = 1
