# Phase 2 Specification: AI Personalization & Coach

**Objective**: Backend AI features — weak-point analysis, personalized learning paths, email coaching.
**Prerequisite**: Phase 1 complete (MVP working)
**Duration**: 5 days
**Gate**: Pro tier ($19.99/mo) unlocks all Phase 2 features

---

## 1. Scope & Overview

### What's New
- **Weak-Point Analysis**: GPT-4 reads user's quiz attempts, returns structured analysis of weak topics
- **Personalized Learning Path**: AI ranks chapters by user's quiz performance; recommends focus areas
- **Spaced Repetition**: Suggests quiz retakes based on time + score decay (forgetting curve)
- **Email Coach**: Weekly summary email (Resend) with progress metrics + weak-point recommendations
- **AI Conversation History**: Store chat messages for context continuity (future model fine-tuning)

### Pro Tier Gate
All Phase 2 features require `user.tier == "pro"` (return 403 otherwise).

### Freemium Tiers Updated
| Tier | Features |
|---|---|
| Free | Phase 1 features (chapters 1–3) |
| Premium | Phase 1 features (all chapters) + free AI chat (5/day, 50% tokens) |
| Pro | All Phase 1 + All Phase 2 features + unlimited AI, email coach |

---

## 2. Feature Breakdown

### 2.1 Weak-Point Analysis

**User Story**:
- AS a pro user, I want to understand my quiz weak points so I can focus on difficult topics

**How It Works**:
1. User clicks "Analyze My Learning" on dashboard
2. Backend fetches all quiz_attempts for user (past 30 days)
3. GPT-4 processes: topic, score, error patterns
4. Returns structured analysis: weak topics, recommended review chapters, personalized tips
5. Frontend displays report with suggested next actions

**API Contracts**:

```
POST /ai/analyze-weaknesses
  Input: { user_id: uuid }
  Output: {
    analysis_id: uuid,
    user_id: uuid,
    summary: string (GPT-4 generated),
    weak_topics: [
      {
        topic: string (e.g., "Classes & Inheritance"),
        confidence: float (0.0-1.0),
        error_count: int,
        avg_score: int,
        recommendation: string
      }
    ],
    focus_chapters: [
      { chapter_id: uuid, reason: string, priority: "high"|"medium"|"low" }
    ],
    next_action: string,
    generated_at: ISO8601,
    pro_only: true
  }
  Errors: 401, 403 (not pro), 500

GET /ai/analysis-history
  Output: [analysis records, newest first]
  Errors: 401, 403 (not pro), 500
```

**Backend Implementation**:

```python
# Pseudocode
async def analyze_weaknesses(user_id: UUID):
    # 1. Fetch quiz_attempts (past 30 days)
    attempts = await db.query(
        "SELECT * FROM quiz_attempts
         WHERE user_id = :uid AND completed_at > NOW() - INTERVAL '30 days'
         ORDER BY completed_at DESC"
    )

    # 2. Group by chapter; calculate patterns
    patterns = {}
    for attempt in attempts:
        chapter = await db.get_chapter(attempt.chapter_id)
        if chapter.title not in patterns:
            patterns[chapter.title] = []
        patterns[chapter.title].append({
            'score': attempt.score,
            'errors': [q for q in attempt.answers if not q.is_correct],
            'date': attempt.completed_at
        })

    # 3. Build context for GPT-4
    context = f"""
    User's quiz attempts (last 30 days):
    {json.dumps(patterns, indent=2)}

    For each weak topic (score < 70% average):
    1. Explain why it might be weak
    2. Suggest specific topics to review
    3. Recommend practice exercises
    """

    # 4. Call OpenAI streaming
    response = await openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are a Python tutor..."},
            {"role": "user", "content": context}
        ],
        temperature=0.5,
        max_tokens=1500
    )

    # 5. Parse response + store in DB
    analysis = AnalysisRecord(
        user_id=user_id,
        summary=response.content,
        weak_topics=parse_topics(response.content),
        focus_chapters=map_chapters(parse_topics(response.content)),
        generated_at=now()
    )
    await db.save(analysis)
    return analysis
```

