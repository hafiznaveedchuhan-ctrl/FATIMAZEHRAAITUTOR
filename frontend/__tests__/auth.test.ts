/**
 * Auth utility tests
 * Tests password validation logic used in the signup page
 */
import { describe, it, expect } from 'vitest'

// Mirror of the validation rules in signup/page.tsx
const passwordRules = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p) },
]

const isPasswordValid = (pwd: string) => passwordRules.every((r) => r.test(pwd))

describe('Password validation', () => {
  it('accepts a strong password', () => {
    expect(isPasswordValid('Test1234!')).toBe(true)
  })

  it('rejects password shorter than 8 chars', () => {
    expect(isPasswordValid('T1!')).toBe(false)
  })

  it('rejects password without uppercase', () => {
    expect(isPasswordValid('test1234!')).toBe(false)
  })

  it('rejects password without number', () => {
    expect(isPasswordValid('TestTest!')).toBe(false)
  })

  it('rejects password without special character', () => {
    expect(isPasswordValid('Test1234')).toBe(false)
  })

  it('rejects empty password', () => {
    expect(isPasswordValid('')).toBe(false)
  })
})
