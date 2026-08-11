import { describe, expect, it } from 'vitest'
import { isToday, validateUpdatePackage } from './dataUpdates'

const record = {
  id: 'x', name: 'X', category: 'C', organizer: 'O', level: '国家级', audience: '本科生',
  start: '2026-01-01', deadline: '2026-02-01', format: '团队赛', fee: '免费', difficulty: 3,
  value: '中', status: '已截止', updatedAt: '2026-08-10 08:00', source: 'https://example.com',
  description: 'x', daysLeft: 0, color: '#000',
}

describe('data update validation', () => {
  it('rejects undersized packages', () => expect(() => validateUpdatePackage({ schemaVersion: 1, version: '1', generatedAt: new Date().toISOString(), records: [record], changes: [] })).toThrow())
  it('compares calendar dates in local time', () => expect(isToday('2026-08-10T01:00:00+08:00', new Date('2026-08-10T20:00:00+08:00'))).toBe(true))
})
