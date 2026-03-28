# ChatGPT App Setup Guide

## FatimaZehra Python Tutor - Custom GPT

This guide explains how to create the ChatGPT App (Custom GPT) for the FatimaZehra Python Tutor on OpenAI's platform.

---

## Prerequisites

- An OpenAI account with ChatGPT Plus or Team subscription
- Access to GPT Builder (chat.openai.com)
- Backend deployed and running at: `https://naveed64-fatimazehra-ai-tutor-backend.hf.space`

---

## Step-by-Step Setup

### Step 1: Open GPT Builder

1. Go to [chat.openai.com](https://chat.openai.com)
2. Click on your profile icon (bottom-left)
3. Select **"My GPTs"**
4. Click **"Create a GPT"** (top-right)
5. Switch to the **"Configure"** tab

### Step 2: Basic Information

Fill in these fields:

| Field | Value |
|:---|:---|
| **Name** | FatimaZehra Python Tutor |
| **Description** | Your personal AI tutor for learning Python programming. 10 structured chapters from basics to advanced, with quizzes, progress tracking, and a freemium model. Built for Panaversity Agent Factory Hackathon IV. |
| **Profile Picture** | Upload a Python-themed educational logo |

### Step 3: Instructions

1. Open the file: `chatgpt-app/instructions.md`
2. Copy the ENTIRE content
3. Paste it into the **"Instructions"** field in GPT Builder

### Step 4: Conversation Starters

Add these conversation starters:

```
Show me the Python course chapters
Teach me Chapter 1: Python Basics
Quiz me on Chapter 1
Show my learning progress
```

### Step 5: Configure Actions

1. Scroll down to **"Actions"**
2. Click **"Create new action"**
3. In the **"Authentication"** section:
   - Select **"None"** (students will authenticate through the conversation)
4. In the **"Schema"** field:
   - Open the file: `chatgpt-app/openapi-schema.json`
   - Copy the ENTIRE JSON content
   - Paste it into the schema field
5. Click **"Test"** to verify the schema is valid

### Step 6: Knowledge (Optional)

You can upload these files as knowledge:
- Course syllabus or chapter summaries
- Agent Skills documentation from `.claude/skills/`

### Step 7: Additional Settings

| Setting | Value |
|:---|:---|
| **Web Browsing** | OFF |
| **DALL-E Image Generation** | OFF |
| **Code Interpreter** | ON (for running Python examples) |

### Step 8: Save & Publish

1. Click **"Save"** (top-right)
2. Choose visibility:
   - **"Only me"** for testing
   - **"Anyone with a link"** for hackathon demo
   - **"Public"** for production
3. Click **"Confirm"**

---

## Testing the GPT

After creating the GPT, test these scenarios:

### Test 1: Chapter Listing
```
User: "Show me the chapters"
Expected: GPT calls listChapters API and shows all 10 chapters with tiers
```

### Test 2: Content Delivery
```
User: "Teach me Chapter 1"
Expected: GPT calls getChapterContent, fetches MDX, explains in simple terms
```

### Test 3: Quiz Flow
```
User: "Quiz me on Chapter 1"
Expected: GPT calls getQuizQuestions, presents Q1 of 10, waits for answer
```

### Test 4: Progress Check
```
User: "How am I doing?"
Expected: GPT calls getStudentProgress, shows stats with encouragement
```

### Test 5: Freemium Gate
```
User: "Teach me Chapter 4" (as free user)
Expected: GPT explains this is premium, suggests upgrading, offers free alternatives
```

### Test 6: Grounded Q&A
```
User: "What are decorators in Python?"
Expected: GPT fetches relevant chapter content, explains ONLY from course material
```

---

## Architecture

```
Student opens ChatGPT
        |
        v
Custom GPT: "FatimaZehra Python Tutor"
  |-- Instructions (from instructions.md)
  |-- Actions (from openapi-schema.json)
        |
        | API calls (HTTPS)
        v
Backend: https://naveed64-fatimazehra-ai-tutor-backend.hf.space
  |-- GET /chapters (list)
  |-- GET /chapters/{id} (content)
  |-- GET /quiz/by-slug/{slug}/questions
  |-- POST /quiz/submit (rule-based grading)
  |-- GET /progress/me (stats)
  |-- POST /progress/mark-complete
  |-- GET /payment/subscription (tier check)
        |
        v
Neon PostgreSQL (same database as web app)
```

### Key Principle: Zero-Backend-LLM

- Backend performs **ZERO** LLM inference
- ChatGPT handles **ALL** explanation, tutoring, and adaptation
- Backend only serves data and grades quizzes with answer keys
- Cost to developer: **$0** for LLM (students use their own ChatGPT subscription)

---

## Files in This Folder

| File | Purpose | Where to Use |
|:---|:---|:---|
| `README.md` | This setup guide | Reference |
| `instructions.md` | GPT system prompt | Paste into GPT Builder "Instructions" |
| `openapi-schema.json` | Phase 1 API Actions schema | Paste into GPT Builder "Actions" |
| `openapi-schema-hybrid.json` | Phase 2 hybrid schema (premium) | Separate Actions for premium features |

---

## Troubleshooting

### "Action failed" errors
- Check if backend is running: visit `https://naveed64-fatimazehra-ai-tutor-backend.hf.space/health`
- Verify CORS allows `https://chat.openai.com`

### Authentication issues
- Students need to register/login through the conversation first
- The GPT should call registerUser or loginUser before accessing protected endpoints
- Store the access_token and include it in subsequent API calls

### Quiz not grading
- Ensure all 10 answers are collected before calling submitQuiz
- Each answer needs both `question_id` and `selected_option` (0-3)

---

## Phase 2: Hybrid Features (Premium)

For Phase 2, add these premium-gated hybrid endpoints using `openapi-schema-hybrid.json`:
- `POST /ai/learning-path` - Adaptive learning recommendations (uses LLM)
- `POST /ai/analyze-weakness` - Weakness analysis from quiz patterns (uses LLM)

These are ONLY available to Pro tier users and require separate Actions configuration.

---

**Built for Panaversity Agent Factory Hackathon IV**
**Team: FatimaZehra AI Tutor**
