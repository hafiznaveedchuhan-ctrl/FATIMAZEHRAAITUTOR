"""
AI/Hybrid routes for FatimaZehra-AI-Tutor (Phase 2)
Premium-gated endpoints that use backend LLM calls.
"""

import os
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional

from models import User, QuizAttempt, UserProgress, Chapter, AIAnalysis
from database import get_session
from routes.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


# ==================== Request/Response Models ====================

class LearningPathRequest(BaseModel):
    user_id: Optional[str] = None


class LearningPathChapter(BaseModel):
    chapter_number: int
    chapter_title: str
    reason: str
    priority: str  # high, medium, low


class LearningPathResponse(BaseModel):
    recommended_chapters: list[LearningPathChapter]
    summary: str
    estimated_completion_days: int


class WeaknessRequest(BaseModel):
    user_id: Optional[str] = None


class WeakTopic(BaseModel):
    topic: str
    chapter: str
    score_trend: str
    recommendation: str


class WeaknessResponse(BaseModel):
    weak_topics: list[WeakTopic]
    overall_assessment: str
    focus_chapters: list[int]
    next_action: str


# ==================== Helper: Check Pro Tier ====================

def require_pro_tier(user: User):
    """Raise 403 if user is not Pro tier"""
    if user.tier != "pro":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pro tier required. Upgrade to Pro ($19.99/mo) to access AI-powered features."
        )


# ==================== Helper: Call OpenAI ====================

async def call_openai(system_prompt: str, user_prompt: str) -> str:
    """Call OpenAI GPT-4o for analysis"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured"
        )

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analysis failed: {str(e)}"
        )


# ==================== Adaptive Learning Path ====================

@router.post("/learning-path", response_model=LearningPathResponse)
async def get_adaptive_learning_path(
    body: LearningPathRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Generate personalized learning path based on quiz scores and progress.
    PREMIUM FEATURE - Pro tier only. Uses GPT-4o. Cost: ~$0.020/request.
    """
    require_pro_tier(current_user)

    # Fetch user's quiz attempts
    stmt = select(QuizAttempt).where(
        QuizAttempt.user_id == current_user.id
    ).order_by(desc(QuizAttempt.completed_at))
    result = await session.execute(stmt)
    attempts = result.scalars().all()

    # Fetch user's progress
    stmt = select(UserProgress).where(UserProgress.user_id == current_user.id)
    result = await session.execute(stmt)
    progress = result.scalars().all()

    # Fetch all chapters
    stmt = select(Chapter).order_by(Chapter.number)
    result = await session.execute(stmt)
    chapters = result.scalars().all()

    # Build context for LLM
    chapter_map = {ch.id: ch for ch in chapters}
    completed_ids = {p.chapter_id for p in progress if p.completed}

    quiz_summary = []
    for a in attempts:
        ch = chapter_map.get(a.chapter_id)
        if ch:
            quiz_summary.append(f"Chapter {ch.number} ({ch.title}): Score {a.score}%")

    progress_summary = []
    for ch in chapters:
        status_str = "completed" if ch.id in completed_ids else "not started"
        progress_summary.append(f"Chapter {ch.number} ({ch.title}): {status_str}")

    user_prompt = f"""Student: {current_user.name}
Tier: {current_user.tier}

Quiz History:
{chr(10).join(quiz_summary) if quiz_summary else "No quizzes taken yet"}

Chapter Progress:
{chr(10).join(progress_summary)}

Generate a personalized learning path with recommended chapter order, reasons, and priorities."""

    system_prompt = """You are an AI learning path advisor for a Python programming course.
Analyze the student's quiz scores and progress to recommend the best chapter order.
Respond in STRICT JSON format:
{
  "recommended_chapters": [
    {"chapter_number": 1, "chapter_title": "...", "reason": "...", "priority": "high|medium|low"}
  ],
  "summary": "Brief personalized summary",
  "estimated_completion_days": 14
}
Only output valid JSON, no markdown."""

    import json
    ai_response = await call_openai(system_prompt, user_prompt)

    try:
        # Clean markdown code fences if present
        cleaned = ai_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        data = json.loads(cleaned)
        return LearningPathResponse(
            recommended_chapters=[
                LearningPathChapter(**ch) for ch in data["recommended_chapters"]
            ],
            summary=data.get("summary", "Personalized learning path generated."),
            estimated_completion_days=data.get("estimated_completion_days", 14),
        )
    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"Failed to parse AI response: {e}\nResponse: {ai_response}")
        # Fallback: return default path
        return LearningPathResponse(
            recommended_chapters=[
                LearningPathChapter(
                    chapter_number=ch.number,
                    chapter_title=ch.title,
                    reason="Sequential learning recommended",
                    priority="medium"
                )
                for ch in chapters if ch.id not in completed_ids
            ],
            summary="AI analysis encountered an issue. Here's the default sequential path.",
            estimated_completion_days=len(chapters) * 2,
        )


