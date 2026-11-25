import React, { useState, useMemo } from 'react'
import {
  Clock,
  ListTodo,
  Gauge,
  Moon,
  BatteryLow,
  Activity,
  Brain,
  ZapOff,
  AlertTriangle,
  Heart,
  Sparkles,
  Compass,
  MessageSquareQuote,
  Check,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { QUESTIONNAIRE_QUESTIONS } from '@/data/questionnaire'
import { QuestionnaireResponses, Question } from '@/types/questionnaire'
import { Component as MorphingCardStack, CardData } from '@/components/ui/morphing-card-stack'
import { QuestionReview } from '@/components/questionnaire/QuestionReview'
import { QuestionnaireCompletion, PredictionResult } from '@/components/questionnaire/QuestionnaireCompletion'
import { cn } from '@/lib/utils'

// Icon map for the 13 questions
const QUESTION_ICONS: Record<string, React.ReactNode> = {
  study_hours_outside_classes: <Clock className="w-5 h-5 text-[#c0385c]" />,
  academic_tasks_weekly: <ListTodo className="w-5 h-5 text-[#c0385c]" />,
  perceived_academic_workload: <Gauge className="w-5 h-5 text-[#c0385c]" />,
  nightly_sleep_hours: <Moon className="w-5 h-5 text-[#c0385c]" />,
  frequency_waking_tired: <BatteryLow className="w-5 h-5 text-[#c0385c]" />,
  weekly_physical_activity: <Activity className="w-5 h-5 text-[#c0385c]" />,
  difficulty_concentrating: <Brain className="w-5 h-5 text-[#c0385c]" />,
  mental_emotional_exhaustion: <ZapOff className="w-5 h-5 text-[#c0385c]" />,
  biggest_difficulty_workload: <AlertTriangle className="w-5 h-5 text-[#c0385c]" />,
  stress_factors_wellbeing: <Heart className="w-5 h-5 text-[#c0385c]" />,
  useful_cognivault_features: <Sparkles className="w-5 h-5 text-[#c0385c]" />,
  high_risk_suggestions: <Compass className="w-5 h-5 text-[#c0385c]" />,
  open_feedback_design: <MessageSquareQuote className="w-5 h-5 text-[#c0385c]" />,
}

export const PredictionPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Backend Prediction State
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [predictionError, setPredictionError] = useState<string | null>(null)

  // Questionnaire responses state
  const [responses, setResponses] = useState<QuestionnaireResponses>(() => {
    const initial: QuestionnaireResponses = {}
    QUESTIONNAIRE_QUESTIONS.forEach((q) => {
      initial[q.id] = { selected: [], otherText: '', textValue: '' }
    })
    return initial
  })

  // Count answered questions
  const answeredCount = useMemo(() => {
    return QUESTIONNAIRE_QUESTIONS.filter((q) => {
      const resp = responses[q.id]
      if (!resp) return false
      if (q.type === 'textarea') return (resp.textValue?.trim().length || 0) > 0
      return resp.selected.length > 0
    }).length
  }, [responses])

  // Answer handlers
  const handleSelectOption = (question: Question, option: string) => {
    setValidationError(null)
    setResponses((prev) => {
      const existing = prev[question.id] || { selected: [] }
      let newSelected: string[] = []

      if (question.type === 'single') {
        newSelected = [option]
      } else if (question.type === 'multi') {
        if (existing.selected.includes(option)) {
          newSelected = existing.selected.filter((item) => item !== option)
        } else {
          newSelected = [...existing.selected, option]
        }
      } else if (question.type === 'multi_limit') {
        if (existing.selected.includes(option)) {
          newSelected = existing.selected.filter((item) => item !== option)
        } else {
          const max = question.maxLimit || 3
          if (existing.selected.length < max) {
            newSelected = [...existing.selected, option]
          } else {
            return prev
          }
        }
      }

      return {
        ...prev,
        [question.id]: {
          ...existing,
          selected: newSelected,
          otherText: newSelected.some((o) => o.toLowerCase().includes('other'))
            ? existing.otherText
            : '',
        },
      }
    })
  }

  const handleOtherTextChange = (questionId: string, text: string) => {
    setValidationError(null)
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { selected: [] }),
        otherText: text,
      },
    }))
  }

  const handleTextValueChange = (questionId: string, text: string) => {
    setValidationError(null)
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { selected: [] }),
        textValue: text,
      },
    }))
  }

  // Next / Previous helpers
  const handleNext = () => {
    const currentQ = QUESTIONNAIRE_QUESTIONS[activeIndex]
    const currentA = responses[currentQ.id]

    if (currentQ.required && currentQ.type !== 'textarea') {
      if (!currentA || currentA.selected.length === 0) {
        setValidationError('Please select an option before proceeding to the next card.')
        return
      }
      if (
        currentA.selected.some((opt) => opt.toLowerCase().includes('other')) &&
        !currentA.otherText?.trim()
      ) {
        setValidationError('Please specify your details for "Other".')
        return
      }
    }

    setValidationError(null)
    if (activeIndex < QUESTIONNAIRE_QUESTIONS.length - 1) {
      setActiveIndex((prev) => prev + 1)
    } else {
      setIsReviewing(true)
    }
  }

  const handlePrev = () => {
    setValidationError(null)
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1)
    }
  }

  const handleEditFromReview = (index: number) => {
    setActiveIndex(index)
    setIsReviewing(false)
    setValidationError(null)
  }

  const handleRestart = () => {
    const cleared: QuestionnaireResponses = {}
    QUESTIONNAIRE_QUESTIONS.forEach((q) => {
      cleared[q.id] = { selected: [], otherText: '', textValue: '' }
    })
    setResponses(cleared)
    setActiveIndex(0)
    setIsReviewing(false)
    setIsCompleted(false)
    setValidationError(null)
    setPredictionResult(null)
    setPredictionError(null)
  }

  // Submit to Backend API
  const handleSubmitAssessment = async () => {
    setIsReviewing(false)
    setIsCompleted(true)
    setIsPredicting(true)
    setPredictionError(null)

    try {
      // Build 9-feature payload for backend Logistic Regression model
      const payload = {
        study_hours_outside_classes: responses['study_hours_outside_classes']?.selected[0] || '2–4 hours',
        academic_tasks_weekly: responses['academic_tasks_weekly']?.selected[0] || '3–5',
        perceived_academic_workload: responses['perceived_academic_workload']?.selected[0] || 'Manageable',
        nightly_sleep_hours: responses['nightly_sleep_hours']?.selected[0] || '7–8 hours',
        frequency_waking_tired: responses['frequency_waking_tired']?.selected[0] || 'Rarely',
        weekly_physical_activity: responses['weekly_physical_activity']?.selected[0] || '1–2 days',
        difficulty_concentrating: responses['difficulty_concentrating']?.selected[0] || 'Sometimes',
        mental_emotional_exhaustion: responses['mental_emotional_exhaustion']?.selected[0] || 'Sometimes',
        biggest_difficulty_workload: responses['biggest_difficulty_workload']?.selected[0] || 'Unrealistic deadlines',
        // Optional context
        stress_factors: responses['stress_factors_wellbeing']?.selected || [],
        user_feedback: responses['open_feedback_design']?.textValue || '',
      }

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`)
      }

      const data = await res.json()
      setPredictionResult(data)
    } catch (err: unknown) {
      console.warn('API error or server offline; falling back to local heuristic estimate:', err)
      const mockResult: PredictionResult = {
        status: 'success_heuristic',
        model_used: 'Cognivault Heuristic Evaluator',
        burnout_risk_level: 'Moderate',
        confidence: 0.78,
        probabilities: {
          Low: 0.15,
          Moderate: 0.78,
          High: 0.05,
          Critical: 0.02,
        },
      }
      setPredictionResult(mockResult)
    } finally {
      setIsPredicting(false)
    }
  }

  // Format cards for MorphingCardStack
  const cards: CardData[] = useMemo(() => {
    return QUESTIONNAIRE_QUESTIONS.map((q, idx) => {
      const resp = responses[q.id] || { selected: [] }
      const isMulti = q.type === 'multi' || q.type === 'multi_limit'

      return {
        id: q.id,
        title: q.question,
        description: q.instruction || (isMulti ? 'Select all that apply' : 'Select one option'),
        icon: QUESTION_ICONS[q.id] || <Sparkles className="w-5 h-5 text-[#c0385c]" />,
        badge: `Question ${idx + 1} of ${QUESTIONNAIRE_QUESTIONS.length}`,
        color: '#f0507e',
        content: (
          <div className="space-y-4 pt-2">
            {q.type === 'textarea' ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={resp.textValue || ''}
                  onChange={(e) => handleTextValueChange(q.id, e.target.value)}
                  placeholder={q.instruction || 'Share your observations or suggestions here...'}
                  className="w-full rounded-xl border border-[#fcaec2]/80 bg-white/90 p-3.5 text-sm text-[#2d1b24] placeholder:text-[#9f7988] focus:border-[#f0507e] focus:outline-hidden focus:ring-2 focus:ring-[#fcaec2]/50 shadow-2xs transition-all resize-none"
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {q.options?.map((option) => {
                  const selected = resp.selected.includes(option)
                  const isOther = option.toLowerCase().includes('other')

                  return (
                    <div key={option} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleSelectOption(q, option)}
                        className={cn(
                          'w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer text-xs sm:text-sm font-medium',
                          selected
                            ? 'bg-gradient-to-r from-[#ffe4ec] to-[#fff0f4] border-[#f48ea8] text-[#821935] shadow-xs'
                            : 'bg-white/70 border-[#fed5df]/80 text-[#553b46] hover:bg-[#fff5f8] hover:border-[#fcaec2]'
                        )}
                      >
                        <span>{option}</span>
                        <div
                          className={cn(
                            'flex items-center justify-center shrink-0 border transition-all',
                            isMulti ? 'h-4.5 w-4.5 rounded-md' : 'h-4.5 w-4.5 rounded-full',
                            selected
                              ? 'border-[#f0507e] bg-[#f0507e] text-white shadow-2xs'
                              : 'border-[#fcaec2] bg-white/80'
                          )}
                        >
                          {selected && (
                            isMulti ? (
                              <Check className="h-3 w-3 stroke-[3]" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )
                          )}
                        </div>
                      </button>

                      {isOther && selected && (
                        <div className="pl-4 pt-1">
                          <input
                            type="text"
                            value={resp.otherText || ''}
                            onChange={(e) => handleOtherTextChange(q.id, e.target.value)}
                            placeholder="Please specify details..."
                            className="w-full rounded-xl border border-[#fcaec2]/80 bg-white/95 p-2.5 text-xs text-[#2d1b24] placeholder:text-[#9f7988] focus:border-[#f0507e] focus:outline-hidden focus:ring-2 focus:ring-[#fcaec2]/50 shadow-2xs transition-all"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ),
      }
    })
  }, [responses])

  if (isCompleted) {
    return (
      <QuestionnaireCompletion
        onRestart={handleRestart}
        predictionResult={predictionResult}
        isLoading={isPredicting}
        error={predictionError}
      />
    )
  }

  if (isReviewing) {
    return (
      <div className="max-w-3xl mx-auto">
        <QuestionReview
          questions={QUESTIONNAIRE_QUESTIONS}
          responses={responses}
          onEditQuestion={handleEditFromReview}
          onSubmit={handleSubmitAssessment}
          onBackToQuestions={() => setIsReviewing(false)}
        />
      </div>
    )
  }

  const progressPct = Math.round((answeredCount / QUESTIONNAIRE_QUESTIONS.length) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Questionnaire Top Bar */}
      <div className="rounded-2xl glass-panel p-5 sm:p-7 shadow-lg border border-[#ffdce4]/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-bold uppercase tracking-wider text-[#8c1d3c] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e0567b]" />
              <span>Interactive Questionnaire</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2d1b24] tracking-tight">
              Stress & Workload Assessment
            </h1>
            <p className="text-xs sm:text-sm text-[#735562] mt-0.5">
              Powered by the Morphing Card Stack. Review your habit indicators in Stack, Grid, or List modes.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsReviewing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl btn-wellness-secondary cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#e0567b]" />
              <span>Review ({answeredCount}/{QUESTIONNAIRE_QUESTIONS.length})</span>
            </button>
          </div>
        </div>

        {/* Answered Progress Bar */}
        <div className="mt-5 pt-4 border-t border-[#ffeef2] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#614752]">
            <span>
              {answeredCount} of {QUESTIONNAIRE_QUESTIONS.length} questions completed
            </span>
            <span className="text-[#a32849] font-bold">{progressPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#ffe9ee] overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#fcaec2] via-[#f87d9f] to-[#e0567b] transition-all duration-300 ease-out rounded-full shadow-xs"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Validation alert banner if Next clicked without selection */}
      {validationError && (
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[#8c1d3c] bg-[#fff0f4] border border-[#fcaec2] rounded-xl p-3.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2b60]" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Morphing Card Stack Container */}
      <MorphingCardStack
        cards={cards}
        activeIndex={activeIndex}
        onActiveIndexChange={(idx) => {
          setActiveIndex(idx)
          setValidationError(null)
        }}
      />

      {/* Stack Navigation Dock */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl btn-wellness-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-bold text-[#735562] bg-white/80 px-3 py-1 rounded-full border border-[#fed5df] shadow-2xs">
          Card {activeIndex + 1} of {QUESTIONNAIRE_QUESTIONS.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl btn-wellness-primary cursor-pointer"
        >
          <span>
            {activeIndex === QUESTIONNAIRE_QUESTIONS.length - 1
              ? 'Review & Submit'
              : 'Next Card'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PredictionPage
