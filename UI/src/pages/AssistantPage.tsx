import React, { useState, useRef, useEffect } from 'react'
import {
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Layers,
  MessageSquare,
  Compass,
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
import { AssistantWall } from '@/components/ui/assistant-wall'

const COGNIVAULT_WALL_MESSAGES = [
  "Hey student,\nready for your study reset?\nLet's pace yourself.",
  "Exam pressure feeling heavy?\nTake 3 deep box breaths\nand ease the tension.",
  "Physical neck stiffness?\nI have gentle desk stretches\nto release shoulder strain.",
  "Your burnout check-in\nis ready to review.\nStay proactive.",
  "Sustainable study pacing\nis key to high retention\nand clear focus.",
  "Take a 5-minute walk break;\nyour eyes and posture\nwill thank you.",
  "Late-night study sprint?\nRemember to hydrate\nand dim bright screens.",
  "Cognitive fatigue sets in\nafter 50 minutes of focus.\nStep back for a brief pause.",
  "Notice tension in your jaw?\nDrop your shoulders down\nand take a slow exhale.",
]

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-message',
  sender: 'assistant',
  text: "Welcome to the Cognivault AI Wellness Assistant. I am your educational guide for study habit ergonomics, stress management, sleep wind-down techniques, and restorative breathing pauses.\n\nType a question below, select one of the suggested prompts, or click any card on the Assistant Wall above to start a conversation.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  categoryLabel: 'Welcome Guide',
  tips: [
    'Stress & Study Habits: Exam tension, taking structured breaks, and workload triage.',
    'Breathing & Relaxation: 4-4-4-4 box breathing, sensory grounding, and somatic sighs.',
    'Physical Wellness: Desk stretches for neck and shoulders, gentle yoga, and movement breaks.',
    'Sleep & Daily Routines: Evening screen management and sustainable daily wellness habits.',
  ],
  suggestedFollowups: SUGGESTED_QUESTIONS,
}

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isWallCollapsed, setIsWallCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatSectionRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (textToSend?: string) => {
    const rawQuery = (textToSend ?? inputValue).trim()
    if (!rawQuery) return

    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawQuery,
      timestamp: currentTime,
    }

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
    setInputValue('')
  }

  const handleWallCardSelect = (_index: number, message: string) => {
    // Clean formatted card text for chat query
    const cleanQuery = message.replace(/\n/g, ' ')
    handleSendMessage(cleanQuery)
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInputValue('')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ffdce4]/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-semibold uppercase tracking-wider text-[#8c1d3c] shadow-2xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#e0567b]" />
            <span>Interactive Dialogue & Ambient Prompts</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2d1b24]">
            Wellness Assistant
          </h1>

          <p className="text-xs sm:text-sm text-[#735562] max-w-xl font-normal leading-relaxed">
            Reflective guidance for student stress, study burnout pacing, and daily habit resets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsWallCollapsed((prev) => !prev)}
            className="btn-wellness-secondary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer"
            title={isWallCollapsed ? 'Show ambient Assistant Wall' : 'Collapse ambient Assistant Wall'}
          >
            <Layers className="w-3.5 h-3.5 text-[#e0567b]" />
            <span>{isWallCollapsed ? 'Show Wall' : 'Hide Wall'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="btn-wellness-secondary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8a6874]" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Educational Notice Banner */}
      <div className="glass-panel p-4 flex items-start gap-3 text-xs text-[#735562] border border-[#ffdce4]/90">
        <ShieldAlert className="w-4 h-4 text-[#e0567b] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-normal">
          This assistant provides evidence-backed lifestyle suggestions. It is not an emergency hotline or medical diagnosis tool. If in acute crisis, please contact your university health center or local crisis lifeline.
        </p>
      </div>

      {/* 3. Assistant Wall Showcase Section in Baby-Pink Pastel Glass Theme */}
      {!isWallCollapsed && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#e0567b]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#3b121e]">
                Assistant Wall • Wellness Signals
              </h2>
            </div>
            <span className="text-[11px] font-medium text-[#9c7886]">
              Click any card to explore in chat
            </span>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#ffdce4] ring-1 ring-white/60 h-[380px] sm:h-[430px] w-full">
            <AssistantWall
              messages={COGNIVAULT_WALL_MESSAGES}
              badge="cognivault"
              placeholder="Ask about burnout or study balance..."
              background="#fff2f5"
              glow="#ffc2d1"
              haze="#f7a6bc"
              glass="#fff7f9"
              accent="#e0567b"
              text="#3b121e"
              onSelect={handleWallCardSelect}
              interval={8}
              speed={1}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </section>
      )}

      {/* 4. Interactive Chat Conversation Panel */}
      <section ref={chatSectionRef} className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <MessageSquare className="w-4 h-4 text-[#e0567b]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#3b121e]">
            Conversation Thread
          </h2>
        </div>

        <div className="glass-panel p-4 sm:p-6 min-h-[460px] flex flex-col justify-between space-y-6 border border-[#ffdce4]/90">
          <div className="space-y-6 overflow-y-auto max-h-[520px] pr-2">
            {messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                onSelectSuggestion={(q) => handleSendMessage(q)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar & Suggested Questions */}
          <div className="space-y-4 pt-4 border-t border-[#ffeef2]">
            <SuggestedQuestions
              questions={SUGGESTED_QUESTIONS.slice(0, 3)}
              onSelect={(q) => handleSendMessage(q)}
            />

            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={() => handleSendMessage()}
              placeholder="Ask about study strain, sleep wind-down, breathing, or desk stretches..."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default AssistantPage
