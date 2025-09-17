import pytest
from starlette.testclient import TestClient

from .test_fixtures import client


@pytest.mark.order(0)
def test_main_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