**Cost**:
- Input: ~2KB context (quiz data) = ~500 tokens = $0.005
- Output: ~1500 tokens max = $0.045
- Per call: ~$0.05
- Monthly (5 pro users, 2 analyses/month): ~$0.50

**Database**:
```sql
CREATE TABLE ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  summary TEXT NOT NULL,  -- GPT-4 generated markdown
  weak_topics JSONB,       -- [{ topic, confidence, error_count, recommendation }]
  focus_chapters JSONB,    -- [{ chapter_id, reason, priority }]
  next_action TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Frontend**:
- **Page**: `/ai/analysis` (or `/dashboard` tab)
- **Components**: Summary card, weak topics list (color-coded: red=critical, yellow=medium, green=ok), recommended chapters, "Start Learning" CTA
- **Trigger**: User clicks "Analyze My Performance" button
- **Loading**: Show spinner + "Analyzing your quiz attempts..." message
- **Cache**: Store result for 24 hours (refetch if older)

**Acceptance Criteria**:
- [ ] Only pro users can access (403 for free/premium)
- [ ] Fetches quiz_attempts; groups by topic
- [ ] GPT-4 analysis returns weak topics + recommendations
- [ ] Results saved to DB; can be retrieved later
- [ ] Frontend displays summary + weak topics list
- [ ] Analysis older than 24h shows "Refresh" button
- [ ] Error handling: if analysis fails, show retry message (don't crash)

---

### 2.2 Personalized Learning Path

**User Story**:
- AS a pro user, I want AI to recommend which chapter to learn next based on my performance

**How It Works**:
1. On dashboard load, fetch user's quiz scores
2. AI ranks chapters by: user's score, time since attempt, difficulty (ML model, Phase 3+)
3. Return ordered list with "Why this next?" explanations
4. Frontend shows as "Recommended Learning Path" card

**API Contracts**:

```
GET /ai/learning-path
  Output: {
    path: [
      {
        chapter_id: uuid,
        chapter_number: int,
        title: string,
        reason: string,
        difficulty: "easy"|"medium"|"hard",
        estimated_time_minutes: int,
        priority: "high"|"medium"|"low"
      }
    ],
    strategy: string (e.g., "Review weak topics first, then advance")
  }
  Errors: 401, 403 (not pro), 500

POST /ai/learning-path/start
  Input: { chapter_id: uuid }
  Output: { success: bool, session_id: uuid }
  Errors: 401, 403, 404, 500
```

**Backend Logic**:

```python
async def get_learning_path(user_id: UUID):
    # 1. Get user's quiz scores (all chapters)
    scores = await db.query(
        "SELECT chapter_id, MAX(score) as best_score, COUNT(*) as attempts
         FROM quiz_attempts
         WHERE user_id = :uid
         GROUP BY chapter_id"
    )

    # 2. Score chapters: low-score chapters first (need review)
    # Then unvisited chapters
    chapters = await db.get_chapters()
    scored_chapters = []

    for ch in chapters:
        user_score = next((s['best_score'] for s in scores if s['chapter_id'] == ch.id), None)
        if user_score is None:
            priority = 0  # Not yet attempted
            reason = "You haven't tried this yet"
        elif user_score < 70:
            priority = 1  # Weak
            reason = f"You scored {user_score}% - needs review"
        else:
            priority = 2  # Mastered
            reason = "You've mastered this"

        scored_chapters.append((priority, ch, reason))

    # 3. Sort by priority (weak first), then by chapter number
    sorted_chapters = sorted(scored_chapters, key=lambda x: (x[0], x[1].number))

    # 4. Build path (top 5 recommended)
    path = [
        {
            'chapter_id': ch.id,
            'chapter_number': ch.number,
            'title': ch.title,
            'reason': reason,
            'difficulty': estimate_difficulty(ch.number),  # Increases with chapter #
            'estimated_time_minutes': 30 + (ch.number * 5),
            'priority': ['high', 'medium', 'low'][priority]
        }
        for priority, ch, reason in sorted_chapters[:5]
    ]

    return {
        'path': path,
        'strategy': "Focus on weak topics first, then advance to new material"
    }
