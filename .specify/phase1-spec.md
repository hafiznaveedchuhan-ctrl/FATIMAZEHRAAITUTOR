# Phase 1 Specification: FatimaZehra-AI-Tutor MVP

**Objective**: Core learning platform with auth, free/paid chapters, quiz, and Stripe payments.
**Duration**: 10 days
**Go/No-Go**: All acceptance criteria passing + browser-use E2E flow successful

---

## 1. Scope & Non-Goals

### In Scope
- User authentication (email + Google OAuth)
- 10 Python chapters (MDX content + 10 MCQs each)
- Free tier: Chapters 1–3, limited AI chat (50% tokens)
- Premium tier: $9.99/mo, all 10 chapters, 5 AI chats/day
- Pro tier: $19.99/mo, all + future weak-point analysis (Phase 2)
- Quiz engine with scoring and result storage
- User progress tracking (completion %, streaks)
- Dark/light mode with system preference
- Responsive design (mobile-first, all breakpoints)
- Stripe TEST MODE checkout + webhook
- OpenAI GPT-4 streaming chat (frontend only, via Next.js API route)
- Sentry error tracking (frontend + backend)

### Non-Scope (Phase 2+)
- Backend AI analysis (weak-point detection, personalized learning paths)
- Email notifications (Resend integration, weekly coach summaries)
- Admin dashboard (user metrics, revenue, chapter analytics)
- Certificate generation (jsPDF, R2 storage)
- Rate limiting (Redis integration)
- SEO (sitemap, robots.txt, metadata optimization)
- Docker/Kubernetes (Phase 3)
- Multi-language support
- Database migrations (Alembic; auto-run in Phase 1)

### External Dependencies
- **OpenAI**: GPT-4 API (chat completions, streaming)
- **Stripe**: Payments, TEST MODE keys
- **Neon**: PostgreSQL cloud database
- **NextAuth.js**: OAuth + session management
- **Upstash**: Redis (future rate limiting; stubbed in Phase 1)
- **Sentry**: Error tracking
- **Resend**: Email (Phase 2+; stubbed)

---

## 2. Feature Breakdown

### 2.1 Authentication

**User Stories**:
- AS a new user, I want to sign up with email/password so I can access the platform
- AS a user, I want to log in with Google OAuth so I don't manage passwords
- AS a logged-in user, I want to see my name and subscription tier
- AS a user, I want to log out securely

**API Contracts**:

```
POST /auth/register
  Input:  { email: string, password: string, name: string }
  Output: { user_id: uuid, email: string, token: string }
  Errors: 409 (email exists), 400 (invalid), 500

POST /auth/login
  Input:  { email: string, password: string }
  Output: { user_id: uuid, email: string, token: string }
  Errors: 401 (invalid creds), 400, 500

POST /auth/google-callback
  Input:  { code: string }
  Output: { user_id: uuid, email: string, token: string }
  Errors: 401 (invalid code), 400, 500

GET /auth/me
  Output: { user_id: uuid, email: string, name: string, tier: "free"|"premium"|"pro", subscription_expires_at: null|ISO8601 }
  Errors: 401 (unauthorized), 500

POST /auth/logout
  Output: {}
  Errors: 401, 500
```

**Database**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  hashed_password VARCHAR,  -- NULL for OAuth-only
  tier VARCHAR DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro')),
  oauth_provider VARCHAR,  -- 'google', NULL for email-only
  oauth_id VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Frontend**:
- **Pages**: `/login`, `/signup`, `/logout`
- **Components**: Split-screen (form left, code illustration right), Google button, password validation (min 8 chars, 1 upper, 1 digit)
- **Auth state**: NextAuth.js session + React Context
- **Cookies**: JWT in httpOnly, secure cookie (NextAuth.js default)
- **Error handling**: Toast notifications for invalid email, weak password, duplicate email

