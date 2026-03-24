/**
 * Rate-limit logic tests
 * Tests the server-side rate limiter used in app/api/chat/route.ts
 */
import { describe, it, expect, beforeEach } from 'vitest'

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  premium: 50,
  pro: Infinity,
}

// Extracted rate-limit logic (mirrors chat/route.ts)
const store = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string, tier: string, dayStamp = 1) {
  const limit = TIER_LIMITS[tier] ?? 5
  if (!isFinite(limit)) return { allowed: true, remaining: 999 }

  const key = `${userId}:${dayStamp}`
  const entry = store.get(key) ?? { count: 0, resetAt: Date.now() + 86400000 }

  if (entry.count >= limit) return { allowed: false, remaining: 0 }

  store.set(key, { ...entry, count: entry.count + 1 })
  return { allowed: true, remaining: limit - entry.count - 1 }
}

describe('Server-side rate limiter', () => {
  beforeEach(() => store.clear())

  it('allows free user up to 5 messages', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('user1', 'free').allowed).toBe(true)
    }
  })

  it('blocks free user on 6th message', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('user1', 'free')
    expect(checkRateLimit('user1', 'free').allowed).toBe(false)
  })

  it('never blocks pro users', () => {
    for (let i = 0; i < 1000; i++) {
      expect(checkRateLimit('user-pro', 'pro').allowed).toBe(true)
    }
  })

  it('tracks different users independently', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('userA', 'free')
    expect(checkRateLimit('userA', 'free').allowed).toBe(false)
    expect(checkRateLimit('userB', 'free').allowed).toBe(true)
  })

  it('returns correct remaining count', () => {
    const first = checkRateLimit('user1', 'free')
    expect(first.remaining).toBe(4)
    const second = checkRateLimit('user1', 'free')
    expect(second.remaining).toBe(3)
  })
})
