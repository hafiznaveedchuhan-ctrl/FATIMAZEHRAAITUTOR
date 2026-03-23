'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { Code2, Target, Zap, TrendingUp, Flame, Trophy } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-indigo-900/20 pointer-events-none" />

        <div className="container relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Master Python with<br />
            <span className="text-indigo-500">AI Coaching</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            10 comprehensive chapters, interactive quizzes, and personalized AI assistance to help you become a Python expert
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/learn"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg transition inline-block"
              >
                Start Learning
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg transition"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#pricing"
                  className="border border-indigo-500 text-indigo-400 hover:text-indigo-300 font-semibold py-3 px-8 rounded-lg transition"
                >
                  View Pricing
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">Why Learn With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Code2, title: '10 Chapters', desc: 'From basics to advanced Python concepts' },
            { icon: Zap, title: 'AI Tutor', desc: 'GPT-4 powered guidance & code examples' },
            { icon: Target, title: 'Interactive Quiz', desc: '10 questions per chapter to test knowledge' },
            { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visual dashboard showing your growth' },
            { icon: Flame, title: 'Streak Tracking', desc: 'Build consistency with daily learning streaks' },
            { icon: Trophy, title: 'Certification', desc: 'Earn certificates as you complete chapters' },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="card hover:border-indigo-500/50 transition group">
                <Icon className="w-10 h-10 text-indigo-500 mb-4 group-hover:scale-110 transition" />
                <h3 className="font-bold mb-2 text-lg">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Free',
              price: '$0',
              features: ['Chapters 1-3', 'Basic Quiz', 'Limited AI Chat', 'Community Support'],
              cta: 'Get Started',
              href: session ? '/learn' : '/auth/signup',
              popular: false,
            },
            {
              name: 'Premium',
              price: '$9.99',
              period: '/month',
              features: ['All 10 Chapters', 'Full Quiz Access', '5 AI Chats/Day', 'Progress Dashboard', 'Email Support'],
              cta: 'Upgrade Now',
              href: '/auth/signup',
              popular: true,
            },
            {
              name: 'Pro',
              price: '$19.99',
              period: '/month',
              features: ['Everything in Premium', 'Unlimited AI Chat', 'Weak-Point Analysis', 'Personalized Path', 'Priority Support'],
              cta: 'Choose Pro',
              href: '/auth/signup',
              popular: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`rounded-lg p-8 border transition ${
                plan.popular
                  ? 'bg-indigo-600/20 border-indigo-500 scale-105 shadow-lg'
                  : 'bg-surface-900 border-surface-700 hover:border-surface-600'
              }`}
            >
              {plan.popular && <div className="text-indigo-400 font-semibold mb-2">Most Popular</div>}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-400">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="text-gray-300 flex items-center gap-2">
                    <span className="text-indigo-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center font-semibold py-3 rounded-lg transition ${
                  plan.popular
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Master Python?</h2>
        <p className="text-xl text-gray-400 mb-8">Join thousands of learners on their Python journey</p>
        {!session && (
          <Link
            href="/auth/signup"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-10 rounded-lg transition inline-block"
          >
            Start Free Today
          </Link>
        )}
      </section>

      <Footer />
    </div>
  )
}
