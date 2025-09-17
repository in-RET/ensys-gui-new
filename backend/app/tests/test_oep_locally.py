import pytest

from .test_fixtures import client


@pytest.mark.order(18)
def test_oep_schemas(client):
    response = client.get("/oep/local_schemas/sinks")
    response_data = response.json()

    assert response.status_code == 200
    assert response_data["success"] == True
