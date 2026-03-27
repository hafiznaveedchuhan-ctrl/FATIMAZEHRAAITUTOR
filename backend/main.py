"""
FatimaZehra-AI-Tutor Backend API
FastAPI application for Python learning platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from database import init_db, close_db
from routes import auth_router, chapters_router, quiz_router, progress_router, payment_router

# ── Sentry monitoring (initialised only when DSN is set) ──
_sentry_dsn = os.getenv("SENTRY_DSN")
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.10,
        environment=os.getenv("ENV", "development"),
        release="fatimazehra-ai-tutor@1.0.0",
    )

# Lifecycle manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[START] FatimaZehra-AI-Tutor Backend Starting...")
    await init_db()
    print("[OK] Database initialized")
    yield
    # Shutdown
    print("[SHUTDOWN] Shutting down...")
    await close_db()

# Create FastAPI app
app = FastAPI(
    title="FatimaZehra-AI-Tutor API",
    description="Python Learning Platform with AI Coaching",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://fatimazehraaitutor-yci1.vercel.app",
        "https://frontend-blue-kappa-15.vercel.app",
        os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(chapters_router)
app.include_router(quiz_router)
app.include_router(progress_router)
app.include_router(payment_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "ok",
        "service": "FatimaZehra-AI-Tutor API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to FatimaZehra-AI-Tutor API",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }

# Stub routes (to be implemented)
@app.get("/api/status")
async def api_status():
    """API status"""
    return {"status": "ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
