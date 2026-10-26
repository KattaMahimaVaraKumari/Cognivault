import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, RotateCcw, Home, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface QuestionnaireCompletionProps {
  onRestart: () => void
}

export const QuestionnaireCompletion: React.FC<QuestionnaireCompletionProps> = ({
  onRestart,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="border border-gray-200 rounded-xl bg-white p-8 sm:p-10 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 text-gray-900 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 mb-3">
          <Sparkles className="w-3 h-3" />
          <span>Assessment Completed</span>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Questionnaire Submitted
        </h1>

        <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
          Thank you for completing the student academic workload and well-being questionnaire. Your responses have been validated and recorded for this session.
        </p>

        {/* Clear scope notice */}
        <div className="mt-6 p-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 text-xs text-gray-500 text-left leading-relaxed">
          <p className="font-medium text-gray-700 mb-1">Notice regarding Model Inference:</p>
          Automated burnout-risk scoring and machine learning inference will be integrated in the backend handoff phase. In this frontend interface block, no synthetic prediction, medical diagnosis, or risk tier score is generated.
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Questionnaire</span>
          </button>

          <Link
            to="/overview"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default QuestionnaireCompletion
