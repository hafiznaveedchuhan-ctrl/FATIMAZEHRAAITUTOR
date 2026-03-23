# Task Plan: FatimaZehra-AI-Tutor (Phase 1 — 10-Day Sprint)

**Objective**: MVP complete, all acceptance criteria passing, browser-use E2E successful

**Git Workflow**: Commit after every day's work with format: `feat: day-N complete - FatimaZehra-AI-Tutor`

---

## Day 1: Monorepo Setup & Infrastructure

**Goal**: Project scaffold, database ready, basic endpoints working

### Tasks

#### 1.1 Monorepo Structure & Dependency Setup
- [ ] Create folder structure: `frontend/`, `backend/`, `k8s/`
- [ ] Root `package.json` (workspace or lerna setup, optional; simpler: separate pkgs)
- [ ] Root `.gitignore` (include `.env`, `node_modules`, `__pycache__`, `.venv`)
- [ ] Backend: `requirements.txt` with FastAPI, SQLModel, asyncpg, python-jose, passlib, pydantic-settings
- [ ] Frontend: `package.json` with Next.js 14, React, TailwindCSS, shadcn/ui, framer-motion, swr
- [ ] Both: Ensure Python 3.12, Node 20 specified

**Test**: `pip install -r requirements.txt` succeeds; `npm install` in frontend succeeds

#### 1.2 Next.js 14 Project Init
- [ ] `npx create-next-app@14 frontend` (App Router, TypeScript, Tailwind)
- [ ] Configure `tsconfig.json` (strict mode)
- [ ] Configure `tailwind.config.js` with design tokens (colors from ui-spec.md)
- [ ] Install shadcn/ui: `npx shadcn-ui@latest init` (dark mode, next-themes)
- [ ] Create basic layout: `app/layout.tsx` with theme provider, navbar placeholder

**Test**: `cd frontend && npm run dev` → localhost:3000 loads, theme toggle works

#### 1.3 FastAPI Project Init
- [ ] Create `backend/main.py` with basic app scaffold
- [ ] Setup: `from fastapi import FastAPI`; create `/health` endpoint returning `{"status": "ok"}`
- [ ] Enable CORS: `CORSMiddleware` allowing localhost:3000
- [ ] Configure Pydantic settings: load from `.env` (OPENAI_API_KEY, DATABASE_URL, etc.)
- [ ] Uvicorn runner: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

**Test**: `cd backend && python -m uvicorn main:app --reload` → POST /health returns 200

#### 1.4 Neon PostgreSQL Setup
- [ ] Create Neon account & project
- [ ] Copy connection string: `postgresql+asyncpg://user:pass@host/db`
- [ ] Add to `.env.example`: `DATABASE_URL=postgresql+asyncpg://...` (no real value)
- [ ] Backend: Import `DATABASE_URL` from settings; create SQLModel engine (no tables yet, just config)

**Test**: Connection string format correct; import succeeds without error

#### 1.5 Create .env.example
```
# .env.example at repo root — NO REAL VALUES
OPENAI_API_KEY=
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql+asyncpg://...
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
REDIS_URL=
SENTRY_DSN=
RESEND_API_KEY=
```

**Test**: File exists, readable, no real secrets

#### 1.6 Git Init & Initial Push
- [ ] `git init` (if not done)
- [ ] Create `.gitignore` (include `.env`, build artifacts, node_modules, __pycache__)
- [ ] Commit: `feat: day-1 complete - FatimaZehra-AI-Tutor` (scaffold + env template)
- [ ] Push to main

**Test**: `git log` shows commit; GitHub repo has initial scaffold

#### 1.7 README.md (Skeleton)
- [ ] Create `/README.md` at repo root
- [ ] Sections: Project overview, tech stack, setup (npm install, pip install, .env), running locally, API docs stub
- [ ] Include GitHub link: https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR

**Test**: README renders correctly on GitHub; links work

---

## Day 2: Database Models & Auth Endpoints

**Goal**: Database schema, FastAPI auth endpoints working, password hashing

### Tasks

#### 2.1 SQLModel Database Schema
- [ ] Create `backend/models.py` with SQLModel tables:
  - `User`: id (UUID), email, name, hashed_password, tier, oauth_provider, oauth_id, created_at, updated_at
  - `Chapter`: id, number (1-10), title, slug, content_mdx, tier_required, created_at
  - `QuizQuestion`: id, chapter_id, question, options (JSON), correct_answer, explanation
  - `QuizAttempt`: id, user_id, chapter_id, answers (JSON), score, completed_at
  - `UserProgress`: id, user_id, chapter_id, completed, last_accessed_at
  - `Subscription`: id, user_id, stripe_customer_id, stripe_sub_id, plan, status, expires_at

