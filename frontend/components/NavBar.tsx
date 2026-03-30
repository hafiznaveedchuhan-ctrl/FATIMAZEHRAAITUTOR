'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X, ChevronDown, Sparkles, Crown, Gem } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/** Tier badge configuration */
const tierConfig = {
  free: { label: 'Free', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: Sparkles },
  premium: { label: 'Premium', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Crown },
  pro: { label: 'Pro', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Gem },
}

export default function NavBar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [liveTier, setLiveTier] = useState<string | null>(null)
  const pathname = usePathname()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Fetch live tier from backend to bypass stale JWT after upgrades
  useEffect(() => {
    if (!session) return
    const accessToken = (session as any)?.accessToken
    if (!accessToken) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => { if (me?.tier) setLiveTier(me.tier) })
      .catch(() => {})
  }, [session])

  // Track scroll for navbar background intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    ...(session ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    { href: '/learn', label: 'Learn' },
    { href: '/chat', label: 'AI Chat' },
    { href: '/pricing', label: 'Pricing' },
  ]

  const isActive = (href: string) => pathname === href

  // User tier: prefer live tier from backend (bypasses stale JWT after upgrade)
  const userTier = liveTier ?? (session?.user as { tier?: string } | undefined)?.tier ?? 'free'
  const tier = tierConfig[userTier as keyof typeof tierConfig] || tierConfig.free
  const TierIcon = tier.icon

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        scrolled
          ? 'backdrop-blur-2xl shadow-2xl nav-bg-scrolled'
          : 'backdrop-blur-xl nav-bg'
      }`}
    >
      <div className="container py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
              FZ
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#EC4899] opacity-0 group-hover:opacity-100 blur-md transition-opacity -z-10" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              Fatima Zehra AI Tutor
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link-underline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'dark:text-white text-gray-900 bg-white/5'
                    : 'dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Upgrade button (show for free users who are logged in) */}
            {session && userTier === 'free' && (
              <Link
                href="/pricing"
                className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-white btn-gradient"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upgrade
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                {!mounted ? (
                  <div className="w-5 h-5" />
                ) : theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400 transition-transform group-hover:rotate-45 duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-400 transition-transform group-hover:-rotate-12 duration-300" />
                )}
              </div>
            </button>

            {/* Auth section */}
            {session ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white font-semibold text-xs">
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm dark:text-gray-300 text-gray-700 max-w-[100px] truncate">
                    {session.user?.name || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl glass border border-white/10 shadow-2xl shadow-black/40 py-2 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                      <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium border ${tier.color}`}>
                        <TierIcon className="w-3 h-3" />
                        {tier.label}
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/learn"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Courses
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile & Settings
                      </Link>
                      {userTier === 'free' && (
                        <Link
                          href="/pricing"
                          className="block px-4 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Upgrade Plan
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          signOut({ callbackUrl: '/auth/login' })
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 border dark:border-white/10 border-gray-200 dark:hover:border-white/20 hover:border-gray-300 hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white btn-gradient"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-6 h-6">
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-300" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-white/10 pt-4 pb-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile tier badge */}
            {session && (
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#EC4899] flex items-center justify-center text-white font-semibold text-xs">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{session.user?.name}</p>
                  <div className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${tier.color}`}>
                    <TierIcon className="w-3 h-3" />
                    {tier.label} Tier
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-3 mt-2 space-y-2 px-4">
              {session ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut({ callbackUrl: '/auth/login' })
                  }}
                  className="w-full text-center py-3 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/5 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-3 rounded-xl text-sm font-medium text-gray-300 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-3 rounded-xl text-sm font-semibold text-white btn-gradient"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

