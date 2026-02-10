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

# Standard Library
from functools import lru_cache
from typing import List, Optional

# Third Party
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings management using Pydantic BaseSettings.

    This class handles all configuration settings for the application,
    automatically loading values from environment variables and providing
    type validation and conversion.

    Application Settings:
        :param app_name: Name of the application
        :type app_name: str
        :param environment: Runtime environment (development|production|test)
        :type environment: str
        :param root_path: Base path for API endpoints
        :type root_path: str
        :param log_level: Logging level (INFO, DEBUG, etc.)
        :type log_level: str

    CORS Settings:
        :param cors_origins: List of allowed CORS origins
        :type cors_origins: List[str]
        :param allow_credentials: Whether to allow credentials in CORS
        :type allow_credentials: bool

    Database Settings:
        :param database_url: Database connection URL
        :type database_url: str
        :param sqlalchemy_echo: Enable SQLAlchemy query logging
        :type sqlalchemy_echo: bool
        :param pool_size: Database connection pool size
        :type pool_size: int
        :param max_overflow: Maximum pool overflow connections
        :type max_overflow: int
        :param pool_recycle: Connection recycle time in seconds
        :type pool_recycle: int

    Redis/Celery Settings:
        :param redis_host: Redis server hostname
        :type redis_host: str
        :param redis_port: Redis server port
        :type redis_port: int
        :param redis_url: Complete Redis URL (auto-generated if not set)
        :type redis_url: Optional[str]

    File System Settings:
        :param local_datadir: Local directory for data storage
        :type local_datadir: str
    """

    # App Settings
    app_name: str = Field(
        default="EnSys Backend", description="Name of the application"
    )
    environment: str = Field(
        default="development",
        description="Runtime environment (development|production|test)",
    )
    root_path: str = Field(default="/api", description="Base path for API endpoints")
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
        validation_alias="DATABASE_URL", description="Database connection URL"
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
        """
        Validate and process CORS origins configuration.

        Converts string input to list of origins, supporting both comma
        and space-separated formats.

        :param v: Input value for CORS origins
        :return: List of CORS origin strings
        """
        if isinstance(v, str):
            parts = [s.strip() for s in v.replace(" ", ",").split(",") if s.strip()]
            return parts or ["*"]
        return v

    @model_validator(mode="after")
    def set_redis_url(self):
        """
        Set Redis URL if not explicitly provided.

        Constructs Redis URL from host and port if not set in environment.

        :return: Updated Settings instance
        """
        if not self.redis_url:
            self.redis_url = f"redis://{self.redis_host}:{self.redis_port}"
        return self


@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings with caching.

    Creates and caches a Settings instance, ensuring consistent configuration
    across the application.

    :return: Cached Settings instance
    :rtype: Settings
    """
    origins = [
        "https://ensys.hs-nordhausen.de",
        "https://ensys.hs-nordhausen.de/dev",
        "http://10.1.7.31:20005",
        "http://localhost:20005",
        "http://10.1.7.31:9004",
        "http://localhost:9004",
        "http://localhost:4200",
    ]

    return Settings(cors_origins=origins)
