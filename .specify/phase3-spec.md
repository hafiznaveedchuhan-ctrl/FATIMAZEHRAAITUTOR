# Phase 3 Specification: Production-Ready Deployment

**Objective**: Docker containerization, Kubernetes orchestration, admin dashboard, performance optimization, SEO, monitoring.
**Prerequisite**: Phase 1 + Phase 2 complete
**Duration**: 5 days
**Target**: Production-ready, scalable, observable system

---

## 1. Scope

### What's New
- **Docker & Docker Compose**: Containerized local dev environment
- **Kubernetes Deployment**: Production K8s cluster (Docker Desktop or AWS/GCP)
- **Admin Dashboard**: User counts, revenue metrics, chapter analytics, payment logs
- **Performance Optimization**: LCP < 2.5s, CLS < 0.1, Lighthouse ≥ 90
- **SEO**: Sitemap, robots.txt, metadata API, OG images
- **Rate Limiting**: Upstash Redis, per-user rate limits (AI chat, API)
- **Email Notifications**: Quiz result emails, streak reminders (Resend)
- **Monitoring & Alerting**: Sentry (frontend + backend), custom metrics
- **CI/CD** (optional Phase 3): GitHub Actions, auto-deploy on main push

### Non-Scope Phase 3
- Multi-region failover (Phase 4)
- GraphQL API (Phase 4)
- Advanced caching (Redis beyond rate limiting, Phase 4)
- Mobile apps (Phase 4+)

---

## 2. Docker Setup

### 2.1 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
```

### 2.2 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y gcc postgresql-client && rm -rf /var/lib/apt/lists/*

RUN groupadd -r fastapi && useradd -r -g fastapi fastapi
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chown -R fastapi:fastapi /app

USER fastapi
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2.3 docker-compose.yml (Local Dev)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: tutor
      POSTGRES_PASSWORD: tutor_dev
      POSTGRES_DB: fatimazehra_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tutor"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://tutor:tutor_dev@postgres:5432/fatimazehra_db
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXTAUTH_URL: http://localhost:3000
      DATABASE_URL: postgresql+asyncpg://tutor:tutor_dev@postgres:5432/fatimazehra_db
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
    command: npm run dev

volumes:
  postgres_data:
```

### 2.4 docker-compose.prod.yml (Production)

```yaml
version: '3.9'

services:
  backend:
    build: ./backend
    environment:
      DATABASE_URL: ${DATABASE_URL}  # Neon PostgreSQL
      REDIS_URL: ${REDIS_URL}        # Upstash Redis
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      SENTRY_DSN: ${SENTRY_DSN}
    ports:
      - "8000:8000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      SENTRY_DSN: ${SENTRY_DSN}
    ports:
      - "3000:3000"
    restart: unless-stopped
```

### 2.5 .dockerignore Files

```
# frontend/.dockerignore
node_modules
.next
.git
.env.local
.env.production.local
.DS_Store
coverage
dist
*.log
.cache

# backend/.dockerignore
__pycache__
.pytest_cache
.venv
.git
.env
.env.local
*.pyc
*.egg-info
dist
build
.coverage
```

---

## 3. Kubernetes Setup

### 3.1 Folder Structure

```
k8s/
├── namespace.yaml
├── configmaps/
│   └── app-config.yaml
├── secrets/
│   └── app-secrets.yaml (template)
├── frontend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── ingress.yaml
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── configmap.yaml
└── ingress/
    └── nginx-ingress.yaml
```

### 3.2 Key Files

**namespace.yaml**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: fatimazehra-ai-tutor
```

**frontend/deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: fatimazehra-ai-tutor
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: fatimazehra-ai-tutor-frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NEXT_PUBLIC_API_URL
        - name: NEXTAUTH_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NEXTAUTH_URL
        - name: SENTRY_DSN
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: SENTRY_DSN
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

**backend/deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: fatimazehra-ai-tutor
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: fatimazehra-ai-tutor-backend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: REDIS_URL
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: OPENAI_API_KEY
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: STRIPE_SECRET_KEY
        - name: SENTRY_DSN
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: SENTRY_DSN
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 20
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 30
        resources:
          requests:
            cpu: 200m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
```

**frontend/hpa.yaml**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: fatimazehra-ai-tutor
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 3.3 Deployment Steps

