import os
from enum import Enum

from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel

########################################################################
# security token
########################################################################
token_secret = os.getenv("SECRET_TOKEN")

def decode_token(token: str):
    token_data = jwt.decode(token, token_secret, algorithms=["HS256"])
    return token_data

########################################################################
# login settings
########################################################################
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/auth/login")

########################################################################
# database settings
########################################################################
db_link = os.getenv("DB_LINK")
db_engine = create_engine(db_link)

def get_db_session():
    with Session(db_engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(db_engine)

########################################################################
# database settings
########################################################################
class USER_MODE(Enum):
    MINIMAL = 0
    MAXIMAL = 1








