import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, User, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'
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
      <div className="flex justify-end gap-3 items-end pl-8 sm:pl-16">
        <div className="flex flex-col items-end max-w-xl">
          <div className="rounded-2xl rounded-br-xs bg-gradient-to-r from-[#f87d9f] via-[#f0507e] to-[#dc2b60] text-white px-5 py-3 text-sm leading-relaxed shadow-sm shadow-[#f0507e]/20 font-medium">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <span className="text-[11px] text-[#9c7886] mt-1 px-1">{message.timestamp}</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f87d9f] to-[#e0567b] text-white flex items-center justify-center shrink-0 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start gap-3 items-start pr-4 sm:pr-12">
      <div
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm',
          message.isCrisis
            ? 'bg-[#e11d48] text-white'
            : 'bg-[#fff0f4] border border-[#fcaec2] text-[#c0385c]'
        )}
      >
        {message.isCrisis ? (
          <ShieldAlert className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      <div
        className={cn(
          'flex flex-col max-w-2xl w-full rounded-2xl rounded-tl-xs glass-panel p-5 shadow-sm space-y-3.5 transition-all border',
          message.isCrisis
            ? 'border-rose-200 bg-rose-50/50'
            : message.isFallback
              ? 'border-[#fed5df] bg-white/75'
              : 'border-[#ffdce4]/90 bg-white/85'
        )}
      >
        {/* Header metadata */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2d1b24]">
              {message.isCrisis ? 'Crisis Support Notice' : 'Cognivault Guide'}
            </span>
            {message.categoryLabel && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c1d3c] bg-[#fff0f4] px-2.5 py-0.5 rounded-full border border-[#fcaec2]/70">
                {message.categoryLabel}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#9c7886]">{message.timestamp}</span>
        </div>

        {/* Primary Message Body */}
        <div className="text-sm text-[#38262f] leading-relaxed space-y-2 whitespace-pre-wrap font-normal">
          {message.text}
        </div>

        {/* Key Tips or Guidance Points */}
        {message.tips && message.tips.length > 0 && (
          <div
            className={cn(
              'p-4 rounded-xl border text-xs space-y-2 shadow-2xs',
              message.isCrisis
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-white/85 border-[#fed5df] text-[#4b353f]'
            )}
          >
            <div className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-[#3b121e]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#e0567b]" />
              <span>{message.isCrisis ? 'Emergency Resources' : 'Key Recommendations'}</span>
            </div>
            <ul className="space-y-1.5 list-disc list-outside pl-4 leading-relaxed font-normal">
              {message.tips.map((tip, idx) => (
                <li key={idx} className="pl-0.5">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Module Quick Link */}
        {message.relatedLink && (
          <div className="pt-1">
            <Link
              to={message.relatedLink.path}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#b83b5e] hover:text-[#8c1d3c] p-2.5 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/60 hover:bg-[#ffe4ec] transition-colors"
            >
              <span>{message.relatedLink.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Follow-up question suggestion chips */}
        {message.suggestedFollowups && message.suggestedFollowups.length > 0 && (
          <div className="pt-2 border-t border-[#ffeef2] space-y-2">
            <span className="text-[11px] font-semibold text-[#8a6874]">
              Follow-up reflections:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedFollowups.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggestion?.(q)}
                  className="text-left text-xs px-3 py-1.5 rounded-xl border border-[#fed5df] bg-white/70 hover:bg-[#fff0f4] hover:border-[#fcaec2] hover:text-[#8c1d3c] text-[#553b46] font-medium transition-all shadow-2xs cursor-pointer"
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
