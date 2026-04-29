"""
Application Configuration Settings
===============================

This module manages the configuration settings for the EnSys application,
handling environment variables and providing type-safe access to configuration
values.

The module includes:
    - Core application settings
    - Database configuration
    - CORS policy settings
    - Redis/Celery configuration
    - File system paths

Configuration is loaded from environment variables with sensible defaults
where appropriate.
"""

import os
# Standard Library
from functools import lru_cache
from typing import List, Optional

# Third Party
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Pydantic settings model for backend configuration.

    - covers app metadata, CORS, DB pool, Redis/Celery, and paths
    - reads from env vars; validation ensures correct types
    """

    # App Settings
    app_name: str = Field(
        default="EnSys Backend", description="Name of the application"
    )

    environment: str = Field(
        default="development",
        description="Runtime environment",
    )

    root_path: Optional[str] = Field(
        default=None,
        description="Base path for API endpoints",
    )

    log_level: str = Field(default="INFO", description="Logging level")

    # CORS Settings
    cors_origins: List[str] = Field(
        default_factory=lambda: ["*"], description="List of allowed CORS origins"
    )
    allow_credentials: bool = Field(
        default=True, description="Allow credentials in CORS"
    )

    # Database Settings
    database_url: str = Field(
        validation_alias="DATABASE_URL", description="Database connection URL", default=os.getenv("DATABASE_URL")
    )
    sqlalchemy_echo: bool = Field(
        default=False, description="Enable SQLAlchemy query logging"
    )
    pool_size: int = Field(default=5, description="Database connection pool size")
    max_overflow: int = Field(
        default=10, description="Maximum pool overflow connections"
    )
    pool_recycle: int = Field(
        default=1800, description="Connection recycle time in seconds"
    )

    # Redis / Celery Settings
    redis_host: str = Field(default="redis", description="Redis server hostname")
    redis_port: int = Field(default=6379, description="Redis server port")
    redis_url: Optional[str] = Field(
        default=None, description="Complete Redis URL (auto-generated if not set)"
    )

    # File System Settings
    local_datadir: str = Field(
        default="/backend/data", description="Local directory for data storage"
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, v):  # noqa: N805
        """Normalize CORS origins to a list of strings.

        - accepts comma/space separated input
        - returns: list of allowed origins
        """
        if isinstance(v, str):
            parts = [s.strip() for s in v.replace(" ", ",").split(",") if s.strip()]
            return parts or ["*"]
        return v

    @model_validator(mode="after")
    def set_redis_url(self):
        """Populate `redis_url` when only host/port are provided."""
        if not self.redis_url:
            self.redis_url = f"redis://{self.redis_host}:{self.redis_port}"
        return self

    @model_validator(mode="after")
    def set_root_path(self):
        if not self.root_path:
            self.root_path = {
                "development": "/dev/api",
                "production": "/api"
            }.get(self.environment, "/api")
        return self

@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance for dependency injection."""
    origins = [
        "http://10.1.7.31:9004",
        "http://10.1.7.31:9004/dev",
        "https://ensys.hs-nordhausen.de",
        "https://ensys.hs-nordhausen.de/dev",
        "http://localhost:9004",
        "http://localhost:9004/dev",
    ]

    return Settings(
        cors_origins=origins,
        redis_host=str(os.getenv("REDIS_HOST")),
        redis_port=int(os.getenv("REDIS_PORT_DEV")),
        environment=str(os.getenv("ENVIRONMENT")),
    )
