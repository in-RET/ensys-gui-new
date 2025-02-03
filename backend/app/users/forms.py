from fastapi.param_functions import Form
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated


class EnUserRegisterForm(OAuth2PasswordRequestForm):
    def __init__(self,
                 username: Annotated[str, Form()],
                 password: Annotated[str, Form()],
                 firstname: Annotated[str, Form()],
                 lastname: Annotated[str, Form()],
                 mail: Annotated[str, Form()]):
        super().__init__(username=username, password=password)
        self.mail = mail
        self.lastname = lastname
        self.firstname = firstname
