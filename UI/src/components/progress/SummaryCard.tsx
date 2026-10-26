import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  badgeText?: string
  isEmpty?: boolean
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText = 'Active Session',
  isEmpty = false,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs space-y-3 transition-all hover:border-gray-300">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-2xl sm:text-3xl font-bold tracking-tight',
              isEmpty ? 'text-gray-400 font-medium text-xl sm:text-2xl' : 'text-gray-900'
            )}
          >
            {value}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{subtitle}</p>
      </div>

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isEmpty ? 'bg-gray-300' : 'bg-gray-700'
            )}
          />
          <span>{badgeText}</span>
        </span>
        <span className="text-[10px] uppercase font-mono">In-Memory</span>
      </div>
    </div>
  )
}

export default SummaryCard
