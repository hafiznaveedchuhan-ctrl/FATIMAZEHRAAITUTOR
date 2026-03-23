"""
FatimaZehra-AI-Tutor Backend API
FastAPI application for Python learning platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

# Lifecycle manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 FatimaZehra-AI-Tutor Backend Starting...")
    yield
    # Shutdown
    print("🛑 Shutting down...")

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
        os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
