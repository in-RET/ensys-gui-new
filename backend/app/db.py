"""
Database Configuration and Session Management
==========================================

This module provides the core database configuration and session management
functionality for the EnSys application.

The module handles:
    - Database engine configuration with connection pooling
    - Session factory setup
    - Dependency injection for database sessions
    - Automatic connection cleanup

Configuration is loaded from environment variables through the settings module.
"""

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session

from .core.config import get_settings

_settings = get_settings()

# Create a pooled SQLAlchemy engine
engine = create_engine(
    _settings.database_url,
    echo=_settings.sqlalchemy_echo,
    pool_pre_ping=True,
    pool_size=_settings.pool_size,
    max_overflow=_settings.max_overflow,
    pool_recycle=_settings.pool_recycle,
)

# Session factory for dependencies and background tasks
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=Session
)


def get_db_session():
    """
    Create and manage a database session for request handling.

    This function serves as a FastAPI dependency that provides a SQLModel Session
    for database operations. It ensures proper resource management by automatically
    closing the session after use.

    Yields:
        Session: A SQLModel session instance bound to the application's database engine.

    Note:
        The session is automatically closed when the request processing is complete,
        even if an exception occurs during processing.
    """
    db_session: Session = SessionLocal()
    try:
        yield db_session
        # db_session.commit()
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db_session.close()
