/**
 * Tier configuration tests
 * Tests tier-gating logic used across the app
 */
import { describe, it, expect } from 'vitest'

const TIER_ORDER: Record<string, number> = { free: 0, premium: 1, pro: 2 }

function canAccessChapter(userTier: string, chapterTierRequired: string): boolean {
  return (TIER_ORDER[userTier] ?? 0) >= (TIER_ORDER[chapterTierRequired] ?? 0)
}

describe('Tier gating', () => {
  it('free user can access free chapters', () => {
    expect(canAccessChapter('free', 'free')).toBe(true)
  })

  it('free user cannot access premium chapters', () => {
    expect(canAccessChapter('free', 'premium')).toBe(false)
  })

  it('free user cannot access pro chapters', () => {
    expect(canAccessChapter('free', 'pro')).toBe(false)
  })

  it('premium user can access free chapters', () => {
    expect(canAccessChapter('premium', 'free')).toBe(true)
  })

  it('premium user can access premium chapters', () => {
    expect(canAccessChapter('premium', 'premium')).toBe(true)
  })

  it('premium user cannot access pro chapters', () => {
    expect(canAccessChapter('premium', 'pro')).toBe(false)
  })

  it('pro user can access all tiers', () => {
    expect(canAccessChapter('pro', 'free')).toBe(true)
    expect(canAccessChapter('pro', 'premium')).toBe(true)
    expect(canAccessChapter('pro', 'pro')).toBe(true)
  })
})
