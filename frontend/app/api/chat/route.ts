import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  })
}

/** Messages per day per tier */
const TIER_LIMITS: Record<string, number> = {
  free: 5,
  premium: 50,
  pro: Infinity,
}

/** In-memory rate limiter — keyed by userId:dayStamp */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(
  userId: string,
  tier: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = TIER_LIMITS[tier] ?? 5
  if (!isFinite(limit)) return { allowed: true, remaining: 999, resetAt: 0 }

  const DAY_MS = 24 * 60 * 60 * 1000
  const dayStamp = Math.floor(Date.now() / DAY_MS)
  const key = `${userId}:${dayStamp}`

  const entry = rateLimitStore.get(key) ?? { count: 0, resetAt: Date.now() + DAY_MS }

  // Clean expired keys periodically (every ~1000 requests)
  if (Math.random() < 0.001) {
    const now = Date.now()
    for (const [k, v] of rateLimitStore) {
      if (v.resetAt < now) rateLimitStore.delete(k)
    }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  rateLimitStore.set(key, { count: entry.count + 1, resetAt: entry.resetAt })
  return { allowed: true, remaining: limit - entry.count - 1, resetAt: entry.resetAt }
}

const SYSTEM_PROMPT = `You are FatimaZehra AI Tutor, an expert Python programming tutor.
Your role is to help students learn Python clearly and effectively.

Guidelines:
- Provide clear, concise explanations with working code examples
- Always use \`\`\`python for Python code blocks
- Encourage learners and celebrate progress
- Break down complex concepts into simple steps
- Point out common mistakes and how to avoid them
- If asked about other topics, gently redirect to Python learning`

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized — please log in again' }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Chat is not configured. Please set OPENAI_API_KEY in environment variables.' }, { status: 503 })
  }

  const userTier = session.user.tier || 'free'

  // ── Server-side rate limit check ──
  const { allowed, remaining, resetAt } = checkRateLimit(session.user.id, userTier)
  if (!allowed) {
    const resetIn = Math.ceil((resetAt - Date.now()) / 1000 / 60) // minutes
    return NextResponse.json(
      { error: `Daily message limit reached. Resets in ${resetIn} minutes. Upgrade for more messages.` },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(TIER_LIMITS[userTier] ?? 5),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetAt),
        },
      }
    )
  }

  try {
    const body = await req.json()
    const { message, context, history = [] } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nCurrent chapter context: The student is studying "${context}". Focus your help on this topic.`
      : SYSTEM_PROMPT

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemContent },
      ...history.slice(-10),
      { role: 'user', content: message.trim() },
    ]

    const stream = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      stream: true,
      max_tokens: 1200,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || ''
            if (delta) controller.enqueue(encoder.encode(delta))
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-User-Tier': userTier,
        'X-RateLimit-Limit': String(TIER_LIMITS[userTier] ?? 5),
        'X-RateLimit-Remaining': String(remaining),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const apiError = error as { status?: number; message?: string; code?: string; error?: { message?: string } }

    if (apiError?.status === 401 || apiError?.code === 'invalid_api_key') {
      return NextResponse.json({ error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY.' }, { status: 500 })
    }
    if (apiError?.status === 429) {
      return NextResponse.json({ error: 'OpenAI rate limit exceeded. Try again later.' }, { status: 429 })
    }
    if (apiError?.code === 'insufficient_quota') {
      return NextResponse.json({ error: 'OpenAI quota exceeded. Please check your billing at platform.openai.com.' }, { status: 500 })
    }

    const errMsg = apiError?.message || apiError?.error?.message || 'Failed to generate response'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
