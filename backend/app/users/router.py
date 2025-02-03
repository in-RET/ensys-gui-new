from datetime import datetime
from typing import Annotated

from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.hash import pbkdf2_sha256
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .forms import EnUserRegisterForm
from .model import EnUser
from ..dependencies import token_secret, db_engine, oauth2_scheme


def decode_token(token: str):
    token_data = jwt.decode(token, token_secret, algorithms=["HS256"])
    print(token_data)

    return token_data


users_router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@users_router.post("/auth/login")
async def user_login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(db_engine) as session:
        statement = select(EnUser).where(EnUser.username == form_data.username)
        results = session.exec(statement)

        user = results.first()

        if user.verify_password(form_data.password):
            user.last_login = datetime.now()
            session.add(user)
            session.commit()
            session.refresh(user)

            token = jwt.encode(user.dict(exclude={"password", "last_login", "date_joined", "is_staff", "is_active", "is_superuser"}), token_secret, algorithm="HS256")
            print(token)

            return JSONResponse(
                content={
                    "message": "User login successful.",
                    "user_data": user.dict(exclude={"password", "last_login", "date_joined", "is_staff", "is_active", "is_superuser"}),
                    "access_token": token,
                    "token_type": "bearer",
                },
                status_code=status.HTTP_200_OK,
            )
        else:
            return JSONResponse(
                content={
                    "message": "User login failed.",
                    "user_data": user.dict(include={"username"})
                },
                status_code=status.HTTP_401_UNAUTHORIZED
            )


@users_router.post("/auth/register")
async def user_register(form_data: EnUserRegisterForm = Depends()):
    user = EnUser(
        username = form_data.username,
        password = pbkdf2_sha256.hash(form_data.password),
        firstname = form_data.firstname,
        lastname = form_data.lastname,
        mail = form_data.mail,
        date_joined = datetime.now(),
    )

    with Session(db_engine) as session:
        session.add(user)
        session.commit()

        statement = select(EnUser).where(EnUser.username == user.username)
        results = session.exec(statement)
        session.close()

        user = results.first()

    if user:
        token = jwt.encode(user.dict(exclude={ "last_login", "date_joined", "is_staff", "is_active", "is_superuser"}), token_secret, algorithm="HS256")

        return JSONResponse(
            content={
                "message": "User created.",
                "user_data": results.first().dict(exclude={"password", "last_login", "date_joined", "is_staff", "is_superuser", "is_active"}),
                "access_token": token,
                "token_type": "bearer",
            },
            status_code=status.HTTP_200_OK
        )
    else:
        return JSONResponse(
            content={
                "message": "User registration failed."
            },
            status_code=status.HTTP_401_UNAUTHORIZED
        )


@users_router.get("/read", response_model=EnUser)
async def user_read(token: Annotated[str, Depends(oauth2_scheme)]):
    token_data = decode_token(token)

    with Session(db_engine) as session:
        statement = select(EnUser).where(EnUser.username == token_data["username"])
        result = session.exec(statement).first()

        session.close()

        if result:
            return result
        else:
            return JSONResponse(
                content={
                    "message": "User can't be read.",
                },
                status_code=status.HTTP_401_UNAUTHORIZED
            )


@users_router.patch("/update", response_model=EnUser)
async def update_user(token: Annotated[str, Depends(oauth2_scheme)], user: EnUser):
    token_data = decode_token(token)

    with Session(db_engine) as session:
        statement = select(EnUser).where(EnUser.id == token_data["id"])
        stored_user_data = session.exec(statement).first()

        # TODO: Hier ist noch ein Bug, Nutzer wird neu angelegt.
        stored_user_model = EnUser(**stored_user_data)
        print(stored_user_model)

        update_user_data = user.model_dump(exclude_unset=True)
        print(update_user_data)
        updated_item = stored_user_model.model_copy(update=update_user_data)


        print(updated_item)

        #session.add(result)
        #session.refresh(result)
        #session.commit()
        session.close()

        return user


@users_router.delete("/delete", response_model=EnUser)
async def delete_user(token: Annotated[str, Depends(oauth2_scheme)]):
    token_data = decode_token(token)

    with Session(db_engine) as session:
        statement = select(EnUser).where(EnUser.id == token_data["id"])
        results = session.exec(statement)
        user = results.one()
        session.delete(user)
        session.commit()
        session.close()

        print("Deleted user:", user)

        return user
