import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.gzip import GZipMiddleware
from starlette.responses import HTMLResponse

from .admin.router import admin_router
from .core.config import get_settings
from .oep.router import oep_router
from .project.router import projects_router
from .results.router import results_router
from .scenario.router import scenario_router
from .simulation.router import simulation_router
from .templates.router import templates_router
from .user.router import users_router

"""
EnSys GUI Backend Application
============================

This module serves as the main entry point for the EnSys GUI backend application.
It configures the FastAPI application, sets up middleware, and includes all routers.

The application provides REST API endpoints for:
    - User management and authentication
    - Project handling
    - Scenario management
    - Simulation control
    - Results retrieval
    - Template management
    - Administrative functions

Configuration
------------
The application uses environment variables for configuration, managed through the
settings module. See core.config for details.

API Documentation
---------------
Once running, the API documentation is available at:
    - /docs (Swagger UI)
    - /redoc (ReDoc)
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
    {"name": "admin", "description": "Just a Teapot."},
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
    openapi_tags=tags_metadata,
    default_response_class=ORJSONResponse,
)

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
    admin_router,
    projects_router,
    scenario_router,
    simulation_router,
    results_router,
    oep_router,
    templates_router,
]
for router in routers:
    fastapi_app.include_router(router=router)


@fastapi_app.get("/")
async def root(request: Request):
    """
    Handles the root endpoint of the FastAPI application, which responds with an HTML page
    providing a welcome message and links to documentation.

    Provides a simple HTML-based response notifying users about the available documentation
    resources. The background and content are customized with inline CSS styling for user
    visual experience.

    :return: HTMLResponse containing the welcome page content and HTTP status code 200.
    :rtype: HTMLResponse
    """

    return templates.TemplateResponse(request=request, name="main_response.html")