```

**Frontend**:
- **Display**: `/dashboard` card titled "Your AI-Powered Learning Path"
- **UX**: Show next 5 chapters in order; click to start chapter
- **Color coding**: Red (weak), yellow (medium), green (mastered)
- **Time estimate**: "~45 min" shown per chapter

**Acceptance Criteria**:
- [ ] Only pro users can access
- [ ] Returns chapters sorted by: weak first, then new, then mastered
- [ ] Includes "reason" explaining why chapter is recommended
- [ ] Difficulty and time estimates reasonable
- [ ] Frontend displays path clearly
- [ ] "Start Learning" button opens chapter

---

### 2.3 Spaced Repetition

**User Story**:
- AS a pro user, I want reminders to retake quizzes I struggled with, using spaced repetition

**How It Works**:
1. Track quiz history (date, score)
2. On dashboard, show "Ready to Review" section: chapters where score was < 80% + time delay exceeded
3. Algorithm: if score < 80%, suggest retake after 3 days; if < 60%, suggest after 1 day
4. AI updates learning path based on retake scores

**Algorithm (Ebbinghaus Forgetting Curve)**:
```
Score 90-100%: Review in 30 days
Score 80-89%:  Review in 10 days
Score 70-79%:  Review in 3 days
Score 60-69%:  Review in 1 day
Score <60%:    Review immediately
```

**API Contracts**:

```
GET /ai/review-suggestions
  Output: {
    ready_now: [{ chapter_id, title, last_score, last_attempted, reason }],
    coming_soon: [{ chapter_id, title, review_date, reason }]
  }
  Errors: 401, 403 (not pro), 500
```

**Frontend**:
- **Display**: `/dashboard` "Ready to Review" section
- **Cards**: Show last score, days since attempt, "Start Quiz" button
- **Notification**: Badge count on nav ("3 reviews due")

**Acceptance Criteria**:
- [ ] Fetches quiz_attempts; calculates next review date
- [ ] Returns chapters with score < 80% and date passed
- [ ] Shows reason ("Your score was 65% - let's review in 1 day")
- [ ] Timer counts down ("Review in 2 days")
- [ ] Retaking quiz updates next_review_date

---

### 2.4 Email Coach (Resend Integration)

**User Story**:
- AS a pro user, I want weekly email summaries of my progress and weak areas

**How It Works**:
1. Scheduled job (cron, Phase 3: APScheduler) runs every Monday 9 AM UTC
2. For each pro user:
   - Calculate weekly stats (chapters viewed, quizzes taken, avg score)
   - Fetch weak-point analysis (or generate fresh one)
   - Build personalized email (Resend template)
   - Send via Resend
3. Email includes: progress summary, weak topics, recommended next chapter, unsubscribe link

**Email Template**:
```
Subject: 🐍 Your Python Learning Report for Week of Mar 17

Hi [Name],

Great progress this week! You completed 3 quizzes and improved by 8% on average.

📊 This Week's Stats
- Chapters viewed: 5
- Quizzes taken: 3
- Average score: 78%
- Current streak: 4 days

🎯 Focus Areas (Weak Topics)
1. Classes & Inheritance (60% avg) → Recommended: Chapter 4 review
2. Decorators (65% avg) → Recommended: Chapter 9 practice

💡 Next Recommendation
Start Chapter 5: Modules & Packages (estimated 45 min)

[Start Learning Button]

Keep up the momentum!
— FatimaZehra AI Tutor
```

**API / Scheduled Task**:

```python
# backend/tasks/send_coach_emails.py
async def send_weekly_coach_emails():
    pro_users = await db.query("SELECT * FROM users WHERE tier = 'pro'")

    for user in pro_users:
        # 1. Get weekly stats
        stats = await calculate_weekly_stats(user.id)

        # 2. Get weak points (cache or generate fresh)
        weak_points = await db.get_latest_analysis(user.id)

        # 3. Render email template
        email_html = render_email_template({
            'name': user.name,
            'stats': stats,
            'weak_points': weak_points,
            'next_chapter': get_next_chapter(user.id)
        })

        # 4. Send via Resend
        await resend.send({
            'to': user.email,
            'subject': f'🐍 Your Python Learning Report for Week of {get_week_date()}',
            'html': email_html,
            'from': 'coach@fatimazehra-ai-tutor.com',
            'unsubscribe_url': f'...?email={user.email}'
        })
