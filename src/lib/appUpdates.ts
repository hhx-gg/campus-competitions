import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

export type AppUpdateResult = 'unsupported' | 'current' | 'installing'

export async function installAvailableAppUpdate(onInstalling?: (version: string) => void): Promise<AppUpdateResult> {
  if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) return 'unsupported'
  const update = await check({ timeout: 20_000 })
  if (!update) return 'current'
  onInstalling?.(update.version)
  await update.downloadAndInstall(undefined, { timeout: 120_000 })
  await relaunch()
  return 'installing'
}
