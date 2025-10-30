from datetime import datetime

from fastapi import HTTPException, Depends
from passlib.hash import pbkdf2_sha256
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from starlette import status

from .model import EnUserDB, EnUser, EnUserUpdate
from ..db import get_db_session
from ..security import decode_token, oauth2_scheme


def _check_username_exists(username: str, db: Session) -> bool:
    statement = select(EnUserDB).where(EnUserDB.username == username.lower())
    return db.exec(statement).first() is not None


def _check_mail_exists(mail: str, db: Session) -> bool:
    statement = select(EnUserDB).where(EnUserDB.mail == mail)
    return db.exec(statement).first() is not None


def create_user(user: EnUser, db: Session = Depends(get_db_session())) -> EnUserDB:
    """Create a new user after validating the uniqueness of username and mail.

    Catches IntegrityError during commit to handle race-conditions where a
    concurrent transaction inserted the same username/email.
    """
    if _check_username_exists(user.username, db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User already exists."
        )

    if _check_mail_exists(user.mail, db):
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
    username: str, password: str, db: Session = Depends(get_db_session())
) -> EnUserDB:
    """Authenticate a user and update last_login. Raises HTTPException on failures."""
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


def read_user(user_id: int, db: Session = Depends(get_db_session())) -> EnUserDB:
    user = db.get(EnUserDB, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    else:
        return user


def read_user_by_token(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db_session())
) -> EnUserDB:
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
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> EnUserDB:
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
    user: EnUserDB = Depends(read_user_by_token()),
    db: Session = Depends(get_db_session()),
) -> None:
    user_db = db.get(EnUserDB, user.id)

    if user_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    db.delete(user_db)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Could not delete user."
        ) from exc

    return None