# ==================== Weakness Analysis ====================

@router.post("/analyze-weakness", response_model=WeaknessResponse)
async def analyze_weaknesses(
    body: WeaknessRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Analyze student weaknesses from quiz patterns.
    PREMIUM FEATURE - Pro tier only. Uses GPT-4o. Cost: ~$0.015/request.
    """
    require_pro_tier(current_user)

    # Fetch quiz attempts with chapter info
    stmt = select(QuizAttempt).where(
        QuizAttempt.user_id == current_user.id
    ).order_by(desc(QuizAttempt.completed_at))
    result = await session.execute(stmt)
    attempts = result.scalars().all()

    # Fetch chapters
    stmt = select(Chapter).order_by(Chapter.number)
    result = await session.execute(stmt)
    chapters = result.scalars().all()
    chapter_map = {ch.id: ch for ch in chapters}

    if not attempts:
        return WeaknessResponse(
            weak_topics=[],
            overall_assessment="No quiz data available yet. Complete some quizzes first!",
            focus_chapters=[],
            next_action="Start with Chapter 1 quiz to get your first assessment.",
        )

    # Build detailed quiz data for LLM
    quiz_details = []
    for a in attempts:
        ch = chapter_map.get(a.chapter_id)
        if ch:
            quiz_details.append(
                f"Chapter {ch.number} ({ch.title}): Score {a.score}%, "
                f"Date: {a.completed_at.strftime('%Y-%m-%d')}"
            )

    user_prompt = f"""Student: {current_user.name}

Quiz Attempt History:
{chr(10).join(quiz_details)}

Chapters available: {', '.join(f'{ch.number}. {ch.title}' for ch in chapters)}

Analyze weakness patterns and provide targeted recommendations."""

    system_prompt = """You are an AI tutor analyzing a Python student's quiz performance.
Identify weak topics and provide actionable recommendations.
Respond in STRICT JSON format:
{
  "weak_topics": [
    {"topic": "...", "chapter": "Chapter N: Title", "score_trend": "declining|low|improving", "recommendation": "..."}
  ],
  "overall_assessment": "Brief overall assessment",
  "focus_chapters": [4, 7],
  "next_action": "Specific next step for the student"
}
Only output valid JSON, no markdown."""

    import json
    ai_response = await call_openai(system_prompt, user_prompt)

    try:
        cleaned = ai_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        data = json.loads(cleaned)

        # Save analysis to database
        analysis = AIAnalysis(
            user_id=current_user.id,
            summary=data.get("overall_assessment", ""),
            weak_topics=data.get("weak_topics", []),
            focus_chapters=data.get("focus_chapters", []),
            next_action=data.get("next_action", ""),
        )
        session.add(analysis)
        await session.commit()

        return WeaknessResponse(
            weak_topics=[WeakTopic(**t) for t in data["weak_topics"]],
            overall_assessment=data.get("overall_assessment", "Analysis complete."),
            focus_chapters=data.get("focus_chapters", []),
            next_action=data.get("next_action", "Review weak chapters."),
        )
    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"Failed to parse AI response: {e}\nResponse: {ai_response}")
        # Fallback based on raw scores
        low_score_chapters = []
        for a in attempts:
            ch = chapter_map.get(a.chapter_id)
            if ch and a.score < 70:
                low_score_chapters.append(ch.number)

        return WeaknessResponse(
            weak_topics=[],
            overall_assessment="AI analysis encountered an issue. Based on scores, review chapters with scores below 70%.",
            focus_chapters=sorted(set(low_score_chapters)),
            next_action="Retake quizzes for chapters where you scored below 70%.",
        )
