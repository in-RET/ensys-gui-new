EnSys project guidelines (advanced, project-specific)

This document captures build, configuration, testing, and development guidelines specific to this repository. It assumes familiarity with Docker, FastAPI, Angular, Celery, PostgreSQL, and pytest.

1) Build and configuration

Docker-based stacks
- Development stack (docker-compose.dev.yaml):
  - Services: Postgres (db), Angular dev server (frontend), FastAPI (backend), Redis, Celery worker, Flower UI.
  - Required env file: .env.dev in repo root. Key variables used by the stack and backend (see below for details).
  - Start: docker compose -f docker-compose.dev.yaml --env-file .env.dev up --build
  - Local ports (defaults):
    - Frontend: http://localhost:${PROXY_PORT} → Angular dev server (port 4200 in container)
    - Backend: http://localhost:${FASTAPI_PORT} (FastAPI bound to 8001 in container)
    - Flower:  http://localhost:${FLOWER_PORT}
  - Volumes mapped for live reload/development:
    - ./frontend → /app with node_modules volume
    - ./backend/app → /backend/app
    - ./backend/data → /backend/data
    - ./backend/templates → /backend/templates
    - ./ensys → /backend/ensys
    - ${HOST_DATADIR} → ${LOCAL_DATADIR} (long‑lived data)
  - Backend container entrypoint runs: alembic upgrade head && uvicorn app.main:fastapi_app --host 0.0.0.0 --port 8001

- Production stack (docker-compose.prod.yaml):
  - Adds Nginx proxy that routes / to frontend (built assets) and /api to backend.
  - Start: docker compose -f docker-compose.prod.yaml --env-file .env.prod up --build -d

Backend application specifics
- App module: backend/app/main.py exposes fastapi_app with root_path read from settings (default /api). In dev (no proxy), you can leave root_path=/api; in pure local runs without proxy you can set environment=development and keep root_path=/api (URLs will be http://localhost:${FASTAPI_PORT}/api if behind proxy; otherwise FastAPI serves at /api directly).
- CORS: Configurable via Settings.cors_origins (comma- or space-separated list supported). allow_credentials defaults to true.
- Health endpoints:
  - /healthz → returns {"status": "ok"}
  - /readiness → checks DB connectivity with a simple SELECT 1
- Static and templates are served from backend/templates.

Backend settings (pydantic-settings)
- Source: backend/app/core/config.py
- Primary knobs (env vars):
  - DATABASE_URL (required): e.g., postgresql://user:pass@host:5432/db
  - environment (development|production|test), root_path (/api default), log_level
  - CORS: cors_origins (string list), allow_credentials
  - SQLAlchemy engine: sqlalchemy_echo, pool_size, max_overflow, pool_recycle
  - Redis: redis_host (default redis), redis_port (6379), redis_url (overrides host/port if set)
  - Paths: local_datadir (default /backend/data) – also used in volumes mapping

Backend packaging and runtime
- Dependencies are managed via backend/docker/requirements.txt for container builds. If running locally outside Docker, install these requirements into a Python 3.12 virtualenv.
- Entrypoints:
  - API: uvicorn app.main:fastapi_app --reload --host 0.0.0.0 --port 8001
  - DB migrations: alembic upgrade head
  - Celery worker: celery --app=app.celery.celery_app worker --loglevel=INFO
  - Flower UI: celery --app=app.celery.celery_app flower --port=8002

Celery/Redis
- The worker and Flower containers depend on Redis (default redis://redis:6379). You can override with REDIS_PORT or set redis_url explicitly.
- In dev compose, the backend depends_on celery and flower; ensure Redis is healthy first.

Gurobi license (production/worker)
- The Celery worker can mount a GUROBI license file:
  - env: GUROBI_LICENSE_FILE_PATH=/absolute/host/path/to/gurobi.lic
  - Compose mounts at /backend/gurobi.lic in the worker container.
- OS_VERSION build arg selects the Gurobi download target in the backend Dockerfile (amd64 or armlinux64). Ensure it matches your host/target.

Frontend application
- Angular 19 with ESLint. Scripts (frontend/package.json):
  - npm start / npm run serve → ng serve --configuration=development --host 0.0.0.0
  - npm run build → ng build --configuration=production
  - npm test → ng test (Karma/Jasmine)
  - npm run lint → ng lint (via angular-eslint)
- Local dev (outside Docker):
  - cd frontend && npm install && npm start
  - Default dev URL: http://localhost:4200

Environment variables (summary)
- From README and config: POSTGRES_*, DATABASE_URL, OS_VERSION, LOCAL_DATADIR, HOST_DATADIR, GUROBI_LICENSE_FILE_PATH, SECRET_TOKEN, OEP_TOKEN (optional), OEP_TOPIC, PROXY_PORT, FASTAPI_PORT, REDIS_PORT, FLOWER_PORT.
- Note: DATABASE_URL must be reachable by the backend and tested by /readiness. In dev compose, POSTGRES_* build DATABASE_URL; otherwise, set DATABASE_URL explicitly.

2) Testing

Back-end and library tests (pytest)
- Two typical suites exist:
  - Core library tests under ensys/tests (depend on external libs like oemof.solph).
  - Backend API tests under backend/app/tests (typically require a DB and app fixtures).
- Recommended invocation patterns from repository root:
  - Run all library tests: pytest ensys/tests
  - Run backend tests (in a prepared env/DB): pytest backend/app/tests
  - Run a single test file: pytest path/to/test_file.py
  - Run a single test: pytest path/to/test_file.py::test_name
- If running outside Docker:
  - Create and activate a Python 3.12 virtualenv.
  - Install deps: pip install -r backend/docker/requirements.txt
  - Ensure DATABASE_URL points to a reachable Postgres instance for backend tests.

Frontend tests (Angular/Karma/Jasmine)
- From frontend directory:
  - Single run in headless Chrome (CI-friendly):
    - npx ng test --watch=false --browsers=ChromeHeadless
  - Default watch mode: npm test
- Ensure dependencies are installed: cd frontend && npm install

How to add a new backend pytest (example)
- Create a test file anywhere under tests or a target directory and run it explicitly to avoid collecting heavy suites if not needed.
- Minimal example we verified in this repo (isolated demo):
  - Create file .junie/tmp/test_demo_junie.py with contents:
    
    def test_arithmetic_demo():
        assert 2 * 3 == 6
    
  - Run only this test from repo root:
    pytest -q .junie/tmp/test_demo_junie.py
  - Expected outcome observed locally: 1 passed in ~0.02s.
  - After verifying, remove the temporary test file to keep the tree clean (we do this clean-up automatically as part of this task; see Clean-up section).

Troubleshooting tests
- ensys/tests require oemof.solph and related scientific libs. If missing, install via backend/docker/requirements.txt or constrain collection to your target test file/path.
- backend/app/tests may assume a running Postgres and may rely on settings from .env.dev/.env.prod; ensure DATABASE_URL is valid and Alembic migrations have been applied.

3) Additional development information

