import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqladmin import Admin
from sqlalchemy import create_engine
from starlette.middleware.gzip import GZipMiddleware

from .core.config import get_settings
from .oep.router import oep_router
from .project.model import ProjectAdmin
from .project.router import projects_router
from .results.router import results_router
from .scenario.model import ScenarioAdmin
from .scenario.router import scenario_router
from .simulation.model import SimulationAdmin
from .simulation.router import simulation_router
from .templates.model import TemplateScenarioAdmin, TemplateAdmin
from .templates.router import templates_router
from .user.model import UserAdmin
from .user.router import users_router

"""EnSys GUI backend entrypoint.

- Configures FastAPI with middleware, admin views, and all routers
- Serves OpenAPI docs at `/docs` and `/redoc`
"""

tags_metadata = [
    {
        "name": "user",
        "description": "Operations with users. The **login** logic is also here.",
    },
    {
        "name": "project",
        "description": "Manage projects.",
    },
    {"name": "scenario", "description": "Manage scenarios."},
    {"name": "default", "description": "The root of all evil."},
    {"name": "simulation", "description": "Manage simulations."},
    {"name": "results", "description": "Get results."},
    {"name": "templates", "description": "Manage templates."},
]

_settings = get_settings()

fastapi_app = FastAPI(
    root_path=_settings.root_path,
    title="EnSys Backend",
    summary="The API and backend for the software package 'EnSys by in.RET'",
    version="0.2.0dev",
    contact={
        "name": "Hochschule Nordhausen - Institut für regenerative Energietechnik",
        "url": "https://www.hs-nordhausen.de/forschung/in-ret-institut-fuer-regenerative-energietechnik/",
        "email": "ensys@hs-nordhausen.de",
    },
    license_info={
        "name": "GNU AFFERO GENERAL PUBLIC LICENSE aGPL",
        "identifier": "aGPL",
    },
    openapi_tags=tags_metadata
)

admin_engine = create_engine(_settings.database_url)
admin = Admin(
    app=fastapi_app,
    engine=admin_engine
)

admin.add_view(UserAdmin)
admin.add_view(ProjectAdmin)
admin.add_view(ScenarioAdmin)
admin.add_view(SimulationAdmin)
admin.add_view(TemplateAdmin)
admin.add_view(TemplateScenarioAdmin)

fastapi_app.mount(
    "/static", StaticFiles(directory=os.path.join("templates", "assets")), name="static"
)
templates = Jinja2Templates(directory=os.path.join("templates", "html"))

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins,
    allow_credentials=_settings.allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable gzip compression for larger responses to reduce bandwidth
fastapi_app.add_middleware(GZipMiddleware, minimum_size=1024)

routers = [
    users_router,
    projects_router,
    scenario_router,
    simulation_router,
    results_router,
    oep_router,
    templates_router,
]
for router in routers:
    fastapi_app.include_router(router=router)


@fastapi_app.middleware("http")
async def fix_admin_root_path(request, call_next):
    if request.url.path.startswith("/admin/"):
        request.scope["path"] = fastapi_app.root_path + request.url.path
    return await call_next(request)

@fastapi_app.get("")
async def root(request: Request):
    """Serve the landing page with links to the API docs.

    - returns: HTMLResponse with the main template
    """

    return templates.TemplateResponse(request=request, name="main_response.html")
