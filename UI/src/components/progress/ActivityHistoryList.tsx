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
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-2xs space-y-4">
        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
          <Clock className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-900">
            No activities recorded in current session
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your activity history will appear here once you take a stress assessment, practice guided breathing, or complete desk stretching routines.
          </p>
        </div>

        {/* Feature Navigation Links */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            to="/prediction"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-gray-600" />
            <span>Stress Assessment</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Link>

          <Link
            to="/meditation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Wind className="w-3.5 h-3.5 text-gray-600" />
            <span>Meditation Timer</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Link>

          <Link
            to="/physical-wellness"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors shadow-2xs cursor-pointer"
          >
            <HeartPulse className="w-3.5 h-3.5 text-gray-600" />
            <span>Physical Wellness</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-2xs divide-y divide-gray-100 overflow-hidden">
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
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                  <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.categoryLabel}
                  </span>
                  {item.isSample && (
                    <span className="text-[10px] font-medium text-gray-400 border border-dashed border-gray-300 px-1.5 py-0.2 rounded-sm">
                      Illustrative Demo
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{item.details}</p>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end justify-between text-xs text-gray-400 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{item.timestamp}</span>
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                {item.isSample ? 'Demo Log' : 'Current Session'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityHistoryList
