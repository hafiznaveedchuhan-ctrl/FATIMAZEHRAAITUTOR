'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { BookOpen, Zap, Trophy, Users } from 'lucide-react'

const stats = [
  { icon: Users, label: '500+ Students', color: 'text-purple-400' },
  { icon: BookOpen, label: '10 Chapters', color: 'text-pink-400' },
  { icon: Zap, label: 'GPT-4 Powered', color: 'text-cyan-400' },
  { icon: Trophy, label: '100% Free Start', color: 'text-yellow-400' },
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex relative overflow-hidden">

      {/* ── Left: Form Side ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">

        {/* Subtle background blobs behind form */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, #6C63FF, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-15 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }} />

        {/* Glass card */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 rounded-3xl blur-xl opacity-30"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #EC4899, #3B82F6)' }} />
          <div className="relative rounded-3xl p-8 border border-white/10"
            style={{
              background: 'rgba(15, 5, 40, 0.80)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}>

            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #EC4899)' }}>
                FZ
              </div>
              <span className="text-xl font-bold gradient-text">FatimaZehra AI Tutor</span>
            </Link>

            {/* Page content (form) */}
            {children}

            <p className="text-center text-gray-600 text-xs mt-8">
              © 2026 FatimaZehra AI Tutor · Panaversity Hackathon IV
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Decoration Side (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">

        {/* Animated gradient orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full blur-3xl opacity-25 animate-blob"
          style={{ background: 'radial-gradient(circle, #6C63FF 0%, #EC4899 50%, transparent 70%)' }} />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000"
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, #3B82F6 50%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-15 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, #EC4899 50%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-sm space-y-6">

          {/* Floating code card */}
          <div className="rounded-2xl border border-white/10 p-5 animate-float"
            style={{
              background: 'rgba(10, 5, 30, 0.75)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 40px rgba(108,99,255,0.2)',
            }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-gray-500 font-mono">main.py</span>
            </div>
            <pre className="text-xs font-mono leading-relaxed">
              <span className="text-purple-400">class </span>
              <span className="text-cyan-300">AITutor</span>
              <span className="text-gray-300">:</span>{'\n'}
              <span className="text-gray-500">  </span>
              <span className="text-purple-400">def </span>
              <span className="text-yellow-300">teach</span>
              <span className="text-gray-300">(self, topic):</span>{'\n'}
              <span className="text-gray-500">    </span>
              <span className="text-purple-400">return </span>
              <span className="text-green-300">self</span>
              <span className="text-gray-300">.explain(topic)</span>{'\n\n'}
              <span className="text-gray-600">{'# Your AI tutor is ready! 🚀'}</span>
            </pre>
          </div>

          {/* Stats pills */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3 border border-white/8"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(10px)',
                  }}>
                  <Icon className={`w-4 h-4 ${stat.color} shrink-0`} />
                  <span className="text-xs text-gray-300 font-medium">{stat.label}</span>
                </div>
              )
            })}
          </div>

          {/* Tagline */}
          <div className="text-center pt-4">
            <h2 className="text-2xl font-bold gradient-text mb-2">Master Python</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Interactive lessons · AI guidance · Real-world projects
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
