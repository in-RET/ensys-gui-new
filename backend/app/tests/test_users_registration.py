import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.tests.test_constants import get_test_user

client = TestClient(app)

@pytest.mark.order(0)
def test_users_register_success():
    test_user, test_token= get_test_user()

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "User created.",
        "user_data": test_user.get_token_information(),
        "access_token": test_token,
        "token_type": "bearer",
    }

@pytest.mark.order(1)
def test_users_register_failure_username_already_exists():
    test_user, test_token = get_test_user()
    test_user.mail = "second.test@localhost.de"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 409
    assert response.json() == {
        "detail": "User already exists.",
    }

@pytest.mark.order(2)
def test_users_register_failure_mail_already_exists():
    test_user, test_token = get_test_user()
    test_user.username = "second pytest"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 409
    assert response.json() == {
        "detail": "Mail already in use.",
    }

@pytest.mark.order(3)
def test_users_register_failure():
    response = client.post(
        url="/users/auth/register",
        params={
            "username": "pytest",
        },
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )
    assert response.status_code == 422

@pytest.mark.order(4)
def test_users_register_no_data():
    response = client.post(
        url="/users/auth/register",
        params = {},
        headers = {
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )
    assert response.status_code == 422
