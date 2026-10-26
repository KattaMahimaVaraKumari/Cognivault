export type AssistantCategory =
  | 'stress_study'
  | 'sleep_habits'
  | 'breathing_relaxation'
  | 'physical_wellness'

export interface KnowledgeEntry {
  id: string
  title: string
  category: AssistantCategory
  categoryLabel: string
  keywords: string[]
  summary: string
  answer: string[]
  tips?: string[]
  relatedLink?: {
    path: string
    label: string
  }
  suggestedFollowups?: string[]
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  categoryLabel?: string
  tips?: string[]
  relatedLink?: {
    path: string
    label: string
  }
  suggestedFollowups?: string[]
  isCrisis?: boolean
  isFallback?: boolean
}