**Backend**:
- Bcrypt hashing (cost 10)
- JWT token expiry: 7 days
- Refresh token: httpOnly cookie, 30 days
- NextAuth.js adapter for user sessions
- Google OAuth config (OAUTH_GOOGLE_ID, OAUTH_GOOGLE_SECRET in .env)

**Acceptance Criteria**:
- [ ] Email signup works; password hashed; user created in DB
- [ ] Email login works; JWT token returned
- [ ] Google OAuth callback works; user created or logged in
- [ ] GET /auth/me returns current user + tier
- [ ] Logout clears session cookie
- [ ] Password reset NOT in Phase 1 (email recovery Phase 2+)
- [ ] Browser-use test: signup → login flow completes

---

### 2.2 Chapters (Content + Metadata)

**Chapter List**:
1. Python Basics & Variables
2. Control Flow & Loops
3. Functions & Scope
4. Object-Oriented Programming
5. Modules & Packages
6. File Handling
7. Exception Handling
8. APIs & Requests
9. Decorators & Generators
10. Advanced Python

**User Stories**:
- AS a free user, I want to see all 10 chapters but only access 1–3
- AS a premium user, I want to access all 10 chapters
- AS a user, I want to read a chapter in MDX format with code examples and syntax highlighting
- AS a user, I want to see a progress indicator (e.g., "3/10 completed, 85% on Chapter 2 quiz")

**API Contracts**:

```
GET /chapters
  Output: [
    {
      id: uuid,
      number: int (1-10),
      title: string,
      slug: string (e.g., "python-basics"),
      tier_required: "free"|"premium"|"pro",
      progress: { completed: bool, quiz_score: int|null, last_accessed_at: ISO8601|null },
      created_at: ISO8601
    }
  ]
  Errors: 401 (unauthorized), 500

GET /chapters/{id}
  Output: {
    id: uuid,
    number: int,
    title: string,
    slug: string,
    content_mdx: string (MDX with frontmatter),
    tier_required: "free"|"premium"|"pro",
    quiz_count: int (always 10),
    quiz_questions: [ see 2.3 ],
    created_at: ISO8601
  }
  Errors: 401, 403 (tier not allowed), 404, 500
```

**Database**:
```sql
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INT UNIQUE NOT NULL (1-10),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content_mdx TEXT NOT NULL,  -- MDX with code, examples
  tier_required VARCHAR DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Content Format (MDX)**:
```mdx
---
chapter: 1
title: "Python Basics & Variables"
slug: "python-basics"
---

# Python Basics & Variables

Variables store data. Use descriptive names.

## Types

Python has built-in types: int, float, str, bool, list, dict, tuple, set.

\`\`\`python
# Example
age = 25
name = "Alice"
is_student = True
\`\`\`

[More content, examples, diagrams]
```

**Frontend**:
- **Pages**: `/learn` (chapter list grid), `/learn/[slug]` (chapter viewer)
- **Components**: Chapter card (lock icon if premium-gated), MDX renderer (remark + rehype), Prism syntax highlighting, copy-button on code blocks
- **Tier gating**: Free users see "Lock" overlay on chapters 4–10; click to upgrade
- **Progress ring**: Visual progress on each card (Recharts)

**Backend**:
- Serve MDX as-is from DB; frontend compiles
- GET /chapters: no filtering by tier (all visible); filtering happens on tier check
- GET /chapters/{id}: check user tier; return 403 if insufficient
- MDX validation on upload (Phase 2: admin endpoint)

**Acceptance Criteria**:
- [ ] GET /chapters returns all 10 chapters with correct tier_required
- [ ] GET /chapters/{id} returns 403 for free user accessing chapter 4+
- [ ] MDX content displays correctly with syntax highlighting
- [ ] Chapter cards show lock icon for gated chapters
- [ ] Progress ring shows completion % (calculated from quiz_attempts)
- [ ] Browser-use test: navigate chapter list → click chapter 1 → read content → see quiz button

---

### 2.3 Quiz Engine

