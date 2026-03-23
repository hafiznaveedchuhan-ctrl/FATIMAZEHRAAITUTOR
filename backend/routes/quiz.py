"""
Quiz routes for FatimaZehra-AI-Tutor
GET  /quiz/by-slug/{slug}/questions  → questions without answers
POST /quiz/submit                     → grade and store attempt
GET  /quiz/history/{chapter_id}       → user's past attempts
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models import (
    Chapter, QuizQuestion, QuizQuestionResponse,
    QuizSubmitRequest, QuizSubmitResponse, QuestionResult,
    QuizAttempt, UserProgress, User
)
from database import get_session
from routes.auth import get_current_user

router = APIRouter(prefix="/quiz", tags=["quiz"])

TIER_HIERARCHY = {"free": 0, "premium": 1, "pro": 2}


async def _get_chapter_by_slug(slug: str, session: AsyncSession) -> Chapter:
    stmt = select(Chapter).where(Chapter.slug == slug)
    result = await session.execute(stmt)
    chapter = result.scalars().first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


async def _check_tier(user: User, chapter: Chapter):
    user_level = TIER_HIERARCHY.get(user.tier, 0)
    required_level = TIER_HIERARCHY.get(chapter.tier_required, 0)
    if user_level < required_level:
        raise HTTPException(
            status_code=403,
            detail=f"This chapter requires {chapter.tier_required} tier"
        )


# ─── Get Questions by Chapter Slug ──────────────────────────────────────────

@router.get("/by-slug/{slug}/questions", response_model=list[QuizQuestionResponse])
async def get_questions_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get all quiz questions for a chapter (correct answers hidden)."""
    chapter = await _get_chapter_by_slug(slug, session)
    await _check_tier(current_user, chapter)

    stmt = select(QuizQuestion).where(QuizQuestion.chapter_id == chapter.id)
    result = await session.execute(stmt)
    questions = result.scalars().all()

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this chapter")

    return [
        QuizQuestionResponse(id=q.id, question=q.question, options=q.options)
        for q in questions
    ]


# ─── Submit Quiz ─────────────────────────────────────────────────────────────

@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    submission: QuizSubmitRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Grade quiz submission, store attempt, update progress."""
    # Verify chapter exists
    chapter_stmt = select(Chapter).where(Chapter.id == submission.chapter_id)
    chapter_result = await session.execute(chapter_stmt)
    chapter = chapter_result.scalars().first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    await _check_tier(current_user, chapter)

    # Build answer lookup
    answer_map = {ans.question_id: ans.selected_option for ans in submission.answers}

    # Fetch all questions for this chapter
    q_stmt = select(QuizQuestion).where(QuizQuestion.chapter_id == submission.chapter_id)
    q_result = await session.execute(q_stmt)
    questions = q_result.scalars().all()

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found")

    # Grade
    results: list[QuestionResult] = []
    correct_count = 0

    for q in questions:
        selected = answer_map.get(q.id, -1)  # -1 = unanswered
        is_correct = selected == q.correct_answer
        if is_correct:
            correct_count += 1
        results.append(
            QuestionResult(
                question_id=q.id,
                question=q.question,
                selected_option=selected,
                correct_option=q.correct_answer,
                explanation=q.explanation,
                is_correct=is_correct,
                options=q.options,
            )
        )

    total = len(questions)
    score = round((correct_count / total) * 100) if total > 0 else 0
    passed = score >= 70  # 70% pass threshold

    # Store attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        chapter_id=submission.chapter_id,
        answers={ans.question_id: ans.selected_option for ans in submission.answers},
        score=score,
    )
    session.add(attempt)

    # Update user progress
    progress_stmt = select(UserProgress).where(
        UserProgress.user_id == current_user.id,
        UserProgress.chapter_id == submission.chapter_id,
    )
    progress_result = await session.execute(progress_stmt)
    progress = progress_result.scalars().first()

    if progress:
        progress.completed = passed or progress.completed
        from datetime import datetime
        progress.last_accessed_at = datetime.utcnow()
    else:
        progress = UserProgress(
            user_id=current_user.id,
            chapter_id=submission.chapter_id,
            completed=passed,
        )
        session.add(progress)

    await session.commit()

    return QuizSubmitResponse(
        score=score,
        correct_count=correct_count,
        total=total,
        passed=passed,
        results=results,
    )


# ─── Get Quiz History ────────────────────────────────────────────────────────

@router.get("/history/{chapter_id}")
async def get_quiz_history(
    chapter_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get user's past quiz attempts for a chapter."""
    stmt = (
        select(QuizAttempt)
        .where(
            QuizAttempt.user_id == current_user.id,
            QuizAttempt.chapter_id == chapter_id,
        )
        .order_by(QuizAttempt.completed_at.desc())
        .limit(5)
    )
    result = await session.execute(stmt)
    attempts = result.scalars().all()

    return [
        {
            "id": a.id,
            "score": a.score,
            "completed_at": a.completed_at.isoformat(),
        }
        for a in attempts
    ]
