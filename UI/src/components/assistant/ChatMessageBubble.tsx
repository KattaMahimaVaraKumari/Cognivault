import React from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'
import { ChatMessage } from '@/types/assistant'
import { cn } from '@/lib/utils'

interface ChatMessageBubbleProps {
  message: ChatMessage
  onSelectSuggestion?: (question: string) => void
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSelectSuggestion,
}) => {
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 items-end pl-8 sm:pl-16">
        <div className="flex flex-col items-end max-w-xl">
          <div className="rounded-2xl rounded-br-xs bg-gray-900 text-white px-4 py-2.5 text-sm leading-relaxed shadow-2xs">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 px-1">{message.timestamp}</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start gap-2.5 items-start pr-4 sm:pr-12">
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border',
          message.isCrisis
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-gray-100 border-gray-200 text-gray-700'
        )}
      >
        {message.isCrisis ? (
          <ShieldAlert className="w-3.5 h-3.5" />
        ) : (
          <Bot className="w-3.5 h-3.5" />
        )}
      </div>

      <div
        className={cn(
          'flex flex-col max-w-2xl w-full rounded-2xl rounded-tl-xs border bg-white p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all',
          message.isCrisis
            ? 'border-red-200 bg-red-50/20'
            : message.isFallback
              ? 'border-gray-200 bg-gray-50/30'
              : 'border-gray-200'
        )}
      >
        {/* Header metadata */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-900">
              {message.isCrisis ? 'Crisis Safety Notice' : 'Cognivault Guide'}
            </span>
            {message.categoryLabel && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {message.categoryLabel}
                </span>
              </>
            )}
          </div>
          <span className="text-[11px] text-gray-400">{message.timestamp}</span>
        </div>

        {/* Primary Message Body */}
        <div className="text-sm text-gray-800 leading-relaxed space-y-2 whitespace-pre-wrap">
          {message.text}
        </div>

        {/* Key Tips or Guidance Points */}
        {message.tips && message.tips.length > 0 && (
          <div
            className={cn(
              'p-3.5 rounded-xl border text-xs space-y-2',
              message.isCrisis
                ? 'bg-red-50/60 border-red-100 text-red-950'
                : 'bg-gray-50 border-gray-100 text-gray-700'
            )}
          >
            <div className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
              <span>{message.isCrisis ? 'Immediate Support Resources' : 'Key Recommendations'}</span>
            </div>
            <ul className="space-y-1.5 list-disc list-outside pl-4 leading-relaxed">
              {message.tips.map((tip, idx) => (
                <li key={idx} className="pl-0.5">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive App Deep Link */}
        {message.relatedLink && (
          <div className="pt-1">
            <Link
              to={message.relatedLink.path}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-xs font-medium text-gray-900 transition-colors shadow-2xs cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-900" />
              <span>{message.relatedLink.label}</span>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* Suggested Follow-up Questions */}
        {message.suggestedFollowups && message.suggestedFollowups.length > 0 && onSelectSuggestion && (
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block">
              Related topics you can ask:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedFollowups.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggestion(q)}
                  className="text-left text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessageBubble
