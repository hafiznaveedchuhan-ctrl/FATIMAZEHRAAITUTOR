'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import NavBar from '@/components/NavBar'
import { Send, Bot, User, Copy, Check, BookOpen, Sparkles, AlertCircle } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Chapter {
  id: string
  number: number
  title: string
  slug: string
  tier_required: string
}

// ─── Tier config ─────────────────────────────────────────────────────────────

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  premium: 50,
  pro: Infinity,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2)
}

// Parse markdown content into text + code segments
type Segment = { type: 'text'; value: string } | { type: 'code'; lang: string; value: string }

function parseContent(content: string): Segment[] {
  const segments: Segment[] = []
  const re = /```(\w*)\n([\s\S]*?)```/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(content)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: content.slice(last, match.index) })
    }
    segments.push({ type: 'code', lang: match[1] || 'python', value: match[2].trimEnd() })
    last = match.index + match[0].length
  }

  if (last < content.length) {
    segments.push({ type: 'text', value: content.slice(last) })
  }

  return segments
}

// ─── Code Block ──────────────────────────────────────────────────────────────

function CodeBlock({ lang, value }: { lang: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-surface-700">
      <div className="flex items-center justify-between bg-surface-800 px-4 py-2">
        <span className="text-xs text-indigo-400 font-mono font-semibold">{lang}</span>
        <button
          onClick={copy}
          className="text-gray-500 hover:text-gray-200 transition flex items-center gap-1 text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={tomorrow}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#1A1A1F',
          padding: '1rem',
          fontSize: '0.875rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

// ─── Render message text with inline code + code blocks ──────────────────────

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const segments = parseContent(content)

  return (
    <div className="space-y-1">
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return <CodeBlock key={i} lang={seg.lang} value={seg.value} />
        }
        return (
          <p
            key={i}
            className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: seg.value
                .replace(/`([^`]+)`/g, '<code class="bg-surface-800 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>'),
            }}
          />
        )
      })}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse rounded-sm ml-0.5 align-middle" />
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: genId(),
      role: 'assistant',
      content:
        "Hi! I'm your AI Python tutor. Ask me anything about Python — from basic syntax to advanced concepts. I'll explain with clear examples!\n\n💡 **Tip:** Select a chapter context in the sidebar to get more focused help.",
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [context, setContext] = useState('')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [msgCount, setMsgCount] = useState(0)
  const [error, setError] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const userTier: string = (session?.user as any)?.tier || 'free'
  const limit = TIER_LIMITS[userTier] ?? 5
  const remaining = Math.max(0, limit - msgCount)
  const isAtLimit = limit !== Infinity && msgCount >= limit

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  // Pre-select context from query param
  useEffect(() => {
    const ctx = searchParams.get('context')
    if (ctx) setContext(ctx)
  }, [searchParams])

  // Fetch chapter list for context selector
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chapters`)
      .then((r) => r.json())
      .then(setChapters)
      .catch(() => {})
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming || isAtLimit) return

    setInput('')
    setError('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg: Message = { id: genId(), role: 'user', content: text }
    const assistantId = genId()
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setMsgCount((c) => c + 1)
    setIsStreaming(true)

    try {
      const historyForAPI = messages
        .filter((m) => m.content)
        .slice(-8)
        .map(({ role, content }) => ({ role, content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: context || null,
          history: historyForAPI,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to get response')
      }

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        )
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      setMsgCount((c) => Math.max(0, c - 1))
    } finally {
      setIsStreaming(false)
    }
  }, [input, isStreaming, isAtLimit, messages, context])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-surface-950 text-white">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-64 hidden md:flex flex-col border-r border-surface-700 bg-surface-900/50 p-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold">AI Tutor</span>
            </div>
            <p className="text-xs text-gray-500">Ask anything about Python</p>
          </div>

          {/* Tier badge + message count */}
          <div className="bg-surface-800 border border-surface-700 rounded-lg p-3 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 capitalize">{userTier} plan</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  userTier === 'pro'
                    ? 'bg-purple-500/20 text-purple-400'
                    : userTier === 'premium'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {userTier.toUpperCase()}
              </span>
            </div>
            {limit === Infinity ? (
              <p className="text-xs text-green-400">Unlimited messages</p>
            ) : (
              <>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Messages used</span>
                  <span className={remaining === 0 ? 'text-red-400' : 'text-gray-300'}>
                    {msgCount} / {limit}
                  </span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      remaining === 0 ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, (msgCount / limit) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Context selector */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              Chapter Context
            </label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">General Python</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.title}>
                  Ch {ch.number}: {ch.title}
                </option>
              ))}
            </select>
            {context && (
              <p className="text-xs text-indigo-400 mt-1.5">
                Focused on: <strong>{context}</strong>
              </p>
            )}
          </div>

          {/* Upgrade CTA for free/premium */}
          {userTier !== 'pro' && (
            <div className="mt-auto bg-indigo-600/10 border border-indigo-500/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-indigo-400 mb-1">
                {userTier === 'free' ? 'Unlock more chats' : 'Go unlimited'}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {userTier === 'free'
                  ? '50 chats/day with Premium'
                  : 'Unlimited chats with Pro'}
              </p>
              <a
                href="/pricing"
                className="block text-center text-xs bg-indigo-500 hover:bg-indigo-600 text-white py-1.5 rounded transition"
              >
                Upgrade
              </a>
            </div>
          )}
        </aside>

        {/* ── Chat Area ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1
              const isStreamingThis = isLast && msg.role === 'assistant' && isStreaming

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-surface-700 text-gray-400'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                        : 'bg-surface-800 border border-surface-700 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : msg.content === '' && isStreamingThis ? (
                      <div className="flex gap-1 py-1">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <MessageContent content={msg.content} isStreaming={isStreamingThis} />
                    )}
                  </div>
                </div>
              )
            })}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Limit reached */}
            {isAtLimit && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 mb-3">
                  You&apos;ve reached your {userTier} plan limit of {limit} messages.
                </p>
                <a
                  href="/pricing"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 px-6 rounded-lg transition"
                >
                  Upgrade for More
                </a>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="border-t border-surface-700 bg-surface-900/80 px-4 py-4">
            {/* Mobile context selector */}
            <div className="md:hidden mb-3">
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="">General Python</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.title}>
                    Ch {ch.number}: {ch.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={isStreaming || isAtLimit}
                placeholder={
                  isAtLimit
                    ? 'Message limit reached — upgrade to continue'
                    : 'Ask about Python… (Enter to send, Shift+Enter for newline)'
                }
                rows={1}
                className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '160px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming || isAtLimit}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-2 text-center">
              AI responses may occasionally contain errors. Always verify code before use.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
