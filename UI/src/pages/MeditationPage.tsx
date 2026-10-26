import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Wind,
} from 'lucide-react'
import { MEDITATION_SESSIONS } from '@/data/meditation'
import { SessionTypeId } from '@/types/meditation'
import { CircleProgress } from '@/components/ui/circle-progress'
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
      if (detail) {
        if (typeof detail.reduceMotion === 'boolean') {
          setReduceMotion(detail.reduceMotion)
        }
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

  // Ref to hold accurate interval timer
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
        const secondsLeft = accumulated - timeInCycle
        return {
          name: phase.name,
          guidance: phase.guidance,
          action: phase.action,
          secondsLeftInPhase: secondsLeft,
          targetScale: phase.targetScale,
        }
      }
    }

    const lastPhase = activeSession.phases[activeSession.phases.length - 1]
    return {
      name: lastPhase.name,
      guidance: lastPhase.guidance,
      action: lastPhase.action,
      secondsLeftInPhase: 1,
      targetScale: lastPhase.targetScale,
    }
  }, [isRunning, elapsedSeconds, activeSession, cycleDuration])

  // Timer Interval Effect with timestamp-based drift correction
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
              if (timerRef.current) clearInterval(timerRef.current)
              setIsRunning(false)
              setIsCompleted(true)
              return totalSeconds
            }
            return next
          })
        }
      }, 250) // Check frequently to avoid drift
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      lastTickTimeRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, totalSeconds])

  // Handlers
  const handleStart = () => {
    setIsCompleted(false)
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleResume = () => {
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsCompleted(false)
    setElapsedSeconds(0)
  }

  const handleSessionChange = (id: SessionTypeId) => {
    if (isRunning) {
      handleReset()
    }
    setSelectedSessionId(id)
    setIsCompleted(false)
    setElapsedSeconds(0)
  }

  const handleDurationChange = (minutes: number) => {
    if (isRunning) {
      handleReset()
    }
    setDurationMinutes(minutes)
    setIsCompleted(false)
    setElapsedSeconds(0)
  }

  // Format Time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const progressPercentage = Math.min(100, (elapsedSeconds / totalSeconds) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-2">
          <Wind className="w-3.5 h-3.5" />
          <span>Restorative Breathing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
          Meditation & Guided Breathing
        </h1>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
          Paced breathwork cycles and gentle mindfulness intervals to reduce autonomic tension, quiet academic stress, and restore steady focus.
        </p>
      </div>

      {/* Session Selection & Duration Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MEDITATION_SESSIONS.map((session) => {
          const isSelected = session.id === selectedSessionId
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => handleSessionChange(session.id)}
              className={cn(
                'text-left p-4 rounded-xl border transition-all cursor-pointer',
                isSelected
                  ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">{session.title}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                )}
              </div>
              <p
                className={cn(
                  'text-xs leading-relaxed',
                  isSelected ? 'text-gray-300' : 'text-gray-500'
                )}
              >
                {session.subtitle}
              </p>
            </button>
          )
        })}
      </div>

      {/* Main Timer Display Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xs">
        {/* Duration selector pill */}
        <div className="mb-8 flex items-center justify-center gap-1.5 p-1 rounded-lg border border-gray-200 bg-gray-50">
          {[1, 3, 5].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleDurationChange(mins)}
              disabled={isRunning}
              className={cn(
                'px-3.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                durationMinutes === mins
                  ? 'bg-white text-gray-900 shadow-2xs border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900',
                isRunning && 'opacity-50 cursor-not-allowed'
              )}
            >
              {mins} {mins === 1 ? 'Minute' : 'Minutes'}
            </button>
          ))}
        </div>

        {/* Circular Progress Timer */}
        <div className="my-2">
          <CircleProgress
            progress={progressPercentage}
            size={290}
            strokeWidth={8}
            breathScale={isRunning && !reduceMotion ? currentPhaseInfo.targetScale : 1.0}
          >
            <div className="space-y-1">
              {/* Phase name */}
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isCompleted ? 'Finished' : currentPhaseInfo.name}
              </div>

              {/* MM:SS Countdown Timer */}
              <div className="text-4xl sm:text-5xl font-mono font-semibold tracking-tight text-gray-900">
                {formatTime(remainingSeconds)}
              </div>

              {/* Phase seconds remaining counter */}
              {isRunning && !isCompleted && (
                <div className="text-xs font-medium text-gray-400">
                  {currentPhaseInfo.secondsLeftInPhase}s in phase
                </div>
              )}
            </div>
          </CircleProgress>
        </div>

        {/* Current Guided Instruction */}
        <div className="mt-8 max-w-md mx-auto space-y-1 min-h-[56px] flex flex-col items-center justify-center">
          {isCompleted ? (
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Session Completed</span>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                {currentPhaseInfo.guidance}
              </p>
              {!isRunning && elapsedSeconds === 0 && (
                <p className="text-xs text-gray-400">Press Start when you are ready to begin.</p>
              )}
            </>
          )}
        </div>

        {/* Session Controls */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {!isRunning && elapsedSeconds === 0 && !isCompleted && (
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
              aria-label="Start breathing session"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Session</span>
            </button>
          )}

          {isRunning && (
            <button
              type="button"
              onClick={handlePause}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
              aria-label="Pause breathing session"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {!isRunning && elapsedSeconds > 0 && !isCompleted && (
            <button
              type="button"
              onClick={handleResume}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
              aria-label="Resume breathing session"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume</span>
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
              aria-label="Start a new session"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Session</span>
            </button>
          )}

          {elapsedSeconds > 0 && !isCompleted && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
              aria-label="Reset session"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Gentle Non-Clinical Disclaimer Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4.5 flex items-start gap-3 text-xs text-gray-500 leading-relaxed">
        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p>
          <strong className="font-medium text-gray-700">Gentle Practice Guidance:</strong>{' '}
          Cognivault AI breathing exercises are designed for general relaxation and academic stress reduction. They do not constitute medical treatment. Never force or strain your breath—breathe at whatever pace feels comfortable and natural for you.
        </p>
      </div>
    </div>
  )
}

export default MeditationPage
