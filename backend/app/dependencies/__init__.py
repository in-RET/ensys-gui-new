import os

from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine

token_secret = os.getenv("SECRET_TOKEN")
pgres_link = os.getenv("POSTGRES_LINK")

# Create Database
db_engine = create_engine(pgres_link)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/auth/login")
