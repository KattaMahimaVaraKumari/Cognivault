import React from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  Wind,
  HeartPulse,
  Clock,
  ArrowRight,
} from 'lucide-react'

export interface ActivityItem {
  id: string
  title: string
  category: 'assessment' | 'meditation' | 'physical_wellness'
  categoryLabel: string
  timestamp: string
  details: string
  isSample?: boolean
}

interface ActivityHistoryListProps {
  activities: ActivityItem[]
}

export const ActivityHistoryList: React.FC<ActivityHistoryListProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-2xl glass-panel p-8 sm:p-10 text-center shadow-sm space-y-4 border border-[#ffdce4]/90">
        <div className="w-12 h-12 rounded-2xl bg-[#fff0f4] border border-[#fcaec2] flex items-center justify-center text-[#c0385c] mx-auto shadow-2xs">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-sm sm:text-base font-bold text-[#2d1b24]">
            No activity logged in current session
          </h3>
          <p className="text-xs text-[#735562] leading-relaxed font-normal">
            Take an interactive stress evaluation, practice guided breathing, or complete desk stretches to log your progress.
          </p>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/prediction"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-wellness-secondary text-xs font-bold cursor-pointer"
          >
            <Brain className="w-4 h-4 text-[#e0567b]" />
            <span>Stress Assessment</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#9c7886]" />
          </Link>

          <Link
            to="/meditation"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-wellness-secondary text-xs font-bold cursor-pointer"
          >
            <Wind className="w-4 h-4 text-[#e0567b]" />
            <span>Breathing Timer</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#9c7886]" />
          </Link>

          <Link
            to="/physical-wellness"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-wellness-secondary text-xs font-bold cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 text-[#e0567b]" />
            <span>Physical Wellness</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#9c7886]" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl glass-panel shadow-sm divide-y divide-[#ffeef2] overflow-hidden border border-[#ffdce4]/90">
      {activities.map((item) => {
        const Icon =
          item.category === 'assessment'
            ? Brain
            : item.category === 'meditation'
              ? Wind
              : HeartPulse

        return (
          <div
            key={item.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fff5f8]/50 transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/80 flex items-center justify-center text-[#c0385c] shrink-0 shadow-2xs">
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#2d1b24]">{item.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffe4ec] text-[#8c1d3c] border border-[#fcaec2]/60">
                    {item.categoryLabel}
                  </span>
                  {item.isSample && (
                    <span className="text-[10px] font-medium text-[#9c7886] bg-white/80 px-2 py-0.5 rounded-full border border-[#fed5df]">
                      Sample
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#614752] leading-relaxed font-normal">{item.details}</p>
              </div>
            </div>

            <span className="text-xs font-semibold text-[#8a6a77] shrink-0 self-end sm:self-auto">
              {item.timestamp}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityHistoryList
