"""
Integration tests for quiz routes.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import uuid

from main import app
from database import get_session
from models import Chapter, QuizQuestion

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

    # Seed a chapter and questions
    async with async_session() as session:
        chapter = Chapter(
            id=str(uuid.uuid4()),
            number=1,
            title="Python Basics",
            slug="python-basics",
            content_mdx="# Python Basics",
            tier_required="free",
        )
        session.add(chapter)
        await session.commit()
        await session.refresh(chapter)

        q = QuizQuestion(
            id=str(uuid.uuid4()),
            chapter_id=chapter.id,
            question="What is a variable?",
            options=["A placeholder", "A function", "A module", "A class"],
            correct_answer=0,
            explanation="A variable stores a value.",
        )
        session.add(q)
        await session.commit()

    yield engine

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
        json={"email": "quiz@example.com", "password": "SecurePass123!", "name": "Quiz User"},
    )
    assert res.status_code == 201
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_get_questions_by_slug(client):
    token = _register_and_token(client)
    res = client.get(
        "/quiz/by-slug/python-basics/questions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) >= 1
    q = questions[0]
    assert "question" in q
    assert "options" in q
    # Correct answer must NOT be exposed
    assert "correct_answer" not in q


@pytest.mark.asyncio
async def test_get_questions_unknown_slug(client):
    token = _register_and_token(client)
    res = client.get(
        "/quiz/by-slug/nonexistent-chapter/questions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_submit_quiz(client):
    token = _register_and_token(client)

    # Fetch questions first
    qs_res = client.get(
        "/quiz/by-slug/python-basics/questions",
        headers={"Authorization": f"Bearer {token}"},
    )
    questions = qs_res.json()
    question_id = questions[0]["id"]

    # Find chapter_id (need to get from chapters endpoint)
    chapters_res = client.get("/chapters", headers={"Authorization": f"Bearer {token}"})
    chapter_id = chapters_res.json()[0]["id"]

    res = client.post(
        "/quiz/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "chapter_id": chapter_id,
            "answers": [{"question_id": question_id, "selected_option": 0}],
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "score" in data
    assert "passed" in data
    assert "results" in data
    assert data["total"] == 1


@pytest.mark.asyncio
async def test_submit_quiz_unauthorized(client):
    res = client.post(
        "/quiz/submit",
        json={"chapter_id": "some-id", "answers": []},
    )
    assert res.status_code == 401
