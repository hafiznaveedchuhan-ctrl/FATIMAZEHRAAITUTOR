"""
Chapter routes for FatimaZehra-AI-Tutor
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlmodel import Session

from models import Chapter, ChapterResponse, ChapterDetail, User
from database import get_session
from routes.auth import get_current_user

router = APIRouter(prefix="/chapters", tags=["chapters"])

# ==================== Get All Chapters ====================
@router.get("", response_model=list[ChapterResponse])
async def get_chapters(
    session: AsyncSession = Depends(get_session)
):
    """
    Get all chapters (visible to everyone)
    Returns: chapter list with tier_required field
    """
    stmt = select(Chapter).order_by(Chapter.number)
    result = await session.execute(stmt)
    chapters = result.scalars().all()

    return [
        ChapterResponse(
            id=ch.id,
            number=ch.number,
            title=ch.title,
            slug=ch.slug,
            tier_required=ch.tier_required
        )
        for ch in chapters
    ]

# ==================== Get Single Chapter ====================
@router.get("/{chapter_id}", response_model=ChapterDetail)
async def get_chapter(
    chapter_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get chapter detail with full content (MDX)
    Checks tier permission
    """
    # Fetch chapter
    stmt = select(Chapter).where(Chapter.id == chapter_id)
    result = await session.execute(stmt)
    chapter = result.scalars().first()

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # Check tier permission
    tier_hierarchy = {"free": 0, "premium": 1, "pro": 2}
    user_tier_level = tier_hierarchy.get(current_user.tier, 0)
    required_tier_level = tier_hierarchy.get(chapter.tier_required, 0)

    if user_tier_level < required_tier_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This chapter requires {chapter.tier_required} tier"
        )

    return ChapterDetail(
        id=chapter.id,
        number=chapter.number,
        title=chapter.title,
        slug=chapter.slug,
        tier_required=chapter.tier_required,
        content_mdx=chapter.content_mdx
    )

# ==================== Get Chapter by Slug ====================
@router.get("/slug/{slug}", response_model=ChapterDetail)
async def get_chapter_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get chapter detail by slug
    Checks tier permission
    """
    # Fetch chapter
    stmt = select(Chapter).where(Chapter.slug == slug)
    result = await session.execute(stmt)
    chapter = result.scalars().first()

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # Check tier permission
    tier_hierarchy = {"free": 0, "premium": 1, "pro": 2}
    user_tier_level = tier_hierarchy.get(current_user.tier, 0)
    required_tier_level = tier_hierarchy.get(chapter.tier_required, 0)

    if user_tier_level < required_tier_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This chapter requires {chapter.tier_required} tier"
        )

    return ChapterDetail(
        id=chapter.id,
        number=chapter.number,
        title=chapter.title,
        slug=chapter.slug,
        tier_required=chapter.tier_required,
        content_mdx=chapter.content_mdx
    )
