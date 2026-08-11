import type { Competition } from '../data/allCompetitions'
import { canonicalBrandName } from '../data/expandedCompetitionCatalog'
import type { SourceRecord } from '../data/sourceRegistry'

export type DataIssue = { severity: 'P0' | 'P1' | 'P2'; recordId?: string; field?: string; message: string }
export type DataQualityReport = { total: number; uniqueBrands: number; completeness: number; publishable: boolean; issues: DataIssue[] }

const requiredFields: Array<keyof Competition> = ['id', 'name', 'category', 'organizer', 'level', 'audience', 'start', 'deadline', 'format', 'fee', 'status', 'updatedAt', 'source', 'description', 'editionYear', 'datePrecision', 'dateNote', 'history', 'core', 'objective']
const brandName = canonicalBrandName

export function auditCompetitionData(items: Competition[], sources: SourceRecord[]): DataQualityReport {
  const issues: DataIssue[] = []
  const ids = new Set<string>()
  const editions = new Set<string>()
  const allowedHosts = new Set(sources.map((source) => new URL(source.url).hostname.toLowerCase()))
  let populated = 0
  for (const item of items) {
    if (ids.has(item.id)) issues.push({ severity: 'P0', recordId: item.id, field: 'id', message: '重复记录 ID' })
    ids.add(item.id)
    const editionKey = `${brandName(item.name)}|${item.start.slice(0, 4)}`
    if (editions.has(editionKey)) issues.push({ severity: 'P1', recordId: item.id, message: '疑似同一品牌同一届次重复' })
    editions.add(editionKey)
    for (const field of requiredFields) {
      const value = item[field]
      if (value !== undefined && value !== null && String(value).trim()) populated++
      else issues.push({ severity: 'P1', recordId: item.id, field, message: `必填字段缺失：${field}` })
    }
    let url: URL | undefined
    try { url = new URL(item.source) } catch { issues.push({ severity: 'P0', recordId: item.id, field: 'source', message: '来源网址格式无效' }) }
    if (url && url.protocol !== 'https:') issues.push({ severity: 'P0', recordId: item.id, field: 'source', message: '来源不是 HTTPS' })
    if (url && !allowedHosts.has(url.hostname.toLowerCase())) issues.push({ severity: 'P0', recordId: item.id, field: 'source', message: '来源域名未登记' })
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.start) || !/^\d{4}-\d{2}-\d{2}$/.test(item.deadline)) issues.push({ severity: 'P1', recordId: item.id, field: 'date', message: '日期格式必须为 YYYY-MM-DD' })
    if (item.start > item.deadline) issues.push({ severity: 'P1', recordId: item.id, field: 'date', message: '报名开始时间晚于截止时间' })
    const startYear = Number(item.start.slice(0, 4))
    const deadlineYear = Number(item.deadline.slice(0, 4))
    if (startYear !== item.editionYear || ![item.editionYear, item.editionYear + 1].includes(deadlineYear)) issues.push({ severity: 'P1', recordId: item.id, field: 'date', message: '日期年份与届次年份不一致（允许截止日期跨至次年）' })
    if (item.datePrecision !== 'exact' && item.status !== '日期待公布') issues.push({ severity: 'P1', recordId: item.id, field: 'status', message: '非精确日期必须明确标记为日期待公布' })
  }
  const completeness = items.length ? populated / (items.length * requiredFields.length) : 0
  for (const year of [2024, 2025, 2026]) {
    const count = items.filter((item) => item.editionYear === year).length
    if (count < 150) issues.push({ severity: 'P1', message: `${year}年度竞赛不足150条：当前 ${count} 条` })
  }
  const uniqueBrands = new Set(items.map((item) => brandName(item.name))).size
  if (uniqueBrands < 150) issues.push({ severity: 'P1', message: `不同竞赛项目不足150个：当前 ${uniqueBrands} 个` })
  const editionsByBrand = new Map<string, Set<number>>()
  for (const item of items) {
    const brand = brandName(item.name)
    const brandYears = editionsByBrand.get(brand) ?? new Set<number>()
    if (item.editionYear) brandYears.add(item.editionYear)
    editionsByBrand.set(brand, brandYears)
  }
  for (const [brand, brandYears] of editionsByBrand) {
    if (brandYears.size !== 3 || ![2024, 2025, 2026].every((year) => brandYears.has(year))) issues.push({ severity: 'P1', message: `${brand} 未完整保留2024—2026三个年度档案` })
  }
  if (completeness < .98) issues.push({ severity: 'P1', message: `字段完整率低于 98%：当前 ${(completeness * 100).toFixed(2)}%` })
  return { total: items.length, uniqueBrands, completeness, publishable: !issues.some((issue) => issue.severity === 'P0' || issue.severity === 'P1'), issues }
}
