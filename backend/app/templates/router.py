from fastapi import APIRouter

from .model import EnSimulationDB, Status

templates_router = APIRouter(
    prefix="/templates",
    tags=["templates"]
)

@templates_router.get("/")
async def get_templates():
