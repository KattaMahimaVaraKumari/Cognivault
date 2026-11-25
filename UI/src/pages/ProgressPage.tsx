import React, { useState } from 'react'
import {
  TrendingUp,
  Brain,
  Wind,
  HeartPulse,
  Sparkles,
} from 'lucide-react'
import { AreaChart, ChartDataPoint } from '@/components/progress/AreaChart'
import { SummaryCard } from '@/components/progress/SummaryCard'
import {
  ActivityHistoryList,
  ActivityItem,
} from '@/components/progress/ActivityHistoryList'
import { cn } from '@/lib/utils'

const ILLUSTRATIVE_WEEKLY_TREND: ChartDataPoint[] = [
  { date: 'Mon', series1: 6, series2: 3, label: 'Mon, Oct 20' },
  { date: 'Tue', series1: 12, series2: 4, label: 'Tue, Oct 21' },
  { date: 'Wed', series1: 8, series2: 2, label: 'Wed, Oct 22' },
  { date: 'Thu', series1: 15, series2: 5, label: 'Thu, Oct 23' },
  { date: 'Fri', series1: 10, series2: 4, label: 'Fri, Oct 24' },
  { date: 'Sat', series1: 18, series2: 6, label: 'Sat, Oct 25' },
  { date: 'Sun', series1: 14, series2: 4, label: 'Sun, Oct 26' },
]

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
    title: '9-Factor Stress Evaluation',
    category: 'assessment',
    categoryLabel: 'Stress Prediction',
    timestamp: 'Yesterday, 04:20 PM',
    details: 'Completed ML questionnaire check-in across workload, sleep, and fatigue factors.',
    isSample: true,
  },
]

export const ProgressPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'session' | 'sample'>('sample')

  const sessionActivities: ActivityItem[] = []
  const activeActivities =
    viewMode === 'sample' ? ILLUSTRATIVE_SAMPLE_ACTIVITIES : sessionActivities
  const activeChartData =
    viewMode === 'sample' ? ILLUSTRATIVE_WEEKLY_TREND : []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-bold uppercase tracking-wider text-[#8c1d3c] shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-[#e0567b]" />
            <span>Analytics & Consistency</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#2d1b24]">
            My Progress & Activity
          </h1>

          <p className="text-sm sm:text-base text-[#614752] max-w-3xl leading-relaxed font-normal">
            Monitor study break frequency, mindful breathing minutes, and wellness routine consistency over time to foster sustainable academic energy.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl glass-panel border border-[#ffdce4]/90 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('session')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              viewMode === 'session'
                ? "bg-[#e0567b] text-white shadow-xs"
                : "text-[#6e535e] hover:text-[#2d1b24]"
            )}
          >
            Live Session
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sample')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              viewMode === 'sample'
                ? "bg-[#e0567b] text-white shadow-xs"
                : "text-[#6e535e] hover:text-[#2d1b24]"
            )}
          >
            Sample Trend
          </button>
        </div>
      </div>

      {/* 2. Summary Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <SummaryCard
          title="Mindful Minutes"
          value={viewMode === 'sample' ? '18 min' : '0 min'}
          subtitle="Guided breathing duration"
          icon={Wind}
          badgeText={viewMode === 'sample' ? 'Weekly Record' : 'Current Session'}
          isEmpty={viewMode === 'session'}
        />

        <SummaryCard
          title="Desk Stretches"
          value={viewMode === 'sample' ? '6 breaks' : '0 breaks'}
          subtitle="Somatic posture exercises"
          icon={HeartPulse}
          badgeText={viewMode === 'sample' ? 'Weekly Record' : 'Current Session'}
          isEmpty={viewMode === 'session'}
        />

        <SummaryCard
          title="Stress Screenings"
          value={viewMode === 'sample' ? '2 runs' : '0 runs'}
          subtitle="Completed ML evaluations"
          icon={Brain}
          badgeText={viewMode === 'sample' ? 'Weekly Record' : 'Current Session'}
          isEmpty={viewMode === 'session'}
        />

        <SummaryCard
          title="Consistency Score"
          value={viewMode === 'sample' ? '92%' : 'Pending'}
          subtitle="Habit cadence index"
          icon={Sparkles}
          badgeText={viewMode === 'sample' ? 'Top Tier' : 'Needs Assessment'}
          isEmpty={viewMode === 'session'}
        />
      </section>

      {/* 3. Visual Trend Chart Glass Panel */}
      <section className="rounded-2xl glass-panel p-6 sm:p-8 shadow-lg border border-[#ffdce4]/90 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#2d1b24]">
              Weekly Activity Cadence
            </h2>
            <p className="text-xs text-[#735562] font-normal">
              Break minutes (baby pink) vs somatic stretches completed (rose)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#a32849]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f0507e]" />
              Mindful Minutes
            </span>
            <span className="flex items-center gap-1.5 text-[#be4162]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fcaec2]" />
              Movement Breaks
            </span>
          </div>
        </div>

        <AreaChart
          data={activeChartData}
          series1Name="Mindful Minutes"
          series2Name="Breaks Completed"
          series1Unit="min"
          series2Unit="breaks"
          height={260}
        />
      </section>

      {/* 4. Activity Log */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#2d1b24]">Recorded Activity Timeline</h2>
          <p className="text-xs text-[#735562]">History of your restorative sessions</p>
        </div>

        <ActivityHistoryList activities={activeActivities} />
      </section>
    </div>
  )
}

export default ProgressPage
