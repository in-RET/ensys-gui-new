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

from fastapi import HTTPException
from passlib.hash import pbkdf2_sha256
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnUserDB, EnUser, EnUserUpdate
from ..security import decode_token


def _check_username_exists(username: str, db: Session) -> bool:
    """Return True if the username already exists.

    - param username: username to look up
    - param db: SQLModel session
    - returns: bool
    """
    statement = select(EnUserDB).where(EnUserDB.username == username.lower())
    return db.exec(statement).first() is not None


def _check_mail_exists(mail: str, db: Session) -> bool:
    """Return True if the email already exists.

    - param mail: email to look up
    - param db: SQLModel session
    - returns: bool
    """
    statement = select(EnUserDB).where(EnUserDB.mail == mail)
    return db.exec(statement).first() is not None


def create_user(user: EnUser, db: Session) -> EnUserDB:
    """Create a new user with hashed password.

    - param user: registration data
    - param db: SQLModel session
    - returns: persisted EnUserDB
    - raises: HTTPException 409 on duplicate username/mail
    """
    if _check_username_exists(username=user.username, db=db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User already exists."
        )

    if _check_mail_exists(mail=user.mail, db=db):
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


def authenticate_user(username: str, password: str, db: Session) -> EnUserDB:
    """Validate credentials and return the user if active.

    - param username: username to authenticate
    - param password: plain password
    - param db: SQLModel session
    - returns: EnUserDB on success
    - raises: HTTPException 404/401 on missing user, inactive, or bad password
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
    db: Session,
) -> bool:
    """Activate a user if not already active.

    - param user: EnUserDB to activate
    - param db: SQLModel session
    - returns: True on success
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


def read_user(user_id: int, db: Session) -> EnUserDB:
    """Fetch a user by id or raise 404.

    - param user_id: id to fetch
    - param db: SQLModel session
    - returns: EnUserDB
    - raises: HTTPException 404 when missing
    """
    user = db.get(EnUserDB, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    else:
        return user


def read_user_by_token(
    db: Session,
    token: str,
) -> EnUserDB:
    """Resolve a user from a JWT token.

    - param token: bearer token to decode
    - param db: SQLModel session
    - returns: EnUserDB
    - raises: HTTPException 401/404 on invalid token or missing user
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
        db.close()

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
    db: Session,
) -> EnUserDB:
    """Apply partial updates to a user profile.

    - param update_data: fields to change
    - param user: target EnUserDB
    - param db: SQLModel session
    - returns: updated EnUserDB
    - raises: HTTPException 409 on db conflict
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
    finally:
        db.refresh(user_db)

    return user_db


def delete_user(
    user: EnUserDB,
    db: Session,
) -> None:
    """Remove a user from the database.

    - param user: EnUserDB to delete
    - param db: SQLModel session
    - returns: None
    - raises: HTTPException 409 on db errors
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
