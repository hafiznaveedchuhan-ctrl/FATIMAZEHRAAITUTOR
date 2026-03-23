'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { Clock, ArrowLeft, Zap } from 'lucide-react'

export default function QuizPage() {
  const params = useParams()
  const slug = params?.slug as string

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <NavBar />

      <div className="container py-24 text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Clock className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            Coming in Day 7
          </div>

          <h1 className="text-4xl font-bold mb-4">Quiz Coming Soon</h1>
          <p className="text-gray-400 mb-10 text-lg">
            Interactive quiz with a 10-minute timer, 10 MCQ questions,
            instant answer feedback, and animated score reveal.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10 text-center">
            {[
              { label: '10', desc: 'Questions' },
              { label: '10min', desc: 'Timer' },
              { label: '70%', desc: 'Pass score' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-900 border border-surface-700 rounded-lg p-4"
              >
                <p className="text-2xl font-bold text-indigo-400">{stat.label}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>

          <Link
            href={`/learn/${slug}`}
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chapter
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
