import pytest
from starlette.testclient import TestClient

from .test_fixtures import client


@pytest.mark.order(1)
def test_admin_root(client: TestClient):
    response = client.get("/admin")
    assert response.status_code == 418
    assert response.json() == {"detail": "I'm a teapot."}
