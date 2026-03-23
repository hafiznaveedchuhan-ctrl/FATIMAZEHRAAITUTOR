import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import { Lock, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react'

interface Chapter {
  id: string
  number: number
  title: string
  slug: string
  tier_required: string
  content_mdx?: string
  error?: string
  detail?: string
}

async function getChapter(slug: string, accessToken: string): Promise<Chapter | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chapters/slug/${slug}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    )
    if (response.status === 403) {
      const data = await response.json()
      return { error: 'forbidden', detail: data.detail } as Chapter
    }
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

async function getAllChapters(): Promise<Chapter[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chapters`,
      { cache: 'no-store' }
    )
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

const tierHierarchy: Record<string, number> = { free: 0, premium: 1, pro: 2 }

export default async function ChapterPage({
  params,
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const accessToken = (session as any).accessToken || ''
  const userTier = (session.user as any)?.tier || 'free'
  const userTierLevel = tierHierarchy[userTier] ?? 0

  const [chapter, allChapters] = await Promise.all([
    getChapter(params.slug, accessToken),
    getAllChapters(),
  ])

  if (!chapter) {
    redirect('/learn')
  }

  const currentIndex = allChapters.findIndex((ch: Chapter) => ch.slug === params.slug)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter =
    currentIndex >= 0 && currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null

  // Tier gate: show upgrade prompt
  if (chapter.error === 'forbidden') {
    return (
      <div className="min-h-screen bg-surface-950 text-white">
        <NavBar />
        <div className="container py-24 text-center">
          <div className="max-w-md mx-auto">
            <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Premium Chapter</h1>
            <p className="text-gray-400 mb-8">
              {chapter.detail || 'This chapter requires a premium subscription to access.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/learn"
                className="border border-surface-700 text-gray-400 hover:text-white hover:border-surface-500 font-semibold py-3 px-6 rounded-lg transition"
              >
                Back to Chapters
              </Link>
              <Link
                href="/pricing"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <NavBar />

      <div className="flex">
        {/* Sidebar: Chapter Navigation */}
        <aside className="w-64 hidden lg:block border-r border-surface-700 bg-surface-900/50 p-4 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            All Chapters
          </Link>

          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Course Content
          </h2>

          <nav className="space-y-0.5">
            {allChapters.map((ch: Chapter) => {
              const chTierLevel = tierHierarchy[ch.tier_required] ?? 0
              const isLocked = userTierLevel < chTierLevel
              const isCurrent = ch.slug === params.slug

              if (isLocked) {
                return (
                  <div
                    key={ch.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                  >
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {ch.number}. {ch.title}
                    </span>
                  </div>
                )
              }

              return (
                <Link
                  key={ch.id}
                  href={`/learn/${ch.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                    isCurrent
                      ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-surface-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs rounded-full font-bold ${
                      isCurrent
                        ? 'bg-indigo-500 text-white'
                        : 'bg-surface-700 text-gray-400'
                    }`}
                  >
                    {ch.number}
                  </span>
                  <span className="truncate">{ch.title}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 py-10 max-w-3xl mx-auto">
          {/* Chapter header */}
          <div className="mb-8">
            <div className="inline-block bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              Chapter {chapter.number}
            </div>
            <h1 className="text-4xl font-bold leading-tight">{chapter.title}</h1>
          </div>

          {/* MDX Content with Tailwind prose */}
          <div className="prose prose-invert max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-strong:text-white
            prose-code:text-indigo-300 prose-code:bg-surface-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-surface-800 prose-pre:border prose-pre:border-surface-700 prose-pre:rounded-lg prose-pre:p-4
            prose-li:text-gray-300
            prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-indigo-500 prose-blockquote:text-gray-400
            prose-hr:border-surface-700
          ">
            <MDXRemote
              source={chapter.content_mdx!}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypePrism],
                },
              }}
            />
          </div>

          {/* Quiz CTA */}
          <div className="mt-14 bg-indigo-600/20 border border-indigo-500/40 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Test Your Knowledge</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              10 questions covering Chapter {chapter.number}: {chapter.title}.
              Earn your progress badge!
            </p>
            <Link
              href={`/learn/${chapter.slug}/quiz`}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg transition inline-flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Start Quiz
            </Link>
          </div>

          {/* Prev / Next Navigation */}
          <div className="mt-10 flex justify-between items-center border-t border-surface-700 pt-8">
            {prevChapter ? (
              <Link
                href={`/learn/${prevChapter.slug}`}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Previous</p>
                  <p className="text-sm font-medium">{prevChapter.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextChapter ? (
              (() => {
                const nextLocked =
                  (tierHierarchy[nextChapter.tier_required] ?? 0) > userTierLevel
                return nextLocked ? (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-3 text-gray-600 group"
                  >
                    <div className="text-right">
                      <p className="text-xs text-gray-700 mb-0.5">Next</p>
                      <p className="text-sm font-medium">{nextChapter.title}</p>
                    </div>
                    <Lock className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    href={`/learn/${nextChapter.slug}`}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition group"
                  >
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-0.5">Next</p>
                      <p className="text-sm font-medium">{nextChapter.title}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )
              })()
            ) : (
              <div className="text-right text-gray-400">
                <p className="text-xs text-gray-600 mb-0.5">Course Complete!</p>
                <p className="text-sm font-semibold">🎉 You finished!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
