import React from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  Wind,
  HeartPulse,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Activity,
  Smile,
} from 'lucide-react'

export const OverviewPage: React.FC = () => {
  const quickActions = [
    {
      title: 'Stress Prediction',
      href: '/prediction',
      icon: Brain,
      description: 'Evaluate multi-factor strain and study workload pressure.',
      badge: 'ML Assessment',
      iconBg: 'bg-gradient-to-br from-[#f87d9f] to-[#e0567b] text-white',
    },
    {
      title: 'Meditation & Breathing',
      href: '/meditation',
      icon: Wind,
      description: 'Reset your focus with guided breathing intervals and soundscapes.',
      badge: 'Mindfulness',
      iconBg: 'bg-gradient-to-br from-[#fcaec2] to-[#f47294] text-white',
    },
    {
      title: 'Physical Wellness',
      href: '/physical-wellness',
      icon: HeartPulse,
      description: 'Desk stretches and ergonomic pauses to reduce somatic tension.',
      badge: 'Ergonomics',
      iconBg: 'bg-gradient-to-br from-[#f87d9f] to-[#dc2b60] text-white',
    },
    {
      title: 'Wellness Assistant',
      href: '/assistant',
      icon: MessageSquare,
      description: 'Reflective dialogue for everyday stress management strategies.',
      badge: 'Conversational',
      iconBg: 'bg-gradient-to-br from-[#e27d92] to-[#be5b72] text-white',
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Hero Welcome Glass Panel */}
      <section className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-9 shadow-md shadow-[#fed5df]/30 border border-[#ffdce4]/90">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#ffd0dc]/40 via-[#ffe4eb]/30 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-xs font-semibold text-[#8c1d3c] shadow-2xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#e0567b]" />
            <span>Habit & Well-being Companion</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#2d1b24] leading-tight">
            Nurture Balance.{' '}
            <span className="bg-gradient-to-r from-[#e0567b] via-[#be4162] to-[#a32849] bg-clip-text text-transparent">
              Prevent Burnout.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#614752] leading-relaxed font-normal">
            Cognivault AI empowers students to recognize early indicators of fatigue, discover restorative micro-breaks, and explore sustainable study routines designed for academic resilience.
          </p>

          <p className="text-xs text-[#735562] flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#bf4667] shrink-0" />
            <span>Educational wellness support powered by verified lifestyle indicators.</span>
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/prediction"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl btn-wellness-primary cursor-pointer"
            >
              <span>Start Stress Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/meditation"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl btn-wellness-secondary cursor-pointer"
            >
              <span>Quick Breathing Reset</span>
              <Wind className="w-4 h-4 text-[#e0567b]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Burnout Risk Status Banner Card */}
      <section className="rounded-2xl glass-panel p-6 shadow-sm border border-[#ffdce4]/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ffe9ee]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe9ee] text-[#c0385c]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2d1b24]">Burnout Risk Screening</h2>
              <p className="text-xs text-[#735562]">
                Baseline workload and multi-factor strain status
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#fcaec2]/60 bg-white/90 text-xs text-[#734857] font-semibold shadow-2xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#f0507e] animate-pulse" />
            <span>Interactive Assessment Ready</span>
          </span>
        </div>

        <div className="mt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <p className="text-sm text-[#3b121e] font-semibold flex items-center gap-2">
              <Smile className="w-4 h-4 text-[#e0567b]" />
              <span>Evaluate your current academic workload</span>
            </p>
            <p className="text-xs text-[#614752] leading-relaxed font-normal">
              Complete the 13-question card assessment across study demands, sleep balance, physical movement, and cognitive fatigue to receive your explainable risk prediction and personalized recommendations.
            </p>
          </div>

          <Link
            to="/prediction"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl btn-wellness-secondary shrink-0 cursor-pointer"
          >
            <span>Launch Evaluation</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#bf4667]" />
          </Link>
        </div>
      </section>

      {/* 3. Quick Actions Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#2d1b24] tracking-tight">Wellness Practices</h2>
            <p className="text-xs text-[#735562]">Core modalities for focus and stress mitigation</p>
          </div>
          <span className="text-xs font-semibold text-[#bf4667]">4 Tools Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                to={action.href}
                className="group flex flex-col justify-between p-5 rounded-2xl glass-card-interactive cursor-pointer relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center shadow-md shadow-[#fed5df]/50`}>
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fff0f4] text-[#8c1d3c] border border-[#fcaec2]/60">
                      {action.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-[#2d1b24] group-hover:text-[#a32849] transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#6e535e] leading-relaxed font-normal">
                    {action.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#ffeef2] flex items-center justify-between text-xs font-semibold text-[#825b6a] group-hover:text-[#a32849] transition-colors">
                  <span>Enter practice</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 4. Progress Preview & Wellness Habit Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Preview */}
        <section className="lg:col-span-2 rounded-2xl glass-panel p-6 flex flex-col justify-between shadow-sm border border-[#ffdce4]/90">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ffe9ee] text-[#c0385c]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#2d1b24]">Consistency & Tracking</h2>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#fff0f4] text-[#8c1d3c] border border-[#fcaec2]/60">
                Analytics
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#614752] leading-relaxed">
              Track longitudinal trends in your study hours, break minutes, and stress screenings over time. Build steady, sustainable rhythms that support long-term academic growth.
            </p>

            <div className="rounded-xl border border-dashed border-[#fcaec2]/80 p-5 bg-gradient-to-r from-[#fff5f7] via-[#fff9fa] to-[#fff0f4] text-center">
              <p className="text-xs font-medium text-[#734857]">
                Explore interactive trend curves and daily activity logs in your personal progress dashboard.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#ffeef2] flex items-center justify-between">
            <span className="text-xs text-[#9c7886]">Weekly insight overview</span>
            <Link
              to="/progress"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b83b5e] hover:text-[#8c1d3c]"
            >
              <span>View Analytics & History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Daily Study Habit Tip */}
        <section className="rounded-2xl glass-panel p-6 flex flex-col justify-between shadow-sm border border-[#ffdce4]/90">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#ffe9ee] text-[#c0385c]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#2d1b24]">Study Pacing Tip</h2>
            </div>

            <h3 className="text-sm font-semibold text-[#3b121e]">
              The 50/10 Focus & Reset Cadence
            </h3>

            <p className="text-xs text-[#614752] leading-relaxed font-normal">
              During demanding study sprints, take a 10-minute micro-break for every 50 minutes of focused effort. Step away from your display, hydrate, and stretch your shoulders to prevent cognitive fatigue accumulation.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#ffeef2] flex items-center gap-2 text-xs text-[#825b6a] font-medium">
            <span className="flex h-2 w-2 rounded-full bg-[#e0567b]" />
            <span>Ergonomic cadence recommendation</span>
          </div>
        </section>
      </div>
    </div>
  )
}

export default OverviewPage
