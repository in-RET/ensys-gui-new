from urllib import response

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.users.forms import EnUserRegisterForm

client = TestClient(app)

def test_users_register_success():
    # testdaten generieren
    user_data = EnUserRegisterForm(
        username="pytest",
        password="mydirtylittlepassword",
        firstname="py",
        lastname="test",
        mail="test@localhost.de"
    )
    #print(user_data.dict(include={"username", "password", "email", "firstname", "lastname"}))
    test_token = "" #jwt.encode(user_data.dict(include={"username", "password", "email", "firstname", "lastname"}), token_secret, algorithm="HS256")

    response = client.post(
        url="/users/auth/register",
        content=user_data,
        #headers = {"Content-Type": "multipart/form-data"}
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "User created.",
        "user_data": "",
        "access_token": test_token,
        "token_type": "bearer",
    }

def test_users_register_failure():
    pass

def test_users_register_no_data():
    response = client.post(
        url="/users/auth/register"
    )
    assert response.status_code == 422
