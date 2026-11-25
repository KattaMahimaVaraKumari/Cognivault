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
    <div className="rounded-2xl glass-panel p-2 shadow-sm border border-[#ffdce4]/90 focus-within:ring-2 focus-within:ring-[#fcaec2]/60 focus-within:border-[#f0507e] transition-all">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSend) onSend()
        }}
        className="flex items-end gap-2"
      >
        <label htmlFor="wellness-assistant-input" className="sr-only">
          Ask assistant
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
          className="flex-1 max-h-32 resize-none bg-transparent px-3 py-2 text-sm text-[#2d1b24] placeholder:text-[#9f7988] focus:outline-hidden leading-relaxed font-normal"
        />

        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer',
            canSend
              ? 'btn-wellness-primary shadow-sm'
              : 'bg-[#ffeef2] text-[#c9a7b2] cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

export default ChatInput