**Test**: SQLModel imports; no syntax errors; relationships correct (foreign keys)

#### 2.2 Alembic Migration Setup
- [ ] `alembic init alembic` in backend folder
- [ ] Configure `alembic/env.py` to use SQLModel metadata
- [ ] Create initial migration: `alembic revision --autogenerate -m "Initial schema"`
- [ ] Verify migration file has CREATE TABLE statements for all 6 tables

**Test**: `alembic upgrade head` runs without error (creates tables in test DB)

#### 2.3 FastAPI Auth Endpoints
- [ ] Create `backend/routes/auth.py` with:
  - `POST /auth/register`: email, password, name → hash password, create user, return user_id + token
  - `POST /auth/login`: email, password → verify hash, return token
  - `GET /auth/me`: return current user (from JWT claims)
  - `POST /auth/logout`: invalidate session (flag in DB or Redis, Phase 3)

**Validation**:
  - Email format (regex or pydantic EmailStr)
  - Password strength: min 8 chars (lowercase, uppercase, digit, special char required per Phase 1 spec, but for MVP: just min 8)
  - No duplicate emails (unique constraint in DB)

**Test**: POST /auth/register with valid data → 201 + user_id; duplicate email → 409; invalid password → 400

#### 2.4 JWT Token Generation & Verification
- [ ] Use `python-jose` + `passlib`
- [ ] Token payload: `{user_id, email, tier}`
- [ ] Create token expiry: 7 days
- [ ] Create dependency: `get_current_user()` extracts token, verifies, returns user
- [ ] All protected endpoints decorated with `@app.get(..., dependencies=[Depends(get_current_user)])`

**Test**: GET /auth/me with valid token → user data; invalid token → 401; expired token → 401

#### 2.5 Seed Initial Data (Optional for Testing)
- [ ] Create `backend/seed.py` script
- [ ] Seed 10 chapters with content (use placeholder MDX)
- [ ] Seed 10 quiz questions per chapter (use simple MCQs)
- [ ] Run on local DB setup (not production)

**Test**: Chapters queryable from DB; quiz questions linked to chapters

#### 2.6 pytest Auth Tests
- [ ] Create `backend/tests/test_auth.py`
- [ ] Test cases:
  - `test_signup_creates_user`: Valid signup → user in DB
  - `test_signup_duplicate_email`: Duplicate → 409
  - `test_login_valid`: Correct email/password → token returned
  - `test_login_invalid`: Wrong password → 401
  - `test_get_current_user`: Valid JWT → user data
  - `test_get_current_user_invalid_token`: Invalid JWT → 401

**Test**: `pytest backend/tests/test_auth.py -v` → all green; coverage ≥ 80%

#### 2.7 Commit Day 2
- [ ] `git add` models, migrations, auth routes, tests
- [ ] `git commit -m "feat: day-2 complete - FatimaZehra-AI-Tutor"` (db schema + auth endpoints)
- [ ] `git push origin main`

---

## Day 3: NextAuth.js & Login/Signup Pages

**Goal**: Frontend auth UI working, NextAuth.js session management, Google OAuth configured (mocked)

### Tasks

#### 3.1 NextAuth.js Setup
- [ ] Install: `npm install next-auth`
- [ ] Create `app/api/auth/[...nextauth]/route.ts`:
  - Providers: CredentialsProvider (email/password) + GoogleProvider (mock for MVP)
  - Callback: `authorize()` calls backend POST /auth/login
  - Session: JWT (next-auth default)
  - JWT expires: 7 days
