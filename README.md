# EnSys by in.RET
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0e4d2f70045041c1aa1f383a0bf92647)](https://app.codacy.com/gh/in-RET/ensys-gui-new/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

[![Built with Material for MkDocs](https://img.shields.io/badge/Material_for_MkDocs-526CFE?style=for-the-badge&logo=MaterialForMkDocs&logoColor=white)](https://squidfunk.github.io/mkdocs-material/)

For further information, please refer to the Documentation: https://in-ret.github.io/ensys-gui-new

---

## Overview
EnSys is a web application for modeling and simulating energy systems. It consists of an Angular frontend and a FastAPI-based backend with asynchronous background processing via Celery and Redis. A Postgres database stores application data. Docker Compose configurations are provided for development and production, including an Nginx proxy in production.

## Tech stack
- Frontend: Angular 19 (TypeScript), served by:
  - Development: Angular dev server (ng serve)
  - Production: Nginx serving built static assets
- Backend: FastAPI (Uvicorn ASGI) with SQLModel/SQLAlchemy and Alembic migrations
- Background tasks: Celery workers with Redis broker/backend
- Database: PostgreSQL
- Proxy (prod): Nginx (routes / to frontend and /api to backend)
- Containerization: Docker, Docker Compose
- Package managers: npm (frontend), pip (backend, inside Docker image)

## Requirements
- Docker and Docker Compose
- Node.js (for local frontend development): LTS recommended
- npm (bundled with Node.js)
- Python (only if running backend outside Docker): Python 3.12 recommended
  - Note: Backend Docker image installs Python 3.12

## Quickstart (Docker)
1) Prepare an .env file (.env.dev for development, .env.prod for production) based on the variables below.

Minimal example for development:

```bash
# Database
POSTGRES_DB=ensys
POSTGRES_USER=ensys_pg
POSTGRES_PASSWORD=ensys_pg
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB

# Backend/runtime
OS_VERSION=amd64                 # or armlinux64 (see backend/docker/dockerfile)
LOCAL_WORKDIR=/absolute/path/to/repo/root
LOCAL_DATADIR=/absolute/path/to/local/data
HOST_DATADIR=/absolute/path/to/local/data
GUROBI_LICENSE_FILE_PATH=/absolute/path/to/gurobi.lic
SECRET_TOKEN=change-me

# Optional external services
# OEP_TOKEN=<token>
OEP_TOPIC=sandbox

# Ports
PROXY_PORT=9004                  # Dev: maps to Angular 4200
FASTAPI_PORT=9006                # Dev: maps to backend 8001
FLOWER_PORT=9008                 # maps to flower 8002
REDIS_PORT=6379                  # Redis inside container listens on this port
```

2) Start the stack

Development:
```bash
docker compose -f docker-compose.dev.yaml --env-file .env.dev up --build
```

Production (with proxy):
```bash
docker compose -f docker-compose.prod.yaml --env-file .env.prod up --build -d
```

3) Open the apps (local defaults)
- Frontend (dev): http://localhost:${PROXY_PORT} (serves Angular dev server)
- Backend (dev): http://localhost:${FASTAPI_PORT}
  - Swagger UI: http://localhost:${FASTAPI_PORT}/docs
  - ReDoc: http://localhost:${FASTAPI_PORT}/redoc
- Flower: http://localhost:${FLOWER_PORT}

In production, the Nginx proxy exposes http://localhost:${PROXY_PORT} with:
- / routed to frontend
- /api routed to backend (FastAPI app is mounted at /api)

## Entry points
- Frontend (dev): ng serve (Angular CLI)
- Frontend (prod): Nginx serves built files from dist/ensys-gui-angular/browser
- Backend API: Uvicorn app main: app.main:fastapi_app (port 8001 inside container)
- Celery worker: celery --app=app.celery.celery_app worker ...
- Celery Flower: celery --app=app.celery.celery_app flower --port=8002

## Available scripts
Root scripts:
- start.sh: docker compose -f docker-compose.prod.yaml --env-file .env.prod up --build -d
- stop.sh: docker compose -f docker-compose.prod.yaml --env-file .env.prod down

Frontend (frontend/package.json):
- npm start or npm run serve: ng serve --configuration=development --host 0.0.0.0
- npm run build: ng build --configuration=production
- npm run watch: ng build --watch --configuration=development
- npm test: ng test
- npm run lint: ng lint

