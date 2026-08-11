import { readFile } from 'node:fs/promises'

const packagePath = new URL('../update-service/public/v1/package.json', import.meta.url)
const data = JSON.parse(await readFile(packagePath, 'utf8'))
const halfArg = process.argv.find((arg) => arg.startsWith('--half='))?.split('=')[1]
const selectedHalf = halfArg === '0' || halfArg === '1' ? Number(halfArg) : undefined
const maxBytes = 2_000_000
const stopStatuses = new Set([401, 403, 429])

function isPublicHttps(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const privateIpv4 = /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/
    return url.protocol === 'https:'
      && host !== 'localhost'
      && host !== '::1'
      && !host.endsWith('.local')
      && !privateIpv4.test(host)
  } catch {
    return false
  }
}

async function inspect(source) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(source, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'NoMoreInfoGapsBot/1.0 (+public competition data verification)',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
    const finalUrl = response.url || source
    if (!isPublicHttps(finalUrl)) throw new Error('Blocked unsafe redirect target')
    if (stopStatuses.has(response.status)) throw new Error(`Access denied: HTTP ${response.status}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const declaredBytes = Number(response.headers.get('content-length') || 0)
    if (declaredBytes > maxBytes) throw new Error('Page exceeds 2 MB limit')
    const reader = response.body?.getReader()
    let bytes = 0
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > maxBytes) {
          await reader.cancel()
          throw new Error('Page exceeds 2 MB limit')
        }
      }
    }
    return { source, ok: true, status: response.status, finalUrl, bytes }
  } catch (error) {
    const cause = error?.cause?.code || error?.cause?.message
    const base = error?.name === 'AbortError' ? 'Timeout after 15 seconds' : String(error?.message || error)
    const message = cause ? `${base} (${cause})` : base
    return { source, ok: false, error: message }
  } finally {
    clearTimeout(timeout)
  }
}

const sources = [...new Set(
  data.records
    .filter((item) => item.editionYear === 2026)
    .map((item) => item.source)
    .filter(isPublicHttps),
)].sort()
const selected = selectedHalf === undefined
  ? sources
  : sources.filter((_, index) => index % 2 === selectedHalf)
const results = []
for (let offset = 0; offset < selected.length; offset += 5) {
  results.push(...await Promise.all(selected.slice(offset, offset + 5).map(inspect)))
}
const failures = results.filter((result) => !result.ok)
const redirects = results.filter((result) => result.ok && result.finalUrl !== result.source)
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  selectedHalf: selectedHalf ?? 'all',
  checked: results.length,
  succeeded: results.length - failures.length,
  failed: failures.length,
  failures,
  redirects,
}, null, 2))
