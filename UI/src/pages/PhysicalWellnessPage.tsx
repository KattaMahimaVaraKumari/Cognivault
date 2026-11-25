import React, { useState, useMemo } from 'react'
import {
  HeartPulse,
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

  const handleToggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleResetSession = () => {
    setCompletedIds([])
  }

  const filteredRoutines = useMemo(() => {
    if (selectedCategory === 'all') return WELLNESS_ROUTINES
    return WELLNESS_ROUTINES.filter((r) => r.category === selectedCategory)
  }, [selectedCategory])

  const completionPct = Math.round((completedIds.length / WELLNESS_ROUTINES.length) * 100)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-bold uppercase tracking-wider text-[#8c1d3c] shadow-2xs">
          <HeartPulse className="w-3.5 h-3.5 text-[#e0567b]" />
          <span>Somatic Health & Ergonomics</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#2d1b24]">
          Physical Wellness & Stretches
        </h1>

        <p className="text-sm sm:text-base text-[#614752] max-w-3xl leading-relaxed font-normal">
          Counteract stiffness and postural fatigue from prolonged laptop and study sessions. Taking brief somatic pauses stimulates circulation and resets muscle tension.
        </p>
      </div>

      {/* 2. Safety Guidelines Banner */}
      <div className="rounded-2xl glass-panel p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4 shadow-sm border border-[#ffdce4]/90">
        <div className="p-2.5 rounded-xl bg-[#fff0f4] border border-[#fcaec2] text-[#c0385c] shrink-0 shadow-2xs">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#2d1b24]">
            Gentle Self-Care Practice Guidance
          </h2>
          <p className="text-xs sm:text-sm text-[#614752] leading-relaxed font-normal">
            Move gently and mindfully. Never force or bounce into a posture. If you experience dizziness or joint discomfort, stop immediately and rest.
          </p>
        </div>
      </div>

      {/* 3. Session Progress & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" role="tablist">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                  isSelected
                    ? 'btn-wellness-primary shadow-sm'
                    : 'glass-panel text-[#6e535e] hover:text-[#2d1b24] hover:bg-white/95 border border-[#ffdce4]'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-bold',
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-[#ffeef2] text-[#8c1d3c]'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Completion Indicator */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-xs font-semibold text-[#614752]">
            Completed: <span className="text-[#a32849] font-bold">{completedIds.length}</span> of {WELLNESS_ROUTINES.length}
            <span className="text-[#9c7886] font-normal ml-1">({completionPct}%)</span>
          </div>

          {completedIds.length > 0 && (
            <button
              type="button"
              onClick={handleResetSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg btn-wellness-secondary cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            isCompleted={completedIds.includes(routine.id)}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>
    </div>
  )
}

export default PhysicalWellnessPage