**User Stories**:
- AS a user, I want to answer 10 MCQs per chapter
- AS a user, I want to see my score immediately after submitting
- AS a user, I want to see correct answers + explanations for wrong answers
- AS a user, I want to retake a quiz to improve my score
- AS a premium user, I want my quiz attempts saved so I can review them later

**API Contracts**:

```
GET /quiz/{chapter_id}
  Output: {
    chapter_id: uuid,
    questions: [
      {
        id: uuid,
        question: string,
        options: ["A", "B", "C", "D"],
        // correct_answer NOT returned before submission
      }
    ]
  }
  Errors: 401, 403 (tier), 404, 500

POST /quiz/submit
  Input: {
    chapter_id: uuid,
    answers: [{ question_id: uuid, selected_option: int (0-3) }]
  }
  Output: {
    score: int (0-100),
    results: [
      {
        question_id: uuid,
        selected_option: int,
        correct_option: int,
        explanation: string,
        is_correct: bool
      }
    ],
    passed: bool (score >= 70)
  }
  Errors: 401, 403, 404, 500
```

**Database**:
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,  -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer INT NOT NULL (0-3),
  explanation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  answers JSONB NOT NULL,  -- [{ question_id, selected }]
  score INT NOT NULL (0-100),
  passed BOOLEAN,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, chapter_id) ON CONFLICT UPDATE
);
```

**Frontend**:
- **Pages**: `/learn/[slug]/quiz`
- **Components**: MCQ card, timer (optional Phase 2), progress bar, score reveal (animated number counter), explanation cards
- **UX**: One question at a time or all visible; skip option; submit disables until required answered
- **Scoring**: (correct / 10) * 100
- **Animations**: Fade-in for results, spring bounce for score number

**Backend**:
- Validate all question_ids exist for chapter
- Check answer range (0–3)
- Calculate score
- Save attempt; if retake, UPDATE (keep latest attempt)
- Return results with correct answer + explanation

**Acceptance Criteria**:
- [ ] GET /quiz/{chapter_id} returns 10 questions; correct_answer NOT in response
- [ ] POST /quiz/submit validates all answers; calculates score
- [ ] Score ≥ 70 = passed; displayed with celebration animation
- [ ] Explanation shows for each wrong answer
- [ ] Quiz attempt saved to DB; can be retrieved later
- [ ] Retaking quiz overwrites previous attempt
- [ ] Browser-use test: view quiz → answer 8/10 correct → see score 80%

---

### 2.4 Progress Tracking

**User Stories**:
- AS a user, I want to see which chapters I've completed
- AS a user, I want to see my quiz scores and streaks (consecutive days)
- AS a user, I want to see my overall progress (% chapters done, avg quiz score)

**API Contracts**:

```
GET /progress/{user_id}
  Output: {
    user_id: uuid,
    chapters_completed: int,
    chapters_total: int,
    completion_percentage: int,
    quiz_scores: [
      { chapter_id: uuid, chapter_number: int, score: int, passed: bool, attempted_at: ISO8601 }
    ],
    average_score: int,
    streak_days: int,
    last_activity_at: ISO8601
  }
  Errors: 401, 404, 500

POST /progress/mark-complete
  Input: { chapter_id: uuid }
  Output: { success: bool, updated_progress: { ... } }
  Errors: 401, 403, 404, 500
```

**Database**:
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  completed BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, chapter_id)
);
```

**Frontend**:
- **Pages**: `/dashboard`
- **Components**: Stats row (animated counters: chapters done, avg score, streak), progress rings (Recharts), activity feed
- **Triggers**: Mark chapter complete when user passes quiz (score ≥ 70); update last_accessed_at on chapter view
- **Streak**: Calculate from quiz_attempts (days with attempts in sequence)

**Backend**:
- GET /progress: join user_progress + quiz_attempts; calculate streak from date grouping
- POST /progress/mark-complete: upsert user_progress (completed=true)
- Streak logic: count consecutive days with quiz_attempts; break on gap

