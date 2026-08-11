import { describe, expect, it } from 'vitest'
import { competitions, deriveCompetitionStatus } from './allCompetitions'
import { competitions as base } from './competitions'
import { competitionName, fieldValue } from './competitionI18n'

describe('runtime competition status', () => {
  it('never keeps an expired historical record open', () => {
    const result = deriveCompetitionStatus(base[0], new Date('2026-08-09T12:00:00+08:00'))
    expect(result.status).toBe('已截止')
    expect(result.daysLeft).toBe(0)
  })

  it('calculates open and upcoming states from dates', () => {
    expect(deriveCompetitionStatus(base[0], new Date('2025-06-01T12:00:00+08:00')).status).toBe('报名中')
    expect(deriveCompetitionStatus(base[0], new Date('2025-01-01T12:00:00+08:00')).status).toBe('未开始')
  })

  it('ships 150 independent records for each year from 2024 through 2026', () => {
    expect(competitions).toHaveLength(450)
    expect(new Set(competitions.map((item) => item.start.slice(0, 4)))).toEqual(new Set(['2024', '2025', '2026']))
    expect(new Set(competitions.map((item) => item.id)).size).toBe(450)
    for (const year of ['2024', '2025', '2026']) expect(competitions.filter((item) => item.editionYear === Number(year)).length).toBe(150)
    const editions = new Map<string, Set<number>>()
    for (const item of competitions) {
      const brand = item.name.replace(/^20\d{2}\s+/u, '')
      const years = editions.get(brand) ?? new Set<number>()
      years.add(item.editionYear!)
      editions.set(brand, years)
    }
    expect(editions.size).toBe(150)
    for (const years of editions.values()) expect(years).toEqual(new Set([2024, 2025, 2026]))
  })

  it('marks date precision and structured background for every annual record', () => {
    for (const item of competitions) {
      expect(['exact', 'month', 'year']).toContain(item.datePrecision)
      expect(item.dateNote).toBeTruthy()
      expect(item.history).toBeTruthy()
      expect(item.core).toBeTruthy()
      expect(item.objective).toBeTruthy()
    }
  })

  it('provides an English-only display name and core metadata for every record', () => {
    const han = /[\u3400-\u9fff]/u
    for (const item of competitions) {
      expect(competitionName('en', item)).not.toMatch(han)
      expect(competitionName('en', item)).not.toContain('English title missing')
      expect(fieldValue('en', item.category)).not.toMatch(han)
      expect(fieldValue('en', item.audience)).not.toMatch(han)
      expect(fieldValue('en', item.format)).not.toMatch(han)
      expect(fieldValue('en', item.fee)).not.toMatch(han)
    }
  })

  it('contains no unresolved competition-level labels', () => {
    expect(competitions.some((item) => item.level === '待审核')).toBe(false)
  })
})
