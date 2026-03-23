"""
Progress routes for FatimaZehra-AI-Tutor
GET /progress/me → full progress summary (stats, chapters, activity)
"""

from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models import Chapter, QuizAttempt, UserProgress, User
from database import get_session
from routes.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


def _calculate_streak(attempts: list[QuizAttempt]) -> int:
    """Calculate current daily learning streak from quiz attempts."""
    if not attempts:
        return 0

    attempt_dates = sorted(
        {a.completed_at.date() for a in attempts},
        reverse=True
    )

    today = date.today()
    yesterday = today - timedelta(days=1)

    # Streak must include today or yesterday
    if attempt_dates[0] not in (today, yesterday):
        return 0

    streak = 1
    for i in range(1, len(attempt_dates)):
        expected = attempt_dates[i - 1] - timedelta(days=1)
        if attempt_dates[i] == expected:
            streak += 1
        else:
            break

    return streak


@router.get("/me")
async def get_my_progress(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Returns full progress summary for the authenticated user:
    - stats (chapters completed, quiz avg, streak, etc.)
    - chapter_progress (per-chapter completion + scores)
    - recent_activity (last 5 quiz attempts)
    """
    # Fetch all chapters ordered by number
    ch_stmt = select(Chapter).order_by(Chapter.number)
    ch_result = await session.execute(ch_stmt)
    all_chapters = ch_result.scalars().all()

    # Fetch user progress records
    up_stmt = select(UserProgress).where(UserProgress.user_id == current_user.id)
    up_result = await session.execute(up_stmt)
    progress_records = {p.chapter_id: p for p in up_result.scalars().all()}

    # Fetch all quiz attempts for the user
    qa_stmt = (
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
    )
    qa_result = await session.execute(qa_stmt)
    all_attempts = qa_result.scalars().all()

    # Build best score per chapter
    scores_by_chapter: dict[str, list[int]] = {}
    for attempt in all_attempts:
        scores_by_chapter.setdefault(attempt.chapter_id, []).append(attempt.score)

    # ── Stats ─────────────────────────────────────────────────────────────────
    completed_count = sum(
        1 for p in progress_records.values() if p.completed
    )
    total_quizzes = len(all_attempts)
    avg_score = (
        round(sum(a.score for a in all_attempts) / total_quizzes)
        if total_quizzes > 0 else 0
    )
    current_streak = _calculate_streak(all_attempts)

    stats = {
        "chapters_completed": completed_count,
        "total_chapters": len(all_chapters),
        "quiz_avg_score": avg_score,
        "total_quizzes_taken": total_quizzes,
        "current_streak": current_streak,
        "completion_pct": round((completed_count / len(all_chapters)) * 100) if all_chapters else 0,
    }

    # ── Chapter Progress ───────────────────────────────────────────────────────
    chapter_title_map = {ch.id: ch.title for ch in all_chapters}

    chapter_progress = []
    for ch in all_chapters:
        p = progress_records.get(ch.id)
        scores = scores_by_chapter.get(ch.id, [])
        chapter_progress.append({
            "id": ch.id,
            "number": ch.number,
            "title": ch.title,
            "slug": ch.slug,
            "tier_required": ch.tier_required,
            "completed": p.completed if p else False,
            "best_score": max(scores) if scores else None,
            "attempts": len(scores),
            "last_accessed": p.last_accessed_at.isoformat() if p else None,
        })

    # ── Recent Activity ────────────────────────────────────────────────────────
    recent_activity = [
        {
            "type": "quiz",
            "chapter_title": chapter_title_map.get(a.chapter_id, "Unknown Chapter"),
            "score": a.score,
            "passed": a.score >= 70,
            "timestamp": a.completed_at.isoformat(),
        }
        for a in all_attempts[:10]
    ]

    return {
        "stats": stats,
        "chapter_progress": chapter_progress,
        "recent_activity": recent_activity,
    }
