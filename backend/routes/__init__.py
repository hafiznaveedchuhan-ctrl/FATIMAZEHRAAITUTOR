"""Routes package for FatimaZehra-AI-Tutor API"""

from .auth import router as auth_router
from .chapters import router as chapters_router
from .quiz import router as quiz_router
from .progress import router as progress_router

__all__ = ["auth_router", "chapters_router", "quiz_router", "progress_router"]
