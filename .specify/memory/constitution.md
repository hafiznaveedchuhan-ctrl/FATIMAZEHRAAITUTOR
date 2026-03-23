# FatimaZehra-AI-Tutor Constitution

A world-class Python learning platform for Panaversity Agent Factory Hackathon IV.

## Core Principles

### I. Spec-First Workflow
Every feature begins with a written spec — no code without approval. Architecture decisions are explicit and traceable. PHRs capture all significant work. Specs drive implementation; implementation does not drive specs.

### II. Smallest Viable Diff
Changes are minimal and focused. No refactoring unrelated code. No "nice-to-haves" or invented features. Each PR is independently testable. Prefer simplicity; avoid premature abstraction.

### III. Security-First
- **Secrets**: Never hardcoded. All via `.env`; `.env` never committed.
- **Auth**: JWT in httpOnly cookies; NextAuth.js enforced.
- **AI**: Phase 1 rule — OpenAI calls from frontend only (Next.js API route), NOT FastAPI backend. Backend never calls LLM in Phase 1.
- **Payments**: Stripe TEST MODE only during development (sk_test_, pk_test_ keys).
- **Data**: User data encrypted at rest; HTTPS everywhere.

### IV. Type Safety
- **Frontend**: TypeScript strict mode; no `any` without JSDoc.
- **Backend**: Python type hints on all functions; Ruff linting enforced.
- **Database**: SQLModel ORM; no raw SQL except complex queries (documented).

### V. Testing Mandatory
- **Backend**: pytest; coverage ≥ 80%; integration tests for API endpoints.
- **Frontend**: Vitest for components; browser-use for E2E flows after every feature.
- **Gate**: All tests pass before commit; red tests block pushes.

### VI. Accessibility & UX
- Dark mode default (WCAG AA compliance).
- Light mode toggle with system preference detection.
- Mobile-first responsive design (breakpoints: 640, 768, 1024, 1280).
- All interactive elements keyboard-accessible.
- 3-second page load time target (Lighthouse ≥ 90).

### VII. Observable Systems
- **Logging**: Structured JSON logs; backend logs to stdout; frontend logs to Sentry.
- **Metrics**: Request latency, error rates, user events.
- **Traces**: Distributed tracing via OpenTelemetry (optional Phase 3).
- **Monitoring**: Sentry alerts on errors; no silent failures.

### VIII. Git Discipline
- **Commit format**: `feat: [feature name] - FatimaZehra-AI-Tutor`
- **One feature per commit**: Atomic, reversible.
- **Auto-push**: After passing tests, push to `main` immediately.
- **No force-push**: History is sacred; revert instead.

### IX. Phase-Gated Features
- **Phase 1 (MVP)**: Auth, chapters, quiz, Stripe free/paid tiers.
- **Phase 2**: Backend AI features (weak-point analysis, personalized paths, email coach).
- **Phase 3**: Production (Docker, K8s, admin dashboard, SEO, monitoring).
- Code for later phases does NOT exist in Phase 1.

### X. No Invented Data
- All APIs, schemas, and contracts are explicit in specs.
- No mock data; all test data is seeded from SQL fixtures.
- External dependencies (OpenAI, Stripe) are real services or test mode.
- APIs match contract exactly; no surprises.

## Technology Standards

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion (spring physics, staggered)
- **Forms**: React Hook Form + Zod validation
- **State**: React Context (no Redux for MVP)
- **API calls**: fetch + SWR caching
- **Code blocks**: Prism.js with syntax highlighting
- **Charts**: Recharts (progress rings, bar charts)
- **Icons**: Lucide React

### Backend Stack
- **Framework**: FastAPI (async)
- **ORM**: SQLModel (pydantic + SQLAlchemy)
- **Database driver**: asyncpg (async PostgreSQL)
- **Auth**: JWT; python-jose + passlib
- **Validation**: Pydantic v2
- **Linting**: Ruff
- **Type checking**: Pyright or mypy
- **Testing**: pytest + pytest-asyncio

### Database
- **Engine**: PostgreSQL 16+ (Neon)
- **Migrations**: Alembic
- **Connection pooling**: asyncpg built-in
- **Backups**: Neon automated daily

### Infrastructure
- **Containers**: Docker (Python 3.12, Node 20)
- **Orchestration**: Kubernetes (namespace: `fatimazehra-ai-tutor`)
- **Local K8s**: Docker Desktop or Minikube
- **Secrets**: K8s secrets (no hardcoded keys)

## Development Workflow

1. **Spec → PR review** (user/team approves, no code yet)
2. **Feature branch** off `main`
3. **Code + tests** (red-green-refactor cycle)
4. **Browser-use test** (screenshot proof; if fail → fix → retest)
5. **pytest/vitest** (all green)
6. **Commit** (atomic, formatted message)
7. **Push to main** (auto-merge if tests pass)

## Review & Quality Gates

- **Code review**: All PRs require approval from team; no self-merge.
- **Tests**: 100% tests must pass; coverage ≥ 80% for backend.
- **Linting**: Ruff, Pyright, ESLint, TypeScript strict.
- **Performance**: LCP < 2.5s, CLS < 0.1 (Lighthouse ≥ 90).
- **Security**: No hardcoded secrets; OWASP Top 10 checked; Dependabot enabled.

## Documentation

- **Code**: Inline comments for non-obvious logic only.
- **APIs**: OpenAPI schema auto-generated from FastAPI.
- **README**: Setup, Docker, K8s, troubleshooting.
- **PHRs**: Every significant decision recorded.
- **ADRs**: Architectural decisions documented (e.g., auth strategy, data model).

## Deployment

- **Local**: `docker-compose up --build`
- **K8s**: `kubectl apply -f k8s/`
- **Rollback**: `kubectl rollout undo deployment/frontend` (immediate)
- **Monitoring**: Sentry dashboards, Prometheus metrics (Phase 3)

## Governance

**This Constitution is the source of truth.** All decisions align with these principles. Changes to Constitution require team consensus and are documented as amendments. Every developer must read and acknowledge this Constitution before starting.

**Version**: 1.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-23
