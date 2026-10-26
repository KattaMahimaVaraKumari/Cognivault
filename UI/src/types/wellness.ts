export type RoutineCategory = 'all' | 'desk_stretches' | 'gentle_yoga' | 'movement_breaks'

export interface Routine {
  id: string
  name: string
  category: 'desk_stretches' | 'gentle_yoga' | 'movement_breaks'
  categoryLabel: string
  duration: string
  difficulty: string
  targetAreas: string[]
  instructions: string[]
  safetyReminder: string
}
