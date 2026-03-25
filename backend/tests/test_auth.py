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


# ==================== Auth Utility Unit Tests ====================

from auth import (
    validate_password_strength,
    verify_password,
    hash_password,
    create_access_token,
    verify_token,
)


def test_validate_password_strength_valid():
    ok, msg = validate_password_strength("SecurePass123!")
    assert ok is True
    assert msg == ""


def test_validate_password_strength_too_short():
    ok, msg = validate_password_strength("Ab1!")
    assert ok is False
    assert "8 characters" in msg


def test_validate_password_strength_no_uppercase():
    ok, msg = validate_password_strength("lowercase123!")
    assert ok is False
    assert "uppercase" in msg


def test_validate_password_strength_no_lowercase():
    ok, msg = validate_password_strength("UPPERCASE123!")
    assert ok is False
    assert "lowercase" in msg


def test_validate_password_strength_no_digit():
    ok, msg = validate_password_strength("NoDigitsHere!")
    assert ok is False
    assert "digit" in msg


def test_validate_password_strength_no_special():
    ok, msg = validate_password_strength("NoSpecial123")
    assert ok is False
    assert "special" in msg


def test_hash_and_verify_password():
    hashed = hash_password("MyPass123!")
    assert verify_password("MyPass123!", hashed) is True
    assert verify_password("WrongPass!", hashed) is False


def test_create_and_verify_token():
    token = create_access_token("user-123", "test@example.com", "free")
    payload = verify_token(token)
    assert payload is not None
    assert payload.user_id == "user-123"
    assert payload.email == "test@example.com"
    assert payload.tier == "free"


def test_verify_token_invalid():
    assert verify_token("not.a.valid.token") is None


# ==================== Change Password Tests ====================

def _register_token(client, email="pwchange@example.com", password="OldPass123!") -> str:
    res = client.post(
        "/auth/register",
        json={"email": email, "password": password, "name": "PW User"},
    )
    assert res.status_code == 201
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_change_password_success(client):
    """Successfully change password and login with new password."""
    token = _register_token(client)

    res = client.post(
        "/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "OldPass123!", "new_password": "NewPass456!"},
    )
    assert res.status_code == 200
    assert res.json()["message"] == "Password updated successfully."

    # Login with new password must succeed
    login = client.post(
        "/auth/login",
        json={"email": "pwchange@example.com", "password": "NewPass456!"},
    )
    assert login.status_code == 200


@pytest.mark.asyncio
async def test_change_password_wrong_current(client):
    """Return 400 when current_password is incorrect."""
    token = _register_token(client, email="pwwrong@example.com")

    res = client.post(
        "/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "WrongOld999!", "new_password": "NewPass456!"},
    )
    assert res.status_code == 400
    assert "incorrect" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_change_password_weak_new(client):
    """Return 400 when new_password fails strength validation."""
    token = _register_token(client, email="pwweak@example.com")

    res = client.post(
        "/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "OldPass123!", "new_password": "short"},
    )
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_change_password_unauthenticated(client):
    """Return 401 when no Authorization header is sent."""
    res = client.post(
        "/auth/change-password",
        json={"current_password": "OldPass123!", "new_password": "NewPass456!"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_change_password_invalid_token(client):
    """Return 401 when Authorization header contains a bad token."""
    res = client.post(
        "/auth/change-password",
        headers={"Authorization": "Bearer totally.invalid.token"},
        json={"current_password": "OldPass123!", "new_password": "NewPass456!"},
    )
    assert res.status_code == 401
