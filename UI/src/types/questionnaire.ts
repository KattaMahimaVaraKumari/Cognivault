export type QuestionType = 'single' | 'multi' | 'multi_limit' | 'textarea'

export interface Question {
  id: string
  section: string
  question: string
  type: QuestionType
  options?: string[]
  maxLimit?: number
  instruction?: string
  hasOther?: boolean
  placeholder?: string
  required: boolean
}

export interface AnswerState {
  selected: string[]
  otherText?: string
  textValue?: string
}

export type QuestionnaireResponses = Record<string, AnswerState>
