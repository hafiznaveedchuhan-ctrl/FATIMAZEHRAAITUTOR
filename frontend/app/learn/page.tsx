'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { Lock, BookOpen } from 'lucide-react'

interface Chapter {
  id: string
  number: number
  title: string
  slug: string
  tier_required: string
}

export default function LearnPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [liveTier, setLiveTier] = useState<string>('free')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = (session as any)?.accessToken || ''
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      try {
        // Fetch live tier from backend (bypasses stale JWT)
        const [chaptersRes, meRes] = await Promise.all([
          fetch(`${API}/chapters`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${API}/auth/me`,  { headers: { Authorization: `Bearer ${accessToken}` } }),
        ])
        if (chaptersRes.ok) setChapters(await chaptersRes.json())
        if (meRes.ok) {
          const me = await meRes.json()
          setLiveTier(me.tier || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) fetchData()
  }, [session])

  const tier_hierarchy = { free: 0, premium: 1, pro: 2 }
  const user_tier_level = tier_hierarchy[liveTier as keyof typeof tier_hierarchy] || 0

  const isChapterLocked = (tier_required: string) => {
    const required_level = tier_hierarchy[tier_required as keyof typeof tier_hierarchy] || 0
    return user_tier_level < required_level
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading chapters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <NavBar />

      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Learn Python</h1>
          <p className="text-gray-400 max-w-2xl">
            Master Python with 10 comprehensive chapters covering everything from basics to advanced concepts.
            {liveTier === 'free' && (
              <> Upgrade to Premium to unlock all chapters and AI assistance.</>
            )}
          </p>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => {
            const locked = isChapterLocked(chapter.tier_required)

            return (
              <div
                key={chapter.id}
                className={`rounded-lg border p-6 transition group ${
                  locked
                    ? 'bg-surface-900/50 border-surface-700/50 opacity-75 cursor-not-allowed'
                    : 'bg-surface-900 border-surface-700 hover:border-indigo-500 cursor-pointer'
                }`}
              >
                {/* Chapter Number Badge */}
                <div className="inline-block bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  Chapter {chapter.number}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4 group-hover:text-indigo-400 transition">
                  {chapter.title}
                </h3>

                {/* Lock Icon */}
                {locked && (
                  <div className="mb-4 flex items-center gap-2 text-yellow-500 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Requires {chapter.tier_required} tier</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-700">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>10 Questions</span>
                  </div>

                  {locked ? (
                    <Link
                      href="/pricing"
                      className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-4 py-2 rounded-lg text-sm transition"
                    >
                      Upgrade
                    </Link>
                  ) : (
                    <Link
                      href={`/learn/${chapter.slug}`}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      Start
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {chapters.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No chapters available yet</p>
          </div>
        )}

        {/* Upgrade CTA for free users */}
        {liveTier === 'free' && chapters.length > 0 && (
          <div className="mt-12 bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Unlock All Chapters</h3>
            <p className="text-gray-300 mb-6">
              Upgrade to Premium to access chapters 4-10 and unlock AI chat assistance
            </p>
            <Link
              href="/pricing"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg transition inline-block"
            >
              View Pricing
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
