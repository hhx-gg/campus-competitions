type Competition = {
  id: string
  name: string
  source: string
  start: string
  deadline: string
  status: string
  daysLeft: number
  datePrecision?: 'exact' | 'month' | 'year'
  editionYear?: 2024 | 2025 | 2026
  updatedAt: string
}

type DataPackage = {
  schemaVersion: 1
  version: string
  generatedAt: string
  records: Competition[]
  changes: Array<{ id: string; kind: 'added' | 'updated'; changedAt: string }>
}

type CrawlState = {
  source: string
  hash: string
  checkedAt: string
  status: number
  error?: string
  consecutiveFailures: number
}
type CrawlFailure = { source: string; error: string }
type CrawlSummary = {
  checkedAt: string
  checked: number
  succeeded: number
  changedSources: number
  updatedRecords: number
  failures: number
  unmonitorableSources: number
  failureDetails: CrawlFailure[]
}

export interface Env { ASSETS: Fetcher; COMPETITION_DATA: KVNamespace }

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=300',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

const MAX_PAGE_BYTES = 2_000_000
const STOP_STATUSES = new Set([401, 403, 429])
const dayMs = 86_400_000

function safePublicHttps(value: string): boolean {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const privateIpv4 = /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/
    return url.protocol === 'https:' && host !== 'localhost' && host !== '::1' && !host.endsWith('.local') && !privateIpv4.test(host)
  } catch { return false }
}

function normalizedText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function dateValue(year: string, month: string, day: string): string | undefined {
  const value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const date = new Date(`${value}T00:00:00Z`)
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() + 1 === Number(month) && date.getUTCDate() === Number(day) ? value : undefined
}

