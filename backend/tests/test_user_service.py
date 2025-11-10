import pytest
from fastapi import HTTPException
from sqlmodel import SQLModel, create_engine, Session

from ..app.user.model import EnUser
from ..app.user.service import create_user


def setup_in_memory_db():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    SQLModel.metadata.create_all(engine)
    return engine


def test_register_user_happy_path():
    engine = setup_in_memory_db()
    with Session(engine) as session:
        user = EnUser(
            username="TestUser", password="Aa1!testpw", mail="test@example.com"
        )
        db_user = create_user(user=user)

        assert db_user.id is not None
        assert db_user.username == "testuser"
        assert db_user.mail == "test@example.com"


def test_register_user_duplicate_username():
    engine = setup_in_memory_db()
    with Session(engine) as session:
        user1 = EnUser(username="DupUser", password="Aa1!testpw", mail="a@example.com")
        user2 = EnUser(username="DupUser", password="Aa1!testpw2", mail="b@example.com")

        _ = create_user(user=user1)

        with pytest.raises(HTTPException) as excinfo:
            create_user(user=user2, db=session)

        assert excinfo.value.status_code in (409,)
