'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const { update } = useSession()
  const searchParams = useSearchParams()
  const session_id = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')

  useEffect(() => {
    if (!session_id) { setStatus('done'); return }

    // Verify payment and activate plan in Neon DB
    fetch('/api/payment/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id }),
    })
      .then((r) => r.json())
      .then(async () => {
        // Refresh NextAuth session so new tier shows in navbar/dashboard
        await update()
        setStatus('done')
      })
      .catch(() => setStatus('done')) // still show success page even if refresh fails
  }, [session_id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
          {status === 'loading' ? (
            <div className="w-10 h-10 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
          ) : (
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-gray-400 mb-2">
          {status === 'loading'
            ? 'Activating your plan...'
            : 'Your subscription is now active. Premium chapters are unlocked!'}
        </p>

        {status === 'done' && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/learn" className="px-6 py-3 bg-[#6C63FF] hover:bg-[#5a52d5] text-white rounded-xl font-semibold transition-colors">
              Start Learning
            </Link>
            <Link href="/dashboard" className="px-6 py-3 bg-[#1F1F23] hover:bg-[#2a2a2f] text-white rounded-xl font-semibold transition-colors">
              View Dashboard
            </Link>
          </div>
        )}

        <p className="mt-10 text-xs text-gray-600">
          TEST MODE — No real payment was processed.
        </p>
      </div>
    </div>
  )
}
