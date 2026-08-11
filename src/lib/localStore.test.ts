import { describe, expect, it } from 'vitest'
import { normalizeLocalUserState } from './localStore'

describe('normalizeLocalUserState', () => {
  it('migrates older state while dropping retired fields', () => {
    const result = normalizeLocalUserState(JSON.stringify({ schemaVersion: 1, favorites: ['a'], hidden: ['b'], reminders: ['c'] }))
    expect(result.schemaVersion).toBe(3)
    expect(result.favorites).toEqual(['a'])
    expect(result.hidden).toEqual(['b'])
    expect('reminders' in result).toBe(false)
  })

  it('backs away from corrupt input without throwing', () => {
    const result = normalizeLocalUserState('{bad json')
    expect(result.schemaVersion).toBe(3)
    expect(result.favorites).toEqual([])
  })

  it('sanitizes plan text and preserves supported preferences', () => {
    const result = normalizeLocalUserState(JSON.stringify({ reminders: [{ competitionId: 'a', daysBefore: 999, enabled: false }], plans: [{ competitionId: 'a', note: 'x'.repeat(5000), personalRating: 4, tasks: [{ title: 'task', completed: true }] }], language: 'en', theme: 'dark' }))
    expect(result.plans[0].note).toHaveLength(4000)
    expect(result.plans[0].personalRating).toBe(4)
    expect(result.language).toBe('en')
    expect(result.theme).toBe('dark')
  })
})
