'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  BookOpen, Trophy, Flame, Target, CheckCircle2, Lock,
  Clock, TrendingUp, MessageSquare, ChevronRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  chapters_completed: number
  total_chapters: number
  quiz_avg_score: number
  total_quizzes_taken: number
  current_streak: number
  completion_pct: number
}

interface ChapterProgress {
  id: string
  number: number
  title: string
  slug: string
  tier_required: string
  completed: boolean
  best_score: number | null
  attempts: number
  last_accessed: string | null
}

interface Activity {
  type: string
  chapter_title: string
  score: number
  passed: boolean
  timestamp: string
}

interface ProgressData {
  stats: Stats
  chapter_progress: ChapterProgress[]
  recent_activity: Activity[]
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: number
  sub?: string
  accent: string
}) {
  const count = useCountUp(value)
  return (
    <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-white">
        {count}{sub}
      </p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

// ─── Custom Tooltip for Bar Chart ────────────────────────────────────────────

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-white">{payload[0].payload.title}</p>
      <p className="text-indigo-400 mt-0.5">{payload[0].value}% score</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TIER_HIERARCHY: Record<string, number> = { free: 0, premium: 1, pro: 2 }

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [liveTier, setLiveTier] = useState<string | null>(null)

  const accessToken = (session as any)?.accessToken || ''
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const userTier = liveTier ?? (session?.user as any)?.tier ?? 'free'
  const userTierLevel = TIER_HIERARCHY[userTier] ?? 0

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch(`${apiUrl}/progress/me`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } }),
    ])
      .then(async ([progressRes, meRes]) => {
        if (progressRes.ok) setData(await progressRes.json())
        if (meRes.ok) { const me = await meRes.json(); setLiveTier(me.tier || 'free') }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, apiUrl, accessToken])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = data?.stats
  const chapters = data?.chapter_progress ?? []
  const activity = data?.recent_activity ?? []

  // Chart data: chapters with scores
  const chartData = chapters
    .filter((ch) => ch.best_score !== null)
    .map((ch) => ({
      title: `Ch ${ch.number}`,
      score: ch.best_score!,
      passed: ch.best_score! >= 70,
    }))

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <NavBar />

      <div className="container py-10">

        {/* ── Welcome Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {session?.user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 mt-1">Here&apos;s your learning progress</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize border ${
              userTier === 'pro'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : userTier === 'premium'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}>
              {userTier} Plan
            </span>
            {userTier === 'free' && (
              <Link
                href="/pricing"
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={BookOpen}
            label={`of ${stats?.total_chapters ?? 10} chapters`}
            value={stats?.chapters_completed ?? 0}
            accent="bg-indigo-500/20 text-indigo-400"
          />
          <StatCard
            icon={Target}
            label="average quiz score"
            value={stats?.quiz_avg_score ?? 0}
            sub="%"
            accent="bg-green-500/20 text-green-400"
          />
          <StatCard
            icon={Flame}
            label="day streak"
            value={stats?.current_streak ?? 0}
            accent="bg-orange-500/20 text-orange-400"
          />
          <StatCard
            icon={Trophy}
            label="quizzes completed"
            value={stats?.total_quizzes_taken ?? 0}
            accent="bg-yellow-500/20 text-yellow-400"
          />
        </div>

        {/* ── Overall Progress Bar ─────────────────────────────────────────── */}
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Course Progress
            </span>
            <span className="text-sm font-bold text-indigo-400">
              {stats?.completion_pct ?? 0}%
            </span>
          </div>
          <div className="w-full bg-surface-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000"
              style={{ width: `${stats?.completion_pct ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats?.chapters_completed ?? 0} of {stats?.total_chapters ?? 10} chapters completed
          </p>
        </div>

        {/* ── Two-Column Layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Chapter Progress List (3/5 width) */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Chapter Progress</h2>
              <Link
                href="/learn"
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {chapters.map((ch) => {
                const locked = userTierLevel < (TIER_HIERARCHY[ch.tier_required] ?? 0)
                return (
                  <div
                    key={ch.id}
                    className={`bg-surface-900 border rounded-xl p-4 flex items-center gap-4 ${
                      locked ? 'border-surface-700/50 opacity-60' : 'border-surface-700'
                    }`}
                  >
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      locked
                        ? 'bg-surface-700'
                        : ch.completed
                        ? 'bg-green-500/20'
                        : ch.attempts > 0
                        ? 'bg-yellow-500/20'
                        : 'bg-surface-700'
                    }`}>
                      {locked ? (
                        <Lock className="w-4 h-4 text-gray-600" />
                      ) : ch.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">{ch.number}</span>
                      )}
                    </div>

                    {/* Chapter info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ch.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {/* Score bar */}
                        {ch.best_score !== null ? (
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 bg-surface-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  ch.best_score >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${ch.best_score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium whitespace-nowrap ${
                              ch.best_score >= 70 ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {ch.best_score}%
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">Not started</p>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    {!locked && (
                      <Link
                        href={`/learn/${ch.slug}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap transition"
                      >
                        {ch.completed ? 'Review' : ch.attempts > 0 ? 'Continue' : 'Start'}
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quiz Scores Chart */}
            <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Quiz Scores
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barSize={18}>
                    <XAxis
                      dataKey="title"
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.passed ? '#6C63FF' : '#F59E0B'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">No quiz scores yet</p>
                    <Link
                      href="/learn"
                      className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 block"
                    >
                      Take your first quiz →
                    </Link>
                  </div>
                </div>
              )}
              {chartData.length > 0 && (
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                    Passed (≥70%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" />
                    Needs work
                  </span>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Activity
              </h2>
              {activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.slice(0, 5).map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        a.passed ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {a.passed
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          : <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{a.chapter_title}</p>
                        <p className="text-xs text-gray-600">
                          Quiz · {a.score}% ·{' '}
                          {new Date(a.timestamp).toLocaleDateString('en', {
                            month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No activity yet</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
              <h2 className="text-base font-bold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/learn"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-700 transition group"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">Continue Learning</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 ml-auto group-hover:text-gray-400" />
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-700 transition group"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">Ask AI Tutor</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 ml-auto group-hover:text-gray-400" />
                </Link>
                {userTier === 'free' && (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition group"
                  >
                    <Trophy className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-indigo-300">Upgrade to Premium</span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500 ml-auto" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
