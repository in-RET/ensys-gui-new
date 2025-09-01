import pytest
from fastapi.testclient import TestClient

from backend.app.tests.test_fixtures import get_test_user
from .test_fixtures import client


@pytest.mark.order(16)
def test_users_delete_success(get_test_user, client: TestClient):
    test_user, test_token = get_test_user

    response = client.delete(
        url="/user",
        headers={
            "accept"       : "application/json",
            "Authorization": f"Bearer {test_token}",
        }
    )

    assert response.status_code == 200

    response_data = response.json()
    assert response_data["data"] == f"User was successfully deleted."
    assert response_data["errors"] is None
    assert response_data["success"] == True


@pytest.mark.order(17)
def test_users_delete_failure_not_found(get_test_user, client: TestClient):
    test_user, test_token = get_test_user

    response = client.delete(
        url="/user",
        headers={
            "accept"       : "application/json",
            "Authorization": f"Bearer {test_token}",
        }
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "User not found.",
    }
