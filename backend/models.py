"""
SQLModel database models for FatimaZehra-AI-Tutor
"""

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, JSON
from pydantic import EmailStr
import uuid

# Base model with common fields
class TimestampMixin:
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

# ==================== Users ====================
class User(SQLModel, TimestampMixin, table=True):
    """User account model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: EmailStr = Field(unique=True, index=True, nullable=False)
    name: str = Field(nullable=False)
    hashed_password: Optional[str] = Field(default=None)  # NULL for OAuth-only users
    tier: str = Field(default="free", nullable=False)  # free, premium, pro
    oauth_provider: Optional[str] = Field(default=None)  # google, github, etc
    oauth_id: Optional[str] = Field(default=None)

class UserCreate(SQLModel):
    """User creation request"""
    email: EmailStr
    password: str
    name: str

class UserLogin(SQLModel):
    """User login request"""
    email: EmailStr
    password: str

class UserResponse(SQLModel):
    """User response (no password)"""
    id: str
    email: EmailStr
    name: str
    tier: str

# ==================== Chapters ====================
class Chapter(SQLModel, TimestampMixin, table=True):
    """Python chapter content"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    number: int = Field(unique=True, index=True, nullable=False)  # 1-10
    title: str = Field(nullable=False)
    slug: str = Field(unique=True, index=True, nullable=False)
    content_mdx: str = Field(nullable=False)  # MDX content
    tier_required: str = Field(default="free")  # free, premium, pro

class ChapterResponse(SQLModel):
    """Chapter response"""
    id: str
    number: int
    title: str
    slug: str
    tier_required: str

class ChapterDetail(ChapterResponse):
    """Chapter with full content"""
    content_mdx: str

# ==================== Quiz Questions ====================
class QuizQuestion(SQLModel, TimestampMixin, table=True):
    """Multiple choice quiz question"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    chapter_id: str = Field(foreign_key="chapter.id", index=True, nullable=False)
    question: str = Field(nullable=False)
    options: dict = Field(sa_column=Column(JSON), nullable=False)  # ["A", "B", "C", "D"]
    correct_answer: int = Field(nullable=False)  # 0-3
    explanation: str = Field(nullable=False)

class QuizQuestionResponse(SQLModel):
    """Quiz question response (no answer revealed)"""
    id: str
    question: str
    options: dict

class QuizAnswer(SQLModel):
    """Single answer submission"""
    question_id: str
    selected_option: int

class QuizSubmitRequest(SQLModel):
    """Quiz submission request"""
    chapter_id: str
    answers: list[QuizAnswer]

class QuestionResult(SQLModel):
    """Result for single question"""
    question_id: str
    selected_option: int
    correct_option: int
    explanation: str
    is_correct: bool

class QuizSubmitResponse(SQLModel):
    """Quiz submission response"""
    score: int
    passed: bool
    results: list[QuestionResult]

# ==================== Quiz Attempts ====================
class QuizAttempt(SQLModel, TimestampMixin, table=True):
    """User's quiz attempt record"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True, nullable=False)
    chapter_id: str = Field(foreign_key="chapter.id", index=True, nullable=False)
    answers: dict = Field(sa_column=Column(JSON), nullable=False)  # answers data
    score: int = Field(nullable=False)  # 0-100
    completed_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)

# ==================== User Progress ====================
class UserProgress(SQLModel, TimestampMixin, table=True):
    """User's progress tracking"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True, nullable=False)
    chapter_id: str = Field(foreign_key="chapter.id", index=True, nullable=False)
    completed: bool = Field(default=False, nullable=False)
    last_accessed_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class UserProgressResponse(SQLModel):
    """User progress response"""
    chapter_id: str
    completed: bool
    last_accessed_at: datetime

# ==================== Subscriptions ====================
class Subscription(SQLModel, TimestampMixin, table=True):
    """User subscription to premium/pro tiers"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", unique=True, index=True, nullable=False)
    stripe_customer_id: str = Field(nullable=False)
    stripe_subscription_id: Optional[str] = Field(default=None)
    plan: str = Field(nullable=False)  # free, premium, pro
    status: str = Field(default="active")  # active, cancelled, expired
    current_period_start: Optional[datetime] = Field(default=None)
    current_period_end: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    auto_renew: bool = Field(default=True)

class SubscriptionResponse(SQLModel):
    """Subscription response"""
    plan: str
    status: str
    expires_at: Optional[datetime]
    auto_renew: bool

# ==================== AI Analysis (Phase 2+) ====================
class AIAnalysis(SQLModel, TimestampMixin, table=True):
    """AI analysis of user's weak points"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True, nullable=False)
    summary: str = Field(nullable=False)
    weak_topics: dict = Field(sa_column=Column(JSON), default={})
    focus_chapters: dict = Field(sa_column=Column(JSON), default={})
    next_action: Optional[str] = Field(default=None)
    generated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
