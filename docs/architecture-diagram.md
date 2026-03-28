# FatimaZehra AI Tutor - Architecture Diagram

## System Architecture Overview

```
+===========================================================================+
|                          USERS / STUDENTS                                  |
|                     (Browser / ChatGPT Client)                             |
+====================================+======================================+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
+================================+     +================================+
|     PHASE 1 & 2: ChatGPT      |     |     PHASE 3: Web Application   |
|        App Frontend            |     |        (Next.js 14)            |
|   (OpenAI Apps SDK)            |     |                                |
|                                |     |   +----------+ +----------+   |
|  - Conversational UI           |     |   |  Auth    | |  Learn   |   |
|  - 800M+ user reach            |     |   | NextAuth | | Chapters |   |
|  - Zero-LLM (Phase 1)         |     |   +----------+ +----------+   |
|  - Hybrid (Phase 2, Premium)   |     |   +----------+ +----------+   |
|                                |     |   |   Chat   | | Payments |   |
|  Runtime Skills:               |     |   |  GPT-4o  | |  Stripe  |   |
|  - concept-explainer           |     |   +----------+ +----------+   |
|  - quiz-master                 |     |   +----------+ +----------+   |
|  - socratic-tutor              |     |   | Progress | | Pricing  |   |
|  - progress-motivator          |     |   | Dashboard| |  Plans   |   |
|                                |     |   +----------+ +----------+   |
+===============+================+     +===============+================+
                |                                       |
                |         HTTPS / REST API              |
                +-------------------+-------------------+
                                    |
                                    v
+===========================================================================+
|                    BACKEND (FastAPI - Python 3.12)                          |
|                   Hosted on HuggingFace Spaces                             |
|                                                                            |
|   +===================== DETERMINISTIC APIs (Phase 1) ==================+  |
|   |                                                                     |  |
|   |   +----------------+  +----------------+  +-------------------+     |  |
|   |   | Auth API       |  | Chapters API   |  | Quiz API          |     |  |
|   |   | POST /register |  | GET /chapters  |  | GET /quiz/{id}    |     |  |
|   |   | POST /login    |  | GET /chapters/ |  | POST /quiz/submit |     |  |
|   |   | GET /auth/me   |  |     {id}       |  | (rule-based       |     |  |
|   |   +----------------+  +----------------+  |  grading)         |     |  |
|   |                                            +-------------------+     |  |
|   |   +----------------+  +----------------+  +-------------------+     |  |
|   |   | Progress API   |  | Access Control |  | Navigation API    |     |  |
|   |   | GET /progress  |  | Freemium Gate  |  | GET /next         |     |  |
|   |   | POST /complete |  | Tier Checking  |  | GET /previous     |     |  |
|   |   +----------------+  +----------------+  +-------------------+     |  |
|   |                                                                     |  |
|   +=================================================================== +  |
|                                                                            |
|   +=================== HYBRID APIs (Phase 2 - Premium) ================+  |
|   |                                                                     |  |
|   |   +-------------------------+  +-----------------------------+      |  |
|   |   | Adaptive Learning Path  |  | LLM-Graded Assessments     |      |  |
|   |   | POST /ai/learning-path  |  | POST /ai/analyze-weakness  |      |  |
|   |   | (GPT-4o reasoning)      |  | (GPT-4o evaluation)        |      |  |
|   |   | Premium-gated           |  | Pro-gated                  |      |  |
|   |   +-------------------------+  +-----------------------------+      |  |
|   |                                                                     |  |
|   +=================================================================== +  |
|                                                                            |
|   +=================== WEB APP APIs (Phase 3) =========================+  |
|   |                                                                     |  |
|   |   +-------------------------+  +-----------------------------+      |  |
|   |   | AI Chat API             |  | Stripe Payments API         |      |  |
|   |   | POST /api/chat          |  | POST /payment/create        |      |  |
|   |   | GPT-4o streaming        |  | POST /payment/webhook       |      |  |
|   |   | Rate-limited by tier    |  | Tier upgrade on success     |      |  |
|   |   +-------------------------+  +-----------------------------+      |  |
|   |                                                                     |  |
|   +=================================================================== +  |
|                                                                            |
+==================================+========================================+
                                   |
                                   v
+===========================================================================+
|                     DATA LAYER                                             |
|                                                                            |
|   +=============================+  +================================+     |
|   |   Neon PostgreSQL           |  |   Cloudflare R2                |     |
|   |   (Serverless - US East)    |  |   (Content Storage)            |     |
|   |                             |  |                                |     |
|   |   Tables:                   |  |   - Course MDX content         |     |
|   |   - users                   |  |   - Media assets               |     |
|   |   - chapters                |  |   - Quiz banks                 |     |
|   |   - quiz_questions          |  |   - Static resources           |     |
|   |   - quiz_attempts           |  |                                |     |
|   |   - user_progress           |  +================================+     |
|   |   - subscriptions           |                                         |
|   |                             |                                         |
|   +=============================+                                         |
|                                                                            |
+===========================================================================+
                                   |
                                   v
+===========================================================================+
|                   EXTERNAL SERVICES                                        |
|                                                                            |
|   +-----------+  +-----------+  +-----------+  +-------------------+      |
|   |  OpenAI   |  |  Stripe   |  |  Google   |  |  Vercel           |      |
|   |  GPT-4o   |  |  Payments |  |  OAuth    |  |  (Frontend Host)  |      |
|   |  API      |  |  (TEST)   |  |  2.1      |  |  Auto-deploy      |      |
|   +-----------+  +-----------+  +-----------+  +-------------------+      |
|                                                                            |
+===========================================================================+


## Agent Factory Architecture Layers (Implemented)

+-------+---------------------------+------------------+-----------+
| Layer | Technology                | Purpose          | Phase     |
+-------+---------------------------+------------------+-----------+
| L3    | FastAPI                   | HTTP Interface   | 1, 2, 3   |
| L6    | Runtime Skills + MCP      | Domain Knowledge | 1, 2, 3   |
| L4    | OpenAI GPT-4o             | AI Orchestration | 2, 3      |
+-------+---------------------------+------------------+-----------+


## Data Flow Diagrams

### Phase 1: Zero-Backend-LLM Flow
User -> ChatGPT App -> Backend (Deterministic) -> Neon DB / R2
                    <- Content + Quiz + Progress

### Phase 2: Hybrid Flow (Premium Only)
User -> ChatGPT App -> Backend -> OpenAI GPT-4o (for premium features)
                    <- Adaptive Path + LLM Assessment

### Phase 3: Web App Flow
User -> Next.js App -> Backend APIs -> Neon DB
     -> /api/chat   -> OpenAI GPT-4o (streaming)
     -> /api/stripe  -> Stripe API
```

