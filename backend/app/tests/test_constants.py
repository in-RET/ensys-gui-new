from jose import jwt
from sqlalchemy import create_engine
from sqlmodel import Session, select

from backend.app.db import db_link
from backend.app.security import token_secret
from backend.app.users.model import EnUser, EnUserDB


TEST_USER_DATA = {
    "username": "pytest",
    "password": "TestASas12,.",
    "firstname": "firstname",
    "lastname": "lastname",
    "mail": "test@localhost.de"
}

def get_test_user():
    test_user = EnUser(**TEST_USER_DATA)
    test_token = jwt.encode(test_user.get_token_information(), token_secret, algorithm="HS256")

    return test_user, test_token

def get_test_user_db():
    db = Session(create_engine(db_link))

    statement = select(EnUserDB).where(EnUserDB.username == TEST_USER_DATA["username"])
    db_user = db.exec(statement).first()

    db_token = jwt.encode(db_user.get_token_information(), token_secret, algorithm="HS256")

    return db_user, db_token
