from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette import status
from starlette.responses import HTMLResponse

from .admin.router import admin_router
from .component.router import component_router
from .flow.router import flow_router
from .project.router import projects_router
from .scenario.router import scenario_router
from .simulation.router import simulation_router
from .user.router import users_router


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    # startup event
    yield
    # shutdown events

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
        "name": "component",
        "description": "Manage components. All components including busses."
    },
    # {
    #     "name": "flow",
    #     "description": "Manage flows. Flows are the connections between components."
    #     "externalDocs": {
    #         "description": "Items external docs",
    #         "url": "https://fastapi.tiangolo.com/",
    #     },
    # },
]

app = FastAPI(
    lifespan=lifespan,
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
)

origins = [
    "http://localhost:9003",
    "http://localhost:9004",
    "http://localhost:4200", #TODO: Delete in Production, because security reasons.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# including api routers
app.include_router(
    router=users_router,
)
app.include_router(
    router=admin_router,
)

app.include_router(
    router=projects_router
)

app.include_router(
    router=scenario_router
)

app.include_router(
    router=component_router
)

# app.include_router(
#     router=flow_router
# )

app.include_router(
    router=simulation_router
)

@app.get("/", response_class=HTMLResponse)
async def root():
    html_content = """
    <html>
        <head>
            <title>EnSys FastAPI</title>
        </head>
        <body style="background-color:#dcdcde; margin: auto; width: 75vh; height: 75%; display: flex; justify-content: center; align-items: center;">
        <div style="background-color:#fcf9e8; width:100%; text-align: center; font-family: monospace; padding: 15px">
            <h1>Welcome</h1>
            <p>For documentation see '/docs', '/redoc' or <a target="_blank" href="https://in-ret.github.io/ensys-gui-new/">this link</a>.<p>
        </div>
        </body>
    </html>
    """

    return HTMLResponse(
        content=html_content,
        status_code=status.HTTP_200_OK
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
