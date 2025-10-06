import type { Settings } from './schema'
import { DEFAULT_SETTINGS } from './schema'

/**
 * Storage wrapper for extension settings
 */
export async function getSettings(): Promise<Settings> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return DEFAULT_SETTINGS
  }

  const result = await chrome.storage.local.get('settings')
  return { ...DEFAULT_SETTINGS, ...(result.settings || {}) }
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return
  }

  const current = await getSettings()
  const updated = { ...current, ...patch }
  await chrome.storage.local.set({ settings: updated })
}

export function onSettingsChanged(
  callback: (settings: Settings) => void
): () => void {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return () => {}
  }

  const listener = (changes: any, area: string) => {
    if (area === 'local' && changes.settings) {
      callback(changes.settings.newValue)
    }
  }

  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
