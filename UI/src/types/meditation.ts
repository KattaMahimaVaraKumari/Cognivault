export type SessionTypeId = 'calm_breathing' | 'mindful_pause' | 'body_relaxation'

export interface BreathingPhase {
  name: string
  durationSec: number
  guidance: string
  action: 'inhale' | 'hold' | 'exhale' | 'pause'
  targetScale: number
}

export interface SessionConfig {
  id: SessionTypeId
  title: string
  subtitle: string
  description: string
  preparationPrompt: string
  phases: BreathingPhase[]
}
