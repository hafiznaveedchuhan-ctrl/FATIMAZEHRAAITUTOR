import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  premium: 50,
  pro: Infinity,
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

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userTier: string = (session.user as any)?.tier || 'free'

  try {
    const body = await req.json()
    const { message, context, history = [] } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build system prompt with chapter context
    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nCurrent chapter context: The student is studying "${context}". Focus your help on this topic.`
      : SYSTEM_PROMPT

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemContent },
      ...history.slice(-10), // Keep last 10 messages for context window
      { role: 'user', content: message.trim() },
    ]

    const stream = await openai.chat.completions.create({
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
            if (delta) {
              controller.enqueue(encoder.encode(delta))
            }
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
        'X-Tier-Limit': String(TIER_LIMITS[userTier] ?? 5),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)

    if (error?.status === 401) {
      return NextResponse.json({ error: 'Invalid OpenAI API key' }, { status: 500 })
    }
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
    }

    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