```bash
# Build images (local or CI/CD)
docker build -t fatimazehra-ai-tutor-frontend:latest ./frontend
docker build -t fatimazehra-ai-tutor-backend:latest ./backend

# Apply K8s manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/  # Update with real values
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/ingress/

# Verify
kubectl get pods -n fatimazehra-ai-tutor
kubectl get svc -n fatimazehra-ai-tutor
```

---

## 4. Admin Dashboard

**User Story**:
- AS an admin, I want to view user metrics, revenue, and platform analytics

**Pages**:
- `/admin/dashboard` — Overview (user count, revenue, active chapters)
- `/admin/users` — User list with tier, signup date, last activity
- `/admin/revenue` — Revenue chart, top paying users, subscription status
- `/admin/chapters` — Chapter analytics (views, quiz completion, avg score)
- `/admin/payments` — Payment logs, failed charges, refunds

**API Endpoints** (admin-only, check user.role == 'admin'):
```
GET /admin/metrics
  Output: { users_total, premium_count, pro_count, monthly_revenue, avg_user_score }

GET /admin/users
  Output: paginated user list with activity logs

GET /admin/revenue
  Output: revenue chart data, MRR (monthly recurring), churn rate

GET /admin/chapters
  Output: per-chapter: views, quiz completion %, avg score
```

**Frontend**:
- Dashboard with Recharts (line charts, bar charts, pie charts)
- User table with filtering/sorting
- Export CSV for analytics
- Real-time metrics update every 60s

---

## 5. Performance Optimization

### 5.1 Frontend

**Lighthouse Targets**: LCP < 2.5s, CLS < 0.1, FID < 100ms, TTL < 3.8s

**Optimizations**:
- Code splitting: Next.js dynamic imports for heavy components
- Image optimization: Next.js Image with lazy loading, WebP format
- Caching: SWR with revalidation (stale-while-revalidate)
- CSS: Tailwind purging unused styles
- Fonts: Inter loaded via font subsetting (Phase 3)
- Third-party scripts: Sentry loaded async with fallback

### 5.2 Backend

**Optimization**:
- Database: Alembic migrations, indexes on user_id, chapter_id, quiz_attempts
- Connection pooling: asyncpg default settings (min 10, max 10)
- Caching: Redis for frequently accessed data (chapters list, top-level analytics)
- API response time target: p95 < 500ms for all endpoints

### 5.3 Database Indexes

```sql
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_chapter_id ON quiz_attempts(chapter_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_ai_analysis_user_id ON ai_analysis(user_id);
```

---

## 6. SEO & Metadata

### 6.1 Sitemap

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fatimazehra-ai-tutor.com/</loc>
    <lastmod>2026-03-23</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fatimazehra-ai-tutor.com/pricing</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fatimazehra-ai-tutor.com/learn</loc>
    <priority>0.7</priority>
  </url>
  <!-- Per-chapter URLs -->
  <url>
    <loc>https://fatimazehra-ai-tutor.com/learn/python-basics</loc>
    <priority>0.6</priority>
  </url>
</urlset>
```

### 6.2 robots.txt

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://fatimazehra-ai-tutor.com/sitemap.xml
```

### 6.3 Metadata API (Next.js)

```javascript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'FatimaZehra AI Tutor - Learn Python with AI',
  description: 'Master Python with AI-powered personalized learning paths. Free chapters 1-3, Premium access to all 10 chapters.',
  openGraph: {
    title: 'FatimaZehra AI Tutor',
    description: 'Learn Python with AI coaching',
    url: 'https://fatimazehra-ai-tutor.com',
    siteName: 'FatimaZehra AI Tutor',
    images: [
      {
        url: 'https://cdn.example.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FatimaZehra AI Tutor',
    description: 'Learn Python with AI coaching',
    images: ['https://cdn.example.com/og-image.png'],
  },
};
```

---

## 7. Rate Limiting (Upstash Redis)

### 7.1 AI Chat Rate Limiting

```python
# backend/middleware/rate_limit.py
async def rate_limit_ai_chat(user_id: UUID, tier: str):
    redis = Redis.from_url(REDIS_URL)
    key = f"ai_chat:{user_id}"

    limits = {
        'free': 2,     # 2 chats/day
        'premium': 5,  # 5 chats/day
        'pro': None    # unlimited
    }

    if limits[tier] is None:
        return True

    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, 86400)  # 24 hours

    if current > limits[tier]:
        raise HTTPException(429, "Rate limit exceeded")

    return True
```

