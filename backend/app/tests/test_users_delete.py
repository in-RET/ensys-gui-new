import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.tests.test_constants import get_test_user

client = TestClient(app)


@pytest.mark.order(10)
def test_users_delete_success():
    test_user, test_token = get_test_user()

    response = client.delete(
        url="/users/delete",
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {test_token}",
        }
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "User was successfully deleted.",
        "user_data": test_user.get_token_information(),
        "token": test_token,
        "token_type": "bearer",
    }

@pytest.mark.order(11)
def test_users_delete_failure_not_found():
    test_user, test_token = get_test_user()

    response = client.delete(
        url="/users/delete",
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {test_token}",
        }
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "User not found.",
    }
