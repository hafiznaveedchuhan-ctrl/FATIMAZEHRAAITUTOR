import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
        {/* Left side: Form */}
        <div className="flex items-center justify-center px-6 py-12 bg-surface-900">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-indigo-500 mb-2">
                FatimaZehra AI Tutor
              </h1>
              <p className="text-gray-400">Learn Python with AI Coaching</p>
            </div>

            {children}

            <p className="text-center text-gray-400 text-sm mt-8">
              © 2026 FatimaZehra AI Tutor. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right side: Illustration (hidden on mobile) */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block bg-surface-800 rounded-lg p-6 border border-surface-700">
                <pre className="text-sm font-mono text-green-400 overflow-hidden">
{`def hello(name):
    print(f"Hello, {name}!")

hello("Python Learner")`}
                </pre>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Master Python</h2>
            <p className="text-gray-400 max-w-sm">
              Interactive lessons, AI guidance, and hands-on practice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
