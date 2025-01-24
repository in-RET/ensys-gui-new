from fastapi.security import OAuth2PasswordRequestForm
from fastapi.exceptions import HTTPException
from fastapi.openapi.models import OAuth2 as OAuth2Model
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.param_functions import Form
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
from starlette.requests import Request
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

# TODO: import from typing when deprecating Python 3.9
from typing_extensions import Annotated, Doc


class EnsysUserRegisterForm(OAuth2PasswordRequestForm):

    def __init__(self,
                 username: Annotated[
                     str,
                     Form(),
                     Doc("""
                             `username` string. The OAuth2 spec requires the exact field name
                             `username`.
                         """
                     )
                 ],
                 password: Annotated[
                     str,
                     Form(),
                     Doc("""
                            `password` string. The OAuth2 spec requires the exact field name
                            `password`.
                         """
                     )
                 ],
                 firstname: Annotated[
                     str,
                     Form(),
                     Doc("""
                            `firstname`string.
                         """)
                 ],
                 lastname: Annotated[
                     str,
                     Form(),
                     Doc("""
                            `lastname`string.
                         """
                    )
                 ],
                 mail: Annotated[
                     str,
                     Form(),
                     Doc("""
                            `mail`string.
                         """)
                 ]):
        super().__init__(username=username, password=password)
        self.mail = mail
        self.lastname = lastname
        self.firstname = firstname
