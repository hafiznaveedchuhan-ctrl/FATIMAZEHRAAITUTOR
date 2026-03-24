---
id: "0009"
title: Fix Premium Tier Gating After Payment
stage: general
date: 2026-03-24
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: FatimaZehra-AI-Tutor
command: /sp.phr
labels: ["stripe", "tier-gating", "payment", "nextauth", "jwt", "fastapi", "nextjs", "playwright"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/api/payment/create-session/route.ts
  - frontend/app/api/payment/verify-session/route.ts
  - frontend/app/pricing/success/page.tsx
  - frontend/app/pricing/page.tsx
  - frontend/app/learn/page.tsx
  - frontend/middleware.ts
  - backend/routes/payment.py
  - backend/.env
  - frontend/.env.local
tests:
  - Playwright E2E: signup → login → pricing → Stripe checkout → payment success → learn page
  - Verified all 10 chapters show "Start" for premium user (Chapters 4-10 unlocked)
  - Confirmed tier updated to "premium" in Neon DB via /auth/me endpoint
---

## Prompt

but iska aga jub chapter 4 ya paid chapter start krha hu to ni horha ha upgrade hi likha arha ha. chk plz and solve this isue

(Full session context: Full E2E Stripe payment flow — signup, login, dashboard, pricing page, Stripe checkout with test card 4242 4242 4242 4242, payment success page. After successful payment, premium chapters (4+) still showing "Upgrade" button instead of being unlocked. Fix the tier gating logic so premium users can access all 10 chapters.)

## Response snapshot

Diagnosed and fixed the full tier gating pipeline across 5 root causes:
1. No Stripe webhook → tier never updated in Neon after checkout
2. Created `/api/payment/verify-session` Next.js route to verify Stripe session and call backend
3. Created `/payment/activate-plan` FastAPI endpoint to update `user.tier` in Neon DB and upsert Subscription record
4. Updated `frontend/app/pricing/success/page.tsx` to call verify-session on mount with loading spinner
5. Updated `frontend/app/learn/page.tsx` to fetch live tier from `/auth/me` backend endpoint (bypasses stale JWT cache)
Verified with Playwright: all 10 chapters now show "Start" for premium user.

## Outcome

- ✅ Impact: Premium chapters (4–10) now correctly unlocked after Stripe payment — "Upgrade" replaced with "Start" links. Full E2E Stripe payment flow working end-to-end in TEST MODE.
- 🧪 Tests: Playwright live browser test confirmed all 10 chapters show "Start" for stripetest@test.com (premium tier). Backend /auth/me returns tier: premium. Neon DB updated correctly.
- 📁 Files: 7 files modified/created — Next.js proxy routes for create-session and verify-session, FastAPI activate-plan endpoint, learn page live tier fetch, success page activation flow, middleware fix, .env updates
- 🔁 Next prompts: Test chapter content pages (/learn/[slug]), quiz flow end-to-end, progress dashboard, AI chat rate limiting
- 🧠 Reflection: Stale JWT is a common pitfall with NextAuth — always fetch live data from backend for authorization decisions that change after initial login (tier upgrades, role changes). The verify-session + activate-plan pattern is a reliable Stripe webhook alternative for local development without CLI.

## Evaluation notes (flywheel)

- Failure modes observed: Multiple compounding issues required sequential diagnosis — Stripe SDK version conflicts (7.8→14.4→5.5→2.74→8.11.0 clean install), wrong NEXTAUTH_SECRET between frontend/backend, withAuth Edge runtime incompatibility, CORS blocking browser→FastAPI calls, and stale JWT tier after payment. Each fix unblocked the next layer.
- Graders run and results (PASS/FAIL): Playwright snapshot PASS — all 10 chapters show "Start" links for premium user
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add Stripe webhook endpoint with CLI forwarding for production-grade tier activation instead of verify-on-success-page pattern
