import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import { ChatMessage } from '@/types/assistant'
import {
  searchKnowledgeBase,
  SUGGESTED_QUESTIONS,
  CRISIS_RESPONSE,
  FALLBACK_MESSAGE,
} from '@/data/wellnessAssistant'
import { ChatMessageBubble } from '@/components/assistant/ChatMessageBubble'
import { SuggestedQuestions } from '@/components/assistant/SuggestedQuestions'
import { ChatInput } from '@/components/assistant/ChatInput'

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-message',
  sender: 'assistant',
  text: "Welcome to the Cognivault AI Wellness Assistant. I am a static educational guide designed to help you explore healthy study habits, desk ergonomics, sleep hygiene, and guided breathing exercises.\n\nYou can ask a question in the box below or choose any of the suggested topics to begin.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  categoryLabel: 'Welcome Guide',
  tips: [
    'Stress & Study Habits: Exam tension, taking proper breaks, and workload prioritization.',
    'Breathing & Relaxation: 4-4-4-4 box breathing, sensory grounding, and somatic sighs.',
    'Physical Wellness: Desk stretches for neck and shoulders, gentle yoga, and movement breaks.',
    'Sleep & Daily Routines: Evening screen management and sustainable daily wellness habits.',
  ],
  suggestedFollowups: SUGGESTED_QUESTIONS,
}

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom smoothly when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Process question through static knowledge base
  const handleSendMessage = (textToSend?: string) => {
    const rawQuery = (textToSend ?? inputValue).trim()
    if (!rawQuery) return

    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    // 1. Add User Message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawQuery,
      timestamp: currentTime,
    }

    // 2. Search Static Knowledge Base
    const searchResult = searchKnowledgeBase(rawQuery)
    let assistantResponse: ChatMessage

    if (searchResult.isCrisis) {
      assistantResponse = {
        ...CRISIS_RESPONSE,
        id: `assistant-${Date.now()}`,
        timestamp: currentTime,
      }
    } else if (searchResult.match) {
      const entry = searchResult.match
      assistantResponse = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: entry.answer.join('\n\n'),
        timestamp: currentTime,
        categoryLabel: entry.categoryLabel,
        tips: entry.tips,
        relatedLink: entry.relatedLink,
        suggestedFollowups: entry.suggestedFollowups,
      }
    } else {
      assistantResponse = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: FALLBACK_MESSAGE.text,
        timestamp: currentTime,
        categoryLabel: 'Search Guidance',
        isFallback: true,
        tips: FALLBACK_MESSAGE.tips,
        suggestedFollowups: FALLBACK_MESSAGE.suggestedFollowups,
      }
    }

    setMessages((prev) => [...prev, userMessage, assistantResponse])
    if (!textToSend) {
      setInputValue('')
    }
  }

  const handleResetConversation = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInputValue('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header & Page Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Static Knowledge Base</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Wellness Assistant
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Search curated guidance on study pressure, desk ergonomics, sleep routines, and breathing techniques. All answers are derived directly from verified local wellness routines.
          </p>
        </div>

        {/* Clear / Reset Conversation */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleResetConversation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors shadow-2xs cursor-pointer"
            title="Reset conversation back to start"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Top Suggested Prompts Ribbon */}
      <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2.5">
        <SuggestedQuestions
          questions={SUGGESTED_QUESTIONS}
          onSelect={(q) => handleSendMessage(q)}
          label="Common questions to explore"
        />
      </div>

      {/* 3. Conversation Messages Area */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xs min-h-[380px] max-h-[620px] overflow-y-auto flex flex-col space-y-5">
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            onSelectSuggestion={(q) => handleSendMessage(q)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Input Form */}
      <div className="space-y-3">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => handleSendMessage()}
          placeholder="Ask about study stress, sleep habits, desk stretches, or breathing exercises..."
        />

        {/* 5. Non-clinical Educational Safety Disclaimer */}
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/70 text-xs text-gray-500">
          <ShieldAlert className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-gray-700">Educational Notice:</strong> This assistant provides static educational information about study habits and wellness routines. It does not provide clinical diagnosis, risk scores, therapy, or medical advice. If you are experiencing an emergency or acute mental health distress, please contact emergency services or a crisis helpline immediately.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AssistantPage
