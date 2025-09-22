import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.responses import HTMLResponse

from .admin.router import admin_router
from .oep.router import oep_router
from .project.router import projects_router
from .results.router import results_router
from .scenario.router import scenario_router
from .simulation.router import simulation_router
from .user.router import users_router

tags_metadata = [
    {
        "name": "user",
        "description": "Operations with users. The **login** logic is also here."
    },
    {
        "name": "project",
        "description": "Manage projects.",
    },
    {
        "name": "admin",
        "description": "Just a Teapot."
    },
    {
        "name": "scenario",
        "description": "Manage scenarios."
    },
    {
        "name": "default",
        "description": "The root of all evil."
    },
    {
        "name": "simulation",
        "description": "Manage simulations."
    },
    {
        "name": "results",
        "description": "Get results."
    }
]

fastapi_app = FastAPI(
    root_path="/api",
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
    servers=[
        {"url": "http://localhost:20002", "description": "Development environment"},
        {"url": "http://localhost:9004", "description": "Production Test environment"},
        {"url": "https://ensys.hs-nordhausen.de", "description": "Production environment"}
    ],
    root_path_in_servers=False
)

fastapi_app.mount("/static", StaticFiles(directory=os.path.join("templates", "assets")), name="static")
templates = Jinja2Templates(directory=os.path.join("templates", "html"))

origins = [
    "http://localhost:9004",
    "http://localhost:20001",
    "http://localhost:20002",
    "https://ensys.hs-nordhausen.de",
    "http://surak.hs-nordhausen.de:9004",
    "http://surak.hs-nordhausen.de:20001",
]

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = [users_router, admin_router, projects_router, scenario_router, simulation_router, results_router, oep_router]
for router in routers:
    fastapi_app.include_router(
        router=router
    )


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

    return templates.TemplateResponse(
        request=request,
        name="main_response.html"
    )

# @app.exception_handler(CustomException)
# async def custom_exceptions_handler(request: Request, exc: CustomException):
#     return CustomResponse(
#         data=None,
#         success=False,
#         errors=[ErrorModel(
#             code=exc.code,
#             message=exc.message
#         )]
#     )

# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     #print(exc.errors())
#     return CustomResponse(
#         data=None,
#         success=False,
#         errors=[ErrorModel(
#             code=status.HTTP_422_UNPROCESSABLE_ENTITY,
#             message=repr(exc.errors())
#         )]
#     )
