'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const { update } = useSession()
  const router = useRouter()

  // Refresh session so new tier is reflected immediately
  useEffect(() => {
    update()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-gray-400 mb-8">
          Your subscription is now active. New chapters and AI features have
          been unlocked. Stripe may take a few seconds to send the confirmation
          — your tier will update automatically.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/learn"
            className="px-6 py-3 bg-[#6C63FF] hover:bg-[#5a52d5] text-white rounded-xl font-semibold transition-colors"
          >
            Start Learning
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#1F1F23] hover:bg-[#2a2a2f] text-white rounded-xl font-semibold transition-colors"
          >
            View Dashboard
          </Link>
        </div>

        {/* Test mode reminder */}
        <p className="mt-10 text-xs text-gray-600">
          TEST MODE — No real payment was processed.
        </p>
      </div>
    </div>
  )
}