Backend (inside container):
- Run API: uvicorn app.main:fastapi_app --host 0.0.0.0 --port 8001
- DB migrations: alembic upgrade head
- Celery worker: celery --app=app.celery.celery_app worker --loglevel=INFO
- Flower UI: celery --app=app.celery.celery_app flower --port=8002

## Environment variables
Core variables used across compose and backend:
- POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT: Postgres connection values used to build DATABASE_URL
- DATABASE_URL: SQLAlchemy/SQLModel database URL (postgresql://...)
- OS_VERSION: Used by backend Dockerfile to download Gurobi (amd64 or armlinux64)
- LOCAL_WORKDIR: Absolute path to a work directory (used by services/scripts) [TODO: confirm exact usage]
- LOCAL_DATADIR: Absolute path where simulation data, dumps and logs are stored
- HOST_DATADIR: Host path mounted into backend/celery containers at ${LOCAL_DATADIR}
- GUROBI_LICENSE_FILE_PATH: Path to Gurobi license on the host, mounted into backend worker at /backend/gurobi.lic
- SECRET_TOKEN: Secret used for auth/token generation in backend
- OEP_TOKEN: Token for OEP access [optional; TODO: confirm where used]
- OEP_TOPIC: OEP topic (default: sandbox)
- PROXY_PORT: Host port for proxy (prod) or Angular dev server (dev)
- FASTAPI_PORT: Host port mapped to backend (dev only)
- REDIS_PORT: Port used by Redis inside Docker and by Celery broker/backend
- FLOWER_PORT: Host port mapped to Celery Flower UI
- PGADMIN_* and WEB_PORT/API_PORT variables appear in older docs; current Compose files use PROXY_PORT/FASTAPI_PORT/FLOWER_PORT. [Updated]

If you maintain separate environments, create .env.dev and .env.prod with appropriate values. See docker-compose.dev.yaml and docker-compose.prod.yaml for references.

## Local development (without Docker)
Frontend only:
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:4200 by default
```

Backend only (requires Python 3.12 and Postgres):
```bash
# Create venv
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/docker/requirements.txt

# Ensure DATABASE_URL is set to a reachable Postgres instance
export DATABASE_URL=postgresql://user:pass@localhost:5432/ensys

# Run migrations and start API
cd backend
alembic upgrade head
uvicorn app.main:fastapi_app --reload --host 0.0.0.0 --port 8001
```
Celery worker locally:
```bash
export REDIS_PORT=6379  # or your Redis port
celery --app=backend.app.celery.celery_app worker --loglevel=INFO
```
Note: Gurobi is required for optimization in production; for local dev, ensure the solver configuration fits your environment. [TODO: document alternative solvers if supported]

## Tests
- Frontend: Angular/Karma/Jasmine
  - Run: cd frontend && npm test
- Backend and EnSys core library: pytest
  - Run inside backend environment/venv: pytest backend/app/tests
  - Library tests: pytest ensys/tests

## Project structure
Top-level folders:
- backend: FastAPI app, Celery tasks, Alembic migrations, Dockerfile and requirements
- frontend: Angular application and Dockerfiles (dev/prod)
- ensys: Python package with energy system modeling components and tests
- docs: MkDocs site sources and built docs
- proxy: Nginx config for production proxy
- example, notebooks, misc: auxiliary materials and examples
- storage: persistent volumes for database and other data (via Compose)
- docker-compose.dev.yaml / docker-compose.prod.yaml: Compose stacks
- start.sh / stop.sh: convenience scripts for production stack

## License
This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See the LICENSE file for details.

## Useful links
- Documentation: https://in-ret.github.io/ensys-gui-new
- Angular CLI: https://angular.io/cli
- FastAPI: https://fastapi.tiangolo.com
- Celery: https://docs.celeryq.dev
- Redis: https://redis.io

## TODOs
- Confirm and document LOCAL_WORKDIR usage and any additional email settings (EMAIL_SENDER, EMAIL_HOST_IP, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD) if still required by the backend.
- Provide guidance for non-Gurobi solver configuration if applicable.
- Provide example .env.dev and .env.prod templates in the repository (if desired).