**Acceptance Criteria**:
- [ ] GET /progress returns accurate chapter completion count
- [ ] Average score calculated correctly
- [ ] Streak counts consecutive days with quiz attempts
- [ ] Dashboard displays stats with animated counters
- [ ] Completion checked on quiz pass; progress updates immediately
- [ ] Browser-use test: complete chapter 1 quiz → check dashboard → streak = 1 day

---

### 2.5 Payment & Tier Gating

**User Stories**:
- AS a free user, I want to see a pricing page with upgrade options
- AS a user, I want to upgrade to Premium ($9.99/mo) or Pro ($19.99/mo) via Stripe checkout
- AS a premium user, I want access to chapters 4–10
- AS a pro user, I want access to all chapters + AI analysis (future)

**Tiers**:
| Tier | Free | Premium | Pro |
|---|---|---|---|
| Price | $0 | $9.99/mo | $19.99/mo |
| Chapters | 1–3 | 1–10 | 1–10 |
| AI Chat | 50% tokens | 5 calls/day | Unlimited |
| Weak Analysis | ✗ | ✗ | ✓ (Phase 2) |

**API Contracts**:

```
POST /payment/create-session
  Input: { plan: "premium"|"pro" }
  Output: { session_url: string (Stripe checkout URL) }
  Errors: 400 (invalid plan), 401, 500

POST /payment/webhook
  Input: Stripe event (raw JSON, signature verified)
  Output: { success: bool }
  Actions:
    - payment_intent.succeeded → update user.tier, create subscription record
    - invoice.payment_failed → notify user (future)
  Errors: 400 (invalid sig), 500

GET /payment/subscription
  Output: { plan: "free"|"premium"|"pro", expires_at: ISO8601|null, auto_renew: bool }
  Errors: 401, 500
```

**Database**:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_customer_id VARCHAR NOT NULL,
  stripe_subscription_id VARCHAR,
  plan VARCHAR CHECK (plan IN ('free', 'premium', 'pro')),
  status VARCHAR (active, cancelled, expired),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id)
);
```

**Stripe Setup**:
- **Mode**: TEST (sk_test_..., pk_test_...)
- **Webhook endpoint**: `POST /payment/webhook`
- **Webhook secret**: .env STRIPE_WEBHOOK_SECRET
- **Products**: Premium (monthly), Pro (monthly)
- **Events**: checkout.session.completed (subscription activated), customer.subscription.deleted (cancellation/downgrade)
- **Note**: `checkout.session.completed` is the correct event for Stripe Checkout subscription flows. `payment_intent.succeeded` applies to one-time payments only.

**Frontend**:
- **Pages**: `/pricing`, `/checkout` (Stripe-hosted)
- **Components**: 3-tier card layout (animated comparisons), Stripe button
- **UX**: Toggle monthly/annual (Phase 2); clear "current plan" indicator
- **Test flow**: Click "Upgrade to Premium" → Stripe checkout → Enter test card 4242 4242 4242 4242 → Redirected to `/dashboard` with "Premium" badge
- **Checkout button**: Stripe Elements or Stripe Checkout hosted page

**Backend**:
- Verify Stripe webhook signature (stripe.Webhook.construct_event)
- On successful payment: update user.tier, create subscription record, sync with Neon
- On failure: log error; Phase 2 will add email notification

**Acceptance Criteria**:
- [ ] Pricing page shows 3 tiers with correct prices
- [ ] Checkout button creates Stripe session; redirects to checkout.stripe.com
- [ ] Webhook receives checkout.session.completed; updates user.tier to premium/pro
- [ ] User tier checked on chapter view; Premium users access chapters 4–10
- [ ] Free users see lock + "Upgrade" button on chapter 4
- [ ] Subscription status shows on dashboard
- [ ] Browser-use test: click "Upgrade to Premium" → pay with 4242 card → unlock chapter 4

---

### 2.6 AI Chat (Frontend-Only GPT-4)

**User Stories**:
- AS a user, I want to ask questions about the current chapter
- AS a premium user, I want 5 AI chats per day
- AS a free user, I want limited AI (50% tokens)
- AS a pro user, I want unlimited AI chats

**API Contracts**:

```
POST /chat
  Input: { message: string, chapter_id: uuid|null, conversation_history: [] }
  Output: { response: string (streaming SSE), stop_reason: "end_turn"|"length"|"error" }
  Errors: 401, 429 (rate limit), 500

