import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit3, Send, Sparkles } from 'lucide-react'
import { Question, QuestionnaireResponses } from '@/types/questionnaire'

interface QuestionReviewProps {
  questions: Question[]
  responses: QuestionnaireResponses
  onEditQuestion: (index: number) => void
  onSubmit: () => void
  onBackToQuestions: () => void
}

export const QuestionReview: React.FC<QuestionReviewProps> = ({
  questions,
  responses,
  onEditQuestion,
  onSubmit,
  onBackToQuestions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="rounded-2xl glass-panel p-6 sm:p-9 shadow-lg border border-[#ffdce4]/90">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a32849] mb-1.5">
          <Sparkles className="w-4 h-4 text-[#e0567b]" />
          <span>Audit & Confirm</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-[#2d1b24] tracking-tight">
          Review Your Questionnaire
        </h1>
        <p className="mt-1.5 text-sm text-[#614752] leading-relaxed max-w-2xl font-normal">
          Please review your answers before submitting to the Cognivault ML engine. You can click Edit beside any question to revise your answer.
        </p>

        {/* Answers List */}
        <div className="mt-8 divide-y divide-[#ffeef2]">
          {questions.map((q, idx) => {
            const resp = responses[q.id] || { selected: [] }
            let displayAnswer = 'Not answered'

            if (q.type === 'textarea') {
              displayAnswer = resp.textValue?.trim() || '(No feedback provided)'
            } else if (resp.selected.length > 0) {
              const formatted = resp.selected.map((opt) => {
                if (opt.toLowerCase().includes('other') && resp.otherText?.trim()) {
                  return `Other: "${resp.otherText.trim()}"`
                }
                return opt
              })
              displayAnswer = formatted.join(', ')
            }

            return (
              <div
                key={q.id}
                className="py-4.5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#a32849]/90">
                    {q.section}
                  </div>
                  <h3 className="text-sm font-bold text-[#2d1b24] leading-snug">
                    {q.question}
                  </h3>
                  <div className="text-xs sm:text-sm text-[#4b353f] font-medium bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-[#fed5df] shadow-2xs">
                    {displayAnswer}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onEditQuestion(idx)}
                  className="self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl btn-wellness-secondary shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#e0567b]" />
                  <span>Edit</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Footer Controls */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBackToQuestions}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl btn-wellness-secondary cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Questions</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl btn-wellness-primary cursor-pointer"
        >
          <span>Calculate Burnout Risk</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default QuestionReview
