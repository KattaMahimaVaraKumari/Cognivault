import React, { useState, useMemo } from 'react'
import {
  HeartPulse,
  Info,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import { WELLNESS_ROUTINES } from '@/data/wellness'
import { RoutineCategory } from '@/types/wellness'
import { RoutineCard } from '@/components/physical-wellness/RoutineCard'
import { loadSettings } from '@/utils/settings'
import { cn } from '@/lib/utils'

const CATEGORY_TABS: { id: RoutineCategory; label: string; count: number }[] = [
  { id: 'all', label: 'All Routines', count: WELLNESS_ROUTINES.length },
  {
    id: 'desk_stretches',
    label: 'Desk Stretches',
    count: WELLNESS_ROUTINES.filter((r) => r.category === 'desk_stretches').length,
  },
  {
    id: 'gentle_yoga',
    label: 'Gentle Yoga',
    count: WELLNESS_ROUTINES.filter((r) => r.category === 'gentle_yoga').length,
  },
  {
    id: 'movement_breaks',
    label: 'Movement Breaks',
    count: WELLNESS_ROUTINES.filter((r) => r.category === 'movement_breaks').length,
  },
]

export const PhysicalWellnessPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<RoutineCategory>(() => {
    const s = loadSettings()
    return s.defaultWellnessCategory || 'all'
  })
  const [completedIds, setCompletedIds] = useState<string[]>([])

  // Toggle routine completion in session state
  const handleToggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleResetSession = () => {
    setCompletedIds([])
  }

  // Filter routines by active category
  const filteredRoutines = useMemo(() => {
    if (selectedCategory === 'all') return WELLNESS_ROUTINES
    return WELLNESS_ROUTINES.filter((r) => r.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Page Header & Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Somatic Health & Posture</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
          Physical Wellness
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
          Gentle movement, desk stretches, and posture resets designed to complement long study sessions. Taking brief somatic pauses helps relieve neck tension, support spinal circulation, and counteract fatigue from prolonged sitting.
        </p>
      </div>

      {/* 2. Safety Guidelines Banner */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5 shadow-2xs">
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
            Safety Guidance for Practice
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Move gently and mindfully. Never force or bounce into a stretch. If you experience dizziness, joint pinching, or acute pain, stop immediately and return to a neutral resting position. These exercises are gentle self-care habits and do not diagnose, prevent, or treat any medical condition.
          </p>
        </div>
      </div>

      {/* 3. Session Progress & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="tablist">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer shrink-0',
                  isSelected
                    ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                    isSelected ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Current Session Tracker */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-gray-500">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 font-medium text-gray-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-800" />
            <span>
              {completedIds.length} of {WELLNESS_ROUTINES.length} completed
            </span>
          </div>

          {completedIds.length > 0 && (
            <button
              type="button"
              onClick={handleResetSession}
              className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors cursor-pointer"
              title="Reset break progress"
              aria-label="Reset completed routines for this session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Routines Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoutines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            isCompleted={completedIds.includes(routine.id)}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      {/* 5. Non-Clinical Informational Disclaimer */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-start gap-3 text-xs text-gray-500 leading-relaxed">
        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p>
          <strong className="font-medium text-gray-700">Educational Note:</strong> Movement break suggestions are intended for healthy study ergonomics and daily lifestyle awareness. Routine completion is tracked during your current browser session only and is not stored on a remote server.
        </p>
      </div>
    </div>
  )
}

export default PhysicalWellnessPage
