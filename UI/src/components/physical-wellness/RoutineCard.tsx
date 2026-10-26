import React from 'react'
import { Check, Clock, AlertCircle, Sparkles } from 'lucide-react'
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
        'rounded-xl border bg-white p-5 sm:p-6 flex flex-col justify-between transition-all shadow-xs',
        isCompleted
          ? 'border-gray-300 bg-gray-50/40'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="space-y-4">
        {/* Header: Title, Category & Duration */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
              {routine.categoryLabel}
            </span>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{routine.duration}</span>
              </span>
              <span>•</span>
              <span className="text-gray-700">{routine.difficulty}</span>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
            {routine.name}
          </h2>

          {/* Target body areas */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {routine.targetAreas.map((area) => (
              <span
                key={area}
                className="text-[11px] px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Instructions
          </h3>
          <ol className="space-y-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed list-decimal list-outside pl-4">
            {routine.instructions.map((step, idx) => (
              <li key={idx} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Safety Reminder */}
        {routine.safetyReminder && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg border border-gray-100 bg-gray-50/70 text-xs text-gray-600">
            <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{routine.safetyReminder}</p>
          </div>
        )}
      </div>

      {/* Completion Action */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        {isCompleted ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Completed this session</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Ready to practice</span>
        )}

        <button
          type="button"
          onClick={() => onToggleComplete(routine.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
            isCompleted
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          )}
          aria-label={
            isCompleted
              ? `Mark ${routine.name} as incomplete`
              : `Mark ${routine.name} as completed`
          }
        >
          <Check className={cn('w-3.5 h-3.5', isCompleted ? 'stroke-[2.5]' : 'text-gray-400')} />
          <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
        </button>
      </div>
    </article>
  )
}

export default RoutineCard
