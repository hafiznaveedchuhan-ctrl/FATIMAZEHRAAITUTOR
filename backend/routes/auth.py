"""
Authentication routes for FatimaZehra-AI-Tutor
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlmodel import Session

from models import User, UserCreate, UserLogin, UserResponse
from database import get_session
from auth import (
    create_access_token,
    verify_token,
    hash_password,
    verify_password,
    TokenResponse,
    validate_password_strength,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# ==================== Register ====================
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    user_create: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    """
    Register a new user with email and password
    """
    # Validate password strength
    is_valid, error_msg = validate_password_strength(user_create.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Check if email already exists
    stmt = select(User).where(User.email == user_create.email)
    existing_user = await session.execute(stmt)
    if existing_user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = hash_password(user_create.password)
    user = User(
        email=user_create.email,
        name=user_create.name,
        hashed_password=hashed_password,
        tier="free"
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Generate token
    token = create_access_token(
        user_id=user.id,
        email=user.email,
        tier=user.tier
    )

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email
    )

# ==================== Login ====================
@router.post("/login", response_model=TokenResponse)
async def login(
    user_login: UserLogin,
    session: AsyncSession = Depends(get_session)
):
    """
    Login with email and password
    """
    # Find user
    stmt = select(User).where(User.email == user_login.email)
    result = await session.execute(stmt)
    user = result.scalars().first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate token
    token = create_access_token(
        user_id=user.id,
        email=user.email,
        tier=user.tier
    )

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email
    )

# ==================== Get Current User ====================
async def get_current_user(
    token: str = None,
    session: AsyncSession = Depends(get_session)
) -> User:
    """
    Dependency to get current user from JWT token
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Remove "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]

    # Verify token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Get user from database
    stmt = select(User).where(User.id == payload.user_id)
    result = await session.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        tier=current_user.tier
    )

# ==================== Logout ====================
@router.post("/logout")
async def logout():
    """
    Logout (client should clear token)
    """
    return {"message": "Logged out successfully"}
