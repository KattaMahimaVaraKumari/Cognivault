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
  Sparkles,
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#ffdce4]/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-semibold uppercase tracking-wider text-[#8c1d3c] shadow-2xs backdrop-blur-md">
            <SettingsIcon className="w-3.5 h-3.5 text-[#e0567b]" />
            <span>System Configuration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2d1b24]">
            Settings
          </h1>

          <p className="text-xs sm:text-sm text-[#735562] max-w-2xl leading-relaxed">
            Configure application appearance, accessibility scaling, default wellness timers, and local data storage.
          </p>
        </div>
      </div>

      {/* 2. Success Feedback Banner */}
      {successBanner && (
        <div className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] backdrop-blur-md text-xs text-[#166534] shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{successBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-[#16a34a] hover:text-[#14532d] p-0.5 cursor-pointer"
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. Section: Appearance */}
      <section className="glass-panel p-6 sm:p-7 space-y-4 border border-[#ffdce4]/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/80 flex items-center justify-center text-[#c0385c] shadow-2xs">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2d1b24]">Appearance</h2>
            <p className="text-xs text-[#735562]">Visual style and interface theme</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ffeef2] space-y-3">
          <div className="p-4 rounded-xl border border-[#fed5df] bg-white/70 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#2d1b24]">Light Pastel Baby-Pink Glassmorphism</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8c1d3c] bg-[#fff0f4] border border-[#fcaec2]/60 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-[#e0567b]" />
                  Active Theme
                </span>
              </div>
              <p className="text-xs text-[#614752] leading-relaxed">
                Cognivault AI features a clean, premium light pastel baby-pink and pearl-white frosted-glass aesthetic designed for a calming, high-end wellness experience.
              </p>
            </div>

            <span className="text-xs font-semibold text-[#8c1d3c] self-start sm:self-auto bg-[#fff0f4] border border-[#fcaec2]/60 px-3.5 py-1.5 rounded-xl shadow-2xs">
              Baby Pink & Pearl
            </span>
          </div>
        </div>
      </section>

      {/* 4. Section: Accessibility */}
      <section className="glass-panel p-6 sm:p-7 space-y-5 border border-[#ffdce4]/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/80 flex items-center justify-center text-[#c0385c] shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2d1b24]">Accessibility</h2>
            <p className="text-xs text-[#735562]">
              Typography scaling and motion preferences applied across all pages
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ffeef2] space-y-5">
          {/* A. Text Size Scaling */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e]">
                Text Size Scale
              </label>
              <span className="text-xs font-medium text-[#9c7886]">
                {settings.textSize === 'large' ? 'Large (+10%)' : 'Normal (100%)'}
              </span>
            </div>
            <p className="text-xs text-[#614752]">
              Adjusts the root font scale across navigation, cards, and instructions for enhanced reading comfort.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => updateSetting('textSize', 'normal' as TextSizePreference)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 backdrop-blur-sm',
                  settings.textSize === 'normal'
                    ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                    : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Normal (Default)</span>
                  {settings.textSize === 'normal' && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    settings.textSize === 'normal' ? 'text-white/90' : 'text-[#735562]'
                  )}
                >
                  Standard 100% typography scale optimized for clean layouts.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('textSize', 'large' as TextSizePreference)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 backdrop-blur-sm',
                  settings.textSize === 'large'
                    ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                    : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Large Text (+10%)</span>
                  {settings.textSize === 'large' && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    settings.textSize === 'large' ? 'text-white/90' : 'text-[#735562]'
                  )}
                >
                  Enlarged font size across headers, instructions, and questionnaires.
                </p>
              </button>
            </div>
          </div>

          {/* B. Reduced Motion */}
          <div className="space-y-2.5 pt-4 border-t border-[#ffeef2]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e]">
                Reduced Motion
              </label>
              <span className="text-xs font-medium text-[#9c7886]">
                {settings.reduceMotion ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-[#614752]">
              Suppresses animated transitions, card flips, and timer pulse effects to accommodate vestibular sensitivity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => updateSetting('reduceMotion', false)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 backdrop-blur-sm',
                  !settings.reduceMotion
                    ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                    : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Standard Motion</span>
                  {!settings.reduceMotion && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    !settings.reduceMotion ? 'text-white/90' : 'text-[#735562]'
                  )}
                >
                  Smooth breathing ring scaling, card morphing, and modal fades.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('reduceMotion', true)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 backdrop-blur-sm',
                  settings.reduceMotion
                    ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                    : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm">Reduced Motion</span>
                  {settings.reduceMotion && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-normal',
                    settings.reduceMotion ? 'text-white/90' : 'text-[#735562]'
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
      <section className="glass-panel p-6 sm:p-7 space-y-5 border border-[#ffdce4]/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/80 flex items-center justify-center text-[#c0385c] shadow-2xs">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2d1b24]">Wellness Preferences</h2>
            <p className="text-xs text-[#735562]">
              Default exercise durations and starting routines
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ffeef2] space-y-5">
          {/* A. Default Meditation Duration */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e]">
                Default Meditation Timer Duration
              </label>
              <span className="text-xs font-medium text-[#9c7886]">
                {settings.defaultMeditationDuration} Minutes
              </span>
            </div>
            <p className="text-xs text-[#614752]">
              Sets the starting timer duration when visiting the Meditation & Guided Breathing page.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {[1, 3, 5, 10].map((mins) => {
                const isSelected = settings.defaultMeditationDuration === mins
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => updateSetting('defaultMeditationDuration', mins)}
                    className={cn(
                      'px-4 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer backdrop-blur-sm',
                      isSelected
                        ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                        : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                    )}
                  >
                    <span>{mins} Minute{mins > 1 ? 's' : ''}</span>
                    {mins === 3 && (
                      <span className="text-[10px] ml-1.5 opacity-90 font-semibold">(Recommended)</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* B. Default Breathing Technique */}
          <div className="space-y-2.5 pt-4 border-t border-[#ffeef2]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e] block">
              Default Breathing Technique
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      'p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 backdrop-blur-sm',
                      isSelected
                        ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                        : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                    )}
                  >
                    <span className="font-semibold text-xs block">{item.title}</span>
                    <span
                      className={cn(
                        'text-[11px] block leading-tight',
                        isSelected ? 'text-white/90' : 'text-[#735562]'
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
          <div className="space-y-2.5 pt-4 border-t border-[#ffeef2]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e] block">
              Default Physical Wellness Filter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
                      'px-3.5 py-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer backdrop-blur-sm',
                      isSelected
                        ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                        : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                    )}
                  >
                    {cat.title}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl glass-panel-subtle text-xs text-[#735562] border border-[#fed5df]">
            Note: No background alarms or unsolicited notifications are scheduled.
          </div>
        </div>
      </section>

      {/* 6. Section: Privacy and Data */}
      <section className="glass-panel p-6 sm:p-7 space-y-4 border border-[#ffdce4]/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/80 flex items-center justify-center text-[#c0385c] shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2d1b24]">Privacy & Data Scope</h2>
            <p className="text-xs text-[#735562]">Local data storage and prototype architecture</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ffeef2] space-y-3.5 text-xs text-[#614752] leading-relaxed">
          <p>
            Cognivault AI is running as a client-side frontend prototype. Settings and exercise preferences are stored locally in your browser to maintain consistency while navigating between application pages.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1 border border-[#fed5df]">
              <span className="text-[#8a6874] block text-[11px] font-medium">Storage Mode</span>
              <span className="font-semibold text-[#2d1b24]">Local Browser Storage</span>
            </div>
            <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1 border border-[#fed5df]">
              <span className="text-[#8a6874] block text-[11px] font-medium">Server Synchronization</span>
              <span className="font-semibold text-[#2d1b24]">Connected (FastAPI + Atlas)</span>
            </div>
            <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1 border border-[#fed5df]">
              <span className="text-[#8a6874] block text-[11px] font-medium">Third-Party Telemetry</span>
              <span className="font-semibold text-[#2d1b24]">None (Zero Tracking)</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#ffeef2]">
            <span className="text-[11px] text-[#9c7886]">
              Clear all locally stored preferences and temporary session tokens.
            </span>

            {!showClearCacheConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearCacheConfirm(true)}
                className="btn-wellness-secondary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#dc2626] hover:text-[#991b1b] hover:border-[#fecaca] self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#dc2626]" />
                <span>Clear Session Cache</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleConfirmClearCache}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Yes, Clear Cache
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearCacheConfirm(false)}
                  className="btn-wellness-secondary px-3.5 py-2 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Section: Reset Settings */}
      <section className="glass-panel p-6 sm:p-7 space-y-4 border border-[#ffdce4]/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/80 flex items-center justify-center text-[#c0385c] shadow-2xs">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2d1b24]">Reset Settings</h2>
            <p className="text-xs text-[#735562]">Restore application settings to initial defaults</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ffeef2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5 max-w-md">
            <p className="text-xs text-[#614752] leading-relaxed">
              Reset appearance, accessibility, and session duration defaults. This action does not modify Profile data.
            </p>
          </div>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="btn-wellness-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#735562]" />
              <span>Reset to Defaults</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/90 backdrop-blur-md space-y-3 self-start sm:self-auto max-w-md shadow-sm">
              <div className="flex items-start gap-2 text-xs text-amber-900 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Reset all settings to initial defaults? Profile information will remain untouched.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-wellness-secondary px-3 py-1.5 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="btn-wellness-primary px-4 py-1.5 text-xs font-semibold cursor-pointer"
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
