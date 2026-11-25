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
  label = 'Suggested topics',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8a6874]">
        <Sparkles className="w-3.5 h-3.5 text-[#e0567b]" />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(question)}
            className="text-left text-xs px-3.5 py-1.5 rounded-xl border border-[#fed5df] bg-white/75 hover:bg-[#fff0f4] hover:border-[#fcaec2] hover:text-[#8c1d3c] text-[#553b46] font-medium transition-all shadow-2xs cursor-pointer"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SuggestedQuestions
