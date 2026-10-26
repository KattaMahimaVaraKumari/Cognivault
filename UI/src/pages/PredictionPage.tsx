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
import { QuestionnaireResponses, AnswerState, Question } from '@/types/questionnaire'
import { Component as MorphingCardStack, CardData } from '@/components/ui/morphing-card-stack'
import { QuestionReview } from '@/components/questionnaire/QuestionReview'
import { QuestionnaireCompletion } from '@/components/questionnaire/QuestionnaireCompletion'
import { cn } from '@/lib/utils'

// Icon map for the 13 questions
const QUESTION_ICONS: Record<string, React.ReactNode> = {
  study_hours_outside_classes: <Clock className="w-5 h-5" />,
  academic_tasks_weekly: <ListTodo className="w-5 h-5" />,
  perceived_academic_workload: <Gauge className="w-5 h-5" />,
  nightly_sleep_hours: <Moon className="w-5 h-5" />,
  frequency_waking_tired: <BatteryLow className="w-5 h-5" />,
  weekly_physical_activity: <Activity className="w-5 h-5" />,
  difficulty_concentrating: <Brain className="w-5 h-5" />,
  mental_emotional_exhaustion: <ZapOff className="w-5 h-5" />,
  biggest_difficulty_workload: <AlertTriangle className="w-5 h-5" />,
  stress_factors_wellbeing: <Heart className="w-5 h-5" />,
  useful_cognivault_features: <Sparkles className="w-5 h-5" />,
  high_risk_suggestions: <Compass className="w-5 h-5" />,
  open_feedback_design: <MessageSquareQuote className="w-5 h-5" />,
}

export const PredictionPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

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
  }

  // Construct MorphingCardStack CardData array
  const cards: CardData[] = useMemo(() => {
    return QUESTIONNAIRE_QUESTIONS.map((q) => {
      const resp: AnswerState = responses[q.id] || { selected: [] }
      const isMulti = q.type === 'multi' || q.type === 'multi_limit'
      const isAtLimit =
        q.type === 'multi_limit' &&
        q.maxLimit !== undefined &&
        resp.selected.length >= q.maxLimit

      return {
        id: q.id,
        badge: q.section,
        title: q.question,
        description: q.instruction || (q.type === 'single' ? 'Select one answer' : ''),
        icon: QUESTION_ICONS[q.id] || <Brain className="w-5 h-5" />,
        content: (
          <div
            className="space-y-2.5"
            onPointerDownCapture={(e) => e.stopPropagation()}
          >
            {q.type === 'textarea' ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={resp.textValue || ''}
                  onChange={(e) => handleTextValueChange(q.id, e.target.value)}
                  placeholder={q.placeholder || 'Write your thoughts here...'}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-hidden focus:ring-1 focus:ring-gray-900 bg-white"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {q.options?.map((option) => {
                  const selected = resp.selected.includes(option)
                  const disabled = !selected && isAtLimit
                  const isOther = option.toLowerCase().includes('other')

                  return (
                    <div key={option} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (disabled) return
                          handleSelectOption(q, option)
                        }}
                        disabled={disabled}
                        className={cn(
                          'w-full flex items-center justify-between text-left px-3.5 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer',
                          selected
                            ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                          disabled && 'opacity-40 cursor-not-allowed hover:bg-white hover:border-gray-200'
                        )}
                      >
                        <span className="leading-snug pr-2">{option}</span>

                        <div
                          className={cn(
                            'flex items-center justify-center shrink-0 border transition-colors',
                            isMulti ? 'h-4 w-4 rounded-xs' : 'h-4 w-4 rounded-full',
                            selected
                              ? 'border-white bg-white text-gray-900'
                              : 'border-gray-300 bg-transparent'
                          )}
                        >
                          {selected && (
                            isMulti ? (
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
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
                            placeholder="Please specify..."
                            className="w-full rounded-md border border-gray-300 p-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-hidden focus:ring-1 focus:ring-gray-900 bg-white"
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
    return <QuestionnaireCompletion onRestart={handleRestart} />
  }

  if (isReviewing) {
    return (
      <div className="max-w-3xl mx-auto">
        <QuestionReview
          questions={QUESTIONNAIRE_QUESTIONS}
          responses={responses}
          onEditQuestion={handleEditFromReview}
          onSubmit={() => {
            setIsCompleted(true)
            setIsReviewing(false)
          }}
          onBackToQuestions={() => setIsReviewing(false)}
        />
      </div>
    )
  }

  const progressPct = Math.round((answeredCount / QUESTIONNAIRE_QUESTIONS.length) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Questionnaire Top Bar */}
      <div className="border border-gray-200 rounded-xl bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Interactive Questionnaire</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Stress Prediction Assessment
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Powered by the Morphing Card Stack. Use stack, grid, or list views to complete your questions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsReviewing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Review ({answeredCount}/{QUESTIONNAIRE_QUESTIONS.length})</span>
            </button>
          </div>
        </div>

        {/* Answered Progress Bar */}
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>
              {answeredCount} of {QUESTIONNAIRE_QUESTIONS.length} questions completed
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Validation alert banner if Next clicked without selection */}
      {validationError && (
        <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
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
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <span className="text-xs font-medium text-gray-400">
          Card {activeIndex + 1} of {QUESTIONNAIRE_QUESTIONS.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
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
