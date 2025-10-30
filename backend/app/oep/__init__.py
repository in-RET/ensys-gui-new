"""
Open Energy Platform (OEP) Module
==============================

Handles all OEP-related functionality including
- Data retrieval from OEP
- Data transformation and mapping
- OEP authentication and API interaction
"""

from .service import get_oep_client

__all__ = ['get_oep_client']
