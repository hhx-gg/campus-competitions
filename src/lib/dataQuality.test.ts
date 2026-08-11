import { describe, expect, it } from 'vitest'
import { competitions } from '../data/allCompetitions'
import { sourceRegistry } from '../data/sourceRegistry'
import { auditCompetitionData } from './dataQuality'

describe('competition data quality gate', () => {
  it('meets the 150-record target for every year', () => {
    const report = auditCompetitionData(competitions, sourceRegistry)
    expect(report.total).toBe(competitions.length)
    expect(report.total).toBe(450)
    expect(report.publishable).toBe(true)
    expect(report.issues).toEqual([])
    expect(report.issues.some((issue) => issue.message.includes('年度竞赛不足'))).toBe(false)
  })

  it('blocks duplicate IDs and unregistered or insecure sources', () => {
    const invalid = [{ ...competitions[0], source: 'http://example.com' }, { ...competitions[0] }]
    const report = auditCompetitionData(invalid, sourceRegistry)
    expect(report.issues.some((issue) => issue.message === '重复记录 ID')).toBe(true)
    expect(report.issues.some((issue) => issue.message === '来源不是 HTTPS')).toBe(true)
    expect(report.issues.some((issue) => issue.message === '来源域名未登记')).toBe(true)
  })
})
