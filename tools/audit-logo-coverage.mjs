import { readFile } from 'node:fs/promises'
import { officialLogoBySource } from '../src/data/officialLogos.ts'

const data = JSON.parse(await readFile(new URL('../update-service/public/v1/package.json', import.meta.url), 'utf8'))
const logoSources = new Set(Object.keys(officialLogoBySource))
const covered = data.records.filter((item) => item.logoUrl || logoSources.has(item.source)).length
console.log(JSON.stringify({
  records: data.records.length,
  recordsWithOfficialSiteMark: covered,
  recordsWithTextMarkFallback: data.records.length - covered,
  coveragePercent: Number((covered / data.records.length * 100).toFixed(1)),
  localLogoAssets: logoSources.size,
}, null, 2))
