"""
Project Management Module
=======================

This module handles all project-related functionality including
- Project creation and management
- Project metadata handling
- Project permissions and sharing
"""

from .model import EnProject, EnProjectDB, EnProjectUpdate
from .router import projects_router
from .service import (
    create_project,
    read_project,
    read_projects,
    update_project,
    delete_project,
    duplicate_project,
)

__all__ = [
    "EnProject",
    "EnProjectDB",
    "EnProjectUpdate",
    "projects_router",
    "create_project",
    "read_project",
    "read_projects",
    "update_project",
    "delete_project",
    "duplicate_project",
]
