import React, { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Ask a question about study stress, sleep, desk stretches, or breathing...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-adjust height based on content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) {
        onSend()
      }
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-2xs p-2 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSend) onSend()
        }}
        className="flex items-end gap-2"
      >
        <label htmlFor="wellness-assistant-input" className="sr-only">
          Ask the Wellness Assistant a question
        </label>
        <textarea
          id="wellness-assistant-input"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 max-h-32 min-h-[38px] resize-none bg-transparent px-2.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden leading-relaxed"
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors shrink-0 cursor-pointer',
            canSend
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="px-2.5 pt-1.5 flex items-center justify-between text-[11px] text-gray-400">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>Static Knowledge Base</span>
      </div>
    </div>
  )
}

export default ChatInput
