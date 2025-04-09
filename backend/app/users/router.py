from datetime import datetime
from typing import Annotated

from fastapi import Depends, APIRouter, Form, HTTPException
from jose import jwt
from passlib.hash import pbkdf2_sha256
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnUser, EnUserDB, EnUserUpdate
from ..db import get_db_session
from ..responses import CustomResponse, ErrorModel, CustomException
from ..security import decode_token, oauth2_scheme, token_secret

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
        # raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        raise CustomException(code=status.HTTP_404_NOT_FOUND, message="User not found.")

    if user_db.verify_password(password):
        user_db.last_login = datetime.now()
        db.add(user_db)
        db.commit()
        db.refresh(user_db)

        token = jwt.encode(user_db.get_token_information(), token_secret, algorithm="HS256")

        # return CustomResponse(
        #     data={
        #         "message": "User login successful.",
        #         "access_token": token,
        #         "token_type": "bearer"
        #     },
        #     success=True,
        #     errors=None
        # )

        return JSONResponse(
            content={
                "message": "User login successful.",
                "access_token": token,
                "token_type": "bearer"},
            status_code=status.HTTP_200_OK
        )
    else:
        # raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password incorrect.")
        return CustomResponse(
            data=None,
            success=False,
            errors=[ErrorModel(
                code=status.HTTP_401_UNAUTHORIZED,
                message="Username/Password incorrect."
            )]
        )


@users_router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def user_register(user: EnUser, db: Session = Depends(get_db_session)) -> CustomResponse:
    # Test against same username
    statement = select(EnUserDB).where(EnUserDB.username == user.username)
    results = db.exec(statement).first()

    if results is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_409_CONFLICT,
        #         message="User already exists."
        #     )]
        # )

    # Test against same mail
    statement = select(EnUserDB).where(EnUserDB.mail == user.mail)
    results = db.exec(statement).first()

    if results is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mail already in use.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_409_CONFLICT,
        #         message="Mail already in use."
        #     )]
        # )

    db_user = EnUserDB(**user.model_dump())
    db_user.username = user.username.lower()
    db_user.password = pbkdf2_sha256.hash(user.password)
    db_user.date_joined = datetime.now()

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if db_user.id is not None:
        return CustomResponse(
            data=None,
            success=True,
            errors=None
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User registration failed.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User registration failed."
        #     )]
        # )


@users_router.get("/")
async def user_read(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> CustomResponse:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Not authenticated."
        #     )]
        # )
    else:
        token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )
    else:
        return CustomResponse(
            data={"userdata": user.model_dump()},
            success=True,
            errors=None
        )


@users_router.patch("/")
async def update_user(token: Annotated[str, Depends(oauth2_scheme)], user: EnUserUpdate, db: Session = Depends(get_db_session)) -> CustomResponse:
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user_db = db.exec(statement).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )

    for field, value in user.model_dict().items():
        print(field,":", value)
        setattr(user_db, field, value)

    db.commit()
    db.refresh(user_db)

    return CustomResponse(
        data={"userdata": user_db.dump()},
        success=True,
        errors=None
    )

@users_router.delete("/")
async def delete_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> CustomResponse:
    token_data = decode_token(token)

    if not "id" in token_data:
        statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
        user = db.exec(statement).first()
    else:
        user = db.get(EnUser, token_data["id"])

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return CustomResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )

    db.delete(user)
    db.commit()

    return CustomResponse(
        data={
            "message": "User was successfully deleted.",
            "token": token,
            "token_type": "bearer",
        },
        success=True,
        errors=None
    )
