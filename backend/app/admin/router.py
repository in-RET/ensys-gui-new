from fastapi import APIRouter, HTTPException
from starlette import status

admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={status.HTTP_418_IM_A_TEAPOT: {"description": "I'm a teapot"}},
)

@admin_router.get("/")
async def root():
    raise HTTPException(status_code=418, detail="I'm a teapot.")
