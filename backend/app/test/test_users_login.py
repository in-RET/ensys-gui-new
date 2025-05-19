import pytest
from fastapi.testclient import TestClient

from backend.app.main import fastapi_app
from backend.app.test.test_constants import get_test_user

client = TestClient(fastapi_app)


@pytest.mark.order(5)
def test_users_login_success():
    test_user, test_token = get_test_user()

    response = client.post(
        url="/user/auth/login",
        data={
            "username": test_user.username,
            "password": test_user.password
        },
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "User login successful.",
        "access_token": test_token,
        "token_type": "bearer",
    }

@pytest.mark.order(6)
def test_users_login_failure_not_found():
    response = client.post(
        url="/user/auth/login",
        data={
            "username": "not_found",
            "password": ""
        },
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "User not found.",
    }

@pytest.mark.order(7)
def test_users_login_failure_wrong_password():
    response = client.post(
        url="/user/auth/login",
        data={
            "username": "pytest",
            "password": ""
        },
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Password incorrect.",
    }


