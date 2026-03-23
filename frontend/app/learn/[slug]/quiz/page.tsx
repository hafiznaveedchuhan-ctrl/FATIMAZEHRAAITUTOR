'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Clock, Trophy, RotateCcw, ArrowRight, BookOpen,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  id: string
  question: string
  options: string[]
}

interface QuestionResult {
  question_id: string
  question: string
  options: string[]
  selected_option: number
  correct_option: number
  explanation: string
  is_correct: boolean
}

interface QuizResult {
  score: number
  correct_count: number
  total: number
  passed: boolean
  results: QuestionResult[]
}

// ─── Timer Hook ───────────────────────────────────────────────────────────────

function useTimer(seconds: number, onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const ref = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    ref.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(ref.current!)
          onExpire()
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [onExpire])

  const stop = useCallback(() => {
    if (ref.current) clearInterval(ref.current)
  }, [])

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

  const minutes = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const isWarning = timeLeft <= 60

  return { timeLeft, formatted, isWarning, start, stop }
}

// ─── Main Quiz Page ──────────────────────────────────────────────────────────

const QUIZ_DURATION = 10 * 60 // 10 minutes

export default function QuizPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  // State
  const [phase, setPhase] = useState<'loading' | 'intro' | 'quiz' | 'submitting' | 'results'>('loading')
  const [chapter, setChapter] = useState<{ id: string; title: string; number: number } | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')
  const [showReview, setShowReview] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const accessToken = (session as any)?.accessToken || ''

  const handleTimeUp = useCallback(() => {
    if (phase === 'quiz') submitQuiz()
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const timer = useTimer(QUIZ_DURATION, handleTimeUp)

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  // Fetch chapter + questions
  useEffect(() => {
    if (!session || !slug) return

    const load = async () => {
      try {
        // Get chapter info
        const chRes = await fetch(`${apiUrl}/chapters/slug/${slug}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!chRes.ok) { router.push('/learn'); return }
        const ch = await chRes.json()
        setChapter({ id: ch.id, title: ch.title, number: ch.number })

        // Get questions
        const qRes = await fetch(`${apiUrl}/quiz/by-slug/${slug}/questions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!qRes.ok) {
          setError('No questions available for this chapter yet.')
          setPhase('intro')
          return
        }
        const qs = await qRes.json()
        setQuestions(qs)
        setPhase('intro')
      } catch {
        setError('Failed to load quiz. Please try again.')
        setPhase('intro')
      }
    }

    load()
  }, [session, slug, apiUrl, accessToken, router])

  const startQuiz = () => {
    setPhase('quiz')
    setAnswers({})
    setCurrent(0)
    timer.start()
  }

  const submitQuiz = useCallback(async () => {
    timer.stop()
    setPhase('submitting')

    const answersPayload = Object.entries(answers).map(([question_id, selected_option]) => ({
      question_id,
      selected_option,
    }))

    try {
      const res = await fetch(`${apiUrl}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          chapter_id: chapter?.id,
          answers: answersPayload,
        }),
      })

      if (!res.ok) throw new Error('Submission failed')
      const data = await res.json()
      setResult(data)
      setPhase('results')
    } catch {
      setError('Failed to submit quiz. Please try again.')
      setPhase('quiz')
    }
  }, [answers, chapter, apiUrl, accessToken, timer])

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading' || status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-surface-950 text-white">
        <NavBar />
        <div className="container py-16 max-w-lg mx-auto text-center">
          <div className="mb-3 inline-block bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold">
            Chapter {chapter?.number} Quiz
          </div>
          <h1 className="text-3xl font-bold mb-2">{chapter?.title}</h1>
          <p className="text-gray-400 mb-10">Test your understanding of this chapter</p>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: BookOpen, label: 'Questions', value: String(questions.length) },
                { icon: Clock, label: 'Time Limit', value: '10 min' },
                { icon: Trophy, label: 'Pass Score', value: '70%' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-surface-900 border border-surface-700 rounded-xl p-4">
                  <Icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!error && (
              <button
                onClick={startQuiz}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl transition text-lg"
              >
                Start Quiz
              </button>
            )}
            <Link
              href={`/learn/${slug}`}
              className="text-gray-500 hover:text-gray-300 text-sm transition flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Chapter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === 'results' && result) {
    return (
      <div className="min-h-screen bg-surface-950 text-white">
        <NavBar />
        <div className="container py-12 max-w-2xl mx-auto">

          {/* Score card */}
          <div className={`rounded-2xl border p-10 text-center mb-8 ${
            result.passed
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {result.passed ? (
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            )}

            <h1 className="text-3xl font-bold mb-1">
              {result.passed ? '🎉 Passed!' : 'Keep Practicing'}
            </h1>
            <p className="text-gray-400 mb-6">
              Chapter {chapter?.number}: {chapter?.title}
            </p>

            <div className="flex justify-center items-baseline gap-2 mb-4">
              <span className={`text-6xl font-black ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                {result.score}%
              </span>
            </div>

            <p className="text-gray-400 text-sm">
              {result.correct_count} correct out of {result.total} questions
            </p>

            {/* Score bar */}
            <div className="mt-6 w-full bg-surface-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  result.passed ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0%</span>
              <span className="text-gray-400">Pass: 70%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <button
              onClick={() => setShowReview(!showReview)}
              className="border border-surface-600 hover:border-surface-500 text-gray-300 hover:text-white px-5 py-2.5 rounded-lg text-sm transition"
            >
              {showReview ? 'Hide Review' : 'Review Answers'}
            </button>
            <button
              onClick={() => { setPhase('intro'); setResult(null) }}
              className="flex items-center gap-2 border border-surface-600 hover:border-surface-500 text-gray-300 hover:text-white px-5 py-2.5 rounded-lg text-sm transition"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </button>
            <Link
              href="/learn"
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Next Chapter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Answer review */}
          {showReview && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Answer Review</h2>
              {result.results.map((r, i) => (
                <div
                  key={r.question_id}
                  className={`rounded-xl border p-5 ${
                    r.is_correct
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {r.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium text-sm">
                      Q{i + 1}. {r.question}
                    </p>
                  </div>

                  <div className="ml-8 space-y-1.5 mb-3">
                    {r.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`text-sm px-3 py-1.5 rounded-lg ${
                          idx === r.correct_option
                            ? 'bg-green-500/20 text-green-300'
                            : idx === r.selected_option && !r.is_correct
                            ? 'bg-red-500/20 text-red-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {idx === r.correct_option && '✓ '}
                        {idx === r.selected_option && !r.is_correct && '✗ '}
                        {opt}
                      </div>
                    ))}
                  </div>

                  <p className="ml-8 text-xs text-gray-500 bg-surface-800 rounded-lg px-3 py-2">
                    💡 {r.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Quiz (active) ──────────────────────────────────────────────────────────

  const q = questions[current]
  if (!q) return null

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <NavBar />

      <div className="container py-8 max-w-2xl mx-auto">

        {/* Header: title + timer + progress */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Chapter {chapter?.number}</p>
            <h1 className="text-lg font-bold truncate max-w-xs">{chapter?.title}</h1>
          </div>

          <div className={`flex items-center gap-1.5 font-mono text-lg font-bold px-4 py-2 rounded-xl border ${
            timer.isWarning
              ? 'text-red-400 border-red-500/30 bg-red-500/10 animate-pulse'
              : 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10'
          }`}>
            <Clock className="w-4 h-4" />
            {timer.formatted}
          </div>
        </div>

        {/* Progress bar + counter */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="w-full bg-surface-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 mb-5">
          <p className="text-base font-medium leading-relaxed mb-6">
            {q.question}
          </p>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(q.id, idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/20 text-white font-medium'
                      : 'border-surface-600 hover:border-surface-500 text-gray-300 hover:bg-surface-800'
                  }`}
                >
                  <span className={`inline-block w-6 h-6 rounded-full border text-xs font-bold mr-3 text-center leading-5 flex-shrink-0 ${
                    selected
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'border-surface-500 text-gray-500'
                  }`}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Question dot navigator */}
          <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                  i === current
                    ? 'bg-indigo-500 text-white'
                    : answers[questions[i].id] !== undefined
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-surface-700 text-gray-500 hover:bg-surface-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={!allAnswered || phase === 'submitting'}
              className="flex items-center gap-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              {phase === 'submitting' ? 'Submitting…' : 'Submit Quiz'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Submit reminder */}
        {allAnswered && current < questions.length - 1 && (
          <p className="text-center text-xs text-green-400 mt-4">
            ✓ All questions answered — navigate to last question to submit
          </p>
        )}

        {error && (
          <p className="text-center text-xs text-red-400 mt-4">{error}</p>
        )}
      </div>
    </div>
  )
}
