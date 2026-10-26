import React from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  Wind,
  HeartPulse,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react'

export const OverviewPage: React.FC = () => {
  const quickActions = [
    {
      title: 'Stress Prediction',
      href: '/prediction',
      icon: Brain,
      description: 'Evaluate multi-factor strain and study workload pressure.',
    },
    {
      title: 'Meditation & Breathing',
      href: '/meditation',
      icon: Wind,
      description: 'Reset your focus with guided breathing and calming intervals.',
    },
    {
      title: 'Physical Wellness',
      href: '/physical-wellness',
      icon: HeartPulse,
      description: 'Desk stretches and ergonomic pauses to reduce somatic tension.',
    },
    {
      title: 'Wellness Assistant',
      href: '/assistant',
      icon: MessageSquare,
      description: 'Reflective dialogue for everyday stress management strategies.',
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl">
      {/* 1. Welcome Section */}
      <section className="border border-gray-200 rounded-lg p-6 sm:p-8 bg-white">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Habit & Well-being Companion</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Welcome to Cognivault AI
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Cognivault AI helps you recognize early indicators of burnout and explore healthier, more sustainable study and wellness habits. Take guided self-assessments, discover restorative micro-breaks, and reflect on your daily balance.
          </p>

          <p className="text-xs text-gray-500 leading-normal">
            Note: Cognivault AI is an educational and supportive wellness tool, not a clinical diagnostic instrument or medical service.
          </p>

          <div className="pt-2">
            <Link
              to="/prediction"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <span>Start Stress Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Burnout-Risk Overview (Placeholder Card) */}
      <section className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Burnout Risk Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Screening status and workload indicator baseline
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs text-gray-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Status: Assessment Pending
          </span>
        </div>

        <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <p className="text-sm text-gray-700 font-medium">
              No recent stress screening on record
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Complete the interactive evaluation to analyze key strain dimensions across study demands, sleep balance, and mental fatigue. The predictive machine learning pipeline will be connected in an upcoming module.
            </p>
          </div>

          <Link
            to="/prediction"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-colors shrink-0"
          >
            <span>Visit Stress Prediction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. Quick Actions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
          <span className="text-xs text-gray-500">Core wellness practices</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                to={action.href}
                className="group flex flex-col justify-between p-5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 transition-colors"
              >
                <div>
                  <div className="w-9 h-9 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-700 group-hover:text-gray-900 transition-colors">
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-gray-900 group-hover:text-gray-900">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-medium text-gray-600 group-hover:text-gray-900">
                  <span>Open practice</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 4. Progress Preview & 5. Wellness Tip Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Preview (takes 2 cols on lg) */}
        <section className="lg:col-span-2 border border-gray-200 rounded-lg p-6 bg-white flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md border border-gray-200 bg-gray-50 text-gray-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Progress Tracking Preview</h2>
              </div>
              <span className="text-xs text-gray-500">Module Preview</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Track longitudinal patterns in your study hours, self-reported strain levels, and recovery sessions over weeks. Interactive visual trend graphs and habit consistency metrics will be introduced in the dedicated progress module.
            </p>

            <div className="border border-dashed border-gray-200 rounded-md p-4 bg-gray-50/50 text-center">
              <p className="text-xs text-gray-500">
                Longitudinal trend analytics and visual chart components will be configured in Block 7.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">No chart data recorded yet</span>
            <Link
              to="/progress"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-900 hover:text-gray-700"
            >
              <span>View My Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Supportive Wellness Tip (takes 1 col on lg) */}
        <section className="border border-gray-200 rounded-lg p-6 bg-white flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md border border-gray-200 bg-gray-50 text-gray-700">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Daily Study Habit Tip</h2>
            </div>

            <h3 className="text-sm font-medium text-gray-900">
              The 50/10 Focus & Reset Cadence
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed">
              During demanding study or computer work sessions, schedule a 10-minute break for every 50 minutes of focused effort. Step away from your display, hydrate, and relax your shoulder muscles to prevent cognitive fatigue accumulation.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>General wellness pacing suggestion</span>
          </div>
        </section>
      </div>
    </div>
  )
}

export default OverviewPage
