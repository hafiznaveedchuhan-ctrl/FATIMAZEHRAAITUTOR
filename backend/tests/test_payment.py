"""
Integration tests for payment routes.
Tests the create-session guard rails (invalid plan, already on plan, unauthenticated).
Stripe API calls are mocked to avoid real network requests.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from main import app
from database import get_session

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def test_db():
    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_session():
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    yield

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    return TestClient(app)


def _register_and_token(client) -> str:
    res = client.post(
        "/auth/register",
        json={"email": "pay@example.com", "password": "SecurePass123!", "name": "Pay User"},
    )
    assert res.status_code == 201
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_create_session_invalid_plan(client):
    """Should reject plans that are not 'premium' or 'pro'."""
    token = _register_and_token(client)
    res = client.post(
        "/payment/create-session",
        headers={"Authorization": f"Bearer {token}"},
        json={"plan": "enterprise"},
    )
    assert res.status_code == 400
    assert "Invalid plan" in res.json()["detail"]


@pytest.mark.asyncio
async def test_create_session_already_on_free(client):
    """Free users should be able to upgrade — request must not fail with 'already on plan'."""
    token = _register_and_token(client)

    # Mock Stripe to avoid real network call
    mock_session = MagicMock()
    mock_session.url = "https://checkout.stripe.com/test-session"
    mock_session.id = "cs_test_abc123"

    mock_customer = MagicMock()
    mock_customer.id = "cus_test123"

    with (
        patch("stripe.Customer.create", return_value=mock_customer),
        patch("stripe.checkout.Session.create", return_value=mock_session),
    ):
        res = client.post(
            "/payment/create-session",
            headers={"Authorization": f"Bearer {token}"},
            json={"plan": "premium"},
        )

    assert res.status_code == 200
    data = res.json()
    assert "session_url" in data
    assert data["session_url"] == "https://checkout.stripe.com/test-session"


@pytest.mark.asyncio
async def test_create_session_unauthenticated(client):
    """Should return 401 without Authorization header."""
    res = client.post(
        "/payment/create-session",
        json={"plan": "premium"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_webhook_invalid_signature(client):
    """Webhook with missing/invalid Stripe-Signature should return 400."""
    res = client.post(
        "/payment/webhook",
        content=b'{"type": "checkout.session.completed"}',
        headers={"Content-Type": "application/json"},
    )
    # No Stripe-Signature header → SignatureVerificationError
    assert res.status_code == 400


# ── activate-plan tests ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_activate_plan_invalid_plan(client):
    """Return 400 when plan name is not 'premium' or 'pro'."""
    token = _register_and_token(client)
    res = client.post(
        "/payment/activate-plan",
        headers={"Authorization": f"Bearer {token}"},
        json={"plan": "enterprise", "stripe_session_id": "cs_test_fake"},
    )
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_activate_plan_unauthenticated(client):
    """Return 401 without Authorization header."""
    res = client.post(
        "/payment/activate-plan",
        json={"plan": "premium", "stripe_session_id": "cs_test_fake"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_activate_plan_success(client):
    """Upgrading tier via activate-plan updates user tier in DB."""
    token = _register_and_token(client)

    mock_session_obj = MagicMock()
    mock_session_obj.payment_status = "paid"
    mock_session_obj.metadata = {"plan": "premium", "user_id": "any"}
    mock_session_obj.customer = "cus_test123"
    mock_session_obj.subscription = "sub_test456"

    with patch("stripe.checkout.Session.retrieve", return_value=mock_session_obj):
        res = client.post(
            "/payment/activate-plan",
            headers={"Authorization": f"Bearer {token}"},
            json={"plan": "premium", "stripe_session_id": "cs_test_real"},
        )

    assert res.status_code == 200
    data = res.json()
    assert data["plan"] == "premium"
    assert data["status"] == "activated"

    # /auth/me should now show premium tier
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["tier"] == "premium"


@pytest.mark.asyncio
async def test_activate_plan_payment_not_complete(client):
    """Return 400 if Stripe session payment_status is not 'paid'."""
    token = _register_and_token(client)

    mock_session_obj = MagicMock()
    mock_session_obj.payment_status = "unpaid"
    mock_session_obj.metadata = {"plan": "premium"}

    with patch("stripe.checkout.Session.retrieve", return_value=mock_session_obj):
        res = client.post(
            "/payment/activate-plan",
            headers={"Authorization": f"Bearer {token}"},
            json={"plan": "premium", "stripe_session_id": "cs_test_unpaid"},
        )

    assert res.status_code == 400
    assert "Payment not completed" in res.json()["detail"]


# ── subscription endpoint tests ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_subscription_no_record(client):
    """Free user with no subscription record returns free tier info."""
    token = _register_and_token(client)
    res = client.get(
        "/payment/subscription",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["plan"] == "free"
    assert data["status"] == "active"
    assert data["expires_at"] is None


@pytest.mark.asyncio
async def test_get_subscription_unauthenticated(client):
    """Return 401 without auth."""
    res = client.get("/payment/subscription")
    assert res.status_code == 401
