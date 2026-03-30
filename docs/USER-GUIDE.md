# FatimaZehra AI Tutor - Complete User Guide

> Step-by-step guide for using all 3 phases of the Python AI Tutor platform.
> Every step is explained in baby steps - follow along in your browser or VS Code.

---

## Table of Contents

- [Phase 1: Custom GPT (ChatGPT App)](#phase-1-custom-gpt-chatgpt-app)
- [Phase 2: AI Smart Features (Pro Tier)](#phase-2-ai-smart-features-pro-tier)
- [Phase 3: Web App (Browser)](#phase-3-web-app-browser)
- [VS Code Developer Guide](#vs-code-developer-guide)

---

## Phase 1: Custom GPT (ChatGPT App)

### What is it?
A Custom GPT inside ChatGPT that teaches Python. Students open ChatGPT, select our GPT, and start learning. The GPT fetches chapter data, quiz questions, and progress from our backend automatically.

### How to Use (Browser - Baby Steps)

#### Step 1: Open ChatGPT
1. Open your browser
2. Go to `https://chat.openai.com`
3. Log in with your OpenAI account
4. You need ChatGPT Go ($5/mo) or Plus ($20/mo) plan to use Custom GPTs

#### Step 2: Find the Custom GPT
1. Click **"Explore GPTs"** in the left sidebar
2. Search for **"FatimaZehra Python Tutor"**
3. Click on it to open
4. Or: If you have the direct link, just click it

#### Step 3: Start Learning Python
1. You will see a welcome message from the tutor
2. Type any Python question, for example:

```
What are variables in Python?
```

3. The GPT will fetch Chapter 1 data from our backend and explain it to you
4. It will include code examples and real-world analogies

#### Step 4: Take a Quiz
1. Type:

```
Give me a quiz on Chapter 1
```

2. The GPT will fetch quiz questions from backend
3. It will ask you questions one by one
4. After you answer, it tells you if you're right or wrong with explanation
5. At the end, you get your score

#### Step 5: Check Your Progress
1. Type:

```
Show my progress
```

2. The GPT fetches your completion data from backend
3. Shows which chapters you've done, quiz scores, and what to study next

#### Step 6: Free vs Paid Content
| What You Type | Free Tier | Premium/Pro |
|---|---|---|
| "Teach me variables" | Chapter 1-3 content | All 10 chapters |
| "Quiz on OOP" | Blocked (Chapter 4) | Full quiz access |
| "Analyze my weaknesses" | Not available | Pro tier only |

---

### How to CREATE the Custom GPT (For Developer/Admin)

> This is for the person who builds the GPT, not the student.

#### Step 1: Open GPT Builder
1. Go to `https://chat.openai.com`
2. Login with ChatGPT Go/Plus account
3. Click your profile icon (bottom-left)
4. Click **"My GPTs"**
5. Click **"Create a GPT"**

#### Step 2: Set Basic Info
1. Click **"Configure"** tab (not Create)
2. Fill in:
   - **Name:** `FatimaZehra Python Tutor`
   - **Description:** `Your personal AI Python tutor. Learn Python from basics to advanced with quizzes, explanations, and progress tracking.`
   - **Instructions:** Copy ALL text from `chatgpt-app/instructions.md` and paste here

#### Step 3: Add Conversation Starters
Add these 4 starters:
```
Explain Python variables with examples
Give me a quiz on Chapter 1
Show my learning progress
What chapter should I study next?
```

#### Step 4: Add Actions (API Connection)
1. Scroll down to **"Actions"**
2. Click **"Create new action"**
3. In **"Authentication"**: Select **"None"** (our API handles auth internally)
4. In **"Schema"**: Copy ALL content from `chatgpt-app/openapi-schema.json` and paste
5. Click **"Test"** to verify endpoints work

#### Step 5: Add Phase 2 Actions (Optional - Pro Features)
1. Create another action
2. Paste content from `chatgpt-app/openapi-schema-hybrid.json`
3. This adds `/ai/learning-path` and `/ai/analyze-weakness` endpoints

#### Step 6: Configure Settings
1. **Web Browsing:** OFF
2. **DALL-E Image Generation:** OFF
3. **Code Interpreter:** OFF
4. These are OFF because our GPT only needs backend data, not extra tools

#### Step 7: Save and Publish
1. Click **"Save"** (top-right)
2. Choose **"Everyone"** to make it public
3. Or choose **"Only people with a link"** for private access
4. Copy the share link for students

---

## Phase 2: AI Smart Features (Pro Tier)

### What is it?
Two AI-powered backend endpoints that analyze student performance using GPT-4o. These work inside BOTH the Custom GPT (Phase 1) and the Web App (Phase 3). Only available for Pro tier users ($19.99/mo).

### Feature 1: Weakness Analysis

#### How it Works (Web App)
1. Open the web app: `https://frontend-blue-kappa-15.vercel.app`
2. Login with your Pro account
3. Take quizzes on multiple chapters first (need data to analyze)
4. The AI analyzes your quiz patterns
5. Tells you which topics you're weak in
6. Gives specific recommendations

#### Example Response:
```json
{
  "weak_topics": [
    {
      "topic": "Object Oriented Programming",
      "chapter": "Chapter 4: OOP",
      "score_trend": "declining",
      "recommendation": "Review class inheritance and polymorphism concepts"
    },
    {
      "topic": "Exception Handling",
      "chapter": "Chapter 7: Exception Handling",
      "score_trend": "low",
      "recommendation": "Practice try/except blocks with real-world examples"
    }
  ],
  "overall_assessment": "Strong in basics, needs work on advanced concepts",
  "focus_chapters": [4, 7],
  "next_action": "Start with Chapter 7 - it has the lowest score"
}
```

#### How it Works (Custom GPT)
1. Open FatimaZehra Python Tutor in ChatGPT
2. Type:

```
Analyze my weaknesses
```

3. The GPT calls `/ai/analyze-weakness` endpoint
4. Shows you weak topics in a friendly conversational way

### Feature 2: Adaptive Learning Path

#### How it Works (Web App)
1. Login to web app with Pro account
2. The AI looks at your quiz scores + progress
3. Generates a personalized chapter order
4. Instead of going 1→2→3→4, it might say 1→3→7→4 based on your needs

#### Example Response:
```json
{
  "recommended_chapters": [
    {"chapter_number": 7, "chapter_title": "Exception Handling", "reason": "Lowest quiz score - needs immediate attention", "priority": "high"},
    {"chapter_number": 4, "chapter_title": "OOP", "reason": "Declining scores - revisit fundamentals", "priority": "high"},
    {"chapter_number": 8, "chapter_title": "APIs & Requests", "reason": "Not started yet - builds on previous chapters", "priority": "medium"}
  ],
  "summary": "Focus on weak areas first, then progress to new chapters",
  "estimated_completion_days": 10
}
```

#### How it Works (Custom GPT)
1. Type in ChatGPT:

```
What should I study next?
```

2. The GPT calls `/ai/learning-path` endpoint
3. Gives you a personalized study plan

---

## Phase 3: Web App (Browser)

### What is it?
A full website where students learn Python. Has chapters, quizzes, AI chat, and Stripe payments. Built with Next.js (frontend) and FastAPI (backend).

### How to Use (Browser - Baby Steps)

#### Step 1: Open the Website
1. Open your browser (Chrome, Firefox, Edge - any)
2. Go to: `https://frontend-blue-kappa-15.vercel.app`
3. You will see the landing page with "Learn Python with AI" heading

#### Step 2: Create an Account
1. Click **"Sign Up"** or **"Get Started"**
2. Option A - Email:
   - Enter your name
   - Enter your email
   - Create a password (min 8 characters)
   - Click **"Sign Up"**
3. Option B - Google:
   - Click **"Sign in with Google"**
   - Select your Google account
   - Automatic signup

#### Step 3: Explore Free Chapters
1. After login, you see the Dashboard
2. Click **"Chapters"** in the sidebar/navigation
3. You will see 10 chapters listed
4. Chapters 1, 2, 3 have a **"Free"** badge - click any of them
5. Example: Click **"Chapter 1: Python Basics & Variables"**
6. Read the chapter content - it has:
   - Theory with explanations
   - Code examples
   - Real-world analogies

#### Step 4: Take a Quiz
1. After reading a chapter, click **"Take Quiz"**
2. You get 10 multiple-choice questions
3. Select your answer for each question
4. Click **"Submit"**
5. You see your results:
   - Score (e.g., 80%)
   - Which answers were correct/wrong
   - Explanation for each question

#### Step 5: Chat with AI Tutor
1. Click **"AI Chat"** in the navigation
2. Type any Python question:

```
Explain list comprehension with 3 examples
```

3. The AI (GPT-4o) responds with a detailed explanation
4. Free tier: Limited chat tokens
5. Premium/Pro: Unlimited AI chat

#### Step 6: Upgrade to Premium (Stripe Payment)
1. Click **"Upgrade"** or try to open Chapter 4
2. You see pricing plans:
   - **Premium** - $9.99/mo (all chapters + unlimited quiz + 5 AI chats/day)
   - **Pro** - $19.99/mo (everything + weakness analysis + learning paths)
3. Click **"Subscribe"** on your preferred plan
4. Stripe checkout page opens
5. For testing, use this card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/28`)
   - CVC: Any 3 digits (e.g., `123`)
6. Click **"Pay"**
7. You're redirected back to the app with premium access unlocked

#### Step 7: Access Premium Chapters
1. After payment, go back to **"Chapters"**
2. Chapters 4-8 are now unlocked (Premium)
3. Chapters 9-10 are unlocked if you chose Pro
4. Read, quiz, and chat on all unlocked chapters

#### Step 8: Track Your Progress
1. Click **"Dashboard"** or **"Progress"**
2. You see:
   - How many chapters you've completed
   - Your quiz scores for each chapter
   - Your learning streak
   - Overall completion percentage

---

## VS Code Developer Guide

### How to Run the Project Locally (Baby Steps)

#### Prerequisites
Make sure you have these installed:
- **Node.js** 18+ → Download from `https://nodejs.org`
- **Python** 3.12+ → Download from `https://python.org`
- **Git** → Download from `https://git-scm.com`
- **VS Code** → Download from `https://code.visualstudio.com`

#### Step 1: Clone the Repository
1. Open VS Code
2. Press `Ctrl + ~` to open terminal
3. Type:

```bash
git clone https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR.git
cd FATIMAZEHRAAITUTOR
```

#### Step 2: Setup Backend
1. In VS Code terminal:

```bash
cd backend
python -m venv venv
```

2. Activate virtual environment:

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file in `backend/` folder:

```bash
cp ../.env.example .env
```

5. Open `.env` and fill in your values:

```env
DATABASE_URL=postgresql+asyncpg://your-neon-db-url
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
SECRET_KEY=any-random-string-for-jwt
REDIS_URL=your-upstash-redis-url
```

6. Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

7. Open `http://localhost:8000/docs` in browser - you should see Swagger API docs

#### Step 3: Setup Frontend
1. Open a NEW terminal in VS Code (`Ctrl + Shift + ~`)
2. Type:

```bash
cd frontend
npm install
```

3. Create `.env.local` file in `frontend/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

4. Run the frontend:

```bash
npm run dev
```

5. Open `http://localhost:3000` in browser - you should see the app

#### Step 4: Seed the Database
1. Go back to backend terminal
2. Run:

```bash
python seed.py
```

3. This adds all 10 chapters and quiz questions to your database

#### Step 5: Test Everything
1. Open `http://localhost:3000` in browser
2. Sign up with a test email
3. Read Chapter 1
4. Take the quiz
5. Try AI Chat
6. Test Stripe payment with card `4242 4242 4242 4242`

### Project Structure in VS Code

```
FATIMAZEHRAAITUTOR/
│
├── frontend/              ← Next.js 14 app (open this in VS Code)
│   ├── app/               ← Pages and layouts
│   ├── components/        ← UI components
│   ├── lib/               ← Utilities and API helpers
│   └── public/            ← Static assets
│
├── backend/               ← FastAPI app
│   ├── main.py            ← App entry point
│   ├── models.py          ← Database models
│   ├── database.py        ← DB connection
│   ├── routes/            ← API endpoints
│   │   ├── auth.py        ← Login, signup, logout
│   │   ├── chapters.py    ← Chapter CRUD
│   │   ├── quiz.py        ← Quiz questions and grading
│   │   ├── progress.py    ← User progress tracking
│   │   ├── payment.py     ← Stripe integration
│   │   └── ai.py          ← Phase 2 AI endpoints
│   ├── seed.py            ← Database seeder (chapters + quiz)
│   └── requirements.txt   ← Python dependencies
│
├── chatgpt-app/           ← Custom GPT configuration
│   ├── instructions.md    ← GPT system prompt
│   ├── openapi-schema.json         ← Phase 1 Actions
│   ├── openapi-schema-hybrid.json  ← Phase 2 Actions
│   └── README.md          ← GPT Builder setup guide
│
├── docs/                  ← Documentation
│   ├── architecture-diagram.md
│   ├── cost-analysis.md
│   ├── spec.md
│   └── USER-GUIDE.md      ← This file
│
├── k8s/                   ← Kubernetes manifests
├── docker-compose.yml     ← Local dev with Docker
└── docker-compose.prod.yml ← Production Docker config
```

### Useful VS Code Extensions
- **Python** (Microsoft) - Python IntelliSense
- **Pylance** - Python type checking
- **ES7+ React Snippets** - React/Next.js snippets
- **Tailwind CSS IntelliSense** - CSS class suggestions
- **Thunder Client** - API testing (like Postman)
- **GitLens** - Git history and blame

### Common Commands Reference

| Task | Command |
|---|---|
| Start backend | `cd backend && uvicorn main:app --reload --port 8000` |
| Start frontend | `cd frontend && npm run dev` |
| Seed database | `cd backend && python seed.py` |
| Run backend tests | `cd backend && pytest` |
| Run frontend tests | `cd frontend && npm test` |
| Build frontend | `cd frontend && npm run build` |
| Check API docs | Open `http://localhost:8000/docs` |

---

## Production URLs

| Service | URL |
|---|---|
| **Web App** | https://frontend-blue-kappa-15.vercel.app |
| **Backend API** | https://naveed64-fatimazehra-ai-tutor-backend.hf.space |
| **API Docs** | https://naveed64-fatimazehra-ai-tutor-backend.hf.space/docs |
| **GitHub** | https://github.com/hafiznaveedchuhan-ctrl/FATIMAZEHRAAITUTOR |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Backend won't start | Check `.env` file has correct `DATABASE_URL` |
| Frontend blank page | Check `.env.local` has correct `NEXT_PUBLIC_API_URL` |
| Stripe payment fails | Use test card: `4242 4242 4242 4242` |
| AI Chat not responding | Check `OPENAI_API_KEY` is set and has balance |
| Quiz shows no questions | Run `python seed.py` to seed the database |
| CORS errors in browser | Backend CORS must include your frontend URL |
| "Pro tier required" | Upgrade via Stripe or manually set tier in database |

---

*Built for Panaversity Agent Factory Hackathon IV*
*FatimaZehra-AI-Tutor - Learn Python with AI*
