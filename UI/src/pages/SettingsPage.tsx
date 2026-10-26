import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Eye,
  Sliders,
  Wind,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  TextSizePreference,
  PreferredBreathingType,
  PreferredWellnessCategory,
} from '@/types/settings'
import {
  loadSettings,
  saveSettings,
  clearSessionCache,
} from '@/utils/settings'
import { cn } from '@/lib/utils'

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false)

  // Load saved settings on initial mount
  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
  }, [])

  // Update a single setting and immediately apply + save
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated: AppSettings = {
      ...settings,
      [key]: value,
    }
    setSettings(updated)
    saveSettings(updated)
    setSuccessBanner('Preference updated and applied across the application.')
  }

  // Reset all settings to defaults with explicit confirmation
  const handleConfirmReset = () => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
    setShowResetConfirm(false)
    setSuccessBanner(
      'Settings have been reset to factory defaults. Profile information was not modified.'
    )
  }

  // Clear cached session storage with explicit confirmation
  const handleConfirmClearCache = () => {
    clearSessionCache()
    setSettings(DEFAULT_SETTINGS)
    setShowClearCacheConfirm(false)
    setSuccessBanner(
      'Session cache cleared. All settings and temporary browser session data have been reset.'
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>System Configuration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Settings
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Configure application appearance, accessibility scaling, default wellness timers, and local data storage.
          </p>
        </div>
      </div>

      {/* 2. Success Feedback Banner */}
      {successBanner && (
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. Section: Appearance */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Appearance</h2>
            <p className="text-xs text-gray-500">Visual style and interface theme</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Clean White</span>
                <span className="text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                  Active (Default)
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cognivault AI uses a calm, pure white background with neutral grey borders to promote low-stimulation focus. Decorative color themes are disabled to preserve a minimal, distraction-free environment.
              </p>
            </div>

            <span className="text-xs font-medium text-gray-500 self-start sm:self-auto bg-white border border-gray-200 px-3 py-1.5 rounded-md">
              Read-Only Theme
            </span>
          </div>
        </div>
      </section>

      {/* 4. Section: Accessibility */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Accessibility</h2>
            <p className="text-xs text-gray-500">
              Typography scaling and motion preferences applied across all pages
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-5">
          {/* A. Text Size Scaling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                Text Size Scale
              </label>
              <span className="text-xs text-gray-400">
                {settings.textSize === 'large' ? 'Large (+10%)' : 'Normal (100%)'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Adjusts the root font scale across navigation, cards, and instructions for enhanced reading comfort.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => updateSetting('textSize', 'normal' as TextSizePreference)}
                className={cn(
                  'p-3.5 rounded-lg border text-left transition-all cursor-pointer space-y-1',
                  settings.textSize === 'normal'
                    ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Normal (Default)</span>
                  {settings.textSize === 'normal' && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-sm">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    settings.textSize === 'normal' ? 'text-gray-300' : 'text-gray-500'
                  )}
                >
                  Standard 100% typography scale optimized for compact layouts.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('textSize', 'large' as TextSizePreference)}
                className={cn(
                  'p-3.5 rounded-lg border text-left transition-all cursor-pointer space-y-1',
                  settings.textSize === 'large'
                    ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Large Text (+10%)</span>
                  {settings.textSize === 'large' && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-sm">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    settings.textSize === 'large' ? 'text-gray-300' : 'text-gray-500'
                  )}
                >
                  Enlarged font size across headers, instructions, and questionnaires.
                </p>
              </button>
            </div>
          </div>

          {/* B. Reduced Motion */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                Reduced Motion
              </label>
              <span className="text-xs text-gray-400">
                {settings.reduceMotion ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Suppresses animated transitions, card flips, and timer pulse effects to accommodate vestibular sensitivity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => updateSetting('reduceMotion', false)}
                className={cn(
                  'p-3.5 rounded-lg border text-left transition-all cursor-pointer space-y-1',
                  !settings.reduceMotion
                    ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Standard Motion</span>
                  {!settings.reduceMotion && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-sm">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    !settings.reduceMotion ? 'text-gray-300' : 'text-gray-500'
                  )}
                >
                  Smooth breathing ring scaling, card morphing, and modal fades.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('reduceMotion', true)}
                className={cn(
                  'p-3.5 rounded-lg border text-left transition-all cursor-pointer space-y-1',
                  settings.reduceMotion
                    ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Reduced Motion</span>
                  {settings.reduceMotion && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-sm">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    settings.reduceMotion ? 'text-gray-300' : 'text-gray-500'
                  )}
                >
                  Eliminates motion and scaling animations across the entire application.
                </p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Wellness Preferences */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Wellness Preferences</h2>
            <p className="text-xs text-gray-500">
              Default exercise durations and starting routines
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-5">
          {/* A. Default Meditation Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                Default Meditation Timer Duration
              </label>
              <span className="text-xs text-gray-400">
                {settings.defaultMeditationDuration} Minutes
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Sets the starting timer duration when visiting the Meditation & Guided Breathing page.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 3, 5, 10].map((mins) => {
                const isSelected = settings.defaultMeditationDuration === mins
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => updateSetting('defaultMeditationDuration', mins)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer',
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    <span>{mins} Minute{mins > 1 ? 's' : ''}</span>
                    {mins === 3 && (
                      <span className="text-[10px] ml-1.5 opacity-80">(Recommended)</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* B. Default Breathing Technique */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-900 block">
              Default Breathing Technique
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'calm_breathing',
                  title: 'Calm Breathing',
                  desc: 'Box 4-4-4-4 rhythm for focus',
                },
                {
                  id: 'mindful_pause',
                  title: 'Mindful Pause',
                  desc: 'Extended 4-2-6-2 reset',
                },
                {
                  id: 'body_relaxation',
                  title: 'Body Relaxation',
                  desc: 'Somatic 4-2-7-3 sigh',
                },
              ].map((item) => {
                const isSelected = settings.defaultBreathingType === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      updateSetting('defaultBreathingType', item.id as PreferredBreathingType)
                    }
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all cursor-pointer space-y-1',
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    <span className="font-semibold text-xs block">{item.title}</span>
                    <span
                      className={cn(
                        'text-[11px] block',
                        isSelected ? 'text-gray-300' : 'text-gray-400'
                      )}
                    >
                      {item.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* C. Default Physical Routine Category */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-900 block">
              Default Physical Wellness Filter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { id: 'all', title: 'All Routines' },
                { id: 'desk_stretches', title: 'Desk Stretches' },
                { id: 'gentle_yoga', title: 'Gentle Yoga' },
                { id: 'movement_breaks', title: 'Movement Breaks' },
              ].map((cat) => {
                const isSelected = settings.defaultWellnessCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      updateSetting(
                        'defaultWellnessCategory',
                        cat.id as PreferredWellnessCategory
                      )
                    }
                    className={cn(
                      'px-3 py-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer',
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    {cat.title}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-500">
            Note: No background alarms or unsolicited notifications are scheduled.
          </div>
        </div>
      </section>

      {/* 6. Section: Privacy and Data */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Privacy & Data Scope</h2>
            <p className="text-xs text-gray-500">Local data storage and prototype architecture</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>
            Cognivault AI is running as a client-side frontend prototype. Settings and exercise preferences are stored locally in your browser to maintain consistency while navigating between application pages.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 space-y-0.5">
              <span className="text-gray-400 block text-[11px]">Storage Mode</span>
              <span className="font-semibold text-gray-800">Local Browser Storage</span>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 space-y-0.5">
              <span className="text-gray-400 block text-[11px]">Server Synchronization</span>
              <span className="font-semibold text-gray-800">Offline / Disconnected</span>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 space-y-0.5">
              <span className="text-gray-400 block text-[11px]">Third-Party Telemetry</span>
              <span className="font-semibold text-gray-800">None (Zero Tracking)</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">
              Clear all locally stored preferences and temporary session tokens.
            </span>

            {!showClearCacheConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearCacheConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                <span>Clear Session Cache</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleConfirmClearCache}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  Yes, Clear Cache
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearCacheConfirm(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Section: Reset Settings */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Reset Settings</h2>
            <p className="text-xs text-gray-500">Restore application settings to initial defaults</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5 max-w-md">
            <p className="text-xs text-gray-600 leading-relaxed">
              Reset appearance, accessibility, and session duration defaults. This action does not modify Profile data.
            </p>
          </div>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset to Defaults</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-3 self-start sm:self-auto max-w-md">
              <div className="flex items-start gap-2 text-xs text-gray-800">
                <AlertCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                <p>
                  Reset all settings to initial defaults? Profile information will remain untouched.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3.5 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default SettingsPage
