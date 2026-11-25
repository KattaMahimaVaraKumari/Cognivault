import React from 'react'
import { Clock, AlertCircle, Sparkles } from 'lucide-react'
import { Routine } from '@/types/wellness'
import { cn } from '@/lib/utils'

interface RoutineCardProps {
  routine: Routine
  isCompleted: boolean
  onToggleComplete: (id: string) => void
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  isCompleted,
  onToggleComplete,
}) => {
  return (
    <article
      className={cn(
        'rounded-2xl glass-card-interactive p-6 flex flex-col justify-between transition-all relative overflow-hidden border',
        isCompleted
          ? 'border-[#86efac] bg-[#f0fdf4]/50'
          : 'border-[#ffdce4]/90'
      )}
    >
      <div className="space-y-4">
        {/* Header: Title, Category & Duration */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#fff0f4] text-[#8c1d3c] border border-[#fcaec2]/70 shadow-2xs">
              {routine.categoryLabel}
            </span>

            <div className="flex items-center gap-2 text-xs text-[#735562] font-semibold">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#e0567b]" />
                <span>{routine.duration}</span>
              </span>
              <span>•</span>
              <span className="text-[#a32849]">{routine.difficulty}</span>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#2d1b24] leading-snug">
            {routine.name}
          </h2>

          {/* Target body areas */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {routine.targetAreas.map((area) => (
              <span
                key={area}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/90 border border-[#fed5df] text-[#553b46] font-medium shadow-2xs"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 pt-3 border-t border-[#ffeef2]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#735562]">
            Guided Steps
          </h3>
          <ol className="space-y-1.5 text-xs sm:text-sm text-[#4b353f] leading-relaxed list-decimal list-outside pl-4 font-normal">
            {routine.instructions.map((step, idx) => (
              <li key={idx} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Safety Reminder */}
        {routine.safetyReminder && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-[#fed5df] bg-white/70 text-xs text-[#614752] shadow-2xs">
            <AlertCircle className="w-4 h-4 text-[#e0567b] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-normal">{routine.safetyReminder}</p>
          </div>
        )}
      </div>

      {/* Completion Action Button */}
      <div className="mt-6 pt-4 border-t border-[#ffeef2] flex items-center justify-between gap-3">
        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534]">
            <Sparkles className="w-4 h-4 text-[#16a34a]" />
            <span>Completed</span>
          </span>
        ) : (
          <span className="text-xs font-medium text-[#9c7886]">Ready to practice</span>
        )}

        <button
          type="button"
          onClick={() => onToggleComplete(routine.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer',
            isCompleted
              ? 'btn-wellness-secondary text-[#166534] border-[#86efac]'
              : 'btn-wellness-primary'
          )}
        >
          <span>{isCompleted ? 'Mark Incomplete' : 'Complete Routine'}</span>
        </button>
      </div>
    </article>
  )
}

export default RoutineCard
