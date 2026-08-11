import type { Competition } from './competitions'
import { expandedCompetitions } from './expandedCompetitionCatalog'

export type { Competition } from './competitions'
const dayMs = 86_400_000
export function deriveCompetitionStatus(item: Competition, now = new Date()): Competition {
  if (item.datePrecision && item.datePrecision !== 'exact') return { ...item, status: '日期待公布', daysLeft: 0 }
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const start = new Date(`${item.start}T00:00:00`)
  const deadline = new Date(`${item.deadline}T23:59:59`)
  const status = today < start ? '未开始' : today <= deadline ? '报名中' : '已截止'
  const daysLeft = status === '已截止' ? 0 : Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / dayMs))
  return { ...item, status, daysLeft }
}

export const competitions: Competition[] = expandedCompetitions
  .map((item) => deriveCompetitionStatus(item))
  .sort((a, b) => b.start.localeCompare(a.start) || b.updatedAt.localeCompare(a.updatedAt))