function competitionNeedle(name: string): string {
  return name.replace(/^20(?:24|25|26)\s*/, '').replace(/第[^届]*届/g, '').replace(/[\s（）()“”'"·—-]/g, '').slice(0, 18)
}

function extractRegistrationDates(text: string, item: Competition): { start?: string; deadline?: string } {
  if (item.editionYear !== 2026) return {}
  const compact = text.replace(/[\s（）()“”'"·—-]/g, '')
  const needle = competitionNeedle(item.name)
  const index = compact.indexOf(needle)
  if (needle.length < 6 || index < 0) return {}
  const windowText = compact.slice(Math.max(0, index - 500), index + needle.length + 1400)
  const range = windowText.match(/报名(?:时间|日期|阶段|起止时间)?[^。；]{0,80}?(2026)年(\d{1,2})月(\d{1,2})日[^。；]{0,30}?(?:至|到|—|-|~)(?:2026年)?(\d{1,2})月(\d{1,2})日/)
  if (range) return { start: dateValue(range[1], range[2], range[3]), deadline: dateValue('2026', range[4], range[5]) }
  const deadline = windowText.match(/(?:报名截止|截止报名|报名[^。；]{0,12}?截止)[^。；]{0,40}?(2026)年(\d{1,2})月(\d{1,2})日/)
  return deadline ? { deadline: dateValue(deadline[1], deadline[2], deadline[3]) } : {}
}

function applyDates(item: Competition, dates: { start?: string; deadline?: string }, changedAt: string): Competition {
  const start = dates.start ?? item.start
  const deadline = dates.deadline ?? item.deadline
  if (start > deadline || (!dates.start && !dates.deadline) || (start === item.start && deadline === item.deadline)) return item
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)
  const startsAt = new Date(`${start}T00:00:00Z`)
  const endsAt = new Date(`${deadline}T23:59:59Z`)
  const status = today < startsAt ? '未开始' : today <= endsAt ? '报名中' : '已截止'
  const daysLeft = status === '已截止' ? 0 : Math.max(0, Math.ceil((endsAt.getTime() - today.getTime()) / dayMs))
  return { ...item, start, deadline, status, daysLeft, datePrecision: 'exact', updatedAt: changedAt.slice(0, 16).replace('T', ' ') }
}

async function bundledPackage(env: Env, requestUrl = 'https://worker.invalid/v1/package.json'): Promise<DataPackage> {
  const stored = await env.COMPETITION_DATA.get<DataPackage>('package/current', 'json')
  if (stored) return stored
  const asset = await env.ASSETS.fetch(new Request(new URL('/v1/package.json', requestUrl)))
  if (!asset.ok) throw new Error(`Bundled package unavailable: HTTP ${asset.status}`)
  return asset.json<DataPackage>()
}

function isTransientFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /(?:timeout|HTTP 408|HTTP 5\d\d|network|fetch failed)/i.test(message)
}

async function delay(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchOfficialPageOnce(source: string): Promise<{ text: string; status: number }> {
  if (!safePublicHttps(source)) throw new Error('Blocked non-public or non-HTTPS source')
  const response = await fetch(source, {
    headers: { 'User-Agent': 'NoMoreInfoGapsBot/1.0 (+public competition data check)', Accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
  })
  if (STOP_STATUSES.has(response.status)) throw new Error(`Access denied: HTTP ${response.status}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  if (!safePublicHttps(response.url)) throw new Error('Blocked unsafe redirect target')
  const length = Number(response.headers.get('content-length') ?? 0)
  if (length > MAX_PAGE_BYTES) throw new Error('Page exceeds 2 MB limit')
  const html = await response.text()
  if (new Blob([html]).size > MAX_PAGE_BYTES) throw new Error('Page exceeds 2 MB limit')
  return { text: normalizedText(html), status: response.status }
}

async function fetchOfficialPage(source: string): Promise<{ text: string; status: number }> {
  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { return await fetchOfficialPageOnce(source) }
    catch (error) {
      lastError = error
      if (!isTransientFailure(error) || attempt === 1) throw error
      await delay(350 + Math.floor(Math.random() * 300))
    }
  }
  throw lastError
}

async function runDailyCrawl(env: Env, scheduledTime: number): Promise<CrawlSummary> {
  const data = await bundledPackage(env)
  const previousPackage = JSON.stringify(data)
  const allSources = [...new Set(data.records.filter((item) => item.editionYear === 2026).map((item) => item.source))].filter(safePublicHttps).sort()
  const sources = allSources.filter((source) => !new URL(source).pathname.toLowerCase().endsWith('.pdf'))
  const half = new Date(scheduledTime).getUTCHours() < 12 ? 0 : 1
  const selected = sources.filter((_, index) => index % 2 === half)
  const changedAt = new Date(scheduledTime).toISOString()
  const changedIds = new Set<string>()
  let changedSources = 0
  let failures = 0
  const failureDetails: CrawlFailure[] = []

  for (let offset = 0; offset < selected.length; offset += 5) {
    const batch = selected.slice(offset, offset + 5)
    await Promise.all(batch.map(async (source) => {
      const key = `source/${await sha256(source)}`
      try {
        const page = await fetchOfficialPage(source)
        const hash = await sha256(page.text)
        const previous = await env.COMPETITION_DATA.get<CrawlState>(key, 'json')
        await env.COMPETITION_DATA.put(key, JSON.stringify({ source, hash, checkedAt: changedAt, status: page.status, consecutiveFailures: 0 } satisfies CrawlState), { expirationTtl: 60 * 60 * 24 * 90 })
        if (!previous || previous.hash === hash) return
        changedSources += 1
        data.records = data.records.map((item) => {
          if (item.source !== source) return item
          const next = applyDates(item, extractRegistrationDates(page.text, item), changedAt)
          if (next !== item) changedIds.add(item.id)
          return next
        })
      } catch (error) {
        failures += 1
        const message = error instanceof Error ? error.message.slice(0, 180) : 'Unknown crawl error'
        failureDetails.push({ source, error: message })
        const previous = await env.COMPETITION_DATA.get<CrawlState>(key, 'json')
        await env.COMPETITION_DATA.put(key, JSON.stringify({
          source,
          hash: previous?.hash ?? '',
          checkedAt: changedAt,
          status: previous?.status ?? 0,
          error: message,
          consecutiveFailures: (previous?.consecutiveFailures ?? 0) + 1,
        } satisfies CrawlState), { expirationTtl: 60 * 60 * 24 * 90 })
      }
    }))
  }

  if (changedIds.size) {
    await env.COMPETITION_DATA.put('package/previous', previousPackage)
    data.version = changedAt.replace(/[-:T]/g, '').slice(0, 12)
    data.generatedAt = changedAt
    const retained = data.changes.filter((change) => Date.now() - Date.parse(change.changedAt) < 7 * dayMs && !changedIds.has(change.id))
    data.changes = [...retained, ...[...changedIds].map((id) => ({ id, kind: 'updated' as const, changedAt }))]
    await env.COMPETITION_DATA.put('package/current', JSON.stringify(data))
  }

  const summary = {
    checkedAt: changedAt,
    checked: selected.length,
    succeeded: selected.length - failures,
    changedSources,
    updatedRecords: changedIds.size,
    failures,
    unmonitorableSources: allSources.length - sources.length,
    failureDetails: failureDetails.sort((a, b) => a.source.localeCompare(b.source)),
  }
  await env.COMPETITION_DATA.put('crawl/last-run', JSON.stringify(summary), { expirationTtl: 60 * 60 * 24 * 30 })
  return summary
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 })
    if (url.pathname === '/health') {
      const lastRun = await env.COMPETITION_DATA.get<CrawlSummary>('crawl/last-run', 'json')
      return Response.json({ ok: true, service: 'nomore-info-gaps-data', lastRun }, { headers })
    }
    if (url.pathname === '/v1/status.json' || url.pathname === '/v1/crawl-report.json') return Response.json(await env.COMPETITION_DATA.get<CrawlSummary>('crawl/last-run', 'json'), { headers })
    if (url.pathname === '/v1/package.json') return Response.json(await bundledPackage(env, url.toString()), { headers })
    if (url.pathname === '/v1/latest.json' || url.pathname.startsWith('/downloads/')) {
      return env.ASSETS.fetch(request)
    }
    return new Response('Not found', { status: 404 })
  },

  async scheduled(controller: ScheduledController, env: Env, context: ExecutionContext): Promise<void> {
    context.waitUntil(runDailyCrawl(env, controller.scheduledTime))
  },
}
