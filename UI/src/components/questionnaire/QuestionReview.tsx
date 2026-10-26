import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Edit3, Send } from 'lucide-react'
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
      <div className="border border-gray-200 rounded-xl bg-white p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          <CheckCircle2 className="w-4 h-4 text-gray-700" />
          <span>Review Responses</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
          Review Your Questionnaire
        </h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed max-w-2xl">
          Please review your answers before submitting. You can click Edit beside any question to revise your answer.
        </p>

        {/* Answers List */}
        <div className="mt-8 divide-y divide-gray-100">
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
                  <div className="text-xs font-medium text-gray-400">
                    {q.section}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                    {q.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-normal bg-gray-50 p-2.5 rounded-md border border-gray-100">
                    {displayAnswer}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onEditQuestion(idx)}
                  className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Questions</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
        >
          <span>Submit Questionnaire</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default QuestionReview
