'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="min-h-screen bg-surface-950 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-surface-700 py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-500">FatimaZehra AI Tutor</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12">
        <div className="bg-surface-900 border border-surface-700 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to Dashboard</h2>
          <div className="space-y-4">
            <p className="text-gray-400">
              ✅ Authentication working! You are logged in as:
            </p>
            <div className="bg-surface-800 rounded p-4 border border-surface-700">
              <p className="text-sm">
                <strong>Email:</strong> {session?.user?.email}
              </p>
              <p className="text-sm mt-2">
                <strong>Name:</strong> {session?.user?.name}
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-surface-700">
              <h3 className="text-xl font-bold mb-4">Next Steps (Days 4-10)</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✅ Day 3: Auth pages (completed)</li>
                <li>⏳ Day 4: Landing page & chapter list</li>
                <li>⏳ Day 5: Chapter content & MDX renderer</li>
                <li>⏳ Day 6: AI chat with streaming</li>
                <li>⏳ Day 7: Quiz engine</li>
                <li>⏳ Day 8: Progress dashboard</li>
                <li>⏳ Day 9: Stripe payments</li>
                <li>⏳ Day 10: Final integration & polish</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
