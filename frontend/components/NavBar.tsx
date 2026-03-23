'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function NavBar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b border-surface-700 bg-surface-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-500 hover:text-indigo-400 transition">
            FatimaZehra AI Tutor
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/learn" className="text-gray-400 hover:text-white transition">
              Learn
            </Link>
            <Link href="/chat" className="text-gray-400 hover:text-white transition">
              Chat
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">
              Pricing
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-surface-700 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User menu or Auth buttons */}
            {session ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-gray-400">{session.user?.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-4">
                <Link
                  href="/auth/login"
                  className="text-gray-400 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 border-t border-surface-700 pt-4">
            <Link href="/learn" className="block text-gray-400 hover:text-white transition">
              Learn
            </Link>
            <Link href="/chat" className="block text-gray-400 hover:text-white transition">
              Chat
            </Link>
            <Link href="/pricing" className="block text-gray-400 hover:text-white transition">
              Pricing
            </Link>
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="block w-full text-left bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/login"
                  className="block text-center text-indigo-500 hover:text-indigo-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block text-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
