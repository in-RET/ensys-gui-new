from starlette.testclient import TestClient

from backend.app.main import fastapi_app


client = TestClient(fastapi_app)

def test_main_root():
    response = client.get("/")
    assert response.status_code == 200
