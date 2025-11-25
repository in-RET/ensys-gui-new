"""
User Router Module
================

This module provides the API endpoints for user management in the EnSys application.
It handles user registration, authentication, profile management, and account activation.

The module provides endpoints for:
    - User login and authentication
    - New user registration
    - Email verification and account activation
    - User profile retrieval and updates
    - Account deletion
"""

import asyncio
import os
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.templating import Jinja2Templates
from sqlmodel import Session
from starlette import status
from starlette.responses import JSONResponse

from .model import EnUser, EnUserUpdate, EnUserDB
from .service import (
    authenticate_user,
    create_user,
    read_user_by_token,
    update_user,
    delete_user,
    activate_user,
)
from ..db import get_db_session
from ..mail import send_mail
from ..models.base import GeneralDataModel
from ..models.response import DataResponse, MessageResponse
from ..security import oauth2_scheme

templates = Jinja2Templates(directory=os.path.join("templates", "html"))

users_router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@users_router.post("/auth/login")
async def login_user_endpoint(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db_session),
):
    """
    Authenticates a user and generates an access token upon successful login.

    This function allows the user to log into the system by providing the correct
    credentials. Upon successful authentication, an access token is generated
    and returned with additional details. If the credentials are invalid or the
    user does not exist, appropriate exceptions are raised.

    :param username: The username of the user attempting to log in.
    :type username: str
    :param password: The password associated with the username.
    :type password: str
    :param db: The database session dependency that allows for database queries.
    :type db: Session
    :return: A JSON response containing a success message, an access token,
        and the token type if authentication is successful.
    :rtype: JSONResponse
    :raises HTTPException: Raised with status code 404 if the user does not exist,
        or with status code 401 if the password is incorrect.
    """
    # Authenticate via service
    user_db = authenticate_user(username=username, password=password, db=db)

    return JSONResponse(
        content={
            "message": "User login successful.",
            "access_token": user_db.get_token(),
            "token_type": "bearer",
        },
        status_code=status.HTTP_200_OK,
    )


@users_router.post(
    "/auth/register",
    status_code=status.HTTP_201_CREATED,
    response_model=MessageResponse,
)
async def register_user_endpoint(
    user: EnUser,
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """
    Registers a new user in the system. The function verifies whether the username
    and email provided by the user are unique before proceeding with the creation
    of a new user record. If the username or email is already in use, an exception
    is raised with the appropriate error details. A successful registration results
    in the creation of a persisted user entity in the database. Passwords are
    securely hashed before storage to ensure data protection.

    :param user: An instance of EnUser containing the user's registration details,
                 including username, email, and password.
                 Type: EnUser
    :param db: Dependency-injected database session to interact with the database.
               Type: Session
    :return: A response model indicating the success of the operation.
             Returns a MessageResponse object on success.
    :rtype: MessageResponse

    :raises HTTPException:
        - If the username is already in use (HTTP status 409).
        - If the email is already in use (HTTP status 409).
        - If user registration fails due to an unknown issue (HTTP status 404).
    """
    # Use service to create user
    db_user: EnUserDB = create_user(user=user, db=db)

    token = db_user.get_token()

    # send activation mail asynchronously
    asyncio.create_task(send_mail(token=token, user=db_user))

    return MessageResponse(data="", success=True)


@users_router.get("/auth/activate/{token}")
async def activate_user_endpoint(
    request: Request, token: str, db: Session = Depends(get_db_session)
):
    """
    Activate a user account via email verification link.

    This endpoint handles user account activation by verifying the token sent
    via email. Upon successful activation, a success page is rendered.

    :param db: database session for user retrieval and activation
    :type db: Session
    :param request: FastAPI request object for template rendering
    :type request: Request
    :param token: Account activation token from email
    :type token: str
    :return: HTML template response indicating activation status
    :rtype: TemplateResponse
    :raises HTTPException: If activation fails or token is invalid (status code 409)
    """
    user = read_user_by_token(token=token, db=db)

    if activate_user(user=user, db=db):
        return templates.TemplateResponse(
            request=request,
            name="activation_response_200.html",
            context={"user": user.username},
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity error on user activation.",
        )


@users_router.get("/", response_model=DataResponse)
async def read_user_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """
    Handles a GET API endpoint to read user information from the database.

    This function authenticates the request using the provided token and retrieves
    the corresponding user data from the database. If the token is invalid or the
    user is not found, appropriate HTTP exceptions are raised. On successful retrieval,
    it returns the user data wrapped in a response model.

    :param token: A token string obtained through user authentication.
    :type token: str

    :param db: The database session used for querying user data.
    :type db: Session

    :return: A DataResponse instance containing user information if authentication
             and retrieval are successful.
    :rtype: DataResponse
    """
    user = read_user_by_token(token=token, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[user.model_dump()],
            totalCount=1,
        ),
        success=True,
    )


@users_router.patch("/", response_model=DataResponse)
def update_user_endpoint(
    data: EnUserUpdate,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """
    Updates the user information in the database based on the provided token and
    user data. The token is used to authenticate and retrieve the corresponding
    user. The user details in the database are updated with the provided data,
    and the updated information is returned.

    :param token: The authentication token identifying the user to be updated.
    :type token: str
    :param user: The updated details of the user.
    :type user: EnUserUpdate
    :param db: The database session used for executing queries.
    :type db: Session
    :return: Response containing the updated user details in a data response format.
    :rtype: DataResponse
    """
    user = read_user_by_token(token=token)

    updated = update_user(user=user, update_data=data, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[updated.model_dump()],
            totalCount=1,
        ),
        success=True,
    )


@users_router.delete("/", response_model=MessageResponse)
async def delete_user_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """
    Deletes a user based on the credentials and token provided. The function
    retrieves the user's data from the database using the information decoded
    from the token. If the user does not exist, an HTTP exception is raised.
    If the user exists, the function proceeds to delete the user from the
    database and commits the transaction.

    :param token: An access token for the user requesting deletion.
    :param db: A SQLAlchemy session dependency for interacting with the database.
    :return: A `MessageResponse` indicating the outcome of the operation.
    :rtype: MessageResponse
    :raises HTTPException: If the user is not found, with status code 404.
    """
    user = read_user_by_token(token=token, db=db)

    delete_user(user=user, db=db)

    return MessageResponse(data=f"User was successfully deleted.", success=True)
