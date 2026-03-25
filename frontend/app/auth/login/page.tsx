'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, LogIn, Chrome } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error || 'Invalid email or password')
        return
      }

      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      setError(errorMessage)
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-sm text-gray-400">Sign in to continue your Python journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-red-400 text-sm border border-red-500/20"
            style={{ background: 'rgba(239,68,68,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm btn-gradient flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-xs text-gray-600 px-1">or continue with</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Google OAuth */}
      <button
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="w-full py-3 rounded-xl text-sm font-medium text-gray-200 flex items-center justify-center gap-2.5 transition-all duration-200 border border-white/10 hover:border-white/20 hover:bg-white/5"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <Chrome className="w-4 h-4 text-blue-400" />
        Sign in with Google
      </button>

      {/* Sign up link */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
