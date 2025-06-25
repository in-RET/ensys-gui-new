from datetime import datetime
from typing import Annotated

from fastapi import Depends, APIRouter, Form, HTTPException
from jose import jwt
from passlib.hash import pbkdf2_sha256
from sqlmodel import Session, select
from starlette import status
from starlette.responses import JSONResponse

from .model import EnUser, EnUserDB, EnUserUpdate
from ..data.model import GeneralDataModel
from ..db import get_db_session
from ..responses import DataResponse, MessageResponse
from ..security import decode_token, oauth2_scheme, token_secret

users_router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@users_router.post("/auth/login")
async def user_login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db_session)):
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
    statement = select(EnUserDB).where(EnUserDB.username == username)
    user_db = db.exec(statement).first()

    if not user_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user_db.verify_password(password):
        user_db.last_login = datetime.now()
        db.add(user_db)
        db.commit()
        db.refresh(user_db)

        token = jwt.encode(user_db.get_token_information(), token_secret, algorithm="HS256")

        # return DataResponse(
        #     data={
        #         "message": "User login successful.",
        #         "access_token": token,
        #         "token_type": "bearer"
        #     },
        #     success=True,
        #     errors=None
        # )

        return JSONResponse(
            content={
                "message": "User login successful.",
                "access_token": token,
                "token_type": "bearer"},
            status_code=status.HTTP_200_OK
        )
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password incorrect.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Username/Password incorrect."
        #     )]
        # )


@users_router.post("/auth/register", status_code=status.HTTP_201_CREATED, response_model=MessageResponse)
async def user_register(user: EnUser, db: Session = Depends(get_db_session)) -> MessageResponse:
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
    # Test against same username
    statement = select(EnUserDB).where(EnUserDB.username == user.username)
    results = db.exec(statement).first()

    if results is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_409_CONFLICT,
        #         message="User already exists."
        #     )]
        # )

    # Test against same mail
    statement = select(EnUserDB).where(EnUserDB.mail == user.mail)
    results = db.exec(statement).first()

    if results is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mail already in use.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_409_CONFLICT,
        #         message="Mail already in use."
        #     )]
        # )

    db_user = EnUserDB(**user.model_dump())
    db_user.username = user.username.lower()
    db_user.password = pbkdf2_sha256.hash(user.password)
    db_user.date_joined = datetime.now()

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if db_user.id is not None:
        return MessageResponse(
            data="",
            success=True
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User registration failed.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User registration failed."
        #     )]
        # )


@users_router.get("/", response_model=DataResponse)
async def user_read(token: Annotated[str, Depends(oauth2_scheme)],
                    db: Session = Depends(get_db_session)) -> DataResponse:
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
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_401_UNAUTHORIZED,
        #         message="Not authenticated."
        #     )]
        # )
    else:
        token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user = db.exec(statement).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )
    else:
        return DataResponse(
            data=GeneralDataModel(
                items=[user.model_dump()],
                totalCount=1,
            ),
            success=True,
        )


@users_router.patch("/", response_model=DataResponse)
async def update_user(token: Annotated[str, Depends(oauth2_scheme)], user: EnUserUpdate,
                      db: Session = Depends(get_db_session)) -> DataResponse:
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
    token_data = decode_token(token)

    statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
    user_db = db.exec(statement).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )

    for field, value in user.model_dict().items():
        print(field, ":", value)
        setattr(user_db, field, value)

    db.commit()
    db.refresh(user_db)

    return DataResponse(
        data=GeneralDataModel(
            items=[user.model_dump()],
            totalCount=1,
        ),
        success=True,
    )


@users_router.delete("/", response_model=MessageResponse)
async def delete_user(token: Annotated[str, Depends(oauth2_scheme)],
                      db: Session = Depends(get_db_session)) -> MessageResponse:
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
    token_data = decode_token(token)

    if not "id" in token_data:
        statement = select(EnUserDB).where(EnUserDB.username == token_data["username"])
        user = db.exec(statement).first()
    else:
        user = db.get(EnUser, token_data["id"])

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        # return DataResponse(
        #     data=None,
        #     success=False,
        #     errors=[ErrorModel(
        #         code=status.HTTP_404_NOT_FOUND,
        #         message="User not found."
        #     )]
        # )

    db.delete(user)
    db.commit()

    return MessageResponse(
        data=f"User was successfully deleted.",
        success=True
    )
