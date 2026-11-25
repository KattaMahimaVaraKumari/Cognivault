import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Wind,
} from 'lucide-react'
import { MEDITATION_SESSIONS } from '@/data/meditation'
import { SessionTypeId } from '@/types/meditation'
import { loadSettings } from '@/utils/settings'
import { AppSettings } from '@/types/settings'
import { cn } from '@/lib/utils'

export const MeditationPage: React.FC = () => {
  // Session Configuration State initialized with user settings defaults
  const [selectedSessionId, setSelectedSessionId] = useState<SessionTypeId>(() => {
    const s = loadSettings()
    return (s.defaultBreathingType as SessionTypeId) || 'calm_breathing'
  })
  const [durationMinutes, setDurationMinutes] = useState<number>(() => {
    const s = loadSettings()
    return s.defaultMeditationDuration || 3
  })
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => loadSettings().reduceMotion)

  // Listen for live setting changes
  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const detail = (e as CustomEvent<AppSettings>).detail
      if (detail && typeof detail.reduceMotion === 'boolean') {
        setReduceMotion(detail.reduceMotion)
      }
    }
    window.addEventListener('cognivault-settings-changed', handleSettingsChange)
    return () => {
      window.removeEventListener('cognivault-settings-changed', handleSettingsChange)
    }
  }, [])

  // Timer Run State
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // Interval timer
  const timerRef = useRef<number | null>(null)
  const lastTickTimeRef = useRef<number | null>(null)

  const activeSession = useMemo(() => {
    return (
      MEDITATION_SESSIONS.find((s) => s.id === selectedSessionId) ||
      MEDITATION_SESSIONS[0]
    )
  }, [selectedSessionId])

  const totalSeconds = durationMinutes * 60
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

  // Calculate breathing phase cycle
  const cycleDuration = useMemo(() => {
    return activeSession.phases.reduce((acc, p) => acc + p.durationSec, 0)
  }, [activeSession])

  const currentPhaseInfo = useMemo(() => {
    if (!isRunning && elapsedSeconds === 0) {
      return {
        name: 'Ready',
        guidance: activeSession.preparationPrompt,
        action: 'pause' as const,
        secondsLeftInPhase: 0,
        targetScale: 1.0,
      }
    }

    const timeInCycle = elapsedSeconds % cycleDuration
    let accumulated = 0

    for (const phase of activeSession.phases) {
      accumulated += phase.durationSec
      if (timeInCycle < accumulated) {
        const secondsLeftInPhase = accumulated - timeInCycle
        return {
          name: phase.name,
          guidance: phase.guidance,
          action: phase.action,
          secondsLeftInPhase,
          targetScale: phase.targetScale,
        }
      }
    }

    return {
      name: activeSession.phases[0].name,
      guidance: activeSession.phases[0].guidance,
      action: activeSession.phases[0].action,
      secondsLeftInPhase: activeSession.phases[0].durationSec,
      targetScale: 1.0,
    }
  }, [activeSession, cycleDuration, elapsedSeconds, isRunning])

  // Timer Interval Effect
  useEffect(() => {
    if (isRunning) {
      lastTickTimeRef.current = Date.now()
      timerRef.current = window.setInterval(() => {
        const now = Date.now()
        const delta = Math.floor((now - (lastTickTimeRef.current || now)) / 1000)
        if (delta >= 1) {
          lastTickTimeRef.current = now
          setElapsedSeconds((prev) => {
            const next = prev + delta
            if (next >= totalSeconds) {
              setIsRunning(false)
              setIsCompleted(true)
              return totalSeconds
            }
            return next
          })
        }
      }, 250)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, totalSeconds])

  const handleStartPause = () => {
    if (isCompleted) {
      setElapsedSeconds(0)
      setIsCompleted(false)
      setIsRunning(true)
    } else {
      setIsRunning((prev) => !prev)
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
    setIsCompleted(false)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const overallProgress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 1. Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-bold uppercase tracking-wider text-[#8c1d3c] shadow-2xs">
          <Wind className="w-3.5 h-3.5 text-[#e0567b]" />
          <span>Mindfulness & Focus</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#2d1b24]">
          Meditation & Breathing
        </h1>

        <p className="text-sm sm:text-base text-[#614752] max-w-3xl leading-relaxed font-normal">
          Restore cognitive calm and down-regulate physiological strain. Guided cadence timers help reduce exam anxiety and clear mental fog during intense study days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Circular Breathing Display */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl glass-panel p-8 sm:p-12 shadow-lg border border-[#ffdce4]/90 relative overflow-hidden text-center">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#fcaec2]/30 blur-3xl pointer-events-none" />

          {/* Current Phase Indicator */}
          <div className="mb-6 space-y-1 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8c1d3c] bg-[#fff0f4] px-3 py-1 rounded-full border border-[#fcaec2]">
              {currentPhaseInfo.name}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#2d1b24] mt-2">
              {currentPhaseInfo.guidance}
            </h2>
          </div>

          {/* SVG Animated Breathing Circle */}
          <div className="relative flex items-center justify-center my-4">
            <div
              className={cn(
                "w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-[#ffd2dd] bg-gradient-to-tr from-[#ffe4ec]/60 via-[#fff0f5]/40 to-[#fff8fa]/30 shadow-xl flex items-center justify-center transition-transform duration-1000 ease-in-out",
                !reduceMotion && isRunning && (
                  currentPhaseInfo.action === 'inhale'
                    ? "scale-110"
                    : currentPhaseInfo.action === 'exhale'
                    ? "scale-90"
                    : "scale-100"
                )
              )}
            >
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full glass-panel flex flex-col items-center justify-center p-4 border border-[#ffdce4] shadow-md bg-white/90">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2d1b24] font-mono">
                  {formatTime(remainingSeconds)}
                </span>
                <span className="text-xs font-semibold text-[#9c7886] mt-1 uppercase tracking-wider">
                  {isRunning ? `${currentPhaseInfo.secondsLeftInPhase}s in phase` : 'Paused'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Timer Controls */}
          <div className="w-full max-w-sm mt-6 space-y-4 relative z-10">
            <div className="h-2 w-full rounded-full bg-[#ffe9ee] overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#f87d9f] to-[#e0567b] transition-all duration-300 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStartPause}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl btn-wellness-primary cursor-pointer shadow-md"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{elapsedSeconds > 0 ? 'Resume' : 'Start Breathing'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl btn-wellness-secondary cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Routine Configuration Options */}
        <div className="lg:col-span-5 space-y-6">
          {/* Select Technique */}
          <div className="rounded-2xl glass-panel p-6 shadow-sm border border-[#ffdce4]/90 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3b121e]">
              Select Breathing Protocol
            </h2>

            <div className="space-y-2.5">
              {MEDITATION_SESSIONS.map((sess) => {
                const isSelected = sess.id === selectedSessionId
                return (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => {
                      setSelectedSessionId(sess.id as SessionTypeId)
                      handleReset()
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#fff0f4] border-[#f48ea8] shadow-sm ring-1 ring-[#fcaec2]/50 translate-y-[-1px]"
                        : "bg-white/60 border-[#fed5df]/80 hover:bg-[#fff5f8] text-[#553b46]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#2d1b24]">{sess.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffe4ec] text-[#8c1d3c]">
                        {sess.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-[#735562] mt-1 leading-relaxed">
                      {sess.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Select Duration */}
          <div className="rounded-2xl glass-panel p-6 shadow-sm border border-[#ffdce4]/90 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3b121e]">
              Session Duration
            </h2>
            <div className="flex items-center gap-2">
              {[1, 3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setDurationMinutes(mins)
                    handleReset()
                  }}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    durationMinutes === mins
                      ? "bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white border-transparent shadow-xs"
                      : "bg-white/80 border-[#fed5df] text-[#553b46] hover:bg-[#fff0f4]"
                  )}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeditationPage
