import React from 'react'
import { Sparkles } from 'lucide-react'

interface SuggestedQuestionsProps {
  questions: string[]
  onSelect: (question: string) => void
  label?: string
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelect,
  label = 'Suggested questions',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <Sparkles className="w-3.5 h-3.5 text-gray-400" />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(question)}
            className="text-left text-xs sm:text-[13px] px-3.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 transition-all shadow-2xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-gray-300"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SuggestedQuestions
