# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

---

## Project: FatimaZehra-AI-Tutor

**Official Name**: FatimaZehra-AI-Tutor
**Package**: `fatimazehra-ai-tutor`
**Hackathon**: Panaversity Agent Factory Hackathon IV
**GitHub**: https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR
**Branch**: `main`

### Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Backend | FastAPI (Python 3.12) |
| Database | Neon PostgreSQL + SQLModel ORM |
| Cache | Upstash Redis |
| Auth | NextAuth.js + JWT (httpOnly cookies) |
| OAuth | Google OAuth 2.1 |
| AI | OpenAI GPT-4 + GPT-4 Turbo |
| Payments | Stripe TEST MODE (sk_test_..., pk_test_...) |
| Storage | Cloudflare R2 |
| Email | Resend |
| Monitoring | Sentry (frontend + backend) |
| Containers | Docker + Docker Compose |
| Orchestration | Kubernetes (Docker Desktop or Minikube) |
| Testing | Playwright (browser-use), pytest (backend), Vitest (frontend) |

### Folder Structure

```
FatimaZehra-AI-Tutor/
├── frontend/                  # Next.js 14 app
├── backend/                   # FastAPI application
├── k8s/                       # Kubernetes manifests
├── .specify/                  # Spec files + templates
│   ├── memory/
│   │   └── constitution.md
│   ├── phase1-spec.md         # MVP
│   ├── phase2-spec.md         # AI personalization
│   ├── phase3-spec.md         # Production + K8s
│   ├── ui-spec.md
│   ├── task-plan.md
│   └── templates/
├── history/                   # PHRs + ADRs
│   ├── prompts/
│   └── adr/
├── docker-compose.yml         # Local dev (postgres + redis)
├── docker-compose.prod.yml    # Production config
├── CLAUDE.md                  # This file
├── README.md                  # Setup + API docs
└── .env.example               # All env vars (no secrets)
```

### API Endpoints (Backend)

**Authentication**:
```
POST   /auth/register          {email, password, name} → {user_id, token}
POST   /auth/login             {email, password} → {token, user}
POST   /auth/google-callback   {code} → {token, user}
GET    /auth/me                → current user + subscription
POST   /auth/logout            → {}
```

**Chapters**:
```
GET    /chapters               → [{id, number, title, tier_required, ...}]
GET    /chapters/{id}          → {content_mdx, quiz_questions, ...}
```

**Quiz**:
```
POST   /quiz/submit            {chapter_id, answers[]} → {score, results}
GET    /quiz/{chapter_id}      → questions for chapter
```

**Progress**:
```
GET    /progress/{user_id}     → {chapters_completed, quiz_scores, streak}
POST   /progress/mark-complete {chapter_id} → {updated_progress}
```

**Payments**:
```
POST   /payment/create-session {plan: "premium"|"pro"} → {session_url}
POST   /payment/webhook        (Stripe) → update subscription
```

**AI (Phase 2+)**:
```
POST   /ai/analyze-weaknesses  {user_id} → {weak_topics, recommendations}
GET    /ai/learning-path       → personalized chapters
POST   /ai/chat                {message, context} → streaming response
```

### Database Schema

| Table | Columns | Purpose |
|---|---|---|
| `users` | id, email, name, hashed_password, tier(free/premium/pro), created_at, updated_at | User accounts |
| `chapters` | id, number, title, slug, content_mdx, tier_required, created_at | Python course content |
| `quiz_questions` | id, chapter_id, question, options(jsonb), correct_answer, explanation | Quiz MCQs |
| `quiz_attempts` | id, user_id, chapter_id, answers(jsonb), score, completed_at | Quiz submissions |
| `user_progress` | id, user_id, chapter_id, completed, last_accessed_at | Completion tracking |
| `subscriptions` | id, user_id, stripe_customer_id, stripe_sub_id, plan, status, expires_at | Payment tracking |

### Freemium Tiers

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 | Chapters 1–3, basic quiz, 50% AI chat tokens |
| **Premium** | $9.99/mo | All 10 chapters, unlimited quiz, 5 AI chats/day |
| **Pro** | $19.99/mo | Everything + weak-point analysis, personalized paths, email coach |

### Environment Variables

All in `.env.example` (never commit `.env`):

```
# OpenAI
OPENAI_API_KEY=

# Stripe TEST MODE
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql+asyncpg://...

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redis
REDIS_URL=

# Monitoring
SENTRY_DSN=

# Email
RESEND_API_KEY=
```

### Git Workflow

- **Commit format**: `feat: [feature name] - FatimaZehra-AI-Tutor`
- **Push**: To `main` after every major feature passes tests
- **Branching**: Feature branches from `main`, PR → `main`
- **Test gates**: Browser-use + pytest + Vitest must pass before commit

### Stripe Testing

**TEST MODE ONLY** — Development uses `sk_test_` and `pk_test_` keys.

Test card: `4242 4242 4242 4242`
Any future expiry date, any 3-digit CVC

### Development Phases

| Phase | Focus | Duration |
|---|---|---|
| **Phase 1** | MVP auth, chapters, quiz, stripe checkout | 10 days |
| **Phase 2** | Backend AI: weak-point analysis, learning paths, email coach | 5 days |
| **Phase 3** | Production: Docker, K8s, admin dashboard, SEO, monitoring | 5 days |

See `.specify/phase1-spec.md`, `.specify/phase2-spec.md`, `.specify/phase3-spec.md` for detailed specs.

### Python Course Chapters

| # | Chapter Title | Tier |
|---|---|---|
| 1 | Python Basics & Variables | Free |
| 2 | Control Flow & Loops | Free |
| 3 | Functions & Scope | Free |
| 4 | Object Oriented Programming | Premium |
| 5 | Modules & Packages | Premium |
| 6 | File Handling | Premium |
| 7 | Exception Handling | Premium |
| 8 | APIs & Requests | Premium |
| 9 | Decorators & Generators | Pro |
| 10 | Advanced Python Concepts | Pro |

Each chapter contains:
- Complete theory with real-world examples
- Working code snippets
- 10 MCQ quiz questions with answers
- Difficulty: Beginner → Advanced

### Kubernetes Configuration

| Setting | Value |
|---|---|
| Namespace | fatimazehra-ai-tutor |
| Min Replicas | 2 |
| Max Replicas | 10 |
| Frontend Port | 3000 |
| Backend Port | 8000 |
| Strategy | RollingUpdate |
| CPU Limit | 500m |
| Memory Limit | 512Mi |
| Health Check | /health endpoint |
| Ingress | Nginx Ingress Controller |