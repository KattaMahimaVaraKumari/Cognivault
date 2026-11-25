import React, { useState } from 'react'
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Send,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type FeedbackCategory =
  | 'general'
  | 'bug'
  | 'suggestion'
  | 'content_accuracy'
  | 'other'

const CATEGORIES: { id: FeedbackCategory; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General Feedback',
    description: 'Overall impression or user experience thoughts',
  },
  {
    id: 'suggestion',
    label: 'Suggestion',
    description: 'Ideas for new routines, assessments, or features',
  },
  {
    id: 'bug',
    label: 'Bug Report',
    description: 'Technical glitches, layout issues, or broken elements',
  },
  {
    id: 'content_accuracy',
    label: 'Content Accuracy',
    description: 'Questions or corrections regarding wellness guidance',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Anything else you would like to share with us',
  },
]

interface SubmittedFeedback {
  wasHelpful: 'yes' | 'no' | null
  category: FeedbackCategory
  rating: number | null
  comments: string
  submittedAt: string
}

export const FeedbackPage: React.FC = () => {
  const [wasHelpful, setWasHelpful] = useState<'yes' | 'no' | null>(null)
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [rating, setRating] = useState<number | null>(null)
  const [comments, setComments] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedData, setSubmittedData] = useState<SubmittedFeedback | null>(null)

  const handleRatingClick = (starValue: number) => {
    setRating((prev) => (prev === starValue ? null : starValue))
    if (validationError) setValidationError(null)
  }

  const handleHelpfulClick = (value: 'yes' | 'no') => {
    setWasHelpful((prev) => (prev === value ? null : value))
    if (validationError) setValidationError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const hasHelpfulAnswer = wasHelpful !== null
    const hasRating = rating !== null
    const hasComments = comments.trim().length > 0

    if (!hasHelpfulAnswer && !hasRating && !hasComments) {
      setValidationError('Please select an answer, give a rating, or provide comments.')
      return
    }

    setValidationError(null)
    setIsSubmitting(true)

    setTimeout(() => {
      setSubmittedData({
        wasHelpful,
        category,
        rating,
        comments: comments.trim(),
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
      setIsSubmitting(false)
    }, 300)
  }

  const handleReset = () => {
    setWasHelpful(null)
    setCategory('general')
    setRating(null)
    setComments('')
    setSubmittedData(null)
    setValidationError(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-bold uppercase tracking-wider text-[#8c1d3c] shadow-2xs">
          <MessageCircle className="w-3.5 h-3.5 text-[#e0567b]" />
          <span>User Experience & Sentiment</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#2d1b24]">
          Reflections & Feedback
        </h1>

        <p className="text-sm sm:text-base text-[#614752] max-w-2xl leading-relaxed font-normal">
          Your impressions guide our wellness tools. Let us know how Cognivault AI is supporting your study habits and stress balance.
        </p>
      </div>

      {submittedData ? (
        /* Submission Success Panel */
        <div className="rounded-2xl glass-panel p-8 sm:p-12 text-center space-y-4 shadow-lg border border-[#ffdce4]/90 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f87d9f] to-[#e0567b] text-white flex items-center justify-center mx-auto shadow-md shadow-[#e0567b]/25">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#2d1b24]">Thank You for Your Feedback!</h2>
            <p className="text-sm text-[#614752] max-w-md mx-auto font-normal">
              Your feedback was recorded for this session. We appreciate your insights on student well-being.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl btn-wellness-primary cursor-pointer mt-4"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Submit Another Note</span>
          </button>
        </div>
      ) : (
        /* Interactive Feedback Form */
        <form onSubmit={handleSubmit} className="rounded-2xl glass-panel p-6 sm:p-9 shadow-lg border border-[#ffdce4]/90 space-y-6">
          {validationError && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#fff0f4] border border-[#fcaec2] text-xs font-semibold text-[#8c1d3c]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2b60]" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Was this page helpful? */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3b121e]">
              Was Cognivault helpful for your study sessions today?
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleHelpfulClick('yes')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                  wasHelpful === 'yes'
                    ? 'btn-wellness-primary shadow-xs'
                    : 'glass-panel text-[#6e535e] hover:bg-white/90 border-[#fed5df]'
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Yes, Very Helpful</span>
              </button>

              <button
                type="button"
                onClick={() => handleHelpfulClick('no')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                  wasHelpful === 'no'
                    ? 'bg-[#e0567b] text-white border-[#e0567b] shadow-xs'
                    : 'glass-panel text-[#6e535e] hover:bg-white/90 border-[#fed5df]'
                )}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Needs Improvement</span>
              </button>
            </div>
          </div>

          {/* 2. Star Rating */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3b121e]">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const active = rating !== null && starVal <= rating
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => handleRatingClick(starVal)}
                    className="p-2 rounded-xl transition-all hover:scale-110 cursor-pointer"
                    aria-label={`Rate ${starVal} out of 5 stars`}
                  >
                    <Star
                      className={cn(
                        'w-7 h-7 transition-colors',
                        active
                          ? 'fill-[#f59e0b] text-[#f59e0b] drop-shadow-xs'
                          : 'text-[#e5ccd3] hover:text-[#f8b4c4]'
                      )}
                    />
                  </button>
                )
              })}
              {rating && (
                <span className="text-xs font-bold text-[#735562] ml-2">
                  {rating} of 5 Stars
                </span>
              )}
            </div>
          </div>

          {/* 3. Feedback Category */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3b121e]">
              Topic Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      'text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#fff0f4] border-[#f48ea8] text-[#8c1d3c] shadow-xs ring-1 ring-[#fcaec2]/60 font-semibold'
                        : 'glass-panel text-[#6e535e] hover:bg-white/90 border-[#fed5df]'
                    )}
                  >
                    <div className="font-bold text-[#2d1b24]">{cat.label}</div>
                    <div className="text-[11px] text-[#8a6a77] mt-0.5 font-normal">{cat.description}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Comments Textarea */}
          <div className="space-y-2 pt-2">
            <label htmlFor="feedback-comments" className="block text-xs font-bold uppercase tracking-wider text-[#3b121e]">
              Comments & Suggestions
            </label>
            <textarea
              id="feedback-comments"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What features or habit tools would make Cognivault AI more supportive for your studies?"
              className="w-full rounded-xl border border-[#fed5df] bg-white/90 p-3.5 text-sm text-[#2d1b24] placeholder:text-[#9f7988] focus:border-[#f0507e] focus:outline-hidden focus:ring-2 focus:ring-[#fcaec2]/50 shadow-2xs font-normal transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-[#ffeef2] flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl btn-wellness-primary cursor-pointer shadow-md"
            >
              <span>Submit Note</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default FeedbackPage
