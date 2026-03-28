
# FatimaZehra AI Tutor - Specification Document

**Project:** FatimaZehra AI Tutor
**Type:** Course Companion FTE (Digital Full-Time Equivalent)
**Hackathon:** Panaversity Agent Factory Hackathon IV
**Course Topic:** Option D - Modern Python
**Date:** 2026-03-28
**Version:** 1.0

---

## 1. Executive Summary

FatimaZehra AI Tutor is a Digital Full-Time Equivalent educational tutor that teaches Python programming through 10 structured chapters. It operates 24/7 at a fraction of the cost of human tutoring, serving unlimited concurrent students with consistent, high-quality educational delivery.

### Key Metrics
- **Availability:** 168 hours/week (24/7)
- **Cost per Session:** $0.01 - $0.48
- **Concurrent Capacity:** Unlimited
- **Consistency:** 99%+ through Agent Skills and guardrails
- **Cost Savings:** 85-99% vs human tutoring

---

## 2. Course Content: Modern Python

**Selected Option:** D - Modern Python

### Chapter Curriculum

| # | Chapter Title | Difficulty | Tier Required | Topics |
|:---:|:---|:---:|:---:|:---|
| 1 | Python Basics & Variables | Beginner | Free | Data types, variables, operators, I/O |
| 2 | Control Flow & Loops | Beginner | Free | if/elif/else, for/while, break/continue |
| 3 | Functions & Scope | Beginner | Free | Function definition, parameters, return, scope |
| 4 | Object Oriented Programming | Intermediate | Premium | Classes, objects, inheritance, polymorphism |
| 5 | Modules & Packages | Intermediate | Premium | Importing, pip, virtual environments |
| 6 | File Handling | Intermediate | Premium | Reading/writing, CSV, JSON, context managers |
| 7 | Exception Handling | Intermediate | Premium | try/except, custom exceptions, debugging |
| 8 | APIs & Requests | Intermediate | Premium | HTTP, REST APIs, requests library, auth |
| 9 | Decorators & Generators | Advanced | Pro | Function decorators, generators, yield |
| 10 | Advanced Python Concepts | Advanced | Pro | Metaclasses, descriptors, async/await |

Each chapter contains:
- Complete theory with real-world examples
- Working Python code snippets
- 10 MCQ quiz questions with answer explanations
- Progressive difficulty curve

---

## 3. Architecture Specification

### 3.1 Phase 1: Zero-Backend-LLM (ChatGPT App)

```
User -> ChatGPT App -> Deterministic Backend -> Database/R2
```

**Backend Responsibilities (ZERO LLM calls):**
- Serve course content verbatim from storage
- Track progress and learning streaks
- Grade quizzes using rule-based answer keys
- Enforce freemium access control
- Navigate chapter sequencing

**ChatGPT Responsibilities (ALL intelligence):**
- Explain concepts at learner's appropriate level
- Provide analogies and examples
- Answer questions grounded in course content
- Encourage and motivate students
- Adapt tone and complexity to student

### 3.2 Phase 2: Hybrid Intelligence (Premium)

```
User -> ChatGPT App -> Backend -> LLM APIs (Premium only)
```

**Hybrid Features (max 2, premium-gated):**

1. **Adaptive Learning Path** (Pro tier)
   - Analyzes quiz patterns and progress data
   - Generates personalized chapter recommendations
   - Uses GPT-4o for reasoning over learning data
   - Cost: ~$0.020/request

2. **LLM-Graded Assessments** (Pro tier)
   - Evaluates free-form written answers
   - Provides detailed feedback beyond MCQ
   - Uses GPT-4o for evaluation
   - Cost: ~$0.015/request

### 3.3 Phase 3: Web Application

```
User -> Next.js App -> Backend APIs -> Database + LLM
```

**Full-featured standalone web application with:**
- All Phase 1 deterministic features
- All Phase 2 hybrid features
- AI Chat with GPT-4o streaming
- Stripe payment integration
- User dashboard with progress visualization
- Responsive design (mobile-first)

---