- [ ] Create `.env.local` (git-ignored):
  ```
  NEXTAUTH_SECRET=<generated-secret>
  NEXTAUTH_URL=http://localhost:3000
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

**Test**: NextAuth imported; `/api/auth/signin` redirects to login page

#### 3.2 Login/Signup Pages
- [ ] Create `app/auth/layout.tsx`: Split-screen layout (form left, illustration right)
- [ ] Create `app/auth/login/page.tsx`:
  - Email + password form
  - "Sign up" link
  - Google button (link to `/api/auth/signin?callbackUrl=/dashboard`)
  - Form validation (client-side, Zod)
  - Error toast on failed login
  - Loading state (disable button, show spinner)
- [ ] Create `app/auth/signup/page.tsx`:
  - Email + password + name form
  - Password strength indicator
  - "Already have account?" link
  - Form validation
  - Call backend POST /auth/register; on success → auto-login or redirect to /login
  - Error handling (duplicate email → "Email already in use")

**Test**: Load /auth/login → form renders; submit valid creds → redirects to /dashboard

#### 3.3 Protected Routes
- [ ] Create middleware: `middleware.ts` at root
- [ ] Redirect unauthenticated users from `/dashboard`, `/learn`, `/chat` → `/auth/login`
- [ ] Redirect authenticated users from `/auth/*` → `/dashboard`

**Test**: Unauthenticated → /dashboard → redirect to /auth/login; authenticated → /auth/login → redirect to /dashboard

#### 3.4 Session Provider & User Context
- [ ] Wrap app with `<SessionProvider>` in `app/layout.tsx`
- [ ] Create React Context for user state (tier, email, name)
- [ ] Update context on session change (useEffect + useSession hook from next-auth/react)

**Test**: User data accessible throughout app; persists across page navigations

#### 3.5 Browser-Use E2E Test (Day 3)
- [ ] **Signup flow**:
  - Open localhost:3000/auth/signup
  - Fill email, password, name
  - Click signup
  - Verify: redirected to /dashboard OR /auth/login (depends on auto-login)
  - **Screenshot**: Signup form
- [ ] **Login flow**:
  - Open /auth/login
  - Fill email, password
  - Click login
  - Verify: redirected to /dashboard, user name shown in navbar
  - **Screenshot**: Dashboard after login

**Test**: Both flows successful; screenshots saved

#### 3.6 Commit Day 3
- [ ] `git add` auth pages, NextAuth config, middleware, context
- [ ] `git commit -m "feat: day-3 complete - FatimaZehra-AI-Tutor"` (NextAuth + auth UI)
- [ ] `git push origin main`

---

## Day 4: Landing Page & Chapters UI

**Goal**: Beautiful landing page, chapters list grid, responsive design

### Tasks

#### 4.1 Landing Page Components
- [ ] Create `app/page.tsx` (home)
- [ ] **Hero Section**:
  - Headline: "Master Python with AI Coaching"
  - Subheadline: "10 chapters, personalized learning paths, AI tutor"
  - CTA button: "Start Learning" (redirects to /auth/signup if not authenticated, else /learn)
  - "Sign In" link
  - Animated gradient background (hero-gradient from ui-spec)
  - **Mobile**: Headline/buttons center-aligned, no right illustration on small screens
- [ ] **Features Grid** (6 cards):
  - Code Highlights
  - Personalized Paths
  - AI Tutor
  - Progress Tracking
  - Streak Motivation
  - Certificate (Phase 3)
  - Each card: icon, title, description
- [ ] **Pricing Section** (3 cards):
  - Free, Premium, Pro
  - Features list (checkmarks)
  - CTA buttons
  - "Most Popular" badge on Premium
- [ ] **Testimonials** (3 cards, optional carousel)
- [ ] **CTA Footer**: "Ready to learn?" + signup button

**Test**: Load / → all sections render; responsive on mobile/desktop; animations smooth

#### 4.2 Chapter List Page
- [ ] Create `app/learn/page.tsx`
- [ ] Fetch chapters from backend: GET /chapters
- [ ] Display grid (1 col mobile, 2 tablet, 3 desktop) of chapter cards
- [ ] Each card:
  - Chapter number + title
  - Lock icon if tier_required > user tier
  - Progress ring (0% if not started)
  - "Start Reading" button
  - On click: navigate to /learn/[slug]
- [ ] Free users see lock on chapters 4-10 with "Upgrade" CTA
- [ ] Responsive layout

**Test**: Load /learn as free user → chapters 1-3 unlocked, 4-10 locked; click chapter 1 → navigate to /learn/python-basics

#### 4.3 Navbar Component
- [ ] Create `components/NavBar.tsx`
- [ ] Left: FatimaZehra logo (link to /)
- [ ] Center: Nav links (Learn, Chat, Pricing) — hidden on mobile
- [ ] Right: Theme toggle (sun/moon icon), user menu (dropdown with Profile, Logout)
- [ ] Mobile: Hamburger menu (mobile nav)
- [ ] User menu: Shows name, email, logout button
- [ ] Active link styling (underline or highlight)

**Test**: NavBar renders on all pages; theme toggle works; user menu shows logged-in user

#### 4.4 Footer Component
- [ ] Create `components/Footer.tsx`
- [ ] Links: GitHub, Twitter, Email
- [ ] Copyright: "© 2026 FatimaZehra AI Tutor. All rights reserved."
- [ ] Responsive: Stack vertically on mobile

**Test**: Footer on all pages; links functional

#### 4.5 Responsive Design QA
- [ ] Test on 375px (iPhone SE), 768px (iPad), 1280px (desktop)
- [ ] Touch targets ≥ 44px on mobile
- [ ] No horizontal scrolling
- [ ] Text readable (no overflow)
- [ ] Images responsive (Next.js Image component)

**Test**: All screen sizes render correctly; no layout shifts

#### 4.6 Browser-Use Screenshots (Day 4)
- [ ] Load localhost:3000 → screenshot landing page
- [ ] Scroll down landing → screenshot features + pricing
- [ ] Authenticate as premium user
- [ ] Load /learn → screenshot chapter grid (all unlocked)
- [ ] Load as free user → screenshot chapter grid (4+ locked)

**Test**: Screenshots saved; all pages render correctly

#### 4.7 Commit Day 4
- [ ] `git add` landing page, chapter list, navbar, footer
- [ ] `git commit -m "feat: day-4 complete - FatimaZehra-AI-Tutor"` (landing + chapters UI)
- [ ] `git push origin main`

---

## Day 5: Chapter Content & MDX Rendering

**Goal**: 10 chapters with content, MDX renderer working, syntax highlighting

### Tasks

#### 5.1 Generate/Seed 10 Chapter MDX Files
- [ ] Create `frontend/src/content/chapters/` directory
- [ ] For each of 10 chapters, create `.mdx` file:
  ```mdx
  ---
  chapter: 1
  title: "Python Basics & Variables"
  slug: "python-basics"
  ---

  # Python Basics & Variables

  Variables store data...

  ## Types

  ```python
  age = 25
  name = "Alice"
  ```

  [Content continues with examples, explanations]
  ```
- [ ] Seed to backend DB: POST endpoint for admin to upload MDX (or seed script)
- [ ] Each chapter should be ~2KB (roughly 400-500 words) with 2-3 code examples

**Content Topics**:
1. Variables, types, f-strings, input/output
2. If/else, loops, break/continue, list comprehension
3. Functions, args, kwargs, return, lambda, scope
4. Classes, inheritance, dunder methods
5. Modules, packages, imports, pip
6. File I/O, context managers, pathlib
7. Exceptions, try/except/finally, logging
8. Requests, JSON, REST API basics
9. Decorators, generators, yield
10. Dataclasses, type hints, asyncio, advanced

**Test**: 10 chapters in backend DB; GET /chapters/1 returns MDX content

#### 5.2 Chapter Viewer Page
- [ ] Create `app/learn/[slug]/page.tsx`
- [ ] Fetch chapter from backend: GET /chapters/{chapter_id}
- [ ] Render MDX:
  - Install: `npm install next-mdx-remote`
  - Import MDXRemote from `next-mdx-remote/rsc`
  - Pass chapter.content_mdx to MDXRemote
- [ ] Styling:
  - Use `@tailwindcss/typography` for prose styling (dark mode aware)
  - Code blocks: dark background (#1A1A1F), monospace font
- [ ] Sidebar (left): Chapter outline (clickable headings)
- [ ] Right sidebar: Collapsible AI chat (see Day 6)
- [ ] Bottom: "Next Chapter" + "Start Quiz" buttons
- [ ] Responsive: Stack vertically on mobile; chat in modal

**Test**: Load /learn/python-basics → MDX renders with correct styling; headings link in sidebar

#### 5.3 Code Block Component (Prism.js)
- [ ] Install: `npm install prismjs react-syntax-highlighter` (or use Prism directly)
- [ ] Create `components/CodeBlock.tsx`:
  - Language prop (python, javascript, bash, etc.)
  - Copy button (top-right corner)
  - Line numbers
  - Dark background, light text
  - Syntax highlighting colors (Prism theme: dracula or custom)
- [ ] Render code blocks in MDX with CodeBlock component

**Test**: Code blocks in chapters have syntax highlighting; copy button works

#### 5.4 Progress Tracking on Chapter View
- [ ] On chapter load, POST /progress/mark-accessed {chapter_id}
- [ ] Update user_progress.last_accessed_at in DB
- [ ] Display progress ring showing completion % (from quiz_attempts)

**Test**: Opening chapter updates DB; progress ring shows correct %

#### 5.5 Browser-Use Screenshots (Day 5)
- [ ] Load /learn/python-basics → screenshot chapter content
- [ ] Verify MDX renders correctly
- [ ] Verify sidebar with outline
- [ ] Verify "Start Quiz" button
- [ ] Verify code blocks with copy button

**Test**: Chapter viewer fully functional; content readable

#### 5.6 Commit Day 5
- [ ] `git add` chapters content, MDX setup, code block component, chapter viewer
- [ ] `git commit -m "feat: day-5 complete - FatimaZehra-AI-Tutor"` (chapter content + MDX)
- [ ] `git push origin main`

---

## Day 6: AI Chat (OpenAI Streaming)

**Goal**: OpenAI GPT-4 streaming chat, frontend-only (Next.js API route), working in chapter sidebar

### Tasks

#### 6.1 Next.js API Route for Chat
- [ ] Create `app/api/chat/route.ts`:
  ```typescript
  export async function POST(req: Request) {
    const { message, chapter_id } = await req.json()

    // 1. Verify auth (get user from session)
    // 2. Check rate limit (future: Redis, now: simple DB counter)
    // 3. Build system prompt (include chapter context)
    // 4. Call OpenAI streaming API
    // 5. Return SSE stream
  }
  ```
- [ ] Use `openai` npm package (openai/openai or openai/rest_api)
- [ ] System prompt: "You are a helpful Python tutor..."
- [ ] Include chapter context if chapter_id provided
- [ ] Max tokens: 500

**Test**: POST /api/chat with valid message → streaming response

#### 6.2 OpenAI Streaming Integration
- [ ] Install: `npm install openai` or use `fetch` directly
- [ ] Set `OPENAI_API_KEY` in `.env.local`
- [ ] Create stream (streaming: true in request)
- [ ] Return ReadableStream to client as SSE

**Test**: Response streams (not buffered); tokens received incrementally

#### 6.3 Frontend Chat Component
- [ ] Create `components/ChatWidget.tsx`:
  - Message list (user messages right/indigo, assistant left/gray)
  - Input textarea (auto-expand on input)
  - Send button
  - Loading spinner during response
  - Streaming cursor animation (shows as response streams in)
  - Copy button on code blocks within messages
- [ ] Use `useChat` hook (from `ai/react`) or custom fetch + SSE parser
- [ ] Show typing indicator while awaiting response

**Test**: Send message → see streaming response; copy code blocks

#### 6.4 Chat UI Integration
- [ ] **Chapter View**: Right sidebar collapsible chat panel (default open on desktop, closed on mobile)
- [ ] **Full-page chat** (optional Phase 2): /chat page for dedicated chat interface
- [ ] For MVP (Phase 1): Focus on sidebar chat in chapter view
- [ ] Pass chapter_id to API so context is relevant

**Test**: Open chapter → sidebar shows chat; send message about chapter → relevant response

#### 6.5 Rate Limiting (Stub for Phase 1)
- [ ] Simple per-user counter in memory or DB:
  - Free: 2 messages/day
  - Premium: 5 messages/day
  - Pro: unlimited
- [ ] Track message count per user per day
- [ ] Return 429 if limit exceeded

**Test**: Free user sends >2 messages → 429 "Rate limit exceeded"; pro user unlimited

#### 6.6 Browser-Use Test (Day 6)
- [ ] Open /learn/python-basics
- [ ] Click on right sidebar chat
- [ ] Type: "What is a variable?"
- [ ] Wait for streaming response
- [ ] Verify response appears incrementally
- [ ] Copy any code block in response

**Test**: Chat fully functional; streaming visible

#### 6.7 Commit Day 6
- [ ] `git add` API route, chat component, OpenAI integration
- [ ] `git commit -m "feat: day-6 complete - FatimaZehra-AI-Tutor"` (AI chat + streaming)
- [ ] `git push origin main`

---

## Day 7: Quiz Engine

**Goal**: 10 MCQs per chapter, scoring, result display, storage

### Tasks

#### 7.1 Backend Quiz Endpoints
- [ ] GET /quiz/{chapter_id}: Return 10 questions (no correct_answer revealed)
- [ ] POST /quiz/submit: Accept answers, calculate score, save to DB, return results with explanations
- [ ] Score calculation: (correct / 10) * 100
- [ ] Passed: score >= 70%

**Test**: GET returns questions; POST calculates score correctly

#### 7.2 Frontend Quiz Page
- [ ] Create `app/learn/[slug]/quiz/page.tsx`
- [ ] Fetch questions: GET /quiz/{chapter_id}
- [ ] Display:
  - Progress bar: "Q3 of 10"
  - One question at a time (or all visible, user choice)
  - 4 option buttons (radio style)
  - Next/Prev buttons
  - Submit Quiz button (at end)
- [ ] On submit:
  - POST /quiz/submit with answers
  - Receive score + results
  - Show score reveal (animated counter)
  - Show results: each question → selected answer, correct answer, explanation
  - "Pass" or "Fail" badge (color-coded)
  - Buttons: "Retake Quiz" or "Next Chapter"

**Test**: Complete quiz → see results; retake → overwrites previous attempt

#### 7.3 Quiz Animations
- [ ] Score reveal: useSpring (number counter animation)
- [ ] Pass badge: spring bounce + fade-in
- [ ] Result cards: staggered fade-in (0.05s delay per question)

**Test**: Animations smooth, no jank

#### 7.4 Quiz Session Tracking
- [ ] On quiz completion, POST /progress/mark-complete {chapter_id}
- [ ] Update user_progress.completed = true
- [ ] Update dashboard progress ring

**Test**: Dashboard updates immediately after quiz pass

#### 7.5 Browser-Use Quiz Test (Day 7)
- [ ] Open /learn/python-basics
- [ ] Click "Start Quiz"
- [ ] Answer 8 out of 10 questions correctly
- [ ] Click Submit
- [ ] See score 80%, "Pass" badge
- [ ] See explanations for 2 missed questions
- [ ] Click "Retake Quiz"
- [ ] Verify progress updated on dashboard

**Test**: Full quiz flow end-to-end successful

#### 7.6 Commit Day 7
- [ ] `git add` quiz endpoints, quiz page, animations, progress tracking
- [ ] `git commit -m "feat: day-7 complete - FatimaZehra-AI-Tutor"` (quiz engine)
- [ ] `git push origin main`

---

## Day 8: Dashboard & Progress Tracking

**Goal**: User dashboard with stats, progress rings, activity feed, learning path

### Tasks

#### 8.1 Backend Progress Endpoints
- [ ] GET /progress/{user_id}:
  - chapters_completed (count from user_progress.completed = true)
  - chapters_total (10)
  - completion_percentage
  - quiz_scores (array of {chapter, score, passed, attempted_at})
  - average_score
  - streak_days (consecutive days with quiz attempts)
  - last_activity_at
- [ ] Implement streak calculation (count consecutive days backwards from today)

**Test**: GET /progress/{user_id} returns correct metrics; streak calculated

#### 8.2 Dashboard Page
- [ ] Create `app/dashboard/page.tsx`
- [ ] Layout:
  - Header: "Welcome, [Name]!"
  - Stats row (3 cards):
    - Chapters Completed: X/10 (animated counter)
    - Average Quiz Score: Y% (animated counter)
    - Current Streak: Z days 🔥 (animated counter)
  - Progress Ring (Recharts): Visual representation of completion %
  - Recent Activity Feed: Last 5 quiz attempts (chapter, score, date)
  - "Learning Path" card (stub for Phase 2; show next chapter recommendation)
  - "Start Learning" CTA button

**Test**: Dashboard loads; counters animate; stats accurate

#### 8.3 Animated Counters (useCountUp or Framer Motion)
- [ ] Use `react-countup` or custom hook
- [ ] Animate from 0 to final value on component mount
- [ ] Duration: 1.5s
- [ ] Easing: easeOut

**Test**: Counters smooth, end at correct value

#### 8.4 Progress Ring Chart (Recharts)
- [ ] Create `components/ProgressRing.tsx`:
  - Circular progress indicator
  - Center text showing percentage
  - Color based on score: green (≥70%), yellow (50-69%), red (<50%)
  - Smooth animation on mount

**Test**: Ring displays correct %, colors change by threshold

#### 8.5 Browser-Use Dashboard Test (Day 8)
- [ ] Signup as new user
- [ ] Complete chapter 1 quiz (pass)
- [ ] Complete chapter 2 quiz (pass)
- [ ] Navigate to /dashboard
- [ ] Verify:
  - Chapters Completed: 2/10
  - Average Score: (score1 + score2) / 2
  - Streak: 1 day
  - Progress ring: 20%
  - Recent activity shows both quiz attempts

**Test**: Dashboard fully functional and accurate

#### 8.6 Commit Day 8
- [ ] `git add` progress endpoints, dashboard page, counters, progress ring
- [ ] `git commit -m "feat: day-8 complete - FatimaZehra-AI-Tutor"` (dashboard + progress)
- [ ] `git push origin main`

---

## Day 9: Stripe Payments & Tier Gating

**Goal**: Stripe TEST MODE checkout, webhook, subscription tracking, tier access control

### Tasks

#### 9.1 Stripe Setup (TEST MODE)
- [ ] Create Stripe account (if not done)
- [ ] Get TEST MODE keys:
  - Secret Key: sk_test_...
  - Publishable Key: pk_test_...
  - Webhook Secret: whsec_...
- [ ] Add to `.env.local`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Create 2 products in Stripe dashboard:
  - Premium ($9.99/month)
  - Pro ($19.99/month)

#### 9.2 Backend Payment Endpoints
- [ ] `POST /payment/create-session`:
  - Input: {plan: "premium"|"pro"}
  - Call Stripe API: create checkout session
  - Return: {session_url: "https://checkout.stripe.com/..."}
- [ ] `POST /payment/webhook`:
  - Verify webhook signature
  - On payment_intent.succeeded:
    - Find user by customer_id
    - Update user.tier to premium/pro
    - Create subscription record
  - On invoice.payment_failed: (Phase 2: log error)
  - Return 200 OK
- [ ] `GET /payment/subscription`:
  - Return current subscription (plan, expires_at, status)

**Test**: POST /payment/create-session → valid Stripe URL; webhook updates user.tier

#### 9.3 Frontend Pricing Page
- [ ] Create `app/pricing/page.tsx`
- [ ] Display 3 tier cards:
  - Free: $0, chapters 1-3, 50% AI tokens
  - Premium: $9.99/mo, all chapters, 5 AI chats/day
  - Pro: $19.99/mo, all + Phase 2 features (future)
- [ ] CTA buttons:
  - Free: "Current Plan" (disabled if on free)
  - Premium/Pro: "Upgrade" (calls backend POST /payment/create-session, opens Stripe checkout)
- [ ] "Most Popular" badge on Premium
- [ ] Monthly/annual toggle (stub for Phase 1; hard-coded to monthly)

**Test**: Click "Upgrade to Premium" → Stripe checkout opens

#### 9.4 Stripe Checkout (Frontend)
- [ ] Use Stripe.js or redirect to Stripe checkout URL
- [ ] On success: redirect to /dashboard with query param `?payment=success`
- [ ] On cancel: redirect back to /pricing
- [ ] Show toast notification on return

**Test**: Complete payment with test card 4242 4242 4242 4242 → redirect to dashboard

#### 9.5 Tier Gating Logic
- [ ] Chapter endpoint: GET /chapters/{id} → if user.tier < chapter.tier_required, return 403
- [ ] Frontend: Show lock + "Upgrade" button on gated chapters
- [ ] After successful payment:
  - User tier updated in DB
  - Frontend session updated (refresh user context)
  - Dashboard shows new tier badge
  - Locked chapters now accessible

**Test**: Free user → chapter 4 locked; upgrade to premium → chapter 4 accessible

#### 9.6 Browser-Use Payment Test (Day 9)
- [ ] Signup as free user
- [ ] Try to access chapter 4 → locked with "Upgrade" button
- [ ] Click "Upgrade"
- [ ] Go to /pricing
- [ ] Click "Upgrade to Premium"
- [ ] Complete Stripe checkout with test card: 4242 4242 4242 4242, any future exp, CVC 123
- [ ] Redirected to /dashboard
- [ ] Verify user.tier = "premium"
- [ ] Verify chapter 4 now accessible
- [ ] Verify "Premium" badge shown

**Test**: Full payment flow end-to-end; user tier upgraded

#### 9.7 Commit Day 9
- [ ] `git add` payment endpoints, pricing page, Stripe integration, tier gating
- [ ] `git commit -m "feat: day-9 complete - FatimaZehra-AI-Tutor"` (Stripe + payments)
- [ ] `git push origin main`

---

## Day 10: Integration, Polish, Testing, Final Deployment

**Goal**: All features working together, E2E test suite passes, deployment ready

### Tasks

#### 10.1 Full E2E Test (browser-use)
- [ ] **Complete user journey**:
  1. Load localhost:3000
  2. Signup: email, password, name
  3. Redirected to /dashboard (empty state)
  4. Browse /learn chapter list (1-3 unlocked, 4-10 locked)
  5. Open /learn/python-basics (chapter 1)
  6. Read content, scroll through MDX
  7. Chat: ask "What is a variable?" → receive response
  8. Start Quiz: answer 8/10 correct
  9. See score 80%, "Pass" badge
  10. View /dashboard → stats updated (1 chapter done, 80% avg score)
  11. Go to /pricing
  12. Click "Upgrade to Premium"
  13. Stripe checkout: 4242 card
  14. Return to /dashboard → premium badge shown
  15. Browse /learn → all 10 chapters visible
  16. Open /learn/oop (chapter 4, was locked, now accessible)
  17. Confirm: "You can read this now"
  18. Logout → redirected to /auth/login
  19. Login with same credentials → session restored
  20. Verify: tier still premium, chapters still accessible

**Output**: Screenshot at each step; video recording optional

#### 10.2 Backend Test Suite (pytest)
- [ ] Run all tests: `pytest backend/tests/ -v --cov=backend/src`
- [ ] Ensure coverage ≥ 80%
- [ ] All tests green (no failures, no warnings)
- [ ] Add any missing test cases for edge cases discovered during E2E

**Test**: `pytest` output: all green, coverage report

#### 10.3 Frontend Build & Linting
- [ ] `npm run lint` → zero errors/warnings
- [ ] `npm run build` → build succeeds, no errors
- [ ] Check bundle size (should be reasonable, < 500KB initial)
- [ ] `npm run type-check` → zero TypeScript errors

**Test**: Build succeeds; no console errors

#### 10.4 Documentation Updates
- [ ] Update README.md:
  - Setup instructions (npm install, pip install, .env setup)
  - Running locally (npm run dev in frontend, python -m uvicorn ... in backend)
  - API documentation (list endpoints, example requests/responses)
  - Stripe TEST MODE setup (test card, webhook setup)
  - Browser-use test instructions
  - Known issues / TODOs
- [ ] Add CHANGELOG.md stub for Phase 1

**Test**: README renders correctly on GitHub; instructions accurate

#### 10.5 Dark/Light Mode Polish
- [ ] Verify all pages readable in both dark/light modes
- [ ] Test theme toggle on every page
- [ ] Ensure 4.5:1 contrast ratio (WCAG AA) on all text
- [ ] Fix any dark mode issues (borders, shadows, text colors)

**Test**: All pages readable in both themes; no color-only information

#### 10.6 Responsive Design Final QA
- [ ] Test on 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] Check touch targets (≥ 44px on mobile)
- [ ] No horizontal scrolling
- [ ] Images responsive
- [ ] Modals/overlays work on mobile

**Test**: All screen sizes render correctly

#### 10.7 Error Handling & Edge Cases
- [ ] Network error during payment → graceful error message
- [ ] Invalid email format → validation error
- [ ] Quiz submission fails → retry button
- [ ] Chapter content fails to load → fallback message
- [ ] OpenAI API timeout → show "Please try again" message

**Test**: All error paths handled gracefully

#### 10.8 Final Commit & Push
- [ ] `git add` all remaining files (tests, docs, etc.)
- [ ] `git commit -m "feat: day-10 complete - FatimaZehra-AI-Tutor - Phase 1 MVP"`
- [ ] `git push origin main`
- [ ] Tag release: `git tag -a v1.0.0-phase1 -m "Phase 1 MVP complete"` (optional)
- [ ] Verify GitHub repo shows latest commit

#### 10.9 Phase 1 Sign-Off Checklist

- [ ] ✅ All 6 database tables created and migrated
- [ ] ✅ All 7 auth endpoints working (register, login, OAuth, me, logout)
- [ ] ✅ All 10 chapters with MDX content + 10 MCQs each
- [ ] ✅ Chapter list page with tier gating (free: 1-3, premium: 1-10)
- [ ] ✅ Chapter viewer with MDX rendering and syntax highlighting
- [ ] ✅ Quiz engine: submit answers, score calculation, result display
- [ ] ✅ Dashboard: stats (counters, progress ring), activity feed
- [ ] ✅ Progress tracking: completion %, quiz scores, streaks
- [ ] ✅ AI chat: streaming OpenAI responses in chapter sidebar
- [ ] ✅ Dark/light mode toggle with system preference
- [ ] ✅ Responsive design (mobile, tablet, desktop)
- [ ] ✅ Stripe TEST MODE: checkout, webhook, tier update
- [ ] ✅ Pricing page with 3 tier cards
- [ ] ✅ E2E test: signup → learn → quiz → pay → upgrade flow passes
- [ ] ✅ Backend tests: ≥ 80% coverage, all green
- [ ] ✅ Frontend build: no errors, TypeScript strict
- [ ] ✅ README: setup + API docs + Stripe test card info
- [ ] ✅ Zero hardcoded secrets (all in .env.example, no values)
- [ ] ✅ GitHub repo initialized, main branch has all code
- [ ] ✅ No console errors or warnings (dev mode)

**Result**: Phase 1 MVP COMPLETE — ready for Phase 2 (AI personalization)

---

## Testing & Deployment Strategy

### Local Testing
1. **Backend**: `pytest` (unit + integration tests)
2. **Frontend**: Manual testing + browser-use E2E
3. **Integration**: Full user journey (signup → learn → pay)

### Before Each Commit
- [ ] Tests pass (backend + frontend)
- [ ] No console errors
- [ ] Browser-use E2E passes
- [ ] Responsive design verified (3 breakpoints)
- [ ] Dark/light modes tested

### Git Workflow
- Feature branch off `main`
- Commit after each day's work
- Push to main (auto-merge on CI/CD, Phase 3)
- Each commit = working feature (1 feature per day)

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| OpenAI rate limit | Use gpt-3.5-turbo for testing; implement caching (Phase 3) |
| Stripe webhook timeout | Add retry logic; verify webhook signature |
| MDX parsing errors | Validate MDX on upload; error boundary on frontend |
| Database downtime | Use Neon backups; fallback error message |
| Performance degradation | Lighthouse monitoring; optimize images + code splitting |

---

**PHASE 1 COMPLETE** → Proceed to Phase 2 (AI personalization + Phase 2 spec)
