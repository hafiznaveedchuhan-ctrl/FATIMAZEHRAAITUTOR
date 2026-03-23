"""
Integration tests for chapters routes.
Covers: GET /chapters, GET /chapters/{slug}, tier gating (403).
"""

import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from main import app
from database import get_session
from models import Chapter

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

    # Seed chapters 1-4 (1-3 free, 4 premium)
    async with async_session() as session:
        for i, (slug, tier) in enumerate(
            [
                ("python-basics", "free"),
                ("control-flow", "free"),
                ("functions-scope", "free"),
                ("oop", "premium"),
            ],
            start=1,
        ):
            chapter = Chapter(
                id=str(uuid.uuid4()),
                number=i,
                title=f"Chapter {i}",
                slug=slug,
                content_mdx=f"# Chapter {i}\nContent here.",
                tier_required=tier,
            )
            session.add(chapter)
        await session.commit()

    yield

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    return TestClient(app)


def _auth_headers(client, email: str = "ch@example.com") -> dict:
    res = client.post(
        "/auth/register",
        json={"email": email, "password": "SecurePass123!", "name": "Test User"},
    )
    assert res.status_code == 201
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


# ── GET /chapters ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_chapters_returns_all(client):
    """GET /chapters returns all seeded chapters."""
    headers = _auth_headers(client)
    res = client.get("/chapters", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 4
    # Ordered by number
    assert data[0]["number"] == 1
    assert data[3]["number"] == 4


@pytest.mark.asyncio
async def test_get_chapters_contains_tier_required(client):
    """Each chapter response includes tier_required field."""
    headers = _auth_headers(client, "tier@example.com")
    res = client.get("/chapters", headers=headers)
    assert res.status_code == 200
    for chapter in res.json():
        assert "tier_required" in chapter
        assert chapter["tier_required"] in ("free", "premium", "pro")


@pytest.mark.asyncio
async def test_get_chapters_public(client):
    """GET /chapters is public — returns 200 without a token (tier gating is per-chapter)."""
    res = client.get("/chapters")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


# ── GET /chapters/{slug} ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_chapter_by_slug_free_user_free_chapter(client):
    """Free user can access free chapters via /chapters/slug/{slug}."""
    headers = _auth_headers(client, "free@example.com")
    res = client.get("/chapters/slug/python-basics", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "python-basics"
    assert "content_mdx" in data


@pytest.mark.asyncio
async def test_get_chapter_by_slug_free_user_premium_chapter_returns_403(client):
    """Free user is blocked (403) from premium chapters."""
    headers = _auth_headers(client, "blocked@example.com")
    res = client.get("/chapters/slug/oop", headers=headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_get_chapter_by_slug_not_found(client):
    """Non-existent chapter slug returns 404."""
    headers = _auth_headers(client, "notfound@example.com")
    res = client.get("/chapters/slug/does-not-exist", headers=headers)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_get_chapter_by_slug_unauthorized(client):
    """Fetching a chapter without token returns 401."""
    res = client.get("/chapters/slug/python-basics")
    assert res.status_code == 401