## 4. Technical Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| Web Frontend | Next.js 14 (App Router, TypeScript) | Phase 3 web application |
| ChatGPT Frontend | OpenAI Apps SDK | Phase 1 & 2 conversational UI |
| Backend | FastAPI (Python 3.12) | REST API server |
| Database | Neon PostgreSQL + SQLModel ORM | Data persistence |
| Content Storage | Cloudflare R2 | Course content & media |
| Authentication | NextAuth.js + JWT | Web app auth |
| OAuth | Google OAuth 2.1 | Social login |
| AI Model | OpenAI GPT-4o | Chat & hybrid features |
| Payments | Stripe (TEST MODE) | Subscription management |
| Frontend Hosting | Vercel | Web app deployment |
| Backend Hosting | HuggingFace Spaces | API deployment |
| Containers | Docker + Docker Compose | Development & production |
| Orchestration | Kubernetes | Production scaling |
| Testing | Playwright, pytest, Vitest | E2E, backend, frontend tests |

---

## 5. Required Features (6 Core Features)

### Feature 1: Content Delivery
- **Backend:** Serve chapter content verbatim from database/R2
- **ChatGPT/Web:** Display and explain at learner's level
- **API:** `GET /chapters` and `GET /chapters/{id}`

### Feature 2: Navigation
- **Backend:** Return next/previous chapter data
- **ChatGPT/Web:** Suggest optimal learning path
- **API:** `GET /chapters/{id}/next`, `GET /chapters/{id}/previous`

### Feature 3: Grounded Q&A
- **Backend:** Return relevant content sections via search
- **ChatGPT/Web:** Answer questions using only course content
- **API:** `GET /search?q={query}`

### Feature 4: Rule-Based Quizzes
- **Backend:** Grade quizzes using answer keys (no LLM)
- **ChatGPT/Web:** Present questions, encourage, explain answers
- **API:** `GET /quiz/{chapter_id}`, `POST /quiz/submit`

### Feature 5: Progress Tracking
- **Backend:** Store completion status, quiz scores, streaks
- **ChatGPT/Web:** Celebrate achievements, motivate continuation
- **API:** `GET /progress/{user_id}`, `POST /progress/mark-complete`

### Feature 6: Freemium Gate
- **Backend:** Check user tier and restrict access accordingly
- **ChatGPT/Web:** Explain premium benefits gracefully
- **Tiers:**
  - Free ($0): Chapters 1-3, basic quiz, 5 AI messages/day
  - Premium ($9.99/mo): All chapters, unlimited quiz, 50 messages/day
  - Pro ($19.99/mo): Everything + adaptive path, unlimited AI

---

## 6. Database Schema

### Tables

**users**
| Column | Type | Description |
|:---|:---|:---|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| name | VARCHAR | Display name |
| hashed_password | VARCHAR | Bcrypt hash |
| tier | ENUM | free/premium/pro |
| created_at | TIMESTAMP | Account creation |
| updated_at | TIMESTAMP | Last update |

**chapters**
| Column | Type | Description |
|:---|:---|:---|
| id | UUID | Primary key |
| number | INTEGER | Chapter order (1-10) |
| title | VARCHAR | Chapter title |
| slug | VARCHAR | URL slug |
| content_mdx | TEXT | MDX content |
| tier_required | ENUM | free/premium/pro |

**quiz_questions**
| Column | Type | Description |
|:---|:---|:---|
| id | UUID | Primary key |
| chapter_id | UUID | FK to chapters |
| question | TEXT | Question text |
| options | JSONB | Answer options A-D |
| correct_answer | VARCHAR | Correct option |
| explanation | TEXT | Answer explanation |

**quiz_attempts**
| Column | Type | Description |
|:---|:---|:---|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| chapter_id | UUID | FK to chapters |
| answers | JSONB | Student's answers |
| score | INTEGER | Score out of 10 |
| completed_at | TIMESTAMP | Submission time |

**user_progress**
| Column | Type | Description |
|:---|:---|:---|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| chapter_id | UUID | FK to chapters |
| completed | BOOLEAN | Completion status |
| last_accessed_at | TIMESTAMP | Last access |

**subscriptions**
| Column | Type | Description |
|:---|:---|:---|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| stripe_customer_id | VARCHAR | Stripe customer |
| stripe_sub_id | VARCHAR | Stripe subscription |
| plan | ENUM | premium/pro |
| status | VARCHAR | active/cancelled |
| expires_at | TIMESTAMP | Expiration date |

---

## 7. Agent Skills

Four runtime skills teach the Course Companion FTE how to perform educational tasks:

