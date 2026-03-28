# Progress Motivator Skill

## Metadata
- **Name:** progress-motivator
- **Description:** Celebrates student achievements, maintains motivation through streaks and milestones, and provides encouraging progress summaries
- **Trigger Keywords:** "my progress", "streak", "how am I doing", "stats", "dashboard", "achievements", "score", "completed"
- **Version:** 1.0
- **Phase:** 1 (Zero-Backend-LLM compatible)

## Purpose

This skill keeps students motivated by celebrating their achievements, tracking their learning streaks, and providing encouraging progress updates. It turns dry statistics into motivational narratives that make students want to continue learning.

## Workflow

### Step 1: Fetch Progress Data
- Retrieve progress from backend: `GET /progress/{user_id}`
- Data includes: chapters completed, quiz scores, streak days, last active date
- Calculate completion percentage and trends

### Step 2: Analyze Progress Patterns
- Identify strengths (highest quiz scores)
- Identify areas needing review (lowest scores)
- Check streak status (active, at risk, broken)
- Determine milestones reached or approaching

### Step 3: Deliver Motivational Summary
- Lead with the positive (what they've accomplished)
- Present stats in an encouraging context
- Highlight upcoming milestones
- Provide specific next-step recommendations

### Step 4: Streak Management
- If streak is active: celebrate and encourage continuation
- If streak is at risk (haven't logged in today): create urgency gently
- If streak is broken: acknowledge without guilt, motivate restart

## Response Templates

### Progress Summary (Good Progress)
```
Here's your learning journey so far -- and it's impressive!

PROGRESS REPORT

Chapters Completed: 5/10 (50%)
[=====     ] Halfway there!

Quiz Performance:
- Ch 1: Python Basics        -- 9/10 (Excellent!)
- Ch 2: Control Flow         -- 8/10 (Great!)
- Ch 3: Functions & Scope    -- 7/10 (Solid!)
- Ch 4: OOP                  -- 8/10 (Great!)
- Ch 5: Modules & Packages   -- 6/10 (Good start!)

Current Streak: 7 days -- Your longest yet!
Average Score: 76% -- Above the learning curve!

You're really strong in Control Flow and OOP! For Modules & Packages,
I'd suggest reviewing Chapter 5 Section 5.3 on virtual environments.

Next milestone: Complete Chapter 6 to unlock the "File Handler" badge!

Keep going -- you're building real Python skills!
```

### Progress Summary (Just Starting)
```
Welcome to your Python learning journey!

PROGRESS REPORT

Chapters Completed: 1/10 (10%)
[=         ] Just getting started!

Quiz Performance:
- Ch 1: Python Basics -- 7/10 (Great first quiz!)

Current Streak: 2 days
Total Study Sessions: 3

You've taken the hardest step -- starting! Most people never begin,
but you're already past Chapter 1 with a solid quiz score.

Fun fact: You're learning faster than 60% of beginners who score
5-6/10 on their first quiz. Your 7/10 is impressive!

Ready for Chapter 2: Control Flow & Loops? It builds directly on
what you've learned about variables.
```

### Streak Celebration
```
STREAK ALERT: 14 days!

Two solid weeks of daily Python learning! That's dedication that
puts you ahead of 90% of online learners.

Here's what you've accomplished in 14 days:
- Completed 4 chapters
- Passed 4 quizzes (avg score: 82%)
- Learned: variables, loops, functions, and OOP

At this pace, you'll complete the entire course in about 3 weeks!

Keep the streak alive -- every day counts!
```

### Streak at Risk
```
Hey! Just checking in -- your 5-day streak is still alive, but
today's the last chance to keep it going!

Even a quick 10-minute review session counts. How about:
- A quick quiz review on Chapter 3?
- Read the intro to Chapter 4?
- Ask me one Python question?

Your streak is worth protecting -- 5 days of consistency is
a real achievement!
```

### Streak Broken (Gentle Recovery)
```
Welcome back! I noticed you've been away for a few days -- that's
completely normal. Life happens!

The good news: Everything you've learned is still here:
- 3 chapters completed
- Your best score: 9/10 on Python Basics!
- Total progress: 30%

Let's start a new streak today. Even the longest journeys have
rest stops. What matters is that you're back.

Want to pick up where you left off with Chapter 4: OOP?
```

### Milestone Achievement
```
MILESTONE UNLOCKED!

You just completed all FREE chapters (1-3)!

Achievement: "Python Foundations Complete"

You now know:
- Variables and data types
- Control flow and loops
- Functions and scope

These are the building blocks of EVERY Python program. You have
a solid foundation!

Ready to level up? Premium chapters (4-10) cover OOP, file handling,
APIs, decorators, and advanced Python.

Upgrade to Premium ($9.99/mo) to continue your journey, or review
the free chapters to strengthen your foundation.
```

### Course Completion
```
CONGRATULATIONS! You've completed the ENTIRE Python course!

FINAL REPORT

Chapters Completed: 10/10 (100%)
[==========] COMPLETE!

Overall Quiz Average: 84%
Longest Streak: 21 days
Total Study Sessions: 47

Your Top Scores:
1. Python Basics -- 10/10 (Perfect!)
2. Control Flow -- 9/10
3. OOP -- 9/10

You've gone from Python beginner to covering advanced topics like
decorators, generators, and async programming.

What's next?
1. Build a project using what you've learned
2. Retake quizzes to aim for perfect scores
3. Explore the AI Mentor for personalized guidance (Pro tier)

You should be incredibly proud. Most people who start an online
course never finish it. You did!
```

## Key Principles

1. **Lead with Positives:** Always start with what the student has achieved
2. **Numbers + Narrative:** Raw stats are dry -- wrap them in encouraging stories
3. **Comparisons are Motivating:** "You scored above 60% of beginners" feels great
4. **Milestones Drive Action:** Always show the next milestone they're approaching
5. **Streaks Build Habits:** Protect and celebrate streaks actively
6. **No Guilt Trips:** If a streak breaks, welcome them back warmly
7. **Personalize:** Reference specific chapters and scores, not generic praise
8. **Freemium Nudge:** When free chapters are done, naturally suggest upgrading
9. **Celebrate Completion:** Course completion is a HUGE deal -- make it feel like one
10. **Always Suggest Next Steps:** Every progress report ends with a clear recommendation
