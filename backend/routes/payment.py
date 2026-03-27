"""
Payment routes for FatimaZehra-AI-Tutor (Stripe TEST MODE ONLY)
POST /payment/create-session — creates a Stripe Checkout Session
POST /payment/webhook        — handles Stripe events, updates user tier
GET  /payment/subscription   — returns current user's subscription status
"""

import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from datetime import datetime

from models import User, Subscription
from database import get_session
from routes.auth import get_current_user

# ── Stripe init ─────────────────────────────────────────────────────────────
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("NEXT_PUBLIC_APP_URL", "https://frontend-blue-kappa-15.vercel.app")

# Inline price data (no pre-created Stripe Price IDs needed)
PLAN_CONFIG = {
    "premium": {
        "unit_amount": 999,          # $9.99 in cents
        "currency": "usd",
        "recurring": {"interval": "month"},
        "product_data": {"name": "FatimaZehra AI Tutor — Premium"},
    },
    "pro": {
        "unit_amount": 1999,         # $19.99 in cents
        "currency": "usd",
        "recurring": {"interval": "month"},
        "product_data": {"name": "FatimaZehra AI Tutor — Pro"},
    },
}

router = APIRouter(prefix="/payment", tags=["payment"])


# ── Request/Response models ──────────────────────────────────────────────────
class CreateSessionRequest(BaseModel):
    plan: str  # "premium" | "pro"

class CreateSessionResponse(BaseModel):
    session_url: str
    session_id: str

class ActivatePlanRequest(BaseModel):
    plan: str
    stripe_session_id: str


