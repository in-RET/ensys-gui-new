from datetime import datetime
from multiprocessing.forkserver import connect_to_new_process
from typing import Annotated

from fastapi import Depends, APIRouter, Form, HTTPException
from jose import jwt
from passlib.hash import pbkdf2_sha256
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnUser, EnUserDB, EnUserUpdate
from ..auxillary import decode_token, oauth2_scheme, token_secret
from ..db import get_db_session

users_router = APIRouter(
    prefix="/user",
    tags=["user"],
)

@users_router.post("/auth/login")
async def user_login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db_session)):
    #print(username, password)
    statement = select(EnUserDB).where(EnUserDB.username == username)
    user_db = db.exec(statement).first()

    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user_db.verify_password(password):
        user_db.last_login = datetime.now()
        db.add(user_db)
        db.commit()
        db.refresh(user_db)

        token = jwt.encode(user_db.get_token_information(), token_secret, algorithm="HS256")

        return JSONResponse(
            content={
                "message": "User login successful.",
                "access_token": token,
                "token_type": "bearer",
            },
            status_code=status.HTTP_200_OK,
        )
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password incorrect.")


@users_router.post("/auth/register")
async def user_register(user: EnUser = Depends(), db: Session = Depends(get_db_session)):
    # Test against same username
    statement = select(EnUserDB).where(EnUserDB.username == user.username)
    results = db.exec(statement).first()

    if results is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists.")

    # Test against same mail
    statement = select(EnUserDB).where(EnUserDB.mail == user.mail)
    results = db.exec(statement).first()

    if results is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mail already in use.")

    db_user = EnUserDB(**user.model_dump())
    db_user.username = user.username.lower()
    db_user.password = pbkdf2_sha256.hash(user.password)
    db_user.date_joined = datetime.now()

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if db_user.id is not None:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=""
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User registration failed.")


@users_router.get("/read")
async def user_read(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    else:
        token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    else:
        return user


@users_router.patch("/update")
async def update_user(token: Annotated[str, Depends(oauth2_scheme)], user: EnUserUpdate = Depends(), db: Session = Depends(get_db_session)):
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user_db = db.exec(statement).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    for field, value in user.model_dict().items():
        print(field,":", value)
        setattr(user_db, field, value)

    db.commit()
    db.refresh(user_db)

    return user_db


@users_router.delete("/delete")
async def delete_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)):
    token_data = decode_token(token)

    if not "id" in token_data:
        statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
        user = db.exec(statement).first()
    else:
        user = db.get(EnUser, token_data["id"])

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(user)
    db.commit()

    return JSONResponse(
        content={
            "message": "User was successfully deleted.",
            "token": token,
            "token_type": "bearer",
        },
        status_code=status.HTTP_200_OK
    )
