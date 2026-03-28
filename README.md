<div align="center">

# FatimaZehra AI Tutor

### Your Personal AI-Powered Python Programming Tutor

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://frontend-blue-kappa-15.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend_API-HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://naveed64-fatimazehra-ai-tutor-backend.hf.space)
[![GitHub](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR)

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

<br/>

**An interactive, AI-powered platform that teaches Python programming from basics to advanced concepts with real-time GPT-4o chat assistance, interactive quizzes, progress tracking, and a freemium subscription model.**

<br/>

[View Live App](https://frontend-blue-kappa-15.vercel.app) &nbsp;&bull;&nbsp; [API Documentation](https://naveed64-fatimazehra-ai-tutor-backend.hf.space/docs) &nbsp;&bull;&nbsp; [Report Bug](https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR/issues) &nbsp;&bull;&nbsp; [Request Feature](https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR/issues)

</div>

---

## Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Python Course Curriculum](#-python-course-curriculum)
- [Subscription Tiers](#-subscription-tiers)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Docker & Kubernetes](#-docker--kubernetes)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Stripe Testing](#-stripe-testing)
- [Contributing](#-contributing)
- [Team](#-team)

---

## About the Project

**FatimaZehra AI Tutor** is a comprehensive, full-stack AI-powered learning platform built for the **Panaversity Agent Factory Hackathon IV**. It provides an interactive Python programming course with 10 structured chapters, real-time AI chat assistance powered by **OpenAI GPT-4o**, quizzes with instant feedback, progress tracking, and a Stripe-integrated freemium subscription model.

### What Makes It Special

- **AI-Powered Learning** - Real-time streaming chat with GPT-4o that adapts to your current chapter context
- **Structured Curriculum** - 10 professionally written chapters from Python Basics to Advanced Concepts
- **Interactive Quizzes** - 10 MCQ questions per chapter with detailed explanations
- **Progress Tracking** - Track completed chapters, quiz scores, and learning streaks
- **Freemium Model** - Start free with 3 chapters, upgrade for full access and unlimited AI
- **Production Ready** - Docker, Kubernetes, CI/CD, health checks - built for scale

---

## Key Features

<table>
<tr>
<td width="50%">

### Authentication & Security
- Email/password registration & login
- Google OAuth 2.1 integration
- JWT-based session management (httpOnly cookies)
- Protected routes with Next.js middleware
- Real-time password strength validation

</td>
<td width="50%">

### AI Chat Assistant
- Real-time streaming responses from GPT-4o
- Context-aware tutoring (knows your current chapter)
- Python code syntax highlighting
- Tier-based rate limiting (5/50/unlimited per day)
- Conversation history support

</td>
</tr>
<tr>
<td width="50%">

### Course Content
- 10 structured Python chapters
- Progressive difficulty (Beginner to Advanced)
- MDX-based rich content rendering
- Working code examples in every chapter
- Real-world use cases and best practices

</td>
<td width="50%">

### Stripe Payments
- Secure checkout integration (TEST MODE)
- Three subscription tiers (Free / Premium / Pro)
- Webhook-based subscription management
- Automatic tier upgrade on successful payment
- Test card: `4242 4242 4242 4242`

</td>
</tr>
<tr>
<td width="50%">

### Progress & Analytics
- Chapter completion tracking
- Quiz score history with pass/fail
- Learning streak counter
- Visual progress dashboard
- Per-chapter completion percentage

</td>
<td width="50%">

### Production Infrastructure
- Docker containerization (dev + prod)
- Kubernetes orchestration (2-10 replicas)
- Rolling update deployment strategy
- Health checks & readiness probes
- Nginx Ingress Controller

</td>
</tr>
</table>

---

## Tech Stack

### Frontend

| Technology | Purpose |
|:---|:---|
| **Next.js 14** (App Router) | React framework with SSR/SSG |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **NextAuth.js** | Authentication (JWT strategy) |
| **Lucide React** | Modern icon library |
| **React Markdown** | Markdown/code rendering in chat |

### Backend

| Technology | Purpose |
|:---|:---|
| **FastAPI** | High-performance Python API framework |
| **Python 3.12** | Backend language |
| **SQLModel** | ORM (SQLAlchemy + Pydantic hybrid) |
| **Neon PostgreSQL** | Serverless Postgres database |
| **Uvicorn** | ASGI server |
| **Alembic** | Database migrations |

### Services & Infrastructure

| Technology | Purpose |
|:---|:---|
| **OpenAI GPT-4o** | AI chat completions with streaming |
| **Stripe** | Payment processing (TEST MODE) |
| **Vercel** | Frontend hosting & auto-deploy |
| **HuggingFace Spaces** | Backend API hosting |
| **Docker + Compose** | Containerization (dev & prod) |
| **Kubernetes** | Container orchestration with HPA |
| **Playwright** | End-to-end browser testing |
| **Sentry** | Error tracking & monitoring |

---

## Architecture

```
                          +---------------------------+
                          |      Users (Browser)      |
                          +------------+--------------+
                                       |
                                       v
+----------------------------------------------------------------------+
|                   FRONTEND  (Next.js 14 on Vercel)                    |
|                                                                      |
|   +----------+   +-----------+   +----------+   +----------------+   |
|   |   Auth   |   |  Learn /  |   |   Chat   |   |   Payments     |   |
|   | NextAuth |   | Chapters  |   |  GPT-4o  |   |   (Stripe)     |   |
|   |  + JWT   |   |           |   | Streaming|   |                |   |
|   +----------+   +-----------+   +----------+   +----------------+   |
|                                                                      |
|              API Routes: /api/chat  /api/auth  /api/stripe           |
+----------------------------------------------------------------------+
                                       |
                                       | HTTPS
                                       v
+----------------------------------------------------------------------+
|              BACKEND  (FastAPI on HuggingFace Spaces)                 |
|                                                                      |
|   +----------+   +-----------+   +----------+   +----------------+   |
|   | Auth API |   | Chapters  |   |   Quiz   |   |   Progress     |   |
|   | /auth/*  |   | /chapters |   |  /quiz   |   |  /progress     |   |
|   +----------+   +-----------+   +----------+   +----------------+   |
+----------------------------------------------------------------------+
                                       |
                                       v
+----------------------------------------------------------------------+
|                  DATABASE  (Neon PostgreSQL - Serverless)              |
|                                                                      |
|   users  |  chapters  |  quiz_questions  |  user_progress            |
|   quiz_attempts  |  subscriptions                                    |
+----------------------------------------------------------------------+
```

---

## Python Course Curriculum

| # | Chapter | Difficulty | Tier | Topics Covered |
|:---:|:---|:---:|:---:|:---|
| 1 | **Python Basics & Variables** | Beginner | Free | Data types, variables, operators, I/O |
| 2 | **Control Flow & Loops** | Beginner | Free | if/elif/else, for/while loops, break/continue |
| 3 | **Functions & Scope** | Beginner | Free | Defining functions, parameters, return values, scope |
| 4 | **Object Oriented Programming** | Intermediate | Premium | Classes, objects, inheritance, polymorphism |
| 5 | **Modules & Packages** | Intermediate | Premium | Importing, creating packages, pip, virtual envs |
| 6 | **File Handling** | Intermediate | Premium | Reading/writing files, CSV, JSON, context managers |
| 7 | **Exception Handling** | Intermediate | Premium | try/except, custom exceptions, debugging |
| 8 | **APIs & Requests** | Intermediate | Premium | HTTP methods, REST APIs, requests library |
| 9 | **Decorators & Generators** | Advanced | Pro | Function decorators, generators, yield |
| 10 | **Advanced Python Concepts** | Advanced | Pro | Metaclasses, descriptors, async/await, patterns |

> Each chapter includes complete theory, working code examples, and **10 MCQ quiz questions** with detailed explanations.

---

## Subscription Tiers

<table>
<tr>
<td align="center" width="33%">

### Free
#### $0/month

---

- Chapters 1-3
- Basic quiz access
- 5 AI chat messages/day
- Progress tracking
- Community support

</td>
<td align="center" width="33%">

### Premium
#### $9.99/month

---

- **All 10 chapters**
- Unlimited quizzes
- 50 AI chat messages/day
- Full progress analytics
- Priority support

</td>
<td align="center" width="33%">

### Pro
#### $19.99/month

---

- Everything in Premium
- **Unlimited AI chat**
- Weak-point analysis
- Personalized learning paths
- Email coaching (coming soon)

</td>
</tr>
</table>

---

## API Endpoints

### Authentication
```
POST   /auth/register            Register new user
POST   /auth/login               Login with credentials
POST   /auth/google-callback     Google OAuth callback
GET    /auth/me                  Get current user profile
POST   /auth/logout              Logout user
POST   /auth/change-password     Change password
```

### Chapters & Learning
```
GET    /chapters                 List all chapters
GET    /chapters/{id}            Get chapter content (MDX)
```

### Quizzes
```
GET    /quiz/{chapter_id}        Get quiz questions for chapter
POST   /quiz/submit              Submit quiz answers and get score
```

### Progress
```
GET    /progress/{user_id}       Get user progress & stats
POST   /progress/mark-complete   Mark chapter as completed
```

### Payments
```
POST   /payment/create-session   Create Stripe checkout session
POST   /payment/webhook          Stripe webhook handler
```

### AI Chat
```
POST   /api/chat                 Stream AI response (GPT-4o)
```

> Full interactive API docs available at: [Backend /docs](https://naveed64-fatimazehra-ai-tutor-backend.hf.space/docs)

---

## Database Schema

| Table | Key Columns | Purpose |
|:---|:---|:---|
| `users` | id, email, name, hashed_password, tier, created_at | User accounts & authentication |
| `chapters` | id, number, title, slug, content_mdx, tier_required | Course content storage |
| `quiz_questions` | id, chapter_id, question, options (JSONB), correct_answer, explanation | Quiz MCQ questions |
| `quiz_attempts` | id, user_id, chapter_id, answers (JSONB), score, completed_at | Quiz submission history |
| `user_progress` | id, user_id, chapter_id, completed, last_accessed_at | Chapter completion tracking |
| `subscriptions` | id, user_id, stripe_customer_id, stripe_sub_id, plan, status, expires_at | Payment & subscription management |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.12+
- **PostgreSQL** (or [Neon](https://neon.tech) account)
- **OpenAI API Key** ([platform.openai.com](https://platform.openai.com/api-keys))
- **Stripe Account** in TEST MODE ([stripe.com](https://stripe.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR.git
cd FATIMAZEHRAAITUTOR
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local     # Fill in your environment variables
npm run dev                     # Starts on http://localhost:3000
```

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your environment variables
alembic upgrade head            # Run database migrations
uvicorn main:app --reload --port 8000
```

---

## Environment Variables

Create `.env.local` (frontend) and `.env` (backend) from the example templates:

| Variable | Description | Required |
|:---|:---|:---:|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth JWT | Yes |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000`) | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `BACKEND_URL` | Internal backend URL | Yes |
| `REDIS_URL` | Upstash Redis URL | No |
| `SENTRY_DSN` | Sentry error tracking DSN | No |
| `RESEND_API_KEY` | Resend email service key | No |

> **Important:** Never commit `.env` files. Use `.env.example` as a template.

---

## Docker & Kubernetes

### Docker (Local Development)

```bash
# Build and run all services
docker-compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:8000
#   PostgreSQL → localhost:5432
#   Redis     → localhost:6379

# Stop all services
docker-compose down
```

### Docker (Production)

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -n fatimazehra-ai-tutor
kubectl get svc -n fatimazehra-ai-tutor

# Port-forward for local testing
kubectl port-forward svc/frontend 3000:3000 -n fatimazehra-ai-tutor
kubectl port-forward svc/backend 8000:8000 -n fatimazehra-ai-tutor
```

**Kubernetes Configuration:**

| Setting | Value |
|:---|:---|
| Namespace | `fatimazehra-ai-tutor` |
| Min Replicas | 2 |
| Max Replicas | 10 |
| Strategy | RollingUpdate |
| CPU Limit | 500m |
| Memory Limit | 512Mi |
| Health Check | `/health` endpoint |
| Ingress | Nginx Ingress Controller |

---

## Deployment

### Production URLs

| Service | Platform | URL |
|:---|:---|:---|
| **Frontend** | Vercel | **[https://frontend-blue-kappa-15.vercel.app](https://frontend-blue-kappa-15.vercel.app)** |
| **Backend API** | HuggingFace Spaces | **[https://naveed64-fatimazehra-ai-tutor-backend.hf.space](https://naveed64-fatimazehra-ai-tutor-backend.hf.space)** |
| **Database** | Neon PostgreSQL | Serverless (US East) |

> The frontend auto-deploys on every push to `main` via Vercel Git integration. No manual redeployment needed.

---

## Project Structure

```
FatimaZehra-AI-Tutor/
|
+-- frontend/                       # Next.js 14 Application
|   +-- app/                        # App Router pages
|   |   +-- auth/                   # Login & Signup pages
|   |   +-- dashboard/              # User dashboard
|   |   +-- learn/                  # Chapter learning pages
|   |   +-- chat/                   # AI Chat interface
|   |   +-- pricing/                # Subscription plans
|   |   +-- profile/                # User profile
|   |   +-- api/                    # API routes (chat, auth, stripe)
|   +-- components/                 # Reusable UI components
|   +-- lib/                        # Auth config, utilities
|   +-- public/                     # Static assets
|   +-- middleware.ts               # Route protection
|   +-- tailwind.config.ts          # Tailwind CSS config
|   +-- next.config.js              # Next.js config
|
+-- backend/                        # FastAPI Application
|   +-- main.py                     # App entry point
|   +-- models/                     # SQLModel database models
|   +-- routes/                     # API route handlers
|   +-- services/                   # Business logic
|   +-- alembic/                    # Database migrations
|   +-- requirements.txt            # Python dependencies
|   +-- Dockerfile                  # Backend container
|
+-- k8s/                            # Kubernetes manifests
|   +-- namespace.yaml
|   +-- frontend/                   # Frontend deployment + service
|   +-- backend/                    # Backend deployment + service
|   +-- ingress/                    # Ingress configuration
|
+-- docker-compose.yml              # Local development
+-- docker-compose.prod.yml         # Production config
+-- .env.example                    # Environment variable template
+-- README.md                       # This file
```

---

## Stripe Testing

Use these test credentials for development:

| Field | Value |
|:---|:---|
| **Card Number** | `4242 4242 4242 4242` |
| **Expiry** | Any future date (e.g., `12/28`) |
| **CVC** | Any 3 digits (e.g., `123`) |

### Local Webhook Testing

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:8000/payment/webhook

# Trigger a test event
stripe trigger payment_intent.succeeded
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature - FatimaZehra-AI-Tutor'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

```
feat: new feature - FatimaZehra-AI-Tutor
fix: bug fix - FatimaZehra-AI-Tutor
docs: documentation update - FatimaZehra-AI-Tutor
refactor: code refactoring - FatimaZehra-AI-Tutor
test: add/update tests - FatimaZehra-AI-Tutor
```

---

## Team

<div align="center">

Built for the **Panaversity Agent Factory Hackathon IV**

**FatimaZehra AI Tutor Team**

[![GitHub](https://img.shields.io/badge/hafiznaveedchuhan--ctrl-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hafiznaveedchuhan-ctrl)

</div>

---

## Development Phases

| Phase | Focus | Status |
|:---|:---|:---:|
| **Phase 1** | MVP - Auth, Chapters, Quiz, Stripe, AI Chat | Complete |
| **Phase 2** | AI Personalization - Weak-point analysis, Learning paths, Email coach | Planned |
| **Phase 3** | Production - Docker, K8s, Admin dashboard, SEO, Monitoring | In Progress |

---

<div align="center">

### If you found this project helpful, please give it a star!

<br/>

**[View Live App](https://frontend-blue-kappa-15.vercel.app)** &nbsp;&bull;&nbsp; **[API Docs](https://naveed64-fatimazehra-ai-tutor-backend.hf.space/docs)** &nbsp;&bull;&nbsp; **[Report Issue](https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR/issues)**

<br/>

<sub>Built with Next.js, FastAPI, GPT-4o & Stripe | Panaversity Agent Factory Hackathon IV</sub>

</div>
