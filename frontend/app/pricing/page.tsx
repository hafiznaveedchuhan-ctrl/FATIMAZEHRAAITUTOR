'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with Python basics at no cost.',
    badge: null,
    features: [
      'Chapters 1–3 (Python Basics, Control Flow, Functions)',
      'Basic quiz with scoring',
      'Limited AI chat (5 messages/day)',
      'Progress tracking dashboard',
    ],
    unavailable: [
      'Chapters 4–10',
      'Unlimited AI chat',
      'Weak-point analysis',
      'Personalized learning path',
    ],
    cta: 'Get Started',
    ctaHref: '/auth/register',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'Unlock the full 10-chapter Python course.',
    badge: 'Most Popular',
    features: [
      'All 10 Python chapters',
      'Unlimited quiz attempts',
      '50 AI chat messages/day',
      'Progress tracking dashboard',
      'Priority quiz scoring + explanations',
    ],
    unavailable: [
      'Weak-point analysis (Pro)',
      'Personalized learning path (Pro)',
    ],
    cta: 'Upgrade to Premium',
    ctaHref: null,
    highlight: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19.99',
    period: '/month',
    description: 'AI-powered coaching and personalized paths.',
    badge: null,
    features: [
      'Everything in Premium',
      'Unlimited AI chat',
      'Weak-point analysis (GPT-4)',
      'Personalized learning path',
      'Weekly email progress coach',
    ],
    unavailable: [],
    cta: 'Upgrade to Pro',
    ctaHref: null,
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'Is this TEST MODE? Will my card be charged?',
    a: 'Yes — this is Stripe TEST MODE. Use card 4242 4242 4242 4242 with any future expiry and any CVC. No real charges occur.',
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. Cancellations take effect at the end of your current billing period. You keep access until then.',
  },
  {
    q: 'What happens if I downgrade?',
    a: 'Chapters 4–10 become locked again, but your quiz history and progress are preserved.',
  },
  {
    q: 'Do I need a credit card for the Free plan?',
    a: 'No. The Free plan requires only an email address.',
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const cancelled = searchParams.get('cancelled') === '1'

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const currentTier = (session?.user as any)?.tier || 'free'
  const accessToken = (session as any)?.accessToken

  async function handleUpgrade(plan: string) {
    if (!session) {
      router.push('/auth/login?next=/pricing')
      return
    }

    setLoading(plan)
    setError(null)

    try {
      const res = await fetch(`/api/payment/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to create checkout session')
      }

      const { session_url } = await res.json()
      window.location.href = session_url
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* ── Header ── */}
      <div className="pt-20 pb-12 text-center px-4">
        <span className="inline-block bg-[#6C63FF]/20 text-[#6C63FF] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
          Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your Learning Plan
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Start free, upgrade when you're ready. All plans include progress
          tracking and quiz scoring.
        </p>

        {/* Stripe test-mode banner */}
        <div className="mt-6 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm px-4 py-2 rounded-lg">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          TEST MODE — Use card <span className="font-mono font-bold mx-1">4242 4242 4242 4242</span> · No real charges
        </div>

        {cancelled && (
          <div className="mt-4 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg">
            Payment cancelled — no charges were made.
          </div>
        )}

        {error && (
          <div className="mt-4 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* ── Tier cards ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const isCurrent = currentTier === tier.id
            const isHigher =
              ['free', 'premium', 'pro'].indexOf(tier.id) >
              ['free', 'premium', 'pro'].indexOf(currentTier)

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                  tier.highlight
                    ? 'border-[#6C63FF] bg-[#111113] shadow-[0_0_40px_rgba(108,99,255,0.15)]'
                    : 'border-[#1F1F23] bg-[#111113]'
                } ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {/* Badge */}
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6C63FF] text-white text-xs font-bold px-4 py-1 rounded-full">
                    {tier.badge}
                  </span>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <span className="absolute -top-3 right-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1">{tier.name}</h2>
                  <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-gray-400 mb-1">{tier.period}</span>
                  </div>
                </div>

                {/* CTA */}
                {tier.id === 'free' ? (
                  isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm cursor-default mb-6"
                    >
                      Your Current Plan
                    </button>
                  ) : (
                    <Link
                      href={tier.ctaHref!}
                      className="w-full py-3 rounded-xl bg-[#1F1F23] hover:bg-[#2a2a2f] text-white font-semibold text-sm text-center transition-colors mb-6 block"
                    >
                      {tier.cta}
                    </Link>
                  )
                ) : isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm cursor-default mb-6"
                  >
                    Your Current Plan
                  </button>
                ) : isHigher ? (
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={loading === tier.id}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${
                      tier.highlight
                        ? 'bg-[#6C63FF] hover:bg-[#5a52d5] text-white'
                        : 'bg-[#1F1F23] hover:bg-[#2a2a2f] text-white'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading === tier.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Redirecting to Stripe…
                      </span>
                    ) : (
                      tier.cta
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-[#1F1F23] text-gray-500 font-semibold text-sm cursor-default mb-6"
                  >
                    Downgrade not available
                  </button>
                )}

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                  {tier.unavailable.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-500">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* ── FAQ ── */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="border border-[#1F1F23] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-[#111113] transition-colors"
                >
                  <span className="font-medium text-sm">{item.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-400">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA footer ── */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Questions?{' '}
            <Link href="/chat" className="text-[#6C63FF] hover:underline">
              Ask the AI Tutor
            </Link>{' '}
            or{' '}
            <a href="mailto:support@fatimazehraaitutor.com" className="text-[#6C63FF] hover:underline">
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
