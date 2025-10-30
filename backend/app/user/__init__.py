"""
User Management Module
===================

Handles all user-related functionality including
- User authentication and authorization
- User profile management
- User preferences and settings
"""

from .model import EnUser, EnUserDB, EnUserUpdate
from .router import users_router
from .service import (
    create_user,
    read_user,
    read_user_by_token,
    update_user,
    delete_user,
    authenticate_user,
)

__all__ = [
    "EnUser",
    "EnUserDB",
    "EnUserUpdate",
    "users_router",
    "create_user",
    "read_user",
    "read_user_by_token",
    "update_user",
    "delete_user",
    "authenticate_user",
]
