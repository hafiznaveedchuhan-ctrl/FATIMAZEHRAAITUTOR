'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import {
  Code2, Target, Zap, TrendingUp, Flame, Trophy,
  Brain, BookOpen, BarChart3, CreditCard, Moon,
  ChevronDown, Star, ArrowRight, CheckCircle2, Sparkles,
  Play, Users, MessageSquare, Award,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ============================================================
   ANIMATED COUNTER HOOK
   ============================================================ */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!startOnView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const step = (timestamp: number) => {
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, startOnView])

  return { count, ref }
}

/* ============================================================
   HOMEPAGE COMPONENT
   ============================================================ */
export default function Home() {
  const { data: session } = useSession()

  // Counters for stats bar
  const students = useCounter(1000, 2000)
  const chapters = useCounter(10, 1500)
  const questions = useCounter(100, 1800)
  const rating = useCounter(49, 2000) // 4.9 * 10

  return (
    <div className="min-h-screen dark:bg-surface-950 bg-white dark:text-white text-gray-900">
      <NavBar />

      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6C63FF]/20 blur-[120px] animate-blob" />
          <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#EC4899]/15 blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] rounded-full bg-[#3B82F6]/15 blur-[120px] animate-blob animation-delay-4000" />
          <div className="absolute top-[50%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#06B6D4]/10 blur-[100px] animate-blob animation-delay-3000" />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              {/* Hackathon badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#6C63FF]/30 mb-8 animate-pulse-glow">
                <span className="text-base">🏆</span>
                <span className="text-sm font-medium text-gray-300">Panaversity Hackathon IV</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
                Master Python
                <br />
                <span className="gradient-text">with AI</span>{' '}
                <span className="gradient-text">Coaching</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                10 comprehensive chapters, interactive quizzes, and GPT-4 powered
                tutoring designed to take you from beginner to Python expert.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {session ? (
                  <Link
                    href="/learn"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white btn-gradient"
                  >
                    Continue Learning
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white btn-gradient"
                    >
                      Start Learning Free
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="#features"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-medium btn-glass text-gray-300"
                    >
                      <Play className="w-4 h-4" />
                      Watch Demo
                    </Link>
                  </>
                )}
              </div>

              {/* Floating stat pills */}
              <div className="flex flex-wrap gap-3 mt-10 justify-center lg:justify-start">
                {[
                  { label: '10 Chapters', icon: BookOpen },
                  { label: '100+ Questions', icon: Target },
                  { label: 'GPT-4 Powered', icon: Brain },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-300 animate-float"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#6C63FF]" />
                      {stat.label}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right side: Floating code card */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/20 to-[#EC4899]/20 blur-3xl rounded-3xl" />

                {/* Code card */}
                <div className="relative glass rounded-2xl border border-white/10 p-6 w-[420px] shadow-2xl shadow-black/40 animate-float">
                  {/* Window controls */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-3 text-xs text-gray-500 font-mono">main.py</span>
                  </div>
                  <pre className="text-sm font-mono leading-relaxed">
                    <code>
                      <span className="text-[#EC4899]">class</span>{' '}
                      <span className="text-[#F59E0B]">AITutor</span>
                      <span className="text-gray-500">:</span>
                      {'\n'}
                      {'  '}
                      <span className="text-[#EC4899]">def</span>{' '}
                      <span className="text-[#3B82F6]">__init__</span>
                      <span className="text-gray-400">(self):</span>
                      {'\n'}
                      {'    '}
                      <span className="text-gray-400">self.</span>
                      <span className="text-[#06B6D4]">model</span>
                      <span className="text-gray-400"> = </span>
                      <span className="text-green-400">&quot;gpt-4&quot;</span>
                      {'\n'}
                      {'    '}
                      <span className="text-gray-400">self.</span>
                      <span className="text-[#06B6D4]">chapters</span>
                      <span className="text-gray-400"> = </span>
                      <span className="text-[#F59E0B]">10</span>
                      {'\n\n'}
                      {'  '}
                      <span className="text-[#EC4899]">def</span>{' '}
                      <span className="text-[#3B82F6]">teach</span>
                      <span className="text-gray-400">(self, topic):</span>
                      {'\n'}
                      {'    '}
                      <span className="text-gray-500"># AI-powered teaching</span>
                      {'\n'}
                      {'    '}
                      <span className="text-[#EC4899]">return</span>
                      <span className="text-gray-400"> self.</span>
                      <span className="text-[#3B82F6]">generate</span>
                      <span className="text-gray-400">(topic)</span>
                      {'\n\n'}
                      <span className="text-[#06B6D4]">tutor</span>
                      <span className="text-gray-400"> = </span>
                      <span className="text-[#F59E0B]">AITutor</span>
                      <span className="text-gray-400">()</span>
                      {'\n'}
                      <span className="text-[#06B6D4]">tutor</span>
                      <span className="text-gray-400">.</span>
                      <span className="text-[#3B82F6]">teach</span>
                      <span className="text-gray-400">(</span>
                      <span className="text-green-400">&quot;Python&quot;</span>
                      <span className="text-gray-400">)</span>
                    </code>
                  </pre>
                  {/* Typing cursor */}
                  <div className="mt-2 flex items-center gap-1 text-gray-500 text-xs font-mono">
                    <span className="w-2 h-4 bg-[#6C63FF] animate-pulse" />
                    <span>Ready to code...</span>
                  </div>
                </div>

                {/* Floating accent cards */}
                <div className="absolute -top-4 -right-4 glass rounded-xl px-4 py-2 border border-[#6C63FF]/30 shadow-lg animate-float animation-delay-1000">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-gray-300 font-medium">AI Powered</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-6 glass rounded-xl px-4 py-2 border border-[#EC4899]/30 shadow-lg animate-float animation-delay-2000">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 font-medium">100% Pass Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:flex justify-center mt-16">
            <a href="#stats" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
              <span className="text-xs">Scroll to explore</span>
              <ChevronDown className="w-5 h-5 animate-bounce-slow" />
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================
          STATS BAR
          ==================================================== */}
      <section id="stats" className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/5 via-[#EC4899]/5 to-[#3B82F6]/5" />
        <div className="container relative">
          <div className="glass rounded-2xl border border-white/10 p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { ref: students.ref, value: `${students.count.toLocaleString()}+`, label: 'Students Learning', icon: Users, color: '#6C63FF' },
                { ref: chapters.ref, value: chapters.count.toString(), label: 'Python Chapters', icon: BookOpen, color: '#EC4899' },
                { ref: questions.ref, value: questions.count.toString(), label: 'Quiz Questions', icon: Target, color: '#3B82F6' },
                { ref: rating.ref, value: `${(rating.count / 10).toFixed(1)}`, label: 'Average Rating', icon: Star, color: '#F59E0B', suffix: <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] inline ml-1" /> },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} ref={stat.ref} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: stat.color }}>
                      {stat.value}
                      {stat.suffix}
                    </div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          FEATURES SECTION
          ==================================================== */}
      <section id="features" className="py-24 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[#6C63FF]/20 mb-6 text-sm text-gray-400">
              <Zap className="w-3.5 h-3.5 text-[#6C63FF]" />
              Platform Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Master Python</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A complete learning ecosystem powered by AI, designed to accelerate your
              Python journey from absolute beginner to confident developer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Tutor',
                desc: 'GPT-4 powered AI assistant for personalized code explanations, debugging help, and learning guidance.',
                gradient: 'from-[#6C63FF] to-[#818CF8]',
                glow: 'rgba(108, 99, 255, 0.15)',
              },
              {
                icon: BookOpen,
                title: '10 Chapters',
                desc: 'From Python basics to advanced concepts like decorators, generators, and OOP patterns.',
                gradient: 'from-[#EC4899] to-[#F472B6]',
                glow: 'rgba(236, 72, 153, 0.15)',
              },
              {
                icon: Target,
                title: 'Quiz Engine',
                desc: '100+ multiple choice questions with instant feedback, explanations, and score tracking.',
                gradient: 'from-[#3B82F6] to-[#60A5FA]',
                glow: 'rgba(59, 130, 246, 0.15)',
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                desc: 'Visual dashboard with animated progress rings, streaks, completion stats, and activity feed.',
                gradient: 'from-[#06B6D4] to-[#22D3EE]',
                glow: 'rgba(6, 182, 212, 0.15)',
              },
              {
                icon: CreditCard,
                title: 'Stripe Payments',
                desc: 'Secure subscription management with Stripe. Upgrade tiers to unlock premium and pro content.',
                gradient: 'from-[#F59E0B] to-[#FBBF24]',
                glow: 'rgba(245, 158, 11, 0.15)',
              },
              {
                icon: Moon,
                title: 'Dark Mode',
                desc: 'Beautiful dark-first design with seamless light mode toggle. Easy on the eyes, stunning to look at.',
                gradient: 'from-[#8B5CF6] to-[#A78BFA]',
                glow: 'rgba(139, 92, 246, 0.15)',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl bg-surface-900 border border-white/5 p-8 hover:border-white/10 transition-all duration-300 feature-card-glow cursor-default"
                >
                  {/* Gradient accent on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${feature.glow}, transparent 70%)` }}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <h3 className="text-lg font-bold mb-2 text-white group-hover:gradient-text transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====================================================
          HOW IT WORKS
          ==================================================== */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6C63FF]/3 to-transparent" />
        <div className="container relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[#EC4899]/20 mb-6 text-sm text-gray-400">
              <Flame className="w-3.5 h-3.5 text-[#EC4899]" />
              How It Works
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Three Steps to{' '}
              <span className="gradient-text">Python Mastery</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Our structured approach ensures you build a solid foundation before advancing to complex topics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[4.5rem] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#6C63FF] via-[#EC4899] to-[#3B82F6] opacity-30" />

            {[
              {
                step: '01',
                title: 'Choose Your Chapter',
                desc: 'Browse our 10 structured Python chapters. Start from basics or jump to where you need. Free tier gives you 3 chapters to begin.',
                icon: BookOpen,
                color: '#6C63FF',
              },
              {
                step: '02',
                title: 'Learn & Practice',
                desc: 'Read interactive content with real code examples. Ask the AI tutor for help. Practice with quizzes after each chapter.',
                icon: Code2,
                color: '#EC4899',
              },
              {
                step: '03',
                title: 'Track & Master',
                desc: 'Monitor your progress on the dashboard. Build streaks, improve quiz scores, and unlock advanced chapters.',
                icon: Trophy,
                color: '#3B82F6',
              },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="relative text-center group">
                  {/* Step number circle */}
                  <div className="relative inline-flex mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10 bg-surface-900 group-hover:scale-110 transition-transform duration-300"
                      style={{ boxShadow: `0 0 40px ${step.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: step.color }} />
                    </div>
                    {/* Step badge */}
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}
                    >
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====================================================
          PRICING SECTION
          ==================================================== */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[#F59E0B]/20 mb-6 text-sm text-gray-400">
              <CreditCard className="w-3.5 h-3.5 text-[#F59E0B]" />
              Pricing Plans
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Simple,{' '}
              <span className="gradient-text">Transparent</span>{' '}
              Pricing
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start free, upgrade when you are ready. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/forever',
                desc: 'Perfect for getting started',
                features: ['Chapters 1-3', 'Basic Quiz Access', 'Limited AI Chat', 'Community Support'],
                cta: 'Get Started',
                href: session ? '/learn' : '/auth/signup',
                popular: false,
                color: '#9CA3AF',
              },
              {
                name: 'Premium',
                price: '$9.99',
                period: '/month',
                desc: 'For serious learners',
                features: ['All 10 Chapters', 'Full Quiz Access', '5 AI Chats/Day', 'Progress Dashboard', 'Email Support'],
                cta: 'Upgrade to Premium',
                href: session ? '/pricing' : '/auth/signup',
                popular: true,
                color: '#6C63FF',
              },
              {
                name: 'Pro',
                price: '$19.99',
                period: '/month',
                desc: 'Maximum learning power',
                features: ['Everything in Premium', 'Unlimited AI Chat', 'Weak-Point Analysis', 'Personalized Path', 'Priority Support'],
                cta: 'Go Pro',
                href: session ? '/pricing' : '/auth/signup',
                popular: false,
                color: '#EC4899',
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-surface-900 border-2 border-[#6C63FF]/50 pricing-popular scale-[1.02] lg:scale-105'
                    : 'bg-surface-900 border border-white/5 hover:border-white/10'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#EC4899] shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1" style={{ color: plan.color }}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center font-semibold py-3.5 rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? 'text-white btn-gradient'
                      : 'text-gray-300 border border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          TESTIMONIALS
          ==================================================== */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#EC4899]/3 to-transparent" />
        <div className="container relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[#6C63FF]/20 mb-6 text-sm text-gray-400">
              <MessageSquare className="w-3.5 h-3.5 text-[#6C63FF]" />
              Testimonials
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Loved by{' '}
              <span className="gradient-text">Learners</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              See what our students say about their learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: 'The AI tutor explained decorators in a way that finally clicked for me. Best Python course I have taken online.',
                name: 'Sarah A.',
                role: 'CS Student',
                initials: 'SA',
                gradient: 'from-[#6C63FF] to-[#818CF8]',
                stars: 5,
              },
              {
                quote: 'The quiz system and progress tracking kept me motivated. I completed all 10 chapters in just 2 weeks!',
                name: 'Hassan M.',
                role: 'Software Engineer',
                initials: 'HM',
                gradient: 'from-[#EC4899] to-[#F472B6]',
                stars: 5,
              },
              {
                quote: 'Upgrading to Pro was worth every penny. The weak-point analysis showed me exactly where to focus my studies.',
                name: 'Amina K.',
                role: 'Data Analyst',
                initials: 'AK',
                gradient: 'from-[#3B82F6] to-[#60A5FA]',
                stars: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="glass rounded-2xl border border-white/5 p-8 hover:border-white/10 transition-all duration-300 group"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-xs`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          CTA SECTION
          ==================================================== */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF] via-[#EC4899] to-[#3B82F6] opacity-90" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

            <div className="relative px-8 py-20 md:py-24 text-center">
              <Award className="w-12 h-12 text-white/80 mx-auto mb-6" />
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Ready to Master Python?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
                Join a growing community of learners. Start with our free tier
                and upgrade whenever you are ready for more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {session ? (
                  <Link
                    href="/learn"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-xl"
                  >
                    Continue Learning
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-xl"
                    >
                      Start Free Today
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="#pricing"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-medium text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all"
                    >
                      View Plans
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