## Deployment Architecture

```
+----------------------------+     +----------------------------+
|      Vercel (Frontend)     |     |   HuggingFace Spaces       |
|                            |     |      (Backend)             |
|  - Next.js 14 SSR/SSG     |     |  - FastAPI + Uvicorn       |
|  - Auto-deploy on push     |     |  - Python 3.12             |
|  - Edge functions          |     |  - SQLModel ORM            |
|  - API routes              | --> |  - REST API endpoints      |
|                            |     |                            |
|  URL: frontend-blue-       |     |  URL: naveed64-fatima      |
|  kappa-15.vercel.app       |     |  zehra-ai-tutor-backend    |
|                            |     |  .hf.space                 |
+----------------------------+     +----------------------------+
              |                                  |
              v                                  v
+----------------------------+     +----------------------------+
|   Neon PostgreSQL          |     |   Stripe (TEST MODE)       |
|   Serverless Database      |     |   Payment Processing       |
|   US East Region           |     |   Webhook Integration      |
+----------------------------+     +----------------------------+
```

## Kubernetes Production Architecture

```
+===========================================================================+
|                    Kubernetes Cluster                                       |
|                    Namespace: fatimazehra-ai-tutor                          |
|                                                                            |
|   +---------------------------+    +---------------------------+           |
|   |  Frontend Deployment      |    |  Backend Deployment       |           |
|   |  Replicas: 2-10 (HPA)    |    |  Replicas: 2-10 (HPA)    |           |
|   |  CPU: 500m | Mem: 512Mi   |    |  CPU: 500m | Mem: 512Mi   |           |
|   |  Port: 3000               |    |  Port: 8000               |           |
|   |  Health: /health          |    |  Health: /health          |           |
|   |  Strategy: RollingUpdate  |    |  Strategy: RollingUpdate  |           |
|   +---------------------------+    +---------------------------+           |
|                |                                |                          |
|                +----------------+---------------+                          |
|                                 |                                          |
|                    +---------------------------+                           |
|                    |   Nginx Ingress Controller |                           |
|                    |   TLS Termination          |                           |
|                    |   Load Balancing           |                           |
|                    +---------------------------+                           |
|                                                                            |
+===========================================================================+
```
