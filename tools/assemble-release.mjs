import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

const version = '0.6.0'
const projectRoot = resolve('.')
const bundleDir = resolve(projectRoot, 'src-tauri/target/release/bundle/nsis')
const releasesDir = resolve(projectRoot, 'releases')
const downloadDir = resolve(projectRoot, 'update-service/public/downloads')
const updateMetadataPath = resolve(projectRoot, 'update-service/public/v1/latest.json')

const bundleFiles = await readdir(bundleDir)
const installerName = bundleFiles.find((name) => name.endsWith('-setup.exe'))
if (!installerName) throw new Error('NSIS installer is missing. Run the Tauri build first.')

const sourceInstallerPath = resolve(bundleDir, installerName)
const signaturePath = `${sourceInstallerPath}.sig`
const signature = (await readFile(signaturePath, 'utf8')).trim()
if (!signature) throw new Error('Updater signature is empty. Sign the NSIS installer first.')

await mkdir(releasesDir, { recursive: true })
await mkdir(downloadDir, { recursive: true })

// Keep one current installer locally and one current updater artifact online.
for (const name of await readdir(releasesDir)) {
  if (name.endsWith('.exe')) await rm(resolve(releasesDir, name))
}
for (const name of await readdir(downloadDir)) {
  if (name.endsWith('.exe') || name.endsWith('.zip') || name.endsWith('.sig')) {
    await rm(resolve(downloadDir, name))
  }
}

const publicInstallerName = `杜绝信息差_${version}_x64-setup.exe`
const publicUpdaterName = `no-more-info-gaps_${version}_x64-setup.exe`
const installerPath = resolve(releasesDir, publicInstallerName)
const updaterPath = resolve(downloadDir, publicUpdaterName)
await copyFile(sourceInstallerPath, installerPath)
await copyFile(sourceInstallerPath, updaterPath)
await writeFile(`${updaterPath}.sig`, `${signature}\n`, 'utf8')

const updater = {
  version,
  notes: '增强每日数据更新、官方站点标识、年份筛选、深色主题、隐藏恢复、双语界面与应用自动升级。',
  pub_date: new Date().toISOString(),
  platforms: {
    'windows-x86_64': {
      signature,
      url: `https://nomore-info-gaps-data.17789861171.workers.dev/downloads/${publicUpdaterName}`,
    },
  },
}
await writeFile(updateMetadataPath, `${JSON.stringify(updater, null, 2)}\n`, 'utf8')

const installerBytes = await readFile(installerPath)
const installerHash = createHash('sha256').update(installerBytes).digest('hex').toUpperCase()
await writeFile(resolve(releasesDir, 'SHA256SUMS.txt'), `${installerHash}  ${publicInstallerName}\n`, 'utf8')
await writeFile(
  resolve(releasesDir, 'README.md'),
  `# Windows 安装包\n\n- 文件：${publicInstallerName}\n- 版本：${version}\n- SHA-256：${installerHash}\n- 数据版本：2026.08.10.7（450 条，150 个品牌，2024—2026 各 150 条）\n- 自动更新：应用启动时检查由 Cloudflare 发布、经 Tauri 签名验证的升级包。\n- 说明：安装包尚未购买 Windows Authenticode 商业证书，首次安装可能显示 SmartScreen 提示；应用内升级包仍有独立密码学签名校验。\n`,
  'utf8',
)

console.log(JSON.stringify({ installer: basename(installerPath), sha256: installerHash, updaterArtifact: publicUpdaterName }, null, 2))
