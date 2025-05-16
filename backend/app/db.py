########################################################################
# database settings
########################################################################
import os

from sqlalchemy import create_engine
from sqlmodel import Session

db_engine = create_engine(os.getenv("DATABASE_URL"))

def get_db_session():
    with Session(db_engine) as session:
        yield session
