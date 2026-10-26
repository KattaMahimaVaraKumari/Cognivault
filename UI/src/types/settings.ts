export type TextSizePreference = 'normal' | 'large'

export type PreferredBreathingType =
  | 'calm_breathing'
  | 'mindful_pause'
  | 'body_relaxation'

export type PreferredWellnessCategory =
  | 'all'
  | 'desk_stretches'
  | 'gentle_yoga'
  | 'movement_breaks'

export interface AppSettings {
  theme: 'clean_white'
  textSize: TextSizePreference
  reduceMotion: boolean
  defaultMeditationDuration: number
  defaultBreathingType: PreferredBreathingType
  defaultWellnessCategory: PreferredWellnessCategory
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'clean_white',
  textSize: 'normal',
  reduceMotion: false,
  defaultMeditationDuration: 3,
  defaultBreathingType: 'calm_breathing',
  defaultWellnessCategory: 'all',
}