API surface and routing
- Backend FastAPI app is mounted with root_path (default /api). In production behind Nginx, requests should be sent to /api/..., while the proxy serves the Angular app at /.
- Routers included in main.py: users, admin, projects, scenario, simulation, results, oep, templates. Static files at /static and a simple HTML root at /.

Database and migrations
- Alembic migrations must be applied before running the backend (compose dev does this via the backend command). For local runs: alembic upgrade head.
- Readiness probe checks DB connectivity; use it to confirm DATABASE_URL correctness during debugging.

Celery & background tasks
- Ensure Redis is available before starting the worker/Flower. In compose.dev, celery and flower depend on redis; the backend depends on celery and flower.
- For local standalone worker: export REDIS_PORT (or redis_url) and run the celery command noted above.

Logging and CORS
- log_level is configurable via settings. CORS origins accept comma- or space-separated lists in env variables.

Frontend specifics
- prefer Angular CLI for development. Use npm run lint (angular-eslint) to keep code quality consistent. Test specs live next to components/services (*.spec.ts). For CI or local single-shot runs, use --watch=false and ChromeHeadless.

Coding style and typing
- Python: The repo does not include a unified pyproject/formatter config; follow PEP8 and keep type annotations where feasible. Consider Black/isort if introducing formatting automation; keep changes minimal and scoped.
- TypeScript: Use ESLint per the Angular configuration. Keep public APIs typed, avoid any in shared services and models.

Common pitfalls
- Incorrect DATABASE_URL or missing migrations → backend fails /readiness and many API tests will fail. Verify with alembic upgrade head.
- Mismatched OS_VERSION vs host architecture → backend image may fail to fetch or install solver tooling (Gurobi). Keep amd64 on x86_64 Linux/mac and armlinux64 on ARM.
- Missing GUROBI license in worker → optimization jobs will fail at runtime. Mount the license file in dev only if you intend to run those jobs.
- CORS issues in local setups when not using the dev compose → adjust cors_origins accordingly.

Clean-up of demonstration artifacts
- We validated the pytest path by creating .junie/tmp/test_demo_junie.py and running pytest -q on it (1 test passed). As part of finalization, we remove the temporary demo test and its directory so only this .junie/guidelines.md remains created by this task.

References
- README.md (contains detailed quickstart, env vars, and scripts)
- docker-compose.dev.yaml and docker-compose.prod.yaml
- backend/app/main.py, backend/app/core/config.py
- frontend/package.json
