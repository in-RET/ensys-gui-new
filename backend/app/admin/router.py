from fastapi import APIRouter, HTTPException
from starlette import status

admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={status.HTTP_418_IM_A_TEAPOT: {"description": "I'm a teapot"}},
)

@admin_router.get("/")
async def root():
    """
    Handles the root route of the admin router.

    This endpoint raises an HTTPException with a 418 status code and a detail message
    indicating "I'm a teapot." This method does not return any content as it is designed
    to only trigger the exception. The implementation is aligned with the HTTP 418 status
    code, which is used as an Easter egg for humorous purposes.

    :return: None
    :raises HTTPException: Always raised with status code 418 and detail "I'm a teapot".
    """
    raise HTTPException(status_code=418, detail="I'm a teapot.")
