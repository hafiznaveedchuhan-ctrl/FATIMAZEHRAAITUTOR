"""Routes package for FatimaZehra-AI-Tutor API"""

from .auth import router as auth_router
from .chapters import router as chapters_router

__all__ = ["auth_router", "chapters_router"]
