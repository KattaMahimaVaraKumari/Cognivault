import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings'

const SETTINGS_STORAGE_KEY = 'cognivault_app_settings'

export function applySettingsToDOM(settings: AppSettings): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // 1. Reduced Motion
  if (settings.reduceMotion) {
    root.classList.add('reduce-motion')
  } else {
    root.classList.remove('reduce-motion')
  }

  // 2. Text Size Scaling
  if (settings.textSize === 'large') {
    root.classList.add('text-size-large')
  } else {
    root.classList.remove('text-size-large')
  }
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      applySettingsToDOM(DEFAULT_SETTINGS)
      return DEFAULT_SETTINGS
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    const merged: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
    }
    applySettingsToDOM(merged)
    return merged
  } catch {
    applySettingsToDOM(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage quota or disabled storage errors
  }
  applySettingsToDOM(settings)
  window.dispatchEvent(
    new CustomEvent('cognivault-settings-changed', { detail: settings })
  )
}

export function clearSessionCache(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
    sessionStorage.clear()
  } catch {
    // Ignore storage errors
  }
  applySettingsToDOM(DEFAULT_SETTINGS)
  window.dispatchEvent(
    new CustomEvent('cognivault-settings-changed', { detail: DEFAULT_SETTINGS })
  )
}
