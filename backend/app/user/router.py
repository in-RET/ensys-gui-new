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
) -> JSONResponse:
    """Authenticate a user and return an access token.

    - param username: login username (form field)
    - param password: login password (form field)
    - param db: SQLModel session dependency
    - returns: JSON with message, access_token, token_type
    - raises: HTTPException 404/401 on missing user or bad credentials
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
    """Register a new user if username/email are free.

    - param user: registration payload
    - param db: SQLModel session dependency
    - returns: MessageResponse on success
    - raises: HTTPException 409/404 on conflicts or failure
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
    """Activate a user via email token and render a response page.

    - param request: FastAPI request for templating
    - param token: activation token from email link
    - param db: SQLModel session dependency
    - returns: TemplateResponse on success
    - raises: HTTPException 409 on activation failure
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


@users_router.get("", response_model=DataResponse)
async def read_user_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """Return the authenticated user's profile.

    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with user data
    """
    user = read_user_by_token(token=token, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[user.model_dump_json(exclude={"password"})],
            totalCount=1,
        ),
        success=True,
    )


@users_router.patch("", response_model=DataResponse)
def update_user_endpoint(
    data: EnUserUpdate,
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> DataResponse:
    """Update the authenticated user's profile.

    - param data: fields to update
    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: DataResponse with updated user
    """
    user = read_user_by_token(token=token, db=db)

    updated = update_user(user=user, update_data=data, db=db)

    return DataResponse(
        data=GeneralDataModel(
            items=[updated.model_dump()],
            totalCount=1,
        ),
        success=True,
    )


@users_router.delete("", response_model=MessageResponse)
async def delete_user_endpoint(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db_session),
) -> MessageResponse:
    """Delete the authenticated user.

    - param token: bearer token from OAuth2
    - param db: SQLModel session dependency
    - returns: MessageResponse indicating deletion
    - raises: HTTPException 404 when user not found
    """
    user = read_user_by_token(token=token, db=db)

    delete_user(user=user, db=db)

    return MessageResponse(data="User was successfully deleted.", success=True)
