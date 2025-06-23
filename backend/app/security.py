import os

from fastapi.security import OAuth2PasswordBearer
from jose import jwt

########################################################################
# security token
########################################################################
token_secret = os.getenv("SECRET_TOKEN")

def decode_token(token: str):
    """
    Decode a JSON Web Token (JWT).

    This function takes a JSON Web Token (JWT) string and decodes it using
    the specified secret and algorithm. The decoded token data is returned,
    allowing further processing or validation.

    :param token: The JWT string to decode.
    :type token: str
    :return: Decoded token data.
    :rtype: dict
    """
    token_data = jwt.decode(token, token_secret, algorithms=["HS256"])
    return token_data

########################################################################
# login settings
########################################################################
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/auth/login")
