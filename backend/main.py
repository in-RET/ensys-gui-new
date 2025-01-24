import os
import jwt
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import create_engine, SQLModel, Session, select
from starlette.responses import JSONResponse

from users.forms import EnsysUserRegisterForm
from users.model import EnsysUser

from passlib.hash import pbkdf2_sha256

backend_app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

token_secret = "DiesIstEinGanzSchlechtesSecretUndMussGeandertWerden"

pgres_link = os.getenv("POSTGRES_LINK")
db_engine = create_engine(pgres_link)
SQLModel.metadata.create_all(db_engine)

@backend_app.get("/")
async def root():
    return {"message": "Hello World"}


@backend_app.post("/users/auth/login")
async def user_login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(db_engine) as session:
        statement = select(EnsysUser).where(EnsysUser.username == form_data.username)
        results = session.exec(statement)

        user = results.first()

        if user.verify_password(form_data.password):
            user.last_login = datetime.now()
            session.add(user)
            session.commit()
            session.refresh(user)

            token = jwt.encode(user.dict(exclude={ "last_login", "date_joined", "is_staff", "is_active", "is_superuser"}), token_secret, algorithm="HS256")
            print(token)

            return JSONResponse(
                content={
                    "message": "User login successful.",
                    "user_data": user.dict(exclude={"password", "last_login", "date_joined", "is_staff", "is_active", "is_superuser"}),
                    "access_token": token,
                    "token_type": "bearer",
                },
                status_code=200
            )
        else:
            return JSONResponse(
                content={
                    "message": "User login failed.",
                    "user_data": user.dict(include={"username"})
                },
                status_code=401
            )


@backend_app.post("/users/auth/register")
async def user_register(form_data: EnsysUserRegisterForm = Depends()):
    user = EnsysUser(
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

        statement = select(EnsysUser).where(EnsysUser.username == user.username)
        results = session.exec(statement)
        session.close()

        user = results.first()

    if user:
        token = jwt.encode(user.dict(exclude={ "last_login", "date_joined", "is_staff", "is_active", "is_superuser"}), token_secret, algorithm="HS256")
        print(token)
        return JSONResponse(
            content={
                "message": "User created.",
                "user_data": results.first().dict(exclude={"password", "last_login", "date_joined", "is_staff", "is_superuser", "is_active"}),
                "access_token": token,
                "token_type": "bearer",
            },
            status_code=200
        )
    else:
        return JSONResponse(
            content={
                "message": "User registration failed."
            },
            status_code=401
        )

@backend_app.put("/users/{user_id}", response_model=EnsysUser)
async def update_user(user_id: int, user: EnsysUser):
    with Session(db_engine) as session:
        statement = select(EnsysUser).where(EnsysUser.id == user_id)
        result = session.exec(statement).first()
        result = user

        session.add(result)
        session.commit()
        session.refresh(result)
        session.close()

        return user


@backend_app.delete("/users/{user_id}", response_model=EnsysUser)
async def delete_user(user_id: int):
    with Session(db_engine) as session:
        statement = select(EnsysUser).where(EnsysUser.id == user_id)
        results = session.exec(statement)
        user = results.one()
        session.delete(user)
        session.commit()
        session.close()

        print("Deleted hero:", user)

        return user