### 7.2 API Rate Limiting

```python
# 100 requests/minute per user (all endpoints)
# 1000 requests/minute per IP (public endpoints)
```

---

## 8. Monitoring & Observability

### 8.1 Sentry Setup

**Frontend** (`next.config.js`):
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [new Sentry.Replay()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Backend** (`main.py`):
```python
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENV", "development"),
    traces_sample_rate=0.1,
)
```

### 8.2 Metrics

- **Frontend**: Page load time, CLS, error rate, user interactions
- **Backend**: API response time, error rate, database query time, cache hit rate
- **Custom**: User signups, quiz attempts, payments processed

### 8.3 Alerts

- Error rate > 5% → trigger alert
- Response time p95 > 1s → warning
- Payment webhook failure → critical alert
- Database connection pool exhaustion → critical

---

## 9. CI/CD (Optional Phase 3)

### 9.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build
          docker build -t fatimazehra-ai-tutor-frontend:${{ github.sha }} .

      - name: Build backend
        run: |
          cd backend
          pip install -r requirements.txt
          pytest
          docker build -t fatimazehra-ai-tutor-backend:${{ github.sha }} .

      - name: Deploy to K8s
        run: |
          kubectl set image deployment/frontend frontend=fatimazehra-ai-tutor-frontend:${{ github.sha }} -n fatimazehra-ai-tutor
          kubectl set image deployment/backend backend=fatimazehra-ai-tutor-backend:${{ github.sha }} -n fatimazehra-ai-tutor
          kubectl rollout status deployment/frontend -n fatimazehra-ai-tutor
```

---

## 10. Email Notifications

### 10.1 Quiz Result Emails

**Trigger**: After quiz submission, if score < 70%, send encouragement email

**Template**:
```
Subject: 📚 Quiz Review - [Chapter Name]

Hi [Name],

You scored 65% on [Chapter Name]. Here are the topics to review:

1. Classes & Inheritance (2 mistakes)
2. Method Overriding (1 mistake)

💡 Tips to improve:
- Review Chapter 4, section "Classes"
- Try this quiz again tomorrow

[Review Chapter Button]
```

### 10.2 Streak Reminder Emails

**Trigger**: If user hasn't taken a quiz in 3 days, send reminder

**Template**:
```
Subject: 🔥 Your 7-day streak is waiting!

Hi [Name],

You had a 7-day learning streak! Keep it going by completing your next quiz today.

Next recommended chapter: [Chapter Name]

[Start Learning Button]
```

---

## 11. Acceptance Criteria (Phase 3 Go/No-Go)

- [ ] Docker images build without errors; containers run locally
- [ ] docker-compose up --build starts all services; health checks pass
- [ ] K8s manifests deploy; all pods Running, healthy
- [ ] Admin dashboard displays metrics (user count, revenue, analytics)
- [ ] Lighthouse score ≥ 90 (LCP < 2.5s, CLS < 0.1)
- [ ] Sitemap.xml generated; robots.txt accessible
- [ ] Rate limiting enforced; AI chat limited to 5/day (premium)
- [ ] Sentry receives and displays errors from frontend + backend
- [ ] Email notifications send on quiz result and streak milestones
- [ ] CI/CD pipeline runs on push to main; tests pass before deploy
- [ ] Zero hardcoded secrets; all in K8s secrets
- [ ] Rollback tested: kubectl rollout undo works
- [ ] Performance monitoring active; p95 response time < 500ms

---

## 12. Deployment Checklist

Before pushing to production:
- [ ] Database backups configured (Neon automatic backups)
- [ ] Monitoring alerts configured (Sentry, custom metrics)
- [ ] SSL certificate (Let's Encrypt via cert-manager, Phase 3 optional)
- [ ] DNS configured (point domain to ingress IP)
- [ ] Email domain verified (Resend SPF/DKIM/DMARC)
- [ ] Stripe webhooks configured for production account
- [ ] OpenAI production API keys set
- [ ] Health checks responding on all services
- [ ] Load testing completed (simulate 100 concurrent users)
- [ ] Security audit passed (no hardcoded secrets, HTTPS enforced)

---

**Next**: Maintenance & improvements beyond Phase 3 (advanced caching, GraphQL, mobile apps, etc.)
