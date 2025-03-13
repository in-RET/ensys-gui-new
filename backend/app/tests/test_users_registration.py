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
    assert response.json() == ""

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

@pytest.mark.order(4)
def test_users_register_failure_mail_not_valid():
    test_user, test_token = get_test_user()
    test_user.mail = "second.ytest.com"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Invalid mail address.",
    }

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_uppercase():
    test_user, test_token = get_test_user()
    test_user.password = "pytest"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_lowercase():
    test_user, test_token = get_test_user()
    test_user.password = "PYTEST"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_digit():
    test_user, test_token = get_test_user()
    test_user.password = "PYtest"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_special_char():
    test_user, test_token = get_test_user()
    test_user.password = "PYtest12"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_special_char():
    test_user, test_token = get_test_user()
    test_user.password = "PYtest12"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_too_short():
    test_user, test_token = get_test_user()
    test_user.password = "PYt"

    response = client.post(
        url="/users/auth/register",
        params=test_user.model_dump(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
    )

    assert response.status_code == 400
