"""
User Service Module
=================

This module provides service layer functionality for user management.
It handles the business logic for user operations including:
- User creation and validation
- User authentication
- User account activation
- User profile updates and deletion
- Access control verification
"""

from datetime import datetime
from typing import Annotated

from fastapi import HTTPException, Depends
from passlib.hash import pbkdf2_sha256
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnUserDB, EnUser, EnUserUpdate
from ..db import SessionLocal
from ..security import decode_token, oauth2_scheme


def _check_username_exists(username: str, db: Session = SessionLocal()) -> bool:
    """
    Check if a username already exists in the database.

    :param username: Username to check
    :type username: str
    :param db: Database session
    :type db: Session
    :return: True if username exists, False otherwise
    :rtype: bool
    """
    statement = select(EnUserDB).where(EnUserDB.username == username.lower())
    return db.exec(statement).first() is not None


def _check_mail_exists(mail: str, db: Session = SessionLocal()) -> bool:
    """
    Check if an email address already exists in the database.

    :param mail: Email address to check
    :type mail: str
    :param db: Database session
    :type db: Session
    :return: True if email exists, False otherwise
    :rtype: bool
    """
    statement = select(EnUserDB).where(EnUserDB.mail == mail)
    return db.exec(statement).first() is not None


def create_user(user: EnUser, db: Session = SessionLocal()) -> EnUserDB:
    """
    Create a new user account in the database.

    Validates username and email uniqueness, hashes the password, and
    persists the user record.

    :param user: User data for account creation
    :type user: EnUser
    :param db: Database session
    :type db: Session
    :return: Created user database object
    :rtype: EnUserDB
    :raises HTTPException: If username or email already exists (status code 409)
    """
    if _check_username_exists(user.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User already exists."
        )

    if _check_mail_exists(user.mail):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Mail already in use."
        )

    db_user = EnUserDB(**user.model_dump())
    db_user.username = user.username.lower()
    db_user.password = pbkdf2_sha256.hash(user.password)

    db_user.date_joined = datetime.now()

    db.add(db_user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        # Generic handling; DB should ideally have unique constraints and proper messages
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create user; uniqueness constraint violated.",
        )

    db.refresh(db_user)

    return db_user


def authenticate_user(
    username: str, password: str, db: Session = SessionLocal()
) -> EnUserDB:
    """
    Authenticate a user by username and password.

    Verifies user credentials, checks account activation status, and updates
    the last login timestamp upon successful authentication.

    :param username: Username to authenticate
    :type username: str
    :param password: Plain text password to verify
    :type password: str
    :param db: Database session
    :type db: Session
    :return: Authenticated user database object
    :rtype: EnUserDB
    :raises HTTPException: If user not found (404), not activated (401), or
        password incorrect (401)
    """
    statement = select(EnUserDB).where(EnUserDB.username == username.lower())

    user_db = db.exec(statement).first()

    if user_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    if not user_db.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not activated. Please check your mails.",
        )

    if not user_db.verify_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Password incorrect."
        )

    user_db.last_login = datetime.now()
    db.add(user_db)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Could not authenticate user."
        )

    db.refresh(user_db)

    return user_db


def activate_user(
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> bool:
    """
    Activate a user account.

    Sets the user's is_active flag to True if not already activated.

    :param user: User database object to activate
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: True if activation successful, False if database error occurs
    :rtype: bool
    """
    if user.is_active:
        return True
    else:
        user.is_active = True

        db.add(user)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            return False

        return True


def read_user(user_id: int, db: Session = SessionLocal()) -> EnUserDB:
    """
    Retrieve a user by their ID.

    :param user_id: ID of the user to retrieve
    :type user_id: int
    :param db: Database session
    :type db: Session
    :return: User database object
    :rtype: EnUserDB
    :raises HTTPException: If user not found (status code 404)
    """
    user = db.get(EnUserDB, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    else:
        return user


def read_user_by_token(
    token: str = Annotated[str, Depends(oauth2_scheme)],
    db: Session = SessionLocal(),
) -> EnUserDB:
    """
    Retrieve a user by their authentication token.

    Decodes the JWT token to extract the username and retrieves the
    corresponding user from the database.

    :param token: JWT authentication token
    :type token: str
    :param db: Database session
    :type db: Session
    :return: User database object
    :rtype: EnUserDB
    :raises HTTPException: If token is invalid (401) or user not found (404)
    """
    print(f"Token: {token}")

    if token:
        token_data = decode_token(token)
        username = token_data.get("username")

        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token."
            )

        statement = select(EnUserDB).where(EnUserDB.username == username.lower())
        user = db.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
            )

        return user
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated."
        )


def update_user(
    update_data: EnUserUpdate,
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> EnUserDB:
    """
    Update user profile information.

    Applies partial updates to user data and persists changes to the database.

    :param update_data: Updated user data
    :type update_data: EnUserUpdate
    :param user: User database object to update
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: Updated user database object
    :rtype: EnUserDB
    :raises HTTPException: If database integrity error occurs (status code 409)
    """
    user_update = update_data.model_dump(exclude_unset=True)
    user_db = user.sqlmodel_update(user_update)
    db.add(user_db)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Could not update user."
        ) from exc


def delete_user(
    user: EnUserDB,
    db: Session = SessionLocal(),
) -> None:
    """
    Delete a user account from the database.

    Permanently removes the user record and all associated data.

    :param user: User database object to delete
    :type user: EnUserDB
    :param db: Database session
    :type db: Session
    :return: None
    :rtype: None
    :raises HTTPException: If database integrity error occurs (status code 409)
    """
    db.delete(user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Could not delete user."
        ) from exc

    return None
