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
  ShieldCheck,
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
  // Form State
  const [wasHelpful, setWasHelpful] = useState<'yes' | 'no' | null>(null)
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [rating, setRating] = useState<number | null>(null)
  const [comments, setComments] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedData, setSubmittedData] = useState<SubmittedFeedback | null>(null)

  // Handle rating click: toggles if already selected
  const handleRatingClick = (starValue: number) => {
    setRating((prev) => (prev === starValue ? null : starValue))
    if (validationError) setValidationError(null)
  }

  // Handle Yes / No click
  const handleHelpfulClick = (value: 'yes' | 'no') => {
    setWasHelpful((prev) => (prev === value ? null : value))
    if (validationError) setValidationError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: Require at least one form of input
    const hasHelpfulAnswer = wasHelpful !== null
    const hasRating = rating !== null
    const hasComments = comments.trim().length > 0

    if (!hasHelpfulAnswer && !hasRating && !hasComments) {
      setValidationError(
        'Please select whether this page was helpful, provide a rating, or enter your comments before submitting.'
      )
      return
    }

    setValidationError(null)
    setIsSubmitting(true)

    // Simulate immediate frontend state submission without fake lag
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    setSubmittedData({
      wasHelpful,
      category,
      rating,
      comments: comments.trim(),
      submittedAt: now,
    })

    setIsSubmitting(false)
  }

  const handleResetForm = () => {
    setSubmittedData(null)
    setWasHelpful(null)
    setCategory('general')
    setRating(null)
    setComments('')
    setValidationError(null)
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Page Header & Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>User Experience & Input</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
          Feedback
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
          Help us improve Cognivault AI. Whether you noticed something that could be clearer, experienced a layout issue, or have suggestions for new wellness routines, we value your feedback.
        </p>
      </div>

      {submittedData ? (
        /* 2. Success / Confirmation State */
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-gray-900">
                Thank you for your feedback!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
                Your response has been recorded for this session. Your perspective directly helps us refine our wellness routines, guided breathing paces, and study stress evaluations.
              </p>
            </div>
          </div>

          {/* Submitted Summary Overview */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/70 text-gray-500">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-gray-700">
                Recorded Submission
              </span>
              <span>Logged at {submittedData.submittedAt}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-gray-400 block text-[11px]">Was page helpful?</span>
                <span className="font-medium text-gray-800 capitalize">
                  {submittedData.wasHelpful ? submittedData.wasHelpful : 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Category</span>
                <span className="font-medium text-gray-800">
                  {CATEGORIES.find((c) => c.id === submittedData.category)?.label}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Experience Rating</span>
                <span className="font-medium text-gray-800">
                  {submittedData.rating ? `${submittedData.rating} / 5 Stars` : 'None given'}
                </span>
              </div>
            </div>

            {submittedData.comments && (
              <div className="pt-2 border-t border-gray-200/70 space-y-1">
                <span className="text-gray-400 block text-[11px]">Your Comments:</span>
                <p className="text-gray-800 bg-white p-3 rounded-md border border-gray-200/60 leading-relaxed whitespace-pre-wrap">
                  {submittedData.comments}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-gray-400">
              Client prototype: Responses are held in memory during the active session.
            </span>

            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Submit Additional Feedback</span>
            </button>
          </div>
        </section>
      ) : (
        /* 3. Interactive Feedback Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* A. Core Question: "Was this page helpful?" */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-gray-900">
                Was this page helpful?
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Let us know if the current tools and wellness information met your needs.
              </p>
            </div>

            <div className="flex items-center gap-3" role="radiogroup" aria-label="Was this page helpful?">
              <button
                type="button"
                role="radio"
                aria-checked={wasHelpful === 'yes'}
                onClick={() => handleHelpfulClick('yes')}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer',
                  wasHelpful === 'yes'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <ThumbsUp className={cn('w-4 h-4', wasHelpful === 'yes' ? 'fill-white' : 'text-gray-400')} />
                <span>Yes</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={wasHelpful === 'no'}
                onClick={() => handleHelpfulClick('no')}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer',
                  wasHelpful === 'no'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <ThumbsDown className={cn('w-4 h-4', wasHelpful === 'no' ? 'fill-white' : 'text-gray-400')} />
                <span>No</span>
              </button>

              {wasHelpful && (
                <span className="text-xs text-gray-500 ml-2">
                  Selected: <strong>{wasHelpful === 'yes' ? 'Helpful' : 'Not helpful'}</strong>
                </span>
              )}
            </div>
          </div>

          {/* B. Detailed Feedback Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
            {/* Category Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                  Feedback Category
                </label>
                <span className="text-xs text-gray-400">Required</span>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
                role="radiogroup"
                aria-label="Feedback Category"
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        'text-left p-3 rounded-lg border text-xs transition-all cursor-pointer flex flex-col justify-between space-y-1',
                        isSelected
                          ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      )}
                    >
                      <span className="font-semibold">{cat.label}</span>
                      <span
                        className={cn(
                          'text-[11px] leading-normal',
                          isSelected ? 'text-gray-300' : 'text-gray-400'
                        )}
                      >
                        {cat.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Optional 1-5 Star / Numeric Rating */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                  Overall Experience Rating (Optional)
                </label>
                <span className="text-xs text-gray-400">
                  {rating ? `${rating} of 5 Stars` : 'Optional'}
                </span>
              </div>

              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="1 to 5 Star Rating">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isFilled = rating !== null && val <= rating
                  return (
                    <button
                      key={val}
                      type="button"
                      role="radio"
                      aria-checked={rating === val}
                      aria-label={`${val} Star${val > 1 ? 's' : ''}`}
                      onClick={() => handleRatingClick(val)}
                      className={cn(
                        'p-2 rounded-lg border transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-gray-300',
                        isFilled
                          ? 'border-gray-900 bg-gray-50 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-300 hover:text-gray-500 hover:border-gray-300'
                      )}
                      title={`Rate ${val} out of 5`}
                    >
                      <Star
                        className={cn(
                          'w-5 h-5 transition-transform',
                          isFilled ? 'fill-gray-900 text-gray-900' : 'text-gray-300'
                        )}
                      />
                    </button>
                  )
                })}

                {rating && (
                  <button
                    type="button"
                    onClick={() => setRating(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline ml-2 cursor-pointer"
                  >
                    Clear rating
                  </button>
                )}
              </div>
            </div>

            {/* Multiline Comments Field */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="feedback-comments-input"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-900"
                >
                  Additional Comments
                </label>
                <span className="text-xs text-gray-400">{comments.length} / 1000 characters</span>
              </div>

              <textarea
                id="feedback-comments-input"
                rows={4}
                maxLength={1000}
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                placeholder="Share your thoughts, suggestions for improvement, or details about any issue you experienced..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-gray-400 focus:ring-2 focus:ring-gray-100 leading-relaxed resize-y transition-all"
              />
            </div>

            {/* Validation Message Banner */}
            {validationError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-200 bg-red-50/40 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{validationError}</p>
              </div>
            )}

            {/* Submit Action & Duplicate Prevention */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[11px] text-gray-400">
                Responses are stored in browser memory during this active session.
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-2xs w-full sm:w-auto cursor-pointer',
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                )}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 4. Prototype Architecture & Privacy Notice */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
            Frontend Prototype Scope
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Cognivault AI is currently running as a standalone client-side prototype. Feedback submitted through this form updates frontend state in your active browser session and does not transmit data to an external server or remote analytics database.
          </p>
        </div>
      </section>
    </div>
  )
}

export default FeedbackPage
