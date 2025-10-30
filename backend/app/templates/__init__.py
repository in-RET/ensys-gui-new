"""
Templates Module
=============

Handles all template-related functionality including
- Energy system templates management
- Template creation and modification
- Template sharing and versioning
"""

from .model import EnTemplate, EnTemplateDB, EnTemplateUpdate
from .service import get_all_templates, clone_template_to_project, validate_template_name
from .router import templates_router

__all__ = ['EnTemplate', 'EnTemplateDB', 'EnTemplateUpdate', 'get_all_templates', 'clone_template_to_project', 'validate_template_name', 'templates_router']