| Skill | File | Purpose | Trigger Keywords |
|:---|:---|:---|:---|
| Concept Explainer | `skills/concept-explainer/SKILL.md` | Explain concepts at various levels | "explain", "what is", "how does" |
| Quiz Master | `skills/quiz-master/SKILL.md` | Guide through quizzes with encouragement | "quiz", "test me", "practice" |
| Socratic Tutor | `skills/socratic-tutor/SKILL.md` | Guide learning through questions | "help me think", "I'm stuck" |
| Progress Motivator | `skills/progress-motivator/SKILL.md` | Celebrate achievements, maintain motivation | "my progress", "streak" |

---

## 8. API Specification

### Authentication
```
POST /auth/register          {email, password, name} -> {user_id, token}
POST /auth/login             {email, password} -> {token, user}
POST /auth/google-callback   {code} -> {token, user}
GET  /auth/me                -> {user profile + subscription}
POST /auth/logout            -> {}
POST /auth/change-password   {current, new} -> {message}
```

### Chapters
```
GET  /chapters               -> [{id, number, title, tier_required}]
GET  /chapters/{id}          -> {content_mdx, quiz_questions}
GET  /chapters/{id}/next     -> {next chapter}
GET  /chapters/{id}/previous -> {previous chapter}
```

### Quiz
```
GET  /quiz/{chapter_id}      -> {questions: [{id, question, options}]}
POST /quiz/submit            {chapter_id, answers[]} -> {score, results}
```

### Progress
```
GET  /progress/{user_id}     -> {chapters_completed, scores, streak}
POST /progress/mark-complete {chapter_id} -> {updated_progress}
```

### Search
```
GET  /search?q={query}       -> {relevant_sections[]}
```

### Payments
```
POST /payment/create-session {plan} -> {session_url}
POST /payment/webhook        (Stripe event) -> update tier
```

### AI (Phase 2 & 3)
```
POST /api/chat               {message, context, history} -> streaming response
POST /ai/learning-path       {user_id} -> {recommendations}
POST /ai/analyze-weakness    {user_id} -> {weak_topics}
```

---

## 9. Monetization Model

| Tier | Price | Features | Target Users |
|:---|---:|:---|:---|
| Free | $0 | Chapters 1-3, basic quiz, 5 AI/day | Trial users, students |
| Premium | $9.99/mo | All chapters, unlimited quiz, 50 AI/day | Serious learners |
| Pro | $19.99/mo | Everything + adaptive path, unlimited AI | Professional developers |

---

## 10. Deployment Architecture

| Service | Platform | URL |
|:---|:---|:---|
| Frontend | Vercel | https://frontend-blue-kappa-15.vercel.app |
| Backend | HuggingFace Spaces | https://naveed64-fatimazehra-ai-tutor-backend.hf.space |
| Database | Neon PostgreSQL | Serverless (US East) |

### Kubernetes Production Config
- Namespace: `fatimazehra-ai-tutor`
- Replicas: 2 (min) - 10 (max) with HPA
- Resources: 500m CPU, 512Mi Memory per pod
- Strategy: RollingUpdate (zero-downtime)
- Health: `/health` endpoint
- Ingress: Nginx Ingress Controller

---

## 11. Acceptance Criteria

### Phase 1 Acceptance
- [ ] Backend has ZERO LLM API calls
- [ ] All 6 required features implemented
- [ ] ChatGPT App works correctly
- [ ] Progress tracking persists across sessions
- [ ] Freemium gate correctly restricts content

### Phase 2 Acceptance
- [ ] Maximum 2 hybrid features implemented
- [ ] Hybrid features are premium-gated
- [ ] Hybrid features are user-initiated only
- [ ] Architecture clearly separates zero-LLM and hybrid
- [ ] Cost tracking per hybrid request

### Phase 3 Acceptance
- [x] Web frontend is functional and responsive
- [x] All 6 features implemented in web app
- [x] AI Chat with GPT-4o streaming works
- [x] Stripe payment integration functional
- [x] Progress tracking persists
- [x] Freemium gate enforced
- [x] Deployed to production (Vercel + HuggingFace)

---

## 12. Non-Functional Requirements

| Requirement | Target |
|:---|:---|
| Response time (p95) | < 500ms |
| Chat streaming latency | < 2s to first token |
| Uptime | 99.5% |
| Mobile responsive | All breakpoints |
| Accessibility | WCAG AA |
| Security | JWT + httpOnly cookies |
| Data encryption | TLS in transit, encrypted at rest |

---

**Document Version:** 1.0
**Prepared for:** Panaversity Agent Factory Development Hackathon IV
