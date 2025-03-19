import os

from fastapi.security import OAuth2PasswordBearer
from jose import jwt

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
