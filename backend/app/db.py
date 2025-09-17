########################################################################
# database settings
########################################################################
import os

from sqlalchemy import create_engine
from sqlmodel import Session

db_url = os.getenv("DATABASE_URL")
db_engine = create_engine(db_url)


def get_db_session():
    """
    Creates and provides a database session.

    This function is designed to yield a database session for interacting with the
    database. The session is created using the given database engine and is
    managed within a context to ensure proper cleanup after usage.

    :return: Yields database session objects.
    :rtype: Session
    """
    with Session(db_engine) as session:
        yield session
