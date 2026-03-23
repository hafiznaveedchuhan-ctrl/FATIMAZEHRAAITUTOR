# FatimaZehra-AI-Tutor

A world-class Python learning platform powered by AI coaching. Learn 10 chapters of Python with personalized learning paths, interactive quizzes, and GPT-4-powered AI assistance.

**Hackathon**: Panaversity Agent Factory Hackathon IV
**GitHub**: https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR

---

## Features

### Phase 1: MVP (Current)
✅ **Auth**: Email signup/login + Google OAuth (NextAuth.js)
✅ **10 Python Chapters**: Free (1-3), Premium (all), with MDX content
✅ **Interactive Quizzes**: 10 MCQs per chapter, scoring, streak tracking
✅ **AI Tutor**: GPT-4 streaming chat, context-aware assistance
✅ **Progress Tracking**: Dashboard with stats, completion %, streaks
✅ **Payments**: Stripe checkout, tier upgrades (Free, Premium $9.99, Pro $19.99)
✅ **Dark/Light Mode**: Beautiful UI with WCAG AA accessibility
✅ **Responsive**: Mobile-first design (all breakpoints tested)

### Phase 2: AI Personalization (Planned)
🔜 **Weak-Point Analysis**: GPT-4 reads quiz history, identifies gaps
🔜 **Personalized Learning Path**: AI-ranked chapter recommendations
🔜 **Spaced Repetition**: Smart review scheduling
🔜 **Email Coach**: Weekly progress summaries + tips

### Phase 3: Production Ready (In Progress)
✅ **Docker & Kubernetes**: Dockerfiles, docker-compose dev/prod, full K8s manifests (namespace, deployments, services, ingress, HPA)
🔜 **Admin Dashboard**: Analytics, revenue, user metrics
🔜 **SEO & Performance**: Lighthouse ≥ 90, sitemap, metadata
🔜 **Monitoring**: Sentry error tracking, custom metrics

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui (Radix UI), Framer Motion |
| **Backend** | FastAPI, Python 3.12, SQLModel |
| **Database** | PostgreSQL 16 (Neon), SQLModel ORM |
| **Auth** | NextAuth.js, JWT, Google OAuth 2.1 |
| **AI** | OpenAI GPT-4, streaming completions |
| **Payments** | Stripe (TEST MODE) |
| **Testing** | pytest (backend), Vitest (frontend), browser-use (E2E) |
| **Cache** | Upstash Redis (Phase 3) |
| **Monitoring** | Sentry |
| **Containers** | Docker, Docker Compose |
| **Orchestration** | Kubernetes |

---

## Quick Start

### Prerequisites
- **Node.js 20+** (frontend): `node --version`
- **Python 3.12+** (backend): `python --version`
- **PostgreSQL** (local or Neon): Connection string
- **OpenAI API Key**: https://platform.openai.com/api-keys
- **Stripe Account** (TEST MODE): https://stripe.com

### 1. Clone & Setup

```bash
git clone https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR.git
cd FATIMAZEHRAAITUTOR

# Copy environment template
cp .env.example .env.local
```

### 2. Fill Environment Variables

Edit `.env.local` with your keys:

```bash
# Required
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Optional (Phase 2+)
REDIS_URL=
SENTRY_DSN=
RESEND_API_KEY=
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000
```

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (Alembic)
alembic upgrade head

# Run development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
# → http://localhost:8000
```

### 5. Test the App

Open http://localhost:3000 in browser:

1. **Signup**: Create account with email/password
2. **Explore**: Browse chapter list (1-3 free, 4-10 locked)
3. **Learn**: Open chapter 1, read content, ask AI questions
4. **Quiz**: Complete chapter 1 quiz (10 MCQs)
5. **Dashboard**: View progress, streaks, stats
6. **Upgrade**: Go to /pricing, click "Upgrade to Premium"
7. **Stripe Checkout**: Use test card `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
8. **Unlock**: After payment, all 10 chapters visible

---

## Docker Setup

### Local Development (docker-compose)

```bash
# Build and run all services (frontend, backend, postgres, redis)
docker-compose up --build

# Services start:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

Stop:
```bash
docker-compose down
```

### Production (docker-compose.prod.yml)

Uses external database (Neon) and Redis (Upstash):

```bash
docker-compose -f docker-compose.prod.yml up --build
```

---

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Docker images built and pushed to registry
- K8s cluster running (Docker Desktop, Minikube, or cloud)

### Deploy

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create configmaps & secrets
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/  # Update with real values

# Deploy frontend & backend
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/ingress/

# Verify
kubectl get pods -n fatimazehra-ai-tutor
kubectl get svc -n fatimazehra-ai-tutor
```

Port-forward for local testing:

```bash
# Frontend
kubectl port-forward svc/frontend 3000:3000 -n fatimazehra-ai-tutor

# Backend
kubectl port-forward svc/backend 8000:8000 -n fatimazehra-ai-tutor
```

---

## API Documentation

### Authentication

```
POST /auth/register
  Body: { email, password, name }
  Response: { user_id, email, token }

POST /auth/login
  Body: { email, password }
  Response: { user_id, email, token }

GET /auth/me
  Headers: Authorization: Bearer {token}
  Response: { user_id, email, name, tier, subscription_expires_at }
```

### Chapters

```
GET /chapters
  Response: [{ id, number, title, slug, tier_required, progress }]

GET /chapters/{id}
  Response: { id, title, content_mdx, quiz_questions }
```

### Quiz

```
GET /quiz/{chapter_id}
  Response: { questions: [{ id, question, options }] }

POST /quiz/submit
  Body: { chapter_id, answers: [{ question_id, selected_option }] }
  Response: { score, passed, results: [{ correct_option, explanation }] }
```

