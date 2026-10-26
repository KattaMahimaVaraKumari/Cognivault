import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Brain,
  Wind,
  HeartPulse,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import { AreaChart, ChartDataPoint } from '@/components/progress/AreaChart'
import { SummaryCard } from '@/components/progress/SummaryCard'
import {
  ActivityHistoryList,
  ActivityItem,
} from '@/components/progress/ActivityHistoryList'
import { cn } from '@/lib/utils'

// Explicitly labeled 7-day illustrative sample trend (no fabricated personal risk scores)
const ILLUSTRATIVE_WEEKLY_TREND: ChartDataPoint[] = [
  { date: 'Mon', series1: 6, series2: 3, label: 'Mon, Oct 20' },
  { date: 'Tue', series1: 12, series2: 4, label: 'Tue, Oct 21' },
  { date: 'Wed', series1: 8, series2: 2, label: 'Wed, Oct 22' },
  { date: 'Thu', series1: 15, series2: 5, label: 'Thu, Oct 23' },
  { date: 'Fri', series1: 10, series2: 4, label: 'Fri, Oct 24' },
  { date: 'Sat', series1: 18, series2: 6, label: 'Sat, Oct 25' },
  { date: 'Sun', series1: 14, series2: 4, label: 'Sun, Oct 26' },
]

// Sample illustrative activity history items for demo mode
const ILLUSTRATIVE_SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'sample-act-1',
    title: 'Calm Breathing Session',
    category: 'meditation',
    categoryLabel: 'Meditation & Breathing',
    timestamp: 'Today, 10:15 AM',
    details: 'Completed 3-minute Box Breathing (4-4-4-4) cycle for cognitive refocusing.',
    isSample: true,
  },
  {
    id: 'sample-act-2',
    title: 'Desk Stretches: Shoulder & Wrist Reset',
    category: 'physical_wellness',
    categoryLabel: 'Physical Wellness',
    timestamp: 'Today, 02:40 PM',
    details: 'Completed Shoulder Rolls and Wrist & Forearm Stretches after typing sprint.',
    isSample: true,
  },
  {
    id: 'sample-act-3',
    title: '10-Factor Stress Evaluation',
    category: 'assessment',
    categoryLabel: 'Stress Prediction',
    timestamp: 'Yesterday, 04:20 PM',
    details: 'Completed questionnaire check-in across workload, sleep, and fatigue factors.',
    isSample: true,
  },
]

export const ProgressPage: React.FC = () => {
  // Toggle between actual session data and illustrative sample trend
  const [viewMode, setViewMode] = useState<'session' | 'sample'>('session')

  // In-memory session state (real data from current browser session)
  // Currently, the application holds questionnaire and wellness state in React memory
  const sessionActivities: ActivityItem[] = []

  const activeActivities =
    viewMode === 'sample' ? ILLUSTRATIVE_SAMPLE_ACTIVITIES : sessionActivities

  const activeChartData =
    viewMode === 'sample' ? ILLUSTRATIVE_WEEKLY_TREND : []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Page Header & Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Analytics & Consistency</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
          My Progress
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
          Monitor your study breaks, mindful breathing minutes, and wellness routine consistency over time. Build sustainable habits that reduce strain and support long-term academic resilience.
        </p>
      </div>

      {/* 2. Progress Overview Summary Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Current Status Overview
          </h2>
          <span className="text-xs text-gray-400">Current Session Scope</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Completed Routines"
            value={viewMode === 'sample' ? '6 breaks' : '0 routines'}
            subtitle={
              viewMode === 'sample'
                ? 'Desk stretches & movement breaks'
                : 'No routines completed in this session'
            }
            icon={HeartPulse}
            badgeText={viewMode === 'sample' ? 'Sample Demo' : 'Session State'}
            isEmpty={viewMode === 'session'}
          />

          <SummaryCard
            title="Questionnaire Status"
            value={viewMode === 'sample' ? '1 check-in' : 'Pending'}
            subtitle={
              viewMode === 'sample'
                ? '10 strain dimensions reviewed'
                : 'Assessment has not been submitted yet'
            }
            icon={Brain}
            badgeText={viewMode === 'sample' ? 'Sample Demo' : 'Session State'}
            isEmpty={viewMode === 'session'}
          />

          <SummaryCard
            title="Most Recent Activity"
            value={viewMode === 'sample' ? 'Calm Breathing' : 'None logged'}
            subtitle={
              viewMode === 'sample'
                ? '3 mins box breathing completed'
                : 'No recorded activity in current session'
            }
            icon={Clock}
            badgeText={viewMode === 'sample' ? 'Sample Demo' : 'Session State'}
            isEmpty={viewMode === 'session'}
          />
        </div>
      </section>

      {/* 3. Progress Chart Section */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Wellness Consistency Trend</h2>
              {viewMode === 'sample' && (
                <span className="text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                  Sample Data (Illustrative)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Track mindful breathing duration and completed movement breaks over consecutive days.
            </p>
          </div>

          {/* Toggle: Current Session vs. Sample Data Preview */}
          <div className="flex items-center p-1 rounded-lg border border-gray-200 bg-gray-50 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('session')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer',
                viewMode === 'session'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              Current Session
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sample')}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer',
                viewMode === 'sample'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              Illustrative Sample
            </button>
          </div>
        </div>

        {/* Chart Render or Session Empty State */}
        {viewMode === 'session' && activeChartData.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-gray-100 bg-gray-50/50 space-y-4">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 mx-auto shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-sm font-semibold text-gray-900">
                No recorded progress in this session
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                As you complete breathing timers and physical wellness routines, your daily progress curve will plot here automatically.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('sample')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                <span>View Sample 7-Day Trend</span>
              </button>

              <Link
                to="/meditation"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Start Breathing Session</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AreaChart
              data={activeChartData}
              series1Name="Mindful Minutes"
              series2Name="Movement Pauses"
              series1Unit="mins"
              series2Unit="breaks"
              height={260}
            />
            <p className="text-[11px] text-gray-400 leading-normal">
              Notice: The chart illustrates multi-day habit trends. In the current prototype, activities are kept in browser memory and do not represent personal clinical records.
            </p>
          </div>
        )}
      </section>

      {/* 4. Activity History Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Recent Activity History
          </h2>
          <span className="text-xs text-gray-400">
            {viewMode === 'sample' ? 'Showing Illustrative Log' : 'Active Session'}
          </span>
        </div>

        <ActivityHistoryList activities={activeActivities} />
      </section>

      {/* 5. Data Architecture & Persistence Disclosure Banner */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-gray-900">
            Data Architecture & Storage Scope
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Cognivault AI is currently operating as a client-side frontend prototype. All active questionnaire responses, meditation timer counts, and physical wellness checkboxes are retained within the active browser session. No personal health records, scores, or measurements are saved permanently to a remote server or persistent database. Cross-device cloud sync and user accounts will be introduced in future platform updates.
          </p>
        </div>
      </section>
    </div>
  )
}

export default ProgressPage
