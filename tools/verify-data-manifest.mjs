import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const releasesDir = resolve(root, 'data/releases')
const latestManifest = (await readdir(releasesDir))
  .filter((name) => name.endsWith('.json'))
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0]
if (!process.argv[2] && !latestManifest) throw new Error('No data release manifest was found.')
const manifestPath = resolve(root, process.argv[2] ?? `data/releases/${latestManifest}`)
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const failures = []

for (const entry of manifest.files ?? []) {
  const bytes = await readFile(resolve(root, entry.path))
  const actual = createHash('sha256').update(bytes).digest('hex')
  if (actual !== String(entry.sha256).toLowerCase()) failures.push(`${entry.path}: expected ${entry.sha256}, got ${actual}`)
}

if (failures.length) {
  console.error(`Data manifest ${manifest.version} failed integrity verification:\n${failures.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Data manifest ${manifest.version} verified (${manifest.files.length} files, ${manifest.recordCount} records).`)
}
