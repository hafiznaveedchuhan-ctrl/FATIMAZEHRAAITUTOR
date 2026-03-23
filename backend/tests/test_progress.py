"""
Integration tests for progress routes.
Covers: GET /progress/me, POST /progress/mark-complete.
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

    # Seed two chapters
    async with async_session() as session:
        for i, slug, tier in [
            (1, "python-basics", "free"),
            (2, "control-flow", "free"),
        ]:
            session.add(Chapter(
                id=str(uuid.uuid4()),
                number=i,
                title=f"Chapter {i}",
                slug=slug,
                content_mdx=f"# Chapter {i}",
                tier_required=tier,
            ))
        await session.commit()

    yield

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    return TestClient(app)


def _register(client, email: str = "prog@example.com") -> tuple[str, str]:
    """Register user, return (user_id, token)."""
    res = client.post(
        "/auth/register",
        json={"email": email, "password": "SecurePass123!", "name": "Prog User"},
    )
    assert res.status_code == 201
    data = res.json()
    return data["user_id"], data["access_token"]


def _chapter_id(client, token: str, slug: str) -> str:
    """Get chapter id by slug."""
    res = client.get("/chapters", headers={"Authorization": f"Bearer {token}"})
    chapters = res.json()
    return next(c["id"] for c in chapters if c["slug"] == slug)


# ── GET /progress/me ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_progress_fresh_user(client):
    """New user with no attempts returns zero stats."""
    _, token = _register(client)
    res = client.get("/progress/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["stats"]["chapters_completed"] == 0
    assert data["stats"]["current_streak"] == 0
    assert data["stats"]["quiz_avg_score"] == 0
    assert isinstance(data["chapter_progress"], list)
    assert len(data["chapter_progress"]) == 2  # 2 seeded chapters


@pytest.mark.asyncio
async def test_get_progress_unauthorized(client):
    """GET /progress/me without token returns 401."""
    res = client.get("/progress/me")
    assert res.status_code == 401


# ── POST /progress/mark-complete ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_mark_complete_success(client):
    """Mark a free chapter as completed; response confirms."""
    _, token = _register(client, "mark@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    chapter_id = _chapter_id(client, token, "python-basics")

    res = client.post(
        "/progress/mark-complete",
        headers=headers,
        json={"chapter_id": chapter_id},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["completed"] is True
    assert data["chapter_id"] == chapter_id


@pytest.mark.asyncio
async def test_mark_complete_idempotent(client):
    """Marking same chapter complete twice is idempotent."""
    _, token = _register(client, "idempotent@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    chapter_id = _chapter_id(client, token, "python-basics")

    for _ in range(2):
        res = client.post(
            "/progress/mark-complete",
            headers=headers,
            json={"chapter_id": chapter_id},
        )
        assert res.status_code == 200
        assert res.json()["success"] is True


@pytest.mark.asyncio
async def test_mark_complete_reflected_in_progress(client):
    """After marking complete, GET /progress/me shows chapters_completed = 1."""
    _, token = _register(client, "reflect@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    chapter_id = _chapter_id(client, token, "python-basics")

    client.post(
        "/progress/mark-complete",
        headers=headers,
        json={"chapter_id": chapter_id},
    )

    res = client.get("/progress/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["stats"]["chapters_completed"] == 1


@pytest.mark.asyncio
async def test_mark_complete_invalid_chapter(client):
    """Non-existent chapter_id returns 404."""
    _, token = _register(client, "inv@example.com")
    res = client.post(
        "/progress/mark-complete",
        headers={"Authorization": f"Bearer {token}"},
        json={"chapter_id": str(uuid.uuid4())},
    )
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_mark_complete_unauthorized(client):
    """POST /progress/mark-complete without token returns 401."""
    res = client.post(
        "/progress/mark-complete",
        json={"chapter_id": str(uuid.uuid4())},
    )
    assert res.status_code == 401
