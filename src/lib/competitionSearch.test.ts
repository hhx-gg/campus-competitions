import { describe, expect, it } from 'vitest'
import { competitions } from '../data/allCompetitions'
import { searchCompetitions } from './competitionSearch'

describe('competition search', () => {
  it('is case-insensitive and matches abbreviations and aliases', () => {
    expect(searchCompetitions(competitions, 'neccs')[0]?.name).toContain('全国大学生英语竞赛')
    expect(searchCompetitions(competitions, 'CUMCM')[0]?.name).toContain('高教社杯')
    expect(searchCompetitions(competitions, 'lanqiaobei')[0]?.name).toContain('蓝桥杯')
  })

  it('searches organizer, description, audience, format and fee', () => {
    expect(searchCompetitions(competitions, '工业和信息化部人才交流中心').some((item) => item.name.includes('蓝桥杯'))).toBe(true)
    expect(searchCompetitions(competitions, '嵌入式').length).toBeGreaterThan(0)
    expect(searchCompetitions(competitions, '研究生').length).toBeGreaterThan(0)
  })

  it('returns the first screen within 150 ms for 10,000 local records', () => {
    const large = Array.from({ length: 10_000 }, (_, index) => ({ ...competitions[index % competitions.length], id: `${competitions[index % competitions.length].id}-${index}` }))
    const start = performance.now()
    const result = searchCompetitions(large, '嵌入式').slice(0, 50)
    expect(performance.now() - start).toBeLessThan(150)
    expect(result.length).toBeGreaterThan(0)
  })
})
