import type { Competition } from '../data/allCompetitions'

export type DataChange = {
  id: string
  kind: 'added' | 'updated'
  changedAt: string
}

export type UpdatePackage = {
  schemaVersion: 1
  version: string
  generatedAt: string
  records: Competition[]
  changes: DataChange[]
}

export type UpdateResult = {
  status: 'current' | 'updated' | 'skipped' | 'offline'
  records: Competition[]
  changes: DataChange[]
  version: string
  checkedAt: string
  error?: string
}

const PACKAGE_KEY = 'campus-competition/data-package-v1'
const CHECK_KEY = 'campus-competition/data-check-v1'
const DAY_MS = 86_400_000
const MIN_RECORDS = 100
const UPDATE_URL = import.meta.env.VITE_UPDATE_PACKAGE_URL || 'https://nomore-info-gaps-data.17789861171.workers.dev/v1/package.json'

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

function isCompetition(value: unknown): value is Competition {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Competition>
  return typeof item.id === 'string' && item.id.length > 0
    && typeof item.name === 'string' && item.name.length > 0
    && typeof item.category === 'string' && typeof item.organizer === 'string'
    && /^20\d{2}-\d{2}-\d{2}$/.test(item.start ?? '')
    && /^20\d{2}-\d{2}-\d{2}$/.test(item.deadline ?? '')
    && isHttpsUrl(item.source)
}

export function validateUpdatePackage(value: unknown): UpdatePackage {
  if (!value || typeof value !== 'object') throw new Error('数据包不是有效对象')
  const data = value as Partial<UpdatePackage>
  if (data.schemaVersion !== 1 || typeof data.version !== 'string' || !Date.parse(data.generatedAt ?? '')) throw new Error('数据包版本信息无效')
  if (!Array.isArray(data.records) || data.records.length < MIN_RECORDS || !data.records.every(isCompetition)) throw new Error('数据记录不完整或字段无效')
  if (new Set(data.records.map((item) => item.id)).size !== data.records.length) throw new Error('数据包包含重复记录')
  if (!Array.isArray(data.changes) || !data.changes.every((item) => item && typeof item.id === 'string' && (item.kind === 'added' || item.kind === 'updated') && Boolean(Date.parse(item.changedAt)))) throw new Error('更新记录无效')
  const ids = new Set(data.records.map((item) => item.id))
  if (data.changes.some((item) => !ids.has(item.id))) throw new Error('更新记录引用了不存在的竞赛')
  return data as UpdatePackage
}

export function loadCachedCompetitionData(fallback: Competition[]): Competition[] {
  if (typeof window === 'undefined') return fallback
  try { return validateUpdatePackage(JSON.parse(window.localStorage.getItem(PACKAGE_KEY) ?? '')).records }
  catch { return fallback }
}

export function loadCachedChanges(): DataChange[] {
  if (typeof window === 'undefined') return []
  try { return validateUpdatePackage(JSON.parse(window.localStorage.getItem(PACKAGE_KEY) ?? '')).changes }
  catch { return [] }
}

export function isToday(value: string, now = new Date()): boolean {
  const date = new Date(value)
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

export async function checkForDataUpdates(fallback: Competition[], force = false): Promise<UpdateResult> {
  const checkedAt = new Date().toISOString()
  const previousCheck = Number(window.localStorage.getItem(CHECK_KEY) ?? 0)
  const cachedRecords = loadCachedCompetitionData(fallback)
  const cachedChanges = loadCachedChanges()
  if (!force && Date.now() - previousCheck < DAY_MS) {
    return { status: 'skipped', records: cachedRecords, changes: cachedChanges, version: readCachedVersion(), checkedAt }
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 20_000)
  try {
    const response = await fetch(UPDATE_URL, { cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const length = Number(response.headers.get('content-length') ?? 0)
    if (length > 8_000_000) throw new Error('数据包超过 8 MB 安全限制')
    const text = await response.text()
    if (new Blob([text]).size > 8_000_000) throw new Error('数据包超过 8 MB 安全限制')
    const data = validateUpdatePackage(JSON.parse(text))
    const previousVersion = readCachedVersion()
    window.localStorage.setItem(PACKAGE_KEY, JSON.stringify(data))
    window.localStorage.setItem(CHECK_KEY, String(Date.now()))
    return { status: previousVersion && previousVersion !== data.version ? 'updated' : 'current', records: data.records, changes: data.changes, version: data.version, checkedAt }
  } catch (error) {
    const message = error instanceof DOMException && error.name === 'AbortError' ? '连接更新服务超时' : error instanceof Error ? error.message : '未知网络错误'
    return { status: 'offline', records: cachedRecords, changes: cachedChanges, version: readCachedVersion(), checkedAt, error: message }
  } finally {
    window.clearTimeout(timeout)
  }
}

function readCachedVersion(): string {
  try { return validateUpdatePackage(JSON.parse(window.localStorage.getItem(PACKAGE_KEY) ?? '')).version }
  catch { return 'bundled-2026.08.10' }
}
