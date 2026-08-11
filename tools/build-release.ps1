$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$privateKey = Join-Path $projectRoot '.release-secrets\updater.key'
$bundleDir = Join-Path $projectRoot 'src-tauri\target\release\bundle\nsis'

if (-not (Test-Path -LiteralPath $privateKey)) {
  throw "Updater private key is missing: $privateKey"
}

Push-Location $projectRoot
try {
  & npm.cmd run tauri build
  if ($LASTEXITCODE -ne 0) { throw 'Tauri build failed.' }

  $installer = Get-ChildItem -LiteralPath $bundleDir -Filter '*-setup.exe' |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if (-not $installer) { throw 'NSIS installer was not generated.' }

  & npx.cmd tauri signer sign --private-key-path $privateKey '--password=' $installer.FullName
  if ($LASTEXITCODE -ne 0) { throw 'Updater signing failed.' }

  & node tools\assemble-release.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Release assembly failed.' }
} finally {
  Pop-Location
}