```

**Frequency**: Every Monday 9 AM UTC (configurable, Phase 3)

**Opt-Out**: Users can unsubscribe via email link (update user.email_coaching=false)

**Frontend**:
- **Settings page** (`/profile`): Toggle "Weekly Coach Emails" (default on for pro)
- **Email preview**: Show sample email on profile page

**Acceptance Criteria**:
- [ ] Scheduled job runs every Monday 9 AM
- [ ] Email includes weekly stats, weak points, next chapter
- [ ] Sent only to pro users with coaching enabled
- [ ] Unsubscribe link works (sets flag in DB)
- [ ] Error handling: failed emails logged; don't crash
- [ ] (Phase 3 monitoring) Email delivery rate tracked in Sentry

---

## 3. Database Schema Additions

```sql
CREATE TABLE ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  summary TEXT,
  weak_topics JSONB,
  focus_chapters JSONB,
  next_action TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  message_type VARCHAR (user|assistant),
  message_text TEXT,
  chapter_id UUID REFERENCES chapters(id),
  tokens_used INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN email_coaching BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN email_coaching_frequency VARCHAR DEFAULT 'weekly';  -- weekly, biweekly, never
```

---

## 4. Cost Analysis

| Feature | Cost/User/Month | Notes |
|---|---|---|
| Weak-Point Analysis | $0.10 | 2 analyses/month @ $0.05 each |
| Learning Path (cached) | $0.00 | Algorithmic; no API calls |
| Weekly Coach Email | $0.02 | 1 email/week; Resend: ~$0.005/email |
| Unlimited AI Chat | $2–5 | 10–50 chat calls; gpt-4-turbo @ $0.01–0.03 per call |
| **Total per Pro** | **$2.12–5.12** | Sustainable at $19.99/mo |

---

## 5. Testing Strategy

### Backend (pytest)
```python
# test_ai_analysis.py
def test_analyze_weaknesses_pro_only():
    # Free user → 403
    # Pro user → 200 with analysis

def test_analyze_weaknesses_fetches_quiz_data():
    # Mock quiz_attempts
    # Verify GPT-4 receives correct context

def test_learning_path_sorts_by_weak_first():
    # Set up quiz attempts with various scores
    # Verify path returns weak chapters first

def test_spaced_repetition_calculation():
    # Test review date logic for each score bracket
```

### Frontend (browser-use)
```
1. Login as pro user
2. Go to /ai/analysis
3. Click "Analyze My Learning"
4. Wait for spinner → see weak topics
5. Go to /dashboard
6. See "Learning Path" card
7. See "Ready to Review" section
8. Click review quiz
```

---

## 6. Acceptance Criteria (Phase 2 Go/No-Go)

- [ ] Weak-point analysis returns GPT-4 generated weak topics + recommendations
- [ ] Only pro users can access analysis (403 for free/premium)
- [ ] Learning path returns chapters sorted by weakness
- [ ] Spaced repetition shows "Ready to Review" chapters based on forgetting curve
- [ ] Weekly email scheduled; sends to pro users; includes stats + weak points
- [ ] Unsubscribe link works; stops future emails
- [ ] Chat history stored; accessible for future model fine-tuning
- [ ] All APIs tested; coverage ≥ 80%
- [ ] Browser-use E2E: pro user gets analysis → sees learning path → receives email
- [ ] Cost per pro user estimated < $5/month
- [ ] Zero new hardcoded secrets; all Resend key in .env

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| GPT-4 costs escalate | Cap tokens/user/month; fall back to cached results |
| Email delivery fails | Retry queue; log failures in Sentry |
| Analysis takes >10s | Cache results; show spinner; improve latency Phase 3 |

---

## 8. Next: Phase 3

After Phase 2 complete:
- Docker containerization
- Kubernetes deployment
- Admin dashboard (user metrics, revenue)
- SEO (sitemap, metadata)
- Rate limiting (Redis)
- Monitoring & alerting (Sentry)
- Email notifications (quiz results, streak reminders)

See `phase3-spec.md`.