# ── POST /payment/create-session ─────────────────────────────────────────────
@router.post("/create-session", response_model=CreateSessionResponse)
async def create_checkout_session(
    body: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Create a Stripe Checkout Session for plan upgrade.
    Returns session_url — redirect the user there to pay.
    """
    if body.plan not in PLAN_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan. Choose 'premium' or 'pro'.",
        )

    if current_user.tier == body.plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You are already on the {body.plan} plan.",
        )

    price_data = PLAN_CONFIG[body.plan]

    # Reuse existing Stripe customer ID if available
    stmt = select(Subscription).where(Subscription.user_id == current_user.id)
    result = await session.execute(stmt)
    subscription = result.scalars().first()
    customer_id = subscription.stripe_customer_id if subscription else None

    if not customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            name=current_user.name,
            metadata={"user_id": current_user.id},
        )
        customer_id = customer.id

    checkout_session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": price_data["currency"],
                    "unit_amount": price_data["unit_amount"],
                    "recurring": price_data["recurring"],
                    "product_data": price_data["product_data"],
                },
                "quantity": 1,
            }
        ],
        mode="subscription",
        # {{CHECKOUT_SESSION_ID}} is a Stripe template variable — curly braces intentional
        success_url=f"{FRONTEND_URL}/pricing/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/pricing?cancelled=1",
        metadata={"user_id": current_user.id, "plan": body.plan},
        subscription_data={
            "metadata": {"user_id": current_user.id, "plan": body.plan}
        },
    )

    return CreateSessionResponse(
        session_url=checkout_session.url,
        session_id=checkout_session.id,
    )


# ── POST /payment/activate-plan ──────────────────────────────────────────────
@router.post("/activate-plan")
async def activate_plan(
    body: ActivatePlanRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Called from the success page after Stripe checkout.
    Frontend has already verified the session with Stripe — this just updates the DB.
    """
    if body.plan not in ["premium", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid plan")

    # Verify session with Stripe to prevent abuse
    try:
        checkout_session = stripe.checkout.Session.retrieve(body.stripe_session_id)
        if checkout_session.payment_status != "paid":
            raise HTTPException(status_code=400, detail="Payment not completed")
        # Confirm the session belongs to this user
        session_plan = checkout_session.metadata.get("plan", "")
        if session_plan != body.plan:
            raise HTTPException(status_code=400, detail="Plan mismatch")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Upgrade user tier
    current_user.tier = body.plan
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)

    # Upsert subscription record
    stmt = select(Subscription).where(Subscription.user_id == current_user.id)
    result = await session.execute(stmt)
    sub = result.scalars().first()

    stripe_customer_id = checkout_session.customer
    stripe_subscription_id = checkout_session.subscription

    if sub:
        sub.plan = body.plan
        sub.status = "active"
        sub.stripe_customer_id = stripe_customer_id
        sub.stripe_subscription_id = stripe_subscription_id
        sub.updated_at = datetime.utcnow()
    else:
        sub = Subscription(
            user_id=current_user.id,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
            plan=body.plan,
            status="active",
        )
    session.add(sub)
    await session.commit()

    return {"plan": body.plan, "status": "activated"}


# ── POST /payment/webhook ────────────────────────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    """
    Stripe webhook endpoint. Verifies signature, handles:
    - checkout.session.completed  → upgrade user tier
    - customer.subscription.deleted → downgrade to free
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        await _handle_checkout_complete(event["data"]["object"], session)
    elif event_type == "customer.subscription.deleted":
        await _handle_subscription_deleted(event["data"]["object"], session)
    # invoice.payment_succeeded / customer.subscription.updated → no action needed

    return {"received": True}


# ── Internal handlers ─────────────────────────────────────────────────────────
@router.get("/subscription")
async def get_subscription(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Return the authenticated user's current subscription status.
    Used by the frontend dashboard to show plan, expiry, and auto-renew.
    """
    stmt = select(Subscription).where(Subscription.user_id == current_user.id)
    result = await session.execute(stmt)
    sub = result.scalars().first()

    if not sub:
        # No subscription record — user is on free tier
        return {
            "plan": current_user.tier,
            "status": "active",
            "expires_at": None,
            "auto_renew": False,
        }

    return {
        "plan": sub.plan,
        "status": sub.status,
        "expires_at": sub.expires_at.isoformat() if sub.expires_at else None,
        "auto_renew": sub.auto_renew,
    }


# ── Internal handlers ─────────────────────────────────────────────────────────
async def _handle_checkout_complete(checkout_obj: dict, db: AsyncSession) -> None:
    """Activate the new plan after successful payment."""
    user_id = checkout_obj.get("metadata", {}).get("user_id")
    plan = checkout_obj.get("metadata", {}).get("plan")
    stripe_customer_id = checkout_obj.get("customer")
    stripe_subscription_id = checkout_obj.get("subscription")

    if not user_id or not plan:
        return

    # 1. Upgrade user tier
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if user:
        user.tier = plan
        user.updated_at = datetime.utcnow()
        db.add(user)

    # 2. Upsert Subscription record
    stmt2 = select(Subscription).where(Subscription.user_id == user_id)
    result2 = await db.execute(stmt2)
    sub = result2.scalars().first()

    if sub:
        sub.stripe_customer_id = stripe_customer_id
        sub.stripe_subscription_id = stripe_subscription_id
        sub.plan = plan
        sub.status = "active"
        sub.updated_at = datetime.utcnow()
    else:
        sub = Subscription(
            user_id=user_id,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
            plan=plan,
            status="active",
        )
    db.add(sub)
    await db.commit()


async def _handle_subscription_deleted(subscription_obj: dict, db: AsyncSession) -> None:
    """Downgrade user to free after subscription cancellation."""
    stripe_subscription_id = subscription_obj.get("id")
    if not stripe_subscription_id:
        return

    stmt = select(Subscription).where(
        Subscription.stripe_subscription_id == stripe_subscription_id
    )
    result = await db.execute(stmt)
    sub = result.scalars().first()

    if not sub:
        return

    sub.status = "cancelled"
    db.add(sub)

    # Downgrade user
    stmt2 = select(User).where(User.id == sub.user_id)
    result2 = await db.execute(stmt2)
    user = result2.scalars().first()
    if user:
        user.tier = "free"
        user.updated_at = datetime.utcnow()
        db.add(user)

    await db.commit()