### Progress

```
GET /progress/{user_id}
  Response: { chapters_completed, quiz_scores, average_score, streak_days }

POST /progress/mark-complete
  Body: { chapter_id }
  Response: { success, updated_progress }
```

### Payments

```
POST /payment/create-session
  Body: { plan: "premium"|"pro" }
  Response: { session_url }

POST /payment/webhook
  (Stripe sends raw event; webhook handler updates user tier)
```

### AI Chat

```
POST /api/chat
  Body: { message, chapter_id? }
  Response: SSE stream (streaming GPT-4 response)

GET /chat/rate-limit
  Response: { remaining, reset_at }
```

---

## Testing

### Backend (pytest)

```bash
cd backend

# Run all tests
pytest -v --cov=src --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py -v

# Coverage report
pytest --cov=src --cov-report=html
# Open htmlcov/index.html
```

### Frontend (Vitest + browser-use)

```bash
cd frontend

# Unit tests
npm run test

# E2E tests (browser-use)
# Manual testing via browser-use skill
npm run dev
# Then open localhost:3000 in browser and test user flows
```

---

## Stripe TEST MODE

### Test Card

Use this card for all test payments:

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

### Webhook Testing (Local)

Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to test webhooks locally:

```bash
stripe login
stripe listen --forward-to localhost:8000/payment/webhook

# In another terminal, trigger test event:
stripe trigger payment_intent.succeeded
```

The webhook handler will:
1. Verify signature
2. Update user tier to premium/pro
3. Create subscription record in DB

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/feature-name
```

### 2. Make Changes

- Write spec first (in `.specify/`)
- Implement code
- Write tests (pytest for backend, vitest for frontend)
- Test locally (dev servers, E2E flows)

### 3. Commit & Push

```bash
git add .
git commit -m "feat: feature-name - FatimaZehra-AI-Tutor"
git push origin feat/feature-name
```

### 4. Create PR

```bash
gh pr create --title "feat: feature-name" --body "Description"
```

### 5. Merge to Main

After review + tests pass:
```bash
git checkout main
git pull origin main
git merge feat/feature-name
git push origin main
```

---

## Debugging

### Frontend Issues

```bash
# Check browser console (F12)
# Check network tab for API errors
# Check Application → Cookies for auth token

# Clear cache & reload
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
```

### Backend Issues

```bash
# Check uvicorn console output
# Check database connection:
psql $DATABASE_URL -c "SELECT 1;"

# Check OpenAI API:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Debug with print statements or pdb:
import pdb; pdb.set_trace()
```

### Database Issues

```bash
# Connect to Neon PostgreSQL:
psql $DATABASE_URL

# List tables:
\dt

# Check user_progress:
SELECT * FROM user_progress;

# Check quiz_attempts:
SELECT * FROM quiz_attempts WHERE user_id = '<USER_ID>';
```

---

## Performance

### Frontend Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTL** (Time to Interactive): < 3.8s
- **Lighthouse Score**: ≥ 90

Check with:
```bash
npm run build
npm run start
# Open http://localhost:3000 in Chrome
# DevTools → Lighthouse → Generate report
```

### Backend Targets

- **Response time** p95: < 500ms
- **Error rate**: < 1%
- **Database query time**: < 100ms

---

## Monitoring & Alerts

### Sentry Error Tracking

1. Create account: https://sentry.io
2. Create project (Next.js + Python)
3. Add DSN to `.env`: `SENTRY_DSN=...`
4. Dashboard: https://sentry.io/organizations/...
5. View errors, set up alerts

### Metrics (Phase 3)

- API response times (Prometheus)
- User events (Google Analytics)
- Payment metrics (Stripe Dashboard)
- Email delivery rates (Resend Dashboard)

---

## Known Issues & TODOs

### Phase 1
- [ ] Google OAuth not fully implemented (NextAuth stub)
- [ ] Rate limiting stubbed (no Redis in Phase 1)
- [ ] Email notifications not sent (Resend Phase 2+)
- [ ] Admin dashboard not available

### Phase 2
- [ ] Weak-point analysis not implemented
- [ ] Personalized learning paths stubbed
- [ ] Spaced repetition algorithm not integrated
- [ ] Email coach feature pending

### Phase 3
- [x] Docker & K8s configs created (see `k8s/` and `docker-compose.prod.yml`)
- [ ] CI/CD pipeline (GitHub Actions) not configured
- [ ] Advanced caching (Redis) not implemented
- [ ] Multi-region failover not setup

---

## Contributing

### Code Standards

- **Frontend**: TypeScript strict mode, Tailwind CSS, shadcn/ui components
- **Backend**: Python type hints, Ruff linting, ≥ 80% test coverage
- **Git**: Commit format: `feat: [name] - FatimaZehra-AI-Tutor`
- **Specs**: Update `.specify/` before code changes

### Review Process

1. Create feature branch
2. Implement + test locally
3. Create PR with description
4. Pass: tests, linting, type checking
5. Get approval
6. Merge to main

---

## Support & Contact

- **Issues**: [GitHub Issues](https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR/issues)
- **Email**: hafiznaveedchuhan@example.com (placeholder)
- **Docs**: See `.specify/` for detailed specs and ADRs

---

## License

MIT License — See LICENSE file

---

## Acknowledgments

Built for **Panaversity Agent Factory Hackathon IV**

**Key Technologies**:
- Next.js team for App Router
- FastAPI team for async framework
- OpenAI for GPT-4 API
- Stripe for payment processing
- Neon for PostgreSQL hosting

---

**Happy Learning! 🐍🚀**

Questions? Check out the project specs in `.specify/` or open an issue on GitHub.
# FATIMAZEHRAAITUTOR
