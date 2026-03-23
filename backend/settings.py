"""
Application settings and configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Database
    database_url: str = "sqlite:///test.db"
    sql_echo: bool = False

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_days: int = 7

    # FastAPI
    debug: bool = False
    title: str = "FatimaZehra-AI-Tutor API"
    version: str = "1.0.0"

    # External APIs
    openai_api_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    # Redis
    redis_url: Optional[str] = None

    # Email
    resend_api_key: Optional[str] = None

    # Monitoring
    sentry_dsn: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False

# Load settings
settings = Settings()
