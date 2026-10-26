import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'
import { Question, AnswerState } from '@/types/questionnaire'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
  question: Question
  answer: AnswerState
  onSelectOption: (option: string) => void
  onOtherTextChange: (text: string) => void
  onTextValueChange: (text: string) => void
  errorMessage?: string | null
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onSelectOption,
  onOtherTextChange,
  onTextValueChange,
  errorMessage,
}) => {
  const isMulti = question.type === 'multi' || question.type === 'multi_limit'
  const isSelected = (opt: string) => answer.selected.includes(opt)
  const isAtLimit =
    question.type === 'multi_limit' &&
    question.maxLimit !== undefined &&
    answer.selected.length >= question.maxLimit


  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="w-full rounded-xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xs"
    >
      {/* Section Header */}
      <div className="mb-4">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {question.section}
        </span>
      </div>

      {/* Question Text */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">
        {question.question}
      </h2>

      {/* Instruction / Multi-select rule */}
      {question.instruction && (
        <p className="mt-2 text-xs sm:text-sm font-medium text-gray-500">
          {question.instruction}
          {question.type === 'multi_limit' && (
            <span className="ml-1.5 font-normal text-gray-400">
              ({answer.selected.length}/{question.maxLimit} selected)
            </span>
          )}
        </p>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Answer Options Container */}
      <div className="mt-6">
        {question.type === 'textarea' ? (
          <div className="space-y-2">
            <textarea
              rows={5}
              value={answer.textValue || ''}
              onChange={(e) => onTextValueChange(e.target.value)}
              placeholder={question.placeholder || 'Type your response here...'}
              className="w-full rounded-lg border border-gray-200 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-hidden focus:ring-1 focus:ring-gray-900 transition-colors"
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {question.options?.map((option) => {
              const selected = isSelected(option)
              const disabled = !selected && isAtLimit
              const isOther = option.toLowerCase().includes('other')

              return (
                <div key={option} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (disabled) return
                      onSelectOption(option)
                    }}
                    disabled={disabled}
                    className={cn(
                      'group w-full flex items-center justify-between text-left p-3.5 sm:p-4 rounded-lg border text-sm font-medium transition-all cursor-pointer',
                      selected
                        ? 'border-gray-900 bg-gray-50 text-gray-900 ring-1 ring-gray-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/50',
                      disabled && 'opacity-40 cursor-not-allowed hover:border-gray-200 hover:bg-white'
                    )}
                  >
                    <div className="flex items-center gap-3 pr-2 min-w-0">
                      {/* Checkbox or Radio Icon Indicator */}
                      <div
                        className={cn(
                          'flex items-center justify-center shrink-0 border transition-colors',
                          isMulti ? 'h-4.5 w-4.5 rounded-sm' : 'h-4.5 w-4.5 rounded-full',
                          selected
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 bg-white group-hover:border-gray-400'
                        )}
                      >
                        {selected && (
                          isMulti ? (
                            <Check className="h-3 w-3 stroke-[3]" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )
                        )}
                      </div>

                      <span className="leading-relaxed break-words">{option}</span>
                    </div>
                  </button>

                  {/* Conditional "Other (please specify)" Input */}
                  {isOther && selected && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-8 pt-1"
                      >
                        <input
                          type="text"
                          value={answer.otherText || ''}
                          onChange={(e) => onOtherTextChange(e.target.value)}
                          placeholder="Please specify your response..."
                          className="w-full rounded-md border border-gray-300 p-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-hidden focus:ring-1 focus:ring-gray-900 bg-white"
                          autoFocus
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default QuestionCard