GET /chat/rate-limit
  Output: { remaining: int, reset_at: ISO8601 }
  Errors: 401, 500
```

**Frontend**:
- **Pages**: `/chat` (full-page) or sidebar on `/learn/[slug]` (collapsible)
- **Components**: Message list, input box, streaming response with cursor animation, code block with copy button
- **OpenAI setup**: Client calls Next.js API route (`/api/chat`), which calls OpenAI and streams response
- **Rate limiting**: Client-side counter (5/day for premium); server verifies
- **Context**: If chapter_id provided, system prompt includes chapter summary
- **UX**: Auto-scroll to latest message, show typing indicator, disable send during response

**Backend (Next.js API Route)**:
```javascript
// /app/api/chat/route.js
export async function POST(req) {
  const { message, chapter_id } = await req.json();
  // Check auth + rate limit
  // Build system prompt (include chapter context if provided)
  // Call OpenAI streaming API
  // Return SSE stream to client
}
```

**OpenAI Setup**:
- Model: gpt-4-turbo or gpt-4 (test: gpt-3.5-turbo for cost)
- System prompt: "You are a Python tutor for beginners..."
- Max tokens: 500 per response
- Temperature: 0.7

**Cost Analysis**:
- Estimate: 1000 tokens per 5 conversations = $0.015 per user/day
- 100 users: $1.50/day = $45/month

**Acceptance Criteria**:
- [ ] Chat endpoint accepts message + chapter_id
- [ ] Response streams to client (SSE, real-time)
- [ ] Code blocks formatted with Prism syntax highlighting
- [ ] Free users can send 5 messages (50% token budget)
- [ ] Premium users can send 5 chats/day
- [ ] Pro users unlimited
- [ ] Rate limit enforced on server
- [ ] Browser-use test: open chat → ask "What is a variable?" → see streaming response

---

### 2.7 Dark/Light Mode

**User Stories**:
- AS a user, I want dark mode by default
- AS a user, I want to toggle to light mode if I prefer
- AS a user, I want my preference saved across sessions

**Frontend**:
- **Library**: next-themes (Tailwind CSS aware)
- **Storage**: localStorage (theme preference)
- **System detect**: Respect prefers-color-scheme on first visit
- **Tailwind**: `dark:` utility classes
- **Toggle**: Moon/sun icon in navbar
- **Colors**:
  - Dark: bg `#0A0A0B`, surface `#111113`, border `#1F1F23`, accent `#6C63FF`
  - Light: bg `#FAFAFA`, surface `#FFFFFF`, border `#E4E4E7`, accent `#6C63FF`

**Acceptance Criteria**:
- [ ] Default is dark mode
- [ ] Toggle switches theme
- [ ] Preference saved in localStorage
- [ ] System preference respected on first visit
- [ ] All pages readable in both modes (contrast ≥ WCAG AA)

---

## 3. UI/UX Summary

**Pages**:
1. `/` — Landing (hero, features, pricing, CTA)
2. `/login`, `/signup` — Auth forms
3. `/dashboard` — Stats, progress, recent activity
4. `/learn` — Chapter list (grid, lock icons, progress %)
5. `/learn/[slug]` — Chapter viewer (MDX + code + sidebar outline + AI chat)
6. `/learn/[slug]/quiz` — Quiz flow (MCQ, timer optional, score reveal)
7. `/pricing` — 3-tier pricing, upgrade buttons
8. `/chat` — Full-page AI chat
9. `/profile` — User profile, subscription status, change password (Phase 2)

**Components**:
- `NavBar` (logo, user menu, theme toggle, auth status)
- `Footer` (links, socials, copyright)
- `ChapterCard` (lock, progress %, title)
- `MCQCard` (question, options, radio)
- `ProgressRing` (Recharts)
- `CodeBlock` (Prism, copy button)
- `ChatMessage` (user/assistant, code blocks, animations)
- `Toast` (error/success notifications)

