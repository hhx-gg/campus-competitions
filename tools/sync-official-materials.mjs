import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const data = JSON.parse(await readFile(resolve('update-service/public/v1/package.json'), 'utf8'))
const stopStatuses = new Set([401, 403, 429])
const maxBytes = 2_000_000

function isPublicHttps(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const privateIpv4 = /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/
    return url.protocol === 'https:' && host !== 'localhost' && host !== '::1' && !host.endsWith('.local') && !privateIpv4.test(host)
  } catch { return false }
}

function plainText(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim()
}

function fileLinks(html, pageUrl) {
  const links = []
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1].replace(/&amp;/gi, '&'), pageUrl).toString()
      if (!isPublicHttps(url) || !/\.(?:pdf|docx?|xlsx?|pptx?|zip)(?:$|[?#])/i.test(url)) continue
      const label = plainText(match[2]) || decodeURIComponent(new URL(url).pathname.split('/').pop() || 'Official file')
      if (!/2026/.test(`${label} ${url}`)) continue
      links.push({ url, label: label.slice(0, 160) })
    } catch { /* ignore malformed declared links */ }
  }
  return [...new Map(links.map((item) => [item.url, item])).values()].slice(0, 12)
}

async function inspect(source) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(source, {
      headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'NoMoreInfoGapsMaterialCollector/1.0 (+public official attachment links)' },
      redirect: 'follow', signal: controller.signal,
    })
    if (stopStatuses.has(response.status)) throw new Error(`access denied: HTTP ${response.status}`)
    if (!response.ok || !isPublicHttps(response.url)) throw new Error(`HTTP ${response.status}`)
    const declared = Number(response.headers.get('content-length') || 0)
    if (declared > maxBytes) throw new Error('page exceeds size limit')
    const html = await response.text()
    if (new Blob([html]).size > maxBytes) throw new Error('page exceeds size limit')
    return { source, files: fileLinks(html, response.url) }
  } catch (error) { return { source, files: [], error: error?.name === 'AbortError' ? 'timeout' : String(error?.message || error) } }
  finally { clearTimeout(timer) }
}

const records2026 = data.records.filter((item) => item.editionYear === 2026)
const counts = new Map()
for (const item of records2026) counts.set(item.source, (counts.get(item.source) || 0) + 1)
const sources = [...counts].filter(([source, count]) => count === 1 && isPublicHttps(source) && !new URL(source).pathname.toLowerCase().endsWith('.pdf')).map(([source]) => source).sort()
const results = []
for (let offset = 0; offset < sources.length; offset += 4) results.push(...await Promise.all(sources.slice(offset, offset + 4).map(inspect)))
const withFiles = results.filter((result) => result.files.length)
const entries = withFiles.map((result) => {
  const files = result.files.map((file) => `    { nameZh: ${JSON.stringify(file.label)}, nameEn: ${JSON.stringify(`Official file: ${decodeURIComponent(new URL(file.url).pathname.split('/').pop() || 'download')}`)}, url: ${JSON.stringify(file.url)} },`).join('\n')
  return `  ${JSON.stringify(result.source)}: [\n${files}\n  ],`
}).join('\n')
await writeFile(resolve('src/data/discoveredMaterials.ts'), `// Generated only from direct file links on single-competition registered official source pages.\nexport type DiscoveredMaterial = { nameZh: string; nameEn: string; url: string }\nexport const discoveredMaterialsBySource: Record<string, DiscoveredMaterial[]> = {\n${entries}\n}\n`, 'utf8')
console.log(JSON.stringify({ checked: sources.length, sourcesWithDirectFiles: withFiles.length, directFiles: withFiles.reduce((sum, item) => sum + item.files.length, 0), failures: results.filter((item) => item.error).length }, null, 2))
