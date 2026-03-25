'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import {
  User, Mail, Crown, Gem, Sparkles, Shield, CreditCard,
  BookOpen, Trophy, Flame, LogOut, ExternalLink, CheckCircle2,
  AlertCircle, Eye, EyeOff,
} from 'lucide-react'

interface Subscription {
  plan: string
  status: string
  expires_at: string | null
  auto_renew: boolean
}

interface Me {
  id: string
  name: string
  email: string
  tier: string
  created_at: string
}

const TIER_CONFIG = {
  free:    { label: 'Free',    color: 'text-gray-300 bg-gray-500/20 border-gray-500/30',     icon: Sparkles },
  premium: { label: 'Premium', color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30', icon: Crown },
  pro:     { label: 'Pro',     color: 'text-purple-300 bg-purple-500/20 border-purple-500/30', icon: Gem },
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [me, setMe] = useState<Me | null>(null)
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [showPwForm, setShowPwForm] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const accessToken = (session as any)?.accessToken || ''
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      fetch(`${apiUrl}/payment/subscription`, { headers: { Authorization: `Bearer ${accessToken}` } }),
    ])
      .then(async ([meRes, subRes]) => {
        if (meRes.ok) setMe(await meRes.json())
        if (subRes.ok) setSub(await subRes.json())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, apiUrl, accessToken])

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setPwLoading(true)
    setPwMsg(null)
    try {
      const res = await fetch(`${apiUrl}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      if (res.ok) {
        setPwMsg({ type: 'success', text: 'Password changed successfully!' })
        setCurrentPw(''); setNewPw(''); setConfirmPw('')
        setTimeout(() => setShowPwForm(false), 2000)
      } else {
        const data = await res.json()
        setPwMsg({ type: 'error', text: data.detail || 'Failed to change password.' })
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setPwLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const userTier = me?.tier || 'free'
  const tierCfg = TIER_CONFIG[userTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.free
  const TierIcon = tierCfg.icon
  const isOAuth = !(session?.user as any)?.email?.includes('@') === false && !(accessToken)

  return (
    <div className="min-h-screen bg-transparent text-white">
      <NavBar />

      <div className="container py-12 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 gradient-text">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left: Avatar + tier ────────────────────────────────────── */}
          <div className="md:col-span-1">
            <div className="glass border border-white/10 rounded-2xl p-6 text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-lg shadow-purple-500/20">
                {me?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <h2 className="text-lg font-bold mb-1 truncate">{me?.name || session?.user?.name}</h2>
              <p className="text-sm text-gray-500 truncate mb-4">{me?.email || session?.user?.email}</p>

              {/* Tier badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${tierCfg.color}`}>
                <TierIcon className="w-4 h-4" />
                {tierCfg.label} Plan
              </div>

              {/* Member since */}
              {me?.created_at && (
                <p className="text-xs text-gray-600 mt-4">
                  Member since {new Date(me.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}

              {/* Sign out */}
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/5 py-2.5 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* ── Right: Details ─────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-5">

            {/* Account info */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="w-4 h-4" /> Full Name
                  </div>
                  <span className="text-sm text-white font-medium">{me?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" /> Email
                  </div>
                  <span className="text-sm text-white font-medium">{me?.email || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4" /> Plan
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${tierCfg.color}`}>
                    <TierIcon className="w-3 h-3" />
                    {tierCfg.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Subscription
              </h3>
              {sub ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className={`text-sm font-medium capitalize ${sub.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-sm text-gray-400">Plan</span>
                    <span className="text-sm font-medium capitalize text-white">{sub.plan}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-sm text-gray-400">Renews</span>
                    <span className="text-sm text-white">
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Auto-renews monthly'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-400">Auto-renew</span>
                    <span className={`text-sm font-medium ${sub.auto_renew ? 'text-green-400' : 'text-gray-500'}`}>
                      {sub.auto_renew ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">You are on the Free plan.</p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {userTier !== 'free' && (
                <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                  <Link
                    href="/pricing"
                    className="flex-1 text-center text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 py-2.5 rounded-xl transition"
                  >
                    View Plans
                  </Link>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Quick Stats
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: BookOpen, label: 'Chapters', href: '/learn' },
                  { icon: Trophy,   label: 'Quiz Scores', href: '/dashboard' },
                  { icon: Flame,    label: 'Streaks', href: '/dashboard' },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 transition group"
                  >
                    <Icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition" />
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 text-center transition">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Security
                </h3>
                <button
                  onClick={() => { setShowPwForm(!showPwForm); setPwMsg(null) }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  {showPwForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {!showPwForm ? (
                <p className="text-sm text-gray-500">Password last changed: never</p>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  {/* Current password */}
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Current password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* New password */}
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="New password (min 8 chars)"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      required
                      minLength={8}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm password */}
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />

                  {pwMsg && (
                    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                      pwMsg.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {pwMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      {pwMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                  >
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