**Animations**:
- Page transitions: fade + slide-up, 0.3s easeOut
- Card hover: scale 1.02
- Chat message: fade-in from bottom
- Score reveal: spring bounce, number counter
- Skeleton: shimmer gradient

---

## 4. Database & Migrations

**Alembic Setup**:
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head  # Runs on backend startup
```

**Tables Summary**:
| Table | Purpose |
|---|---|
| users | User accounts |
| chapters | Course content |
| quiz_questions | MCQs (10 per chapter) |
| quiz_attempts | Quiz submissions + scores |
| user_progress | Chapter completion tracking |
| subscriptions | Payment status |

---

## 5. Testing Strategy

### Backend (pytest)
```bash
pytest backend/tests/ -v --cov=backend/src --cov-report=term-missing
```

**Test files**:
- `test_auth.py` — signup, login, OAuth, JWT validation
- `test_chapters.py` — GET chapters, tier gating
- `test_quiz.py` — submit quiz, scoring, storage
- `test_progress.py` — mark complete, streak calculation
- `test_payments.py` — Stripe webhook, tier update

**Acceptance**: Coverage ≥ 80%, all tests green

### Frontend (browser-use)
```bash
# Manual workflow (automated with browser-use skill)
1. Load localhost:3000
2. Signup email + password
3. Login
4. View chapter list
5. Open chapter 1
6. Take quiz (8/10 correct)
7. View dashboard (streak = 1)
8. Click "Upgrade to Premium"
9. Stripe checkout with 4242 4242 4242 4242
10. Unlock chapter 4
11. Open chapter 4 → new content visible
```

**Acceptance**: Screenshot proof of each step; all green before merge to main

---

## 6. Acceptance Criteria (Phase 1 Go/No-Go)

- [ ] All APIs working (Postman/curl tested)
- [ ] Auth flow: signup → login → logout
- [ ] Free tier: chapters 1–3 accessible; 4–10 locked with upgrade CTA
- [ ] Premium tier: all chapters accessible after stripe webhook
- [ ] Quiz: submit 10 answers → see score + explanations
- [ ] Progress: dashboard shows completion %, quiz scores, streak
- [ ] AI chat: streaming response from OpenAI (gpt-4-turbo or 3.5)
- [ ] Dark mode: default, toggle working, preference persisted
- [ ] Browser-use E2E: full signup → learn → quiz → payment → unlock flow succeeds
- [ ] Stripe TEST MODE: webhook updates tier on payment_intent.succeeded
- [ ] Zero hardcoded secrets; all in .env.example (no values)
- [ ] Sentry: errors logged (optional dashboard review)
- [ ] README: setup, env vars, API docs, Stripe test card instructions
- [ ] No warnings on `npm run build` (frontend) or `pytest` (backend)

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| OpenAI API quota/cost | High | Test with gpt-3.5-turbo; rate limiting (5 calls/day) |
| Stripe webhook timeout | Medium | Retry logic; idempotent webhook handler |
| MDX parsing fails | Medium | Validate MDX on backend; error boundary on frontend |
| JWT token expiry | Low | Auto-refresh on 401; clear session on logout |
| Database downtime | High | Neon auto-backups; fallback error message |

---

## 8. Success Metrics (Go/No-Go Check)

✅ **Phase 1 Complete** when:
1. All acceptance criteria passing
2. Browser-use E2E test succeeds (screenshots)
3. Jest/pytest coverage ≥ 80%
4. Stripe TEST MODE payment flow works (4242 card)
5. User can signup → learn → quiz → upgrade tier in one session
6. README deployed with setup instructions

**Timeline**: 10 days (1 feature per day, Day 10 = integration + final tests)

---

**Next**: Phase 2 spec (`phase2-spec.md`) — AI features unlocked after Phase 1 complete.
