import string
import random
import pytest

from fastapi.testclient import TestClient

from backend.app.main import fastapi_app
from backend.app.tests.test_fixtures import get_test_user

client = TestClient(fastapi_app)

@pytest.mark.order(0)
def test_users_register_success(get_test_user):
    test_user, test_token= get_test_user

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 201
    response_data = response.json()
    assert response_data["data"] == ''
    assert response_data["errors"] is None
    assert response_data["success"] == True

@pytest.mark.order(1)
def test_users_register_failure_username_already_exists(get_test_user):
    test_user, test_token = get_test_user
    test_user.mail = "second.test@localhost.de"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 409
    assert response.json() == {
        "detail": "User already exists.",
    }

@pytest.mark.order(2)
def test_users_register_failure_mail_already_exists(get_test_user):
    test_user, test_token = get_test_user
    test_user.username = "second pytest"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 409
    assert response.json() == {
        "detail": "Mail already in use.",
    }

@pytest.mark.order(3)
def test_users_register_failure():
    response = client.post(
        url="/user/auth/register",
        data={
            "username": "pytest",
        },
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )
    assert response.status_code == 422

@pytest.mark.order(4)
def test_users_register_no_data():
    response = client.post(
        url="/user/auth/register",
        data = {},
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
        }
    )
    assert response.status_code == 422

@pytest.mark.order(4)
def test_users_register_failure_mail_not_valid(get_test_user):
    test_user, test_token = get_test_user
    test_user.mail = "second.ytest.com"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Invalid mail address.",
    }

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_uppercase(get_test_user):
    test_user, test_token = get_test_user
    test_user.password = "pythontest"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_lowercase(get_test_user):
    test_user, test_token = get_test_user
    test_user.password = "PYTHONTEST"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_digit(get_test_user):
    test_user, test_token = get_test_user
    test_user.password = "PYTHONtest"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 400

@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_no_special_char(get_test_user):
    test_user, test_token = get_test_user
    test_user.password = "PYtest12"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    assert response.status_code == 400


@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_too_short(get_test_user):
    test_user, test_token = get_test_user
    test_user.password = "PYt"

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    #% TODO: Why?!
    assert response.status_code == 422


@pytest.mark.order(4)
def test_users_register_failure_password_incorrect_too_long(get_test_user):
    test_user, test_token = get_test_user
    test_user.password = "".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(200))

    response = client.post(
        url="/user/auth/register",
        data=test_user.model_dump_json(exclude_none=True),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        }
    )

    #% TODO: Why?!
    assert response.status_code == 422
