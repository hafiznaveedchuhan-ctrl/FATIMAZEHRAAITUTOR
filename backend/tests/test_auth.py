"""
Tests for authentication routes
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Session

from main import app
from database import get_session
from models import User, UserCreate

# Create test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture
async def test_db():
    """Create test database"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=None,
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async_session = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_session():
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    yield

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

    await engine.dispose()

@pytest.fixture
def client(test_db):
    """Create test client"""
    return TestClient(app)

@pytest.mark.asyncio
async def test_register_success(client):
    """Test successful user registration"""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "name": "Test User"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["access_token"]
    assert data["user_id"]
    assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_register_weak_password(client):
    """Test registration with weak password"""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "weak",
            "name": "Test User"
        }
    )

    assert response.status_code == 400
    assert "Password must be at least 8 characters" in response.json()["detail"]

@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Test registration with existing email"""
    # First registration
    client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "name": "Test User"
        }
    )

    # Second registration with same email
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass456!",
            "name": "Another User"
        }
    )

    assert response.status_code == 409
    assert "Email already registered" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_success(client):
    """Test successful login"""
    # Register first
    client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "name": "Test User"
        }
    )

    # Login
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_login_invalid_password(client):
    """Test login with wrong password"""
    # Register first
    client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "name": "Test User"
        }
    )

    # Login with wrong password
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword123!"
        }
    )

    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    """Test login with non-existent email"""
    response = client.post(
        "/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "SomePassword123!"
        }
    )

    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_me_success(client):
    """Test getting current user profile"""
    # Register and get token
    register_response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "name": "Test User"
        }
    )
    token = register_response.json()["access_token"]

    # Get profile
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["tier"] == "free"

@pytest.mark.asyncio
async def test_get_me_unauthorized(client):
    """Test getting profile without token"""
    response = client.get("/auth/me")

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_invalid_token(client):
    """Test getting profile with invalid token"""
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_logout(client):
    """Test logout endpoint"""
    response = client.post("/auth/logout")

    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"
