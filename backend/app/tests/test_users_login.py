import pytest
from fastapi.testclient import TestClient

from .test_fixtures import client, get_test_user


@pytest.mark.order(13)
def test_users_login_success(get_test_user, client: TestClient):
    test_user, test_token = get_test_user

    print(f"Username: {test_user.username}, Password: {test_user.password}")

    data = {
        "username": test_user.username,
        "password": test_user.password
    }

    headers = {
        "accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = client.post(
        url="/user/auth/login",
        data=data,
        headers=headers
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "User login successful.",
        "access_token": test_token,
        "token_type": "bearer",
    }


@pytest.mark.order(14)
def test_users_login_failure_not_found(client: TestClient):
    response = client.post(
        url="/user/auth/login",
        data={
            "username": "not_found",
            "password": ""
        },
        headers={
            "accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "User not found.",
    }


@pytest.mark.order(15)
def test_users_login_failure_wrong_password(client: TestClient):
    response = client.post(
        url="/user/auth/login",
        data={
            "username": "pytest",
            "password": ""
        },
        headers={
            "accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Password incorrect.",
    }
