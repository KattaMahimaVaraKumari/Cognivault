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
    <div className="rounded-2xl glass-card-interactive p-5 sm:p-6 space-y-3.5 border border-[#ffdce4]/90 relative overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#735562]">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/70 flex items-center justify-center text-[#c0385c] shrink-0 shadow-2xs">
          <Icon className="w-4.5 h-4.5 stroke-[1.8]" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-2xl sm:text-3xl font-extrabold tracking-tight',
              isEmpty ? 'text-[#a18892] font-medium text-xl sm:text-2xl' : 'text-[#2d1b24]'
            )}
          >
            {value}
          </span>
        </div>
        <p className="text-xs text-[#735562] leading-relaxed font-normal">{subtitle}</p>
      </div>

      <div className="pt-2.5 border-t border-[#ffeef2] flex items-center justify-between text-[11px] text-[#9c7886] font-semibold">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isEmpty ? 'bg-slate-300' : 'bg-[#e0567b]'
            )}
          />
          <span className="text-[#614752] font-medium">{badgeText}</span>
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-[#a32849]/70">Synced</span>
      </div>
    </div>
  )
}

export default SummaryCard
