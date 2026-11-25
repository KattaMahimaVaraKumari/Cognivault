import React from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Home, Sparkles, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface PredictionResult {
  status: string
  model_used: string
  burnout_risk_level: 'Low' | 'Moderate' | 'High' | 'Critical' | string
  confidence: number
  probabilities: {
    Low: number
    Moderate: number
    High: number
    Critical: number
  }
  assessment_id?: string | null
  created_at?: string
}

interface QuestionnaireCompletionProps {
  onRestart: () => void
  predictionResult?: PredictionResult | null
  isLoading?: boolean
  error?: string | null
}

const RISK_THEMES: Record<string, {
  label: string
  badgeBg: string
  badgeText: string
  cardBorder: string
  glowGradient: string
  description: string
  color: string
}> = {
  Low: {
    label: 'Low Burnout Risk',
    badgeBg: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
    badgeText: 'Healthy Balance',
    cardBorder: 'border-[#bbf7d0]/90',
    glowGradient: 'from-[#86efac]/20 via-[#bbf7d0]/10 to-transparent',
    description: 'Your responses indicate sustainable study habits, balanced sleep, and healthy recovery rhythms.',
    color: '#16a34a',
  },
  Moderate: {
    label: 'Moderate Burnout Risk',
    badgeBg: 'bg-[#fff0f4] text-[#8c1d3c] border-[#fcaec2]',
    badgeText: 'Manageable Strain',
    cardBorder: 'border-[#fcaec2]/90',
    glowGradient: 'from-[#fcaec2]/25 via-[#ffe4ec]/15 to-transparent',
    description: 'You are managing moderate workload demands. Proactive micro-breaks and regular sleep routines will protect your long-term focus.',
    color: '#e0567b',
  },
  High: {
    label: 'High Burnout Risk',
    badgeBg: 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]',
    badgeText: 'Elevated Strain',
    cardBorder: 'border-[#fed7aa]/90',
    glowGradient: 'from-[#fdba74]/25 via-[#ffedd5]/15 to-transparent',
    description: 'Elevated workload pressure, fatigue, or sleep deprivation are placing significant strain on your academic energy.',
    color: '#ea580c',
  },
  Critical: {
    label: 'Critical Burnout Risk',
    badgeBg: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
    badgeText: 'Urgent Recovery Needed',
    cardBorder: 'border-[#fecaca]/90',
    glowGradient: 'from-[#f87171]/25 via-[#fee2e2]/15 to-transparent',
    description: 'Severe burnout indicators detected. Prioritize immediate rest, workload triage, and emotional wellness support.',
    color: '#dc2626',
  },
}

export const QuestionnaireCompletion: React.FC<QuestionnaireCompletionProps> = ({
  onRestart,
  predictionResult,
  isLoading = false,
  error = null,
}) => {
  // If loading prediction from backend
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-6 text-center"
      >
        <div className="rounded-2xl glass-panel p-10 sm:p-14 shadow-lg border border-[#ffdce4]/90">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f87d9f] to-[#e0567b] flex items-center justify-center mx-auto mb-6 shadow-md shadow-[#e0567b]/25 animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2d1b24] tracking-tight">
            Analyzing Lifestyle Indicators...
          </h2>
          <p className="mt-2 text-sm text-[#735562] max-w-md mx-auto">
            Processing your academic and lifestyle factors through the Cognivault ML model and syncing assessment state.
          </p>
        </div>
      </motion.div>
    )
  }

  const riskLevel = predictionResult?.burnout_risk_level || 'Moderate'
  const theme = RISK_THEMES[riskLevel] || RISK_THEMES.Moderate
  const confidencePct = Math.round((predictionResult?.confidence || 0.78) * 100)
  const probabilities = predictionResult?.probabilities || {
    Low: 0.15,
    Moderate: 0.78,
    High: 0.05,
    Critical: 0.02,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Risk Result Card */}
      <div className={cn('relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-9 shadow-lg border', theme.cardBorder)}>
        <div className={cn('absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br blur-3xl pointer-events-none', theme.glowGradient)} />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider shadow-2xs backdrop-blur-md" style={{ borderColor: theme.color + '40', backgroundColor: theme.color + '12', color: theme.color }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assessment Completed</span>
            </div>

            <span className={cn('self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full border shadow-2xs', theme.badgeBg)}>
              {theme.badgeText}
            </span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-[#9c7886] font-semibold">Predicted Outcome</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2d1b24] tracking-tight mt-1" style={{ color: theme.color }}>
              {theme.label}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#614752] leading-relaxed max-w-2xl">
              {theme.description}
            </p>
          </div>

          {/* Confidence & Model Meta */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/80 border border-[#fed5df] shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9c7886]">Model Confidence</span>
              <div className="text-lg font-bold text-[#2d1b24] mt-0.5">{confidencePct}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 border border-[#fed5df] shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9c7886]">Evaluation Source</span>
              <div className="text-xs font-bold text-[#2d1b24] mt-1 truncate">
                {predictionResult?.model_used || 'Cognivault ML Engine'}
              </div>
            </div>
          </div>

          {/* Probabilities Breakdown */}
          <div className="pt-3 border-t border-[#ffeef2] space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#735562]">Class Probability Distribution</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(probabilities).map(([cat, prob]) => {
                const pct = Math.round(prob * 100)
                const isSelected = cat === riskLevel
                return (
                  <div
                    key={cat}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all',
                      isSelected
                        ? 'bg-[#fff0f4] border-[#f48ea8] shadow-xs'
                        : 'bg-white/60 border-[#fed5df]/80'
                    )}
                  >
                    <div className="text-[11px] font-semibold text-[#8a6a77]">{cat}</div>
                    <div className="text-sm font-bold text-[#2d1b24] mt-0.5">{pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Model Error Notice if present */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#fff0f4] border border-[#fcaec2] text-xs text-[#8c1d3c]">
          <AlertCircle className="w-4 h-4 text-[#dc2b60] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl btn-wellness-secondary cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Assessment</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/overview"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl btn-wellness-secondary cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Overview</span>
          </Link>

          <Link
            to="/meditation"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl btn-wellness-primary cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Practice</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default QuestionnaireCompletion
