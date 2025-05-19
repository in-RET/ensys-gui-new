from datetime import datetime
from typing import Annotated

from fastapi import Depends, APIRouter, Form, HTTPException
from jose import jwt
from passlib.hash import pbkdf2_sha256
from pyomo.core.base.component_order import items
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnUser, EnUserDB, EnUserUpdate
from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..responses import DataResponse, MessageResponse
from ..security import decode_token, oauth2_scheme, token_secret

users_router = APIRouter(
    prefix="/user",
    tags=["user"],
)

@users_router.post("/auth/login")
async def user_login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db_session)):
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

        # return DataResponse(
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password incorrect.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Username/Password incorrect."
        #     )]
        # )


@users_router.post("/auth/register", status_code=status.HTTP_201_CREATED, response_model=MessageResponse)
async def user_register(user: EnUser, db: Session = Depends(get_db_session)) -> MessageResponse:
    # Test against same username
    statement = select(EnUserDB).where(EnUserDB.username == user.username)
    results = db.exec(statement).first()

    if results is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists.")
        # return DataResponse(
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
        # return DataResponse(
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
        return MessageResponse(
            data="",
            success=True
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User registration failed.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User registration failed."
        #     )]
        # )


@users_router.get("/", response_model=DataResponse)
async def user_read(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> DataResponse:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
        # return DataResponse(
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
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )
    else:
        return DataResponse(
            data=GeneralDataModel(
                items=[user.model_dump()],
                totalCount=1,
            ),
            success=True,
        )


@users_router.patch("/", response_model=DataResponse)
async def update_user(token: Annotated[str, Depends(oauth2_scheme)], user: EnUserUpdate, db: Session = Depends(get_db_session)) -> DataResponse:
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user_db = db.exec(statement).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return DataResponse(
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

    return DataResponse(
        data=GeneralDataModel(
            items=[user.model_dump()],
            totalCount=1,
        ),
        success=True,
    )

@users_router.delete("/", response_model=MessageResponse)
async def delete_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db_session)) -> MessageResponse:
    token_data = decode_token(token)

    if not "id" in token_data:
        statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
        user = db.exec(statement).first()
    else:
        user = db.get(EnUser, token_data["id"])

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )

    db.delete(user)
    db.commit()

    return MessageResponse(
        data=f"User was successfully deleted.",
        success=True
    )
