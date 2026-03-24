'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, UserPlus, Chrome, Check, X } from 'lucide-react'

interface PasswordRule {
  label: string
  test: (pwd: string) => boolean
}

const passwordRules: PasswordRule[] = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
  { label: 'Special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const isPasswordValid = passwordRules.every((r) => r.test(password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || 'Registration failed')
        return
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
  }
  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(108,99,255,0.6)'
    e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.12)'
  }
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.10)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
        <p className="text-sm text-gray-400">Start your Python journey for free</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200"
              style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200"
              style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setShowRules(true) }}
              placeholder="••••••••" required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200"
              style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
          {/* Password strength rules */}
          {showRules && password.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {passwordRules.map((rule) => {
                const passed = rule.test(password)
                return (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    {passed
                      ? <Check className="w-3 h-3 text-green-400 shrink-0" />
                      : <X className="w-3 h-3 text-gray-600 shrink-0" />}
                    <span className={`text-xs ${passed ? 'text-green-400' : 'text-gray-600'}`}>{rule.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200"
              style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <X className="w-3 h-3" /> Passwords do not match
            </p>
          )}
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
        <button type="submit" disabled={isLoading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm btn-gradient flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create Free Account
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
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        <Chrome className="w-4 h-4 text-blue-400" />
        Sign up with Google
      </button>

      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
