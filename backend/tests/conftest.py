"""
Shared pytest configuration for FatimaZehra-AI-Tutor backend tests.
Sets DATABASE_URL to an async in-memory SQLite before any app imports occur.
"""
import os

# Must be set BEFORE importing app/database modules so create_async_engine
# uses aiosqlite (async driver) instead of the pysqlite sync default.
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
