import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

const data = JSON.parse(await readFile(resolve('update-service/public/v1/package.json'), 'utf8'))
const outputDir = resolve('public/logos')
const mappingFile = resolve('src/data/officialLogos.ts')
const maxHtmlBytes = 1_000_000
const maxImageBytes = 750_000
const stopStatuses = new Set([401, 403, 429])

function isPublicHttps(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const privateIpv4 = /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/
    return url.protocol === 'https:' && host !== 'localhost' && host !== '::1' && !host.endsWith('.local') && !privateIpv4.test(host)
  } catch { return false }
}

async function boundedBytes(response, cap) {
  const declared = Number(response.headers.get('content-length') || 0)
  if (declared > cap) throw new Error(`asset exceeds ${cap} byte limit`)
  const reader = response.body?.getReader()
  if (!reader) return new Uint8Array()
  const chunks = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > cap) {
      await reader.cancel()
      throw new Error(`asset exceeds ${cap} byte limit`)
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return bytes
}

function iconCandidates(html, pageUrl) {
  const candidates = []
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0])
  for (const image of images) {
    const semanticText = ['class', 'id', 'alt', 'src'].map((attribute) => image.match(new RegExp(`\\b${attribute}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1] || '').join(' ')
    if (!/(?:^|[\s_\-/])(?:logo|site-logo|header-logo|徽标|标志)(?:[\s_.\-/]|$)/i.test(semanticText)) continue
    const source = image.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/gi, '&')
    if (!source) continue
    try { candidates.push(new URL(source, pageUrl).toString()) } catch { /* ignore malformed metadata */ }
  }
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0])
  for (const link of links) {
    const rel = link.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1] || ''
    if (!/(?:^|\s)(?:apple-touch-icon|icon|shortcut icon)(?:\s|$)/i.test(rel)) continue
    const href = link.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]
    if (!href) continue
    try { candidates.push(new URL(href, pageUrl).toString()) } catch { /* ignore malformed metadata */ }
  }
  candidates.push(new URL('/favicon.ico', pageUrl).toString())
  return [...new Set(candidates)].filter(isPublicHttps)
}

function extensionFor(contentType, url) {
  if (contentType.includes('svg')) return '.svg'
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg'
  if (contentType.includes('x-icon') || contentType.includes('vnd.microsoft.icon')) return '.ico'
  const suffix = extname(new URL(url).pathname).toLowerCase()
  return ['.svg', '.png', '.webp', '.jpg', '.jpeg', '.ico'].includes(suffix) ? suffix.replace('.jpeg', '.jpg') : '.ico'
}

async function harvest(source) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const sourceUrl = new URL(source)
    const pageUrl = sourceUrl.pathname.toLowerCase().endsWith('.pdf') ? sourceUrl.origin : source
    const response = await fetch(pageUrl, {
      headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'NoMoreInfoGapsLogoCollector/1.0 (+public official site metadata)' },
      redirect: 'follow', signal: controller.signal,
    })
    if (stopStatuses.has(response.status)) throw new Error(`access denied: HTTP ${response.status}`)
    if (!response.ok || !isPublicHttps(response.url)) throw new Error(`page HTTP ${response.status}`)
    const html = new TextDecoder().decode(await boundedBytes(response, maxHtmlBytes))
    for (const candidate of iconCandidates(html, response.url)) {
      try {
        const iconResponse = await fetch(candidate, {
          headers: { Accept: 'image/*', 'User-Agent': 'NoMoreInfoGapsLogoCollector/1.0 (+public official site metadata)' },
          redirect: 'follow', signal: controller.signal,
        })
        const contentType = (iconResponse.headers.get('content-type') || '').toLowerCase()
        if (stopStatuses.has(iconResponse.status) || !iconResponse.ok || !isPublicHttps(iconResponse.url) || (!contentType.startsWith('image/') && !/\.(?:svg|png|webp|jpe?g|ico)(?:$|\?)/i.test(iconResponse.url))) continue
        const bytes = await boundedBytes(iconResponse, maxImageBytes)
        if (bytes.byteLength < 32) continue
        const hash = createHash('sha256').update(source).digest('hex').slice(0, 16)
        const filename = `${hash}${extensionFor(contentType, iconResponse.url)}`
        await writeFile(resolve(outputDir, filename), bytes)
        return { source, path: `/logos/${filename}`, assetSource: iconResponse.url }
      } catch { /* try the next official metadata candidate */ }
    }
    throw new Error('no usable official icon metadata')
  } catch (error) {
    return { source, error: error?.name === 'AbortError' ? 'timeout' : String(error?.message || error) }
  } finally { clearTimeout(timer) }
}

await mkdir(outputDir, { recursive: true })
for (const name of await readdir(outputDir)) await rm(resolve(outputDir, name))
const sources = [...new Set(data.records.map((item) => item.source).filter(isPublicHttps))].sort()
const results = []
for (let offset = 0; offset < sources.length; offset += 4) {
  results.push(...await Promise.all(sources.slice(offset, offset + 4).map(harvest)))
}
const successes = results.filter((item) => item.path)
const lines = successes.map((item) => `  ${JSON.stringify(item.source)}: ${JSON.stringify(item.path)},`)
await writeFile(mappingFile, `// Generated from public icon metadata on registered official source pages.\nexport const officialLogoBySource: Record<string, string> = {\n${lines.join('\n')}\n}\n\nexport function officialLogoFor(source: string): string | undefined {\n  return officialLogoBySource[source]\n}\n`, 'utf8')
console.log(JSON.stringify({ checked: sources.length, downloaded: successes.length, failed: results.length - successes.length, failures: results.filter((item) => item.error) }, null, 2))
