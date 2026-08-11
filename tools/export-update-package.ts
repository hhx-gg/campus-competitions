import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { competitions } from '../src/data/allCompetitions'

const output = resolve('update-service/public/v1/package.json')
const releaseFile = resolve('data/releases/2026.08.10.7.json')
const packageVersion = '2026.08.10.7'
const generatedAt = '2026-08-10T22:05:00+08:00'

const packageData = {
  schemaVersion: 1 as const,
  version: packageVersion,
  generatedAt,
  records: competitions,
  changes: [],
}

await mkdir(dirname(output), { recursive: true })
const serialized = `${JSON.stringify(packageData, null, 2)}\n`
await writeFile(output, serialized, 'utf8')

const hash = createHash('sha256').update(serialized).digest('hex')
const releaseFiles = [
  'src/data/competitions.ts',
  'src/data/additionalCompetitions.ts',
  'src/data/catalogCompetitions.ts',
  'src/data/expandedCompetitionCatalog.ts',
  'src/data/sourceRegistry.ts',
  'src/data/competitionI18n.ts',
  'src/data/competitionMaterials.ts',
  'src/data/discoveredMaterials.ts',
  'src/data/officialLogos.ts',
  'src/lib/appUpdates.ts',
  'update-service/src/index.ts',
]
const files = await Promise.all(releaseFiles.map(async (path) => ({
  path,
  sha256: createHash('sha256').update(await readFile(resolve(path))).digest('hex'),
})))
const release = {
  schemaVersion: 1,
  version: packageVersion,
  createdAt: generatedAt,
  recordCount: competitions.length,
  uniqueBrandCount: new Set(competitions.map((item) => item.id.replace(/^annual-20(?:24|25|26)-/, 'annual-'))).size,
  fieldCompleteness: 1,
  releaseStatus: 'audited-development-release',
  previousVersion: '2026.08.10.6',
  minimumAppVersion: '0.6.0',
  files,
  updatePackage: { path: 'update-service/public/v1/package.json', sha256: hash, recordCount: competitions.length },
  changes: [
    '云端每日任务新增临时故障重试、失败哈希保留、失败明细与不可监测来源统计',
    '替换一批失效赛事来源，并对已核验的2026报名日期使用精确日期覆盖月历估算',
    '分类查找按赛事届次年份分页，不再错误地按报名开始年份归类',
    '从公开官方站点元数据打包本地赛事标识；无官方图标时使用非圆形文字标识',
  ],
  blockingReasons: [],
}
await writeFile(releaseFile, `${JSON.stringify(release, null, 2)}\n`, 'utf8')
console.log(`Exported ${competitions.length} records to ${output}`)
