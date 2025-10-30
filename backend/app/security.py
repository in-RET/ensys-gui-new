"""
Security and Authentication Module
===============================

This module provides security-related functionality for the EnSys application,
including JWT token handling, password management, and OAuth2 configuration.

The module handles:
    - JWT token encoding and decoding
    - Password hashing and verification
    - OAuth2 authentication scheme
    - Token validation and user authentication

Configuration is loaded from environment variables for security settings.
"""

import os

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

########################################################################
# Security token configuration
########################################################################
token_secret = os.getenv("SECRET_TOKEN")
if not token_secret:
    raise ValueError("SECRET_TOKEN environment variable must be set")


def decode_token(token: str) -> dict:
    """
    Decode and validate a JSON Web Token (JWT).

    This function decodes a JWT using the application's secret key and validates
    its structure and signature. If the token is invalid or expired, an exception
    is raised.

    Args:
        token (str): The JWT string to decode and validate.

    Returns:
        dict: The decoded token payload containing user information.

    Raises:
        HTTPException: If the token is invalid, expired, or malformed.
            - status_code=401 for invalid or expired tokens
            - status_code=400 for malformed tokens
    """
    try:
        return jwt.decode(token, token_secret, algorithms=["HS256"])
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password (str): The plain text password to verify.
        hashed_password (str): The hashed password to compare against.

    Returns:
        bool: True if the password matches the hash, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate a secure hash of a password.

    Args:
        password (str): The plain text password to hash.

    Returns:
        str: The securely hashed password.
    """
    return pwd_context.hash(password)


########################################################################
# OAuth2 configuration
########################################################################
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="user/auth/login",
    description="OAuth2 password bearer token authentication",
)
