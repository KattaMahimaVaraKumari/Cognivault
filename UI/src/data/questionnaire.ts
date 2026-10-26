import { Question } from '@/types/questionnaire'

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  // Section B: Academic Workload and Lifestyle
  {
    id: 'study_hours_outside_classes',
    section: 'Section B: Academic Workload and Lifestyle',
    question:
      'On a normal weekday, how many hours do you spend studying or doing academic work outside your classes?',
    type: 'single',
    options: [
      'Less than 1 hour',
      '1–2 hours',
      '2–4 hours',
      '4–6 hours',
      'More than 6 hours',
    ],
    required: true,
  },
  {
    id: 'academic_tasks_weekly',
    section: 'Section B: Academic Workload and Lifestyle',
    question:
      'In a normal week, how many assignments, projects, tests or other academic tasks do you have?',
    type: 'single',
    options: ['0–2', '3–5', '6–8', '9–12', 'More than 12'],
    required: true,
  },
  {
    id: 'perceived_academic_workload',
    section: 'Section B: Academic Workload and Lifestyle',
    question:
      'How often do you feel you have more academic work than you have time to complete?',
    type: 'single',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
    required: true,
  },
  {
    id: 'nightly_sleep_hours',
    section: 'Section B: Academic Workload and Lifestyle',
    question: 'On average, how many hours do you sleep each night?',
    type: 'single',
    options: [
      'Less than 5 hours',
      '5–6 hours',
      '6–7 hours',
      '7–8 hours',
      'More than 8 hours',
    ],
    required: true,
  },
  {
    id: 'frequency_waking_tired',
    section: 'Section B: Academic Workload and Lifestyle',
    question: 'How often do you wake up feeling tired?',
    type: 'single',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
    required: true,
  },
  {
    id: 'weekly_physical_activity',
    section: 'Section B: Academic Workload and Lifestyle',
    question:
      'How many days per week do you do physical activity or exercise for at least 30 minutes?',
    type: 'single',
    options: ['0 days', '1–2 days', '3–4 days', '5–6 days', 'Every day'],
    required: true,
  },

  // Section C: Stress, Concentration and Exhaustion
  {
    id: 'difficulty_concentrating',
    section: 'Section C: Stress, Concentration and Exhaustion',
    question:
      'How often do you find it difficult to concentrate on your studies because of stress or tiredness?',
    type: 'single',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
    required: true,
  },
  {
    id: 'mental_emotional_exhaustion',
    section: 'Section C: Stress, Concentration and Exhaustion',
    question:
      'How often do you feel mentally or emotionally exhausted because of your academic work?',
    type: 'single',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
    required: true,
  },

  // Section D: Cognivault AI Requirements
  {
    id: 'biggest_difficulty_workload',
    section: 'Section D: Cognivault AI Requirements',
    question:
      'What is the biggest difficulty you face when trying to manage your academic workload?',
    type: 'single',
    options: [
      'Managing deadlines',
      'Managing time',
      'Staying focused',
      'Maintaining a proper sleep schedule',
      'Balancing academics and personal life',
      'Staying motivated',
      'Other (please specify)',
    ],
    hasOther: true,
    required: true,
  },
  {
    id: 'stress_factors_wellbeing',
    section: 'Section D: Cognivault AI Requirements',
    question:
      'What are the main things that affect your stress or well-being as a student?',
    type: 'multi',
    instruction: 'Select all that apply',
    options: [
      'Academic workload',
      'Deadlines and exams',
      'Lack of sleep',
      'Too much screen time',
      'Lack of physical activity',
      'Lack of time for relaxation',
      'Financial concerns',
      'Personal or family issues',
      'Social or peer pressure',
      'Other (please specify)',
    ],
    hasOther: true,
    required: true,
  },
  {
    id: 'useful_cognivault_features',
    section: 'Section D: Cognivault AI Requirements',
    question: 'Which features would you find most useful in Cognivault AI?',
    type: 'multi_limit',
    maxLimit: 3,
    instruction: 'Select up to 3 options',
    options: [
      'Burnout-risk prediction',
      'Explanation of factors affecting my predicted risk',
      'Personalized suggestions',
      'What-if simulation to explore how lifestyle changes affect predicted risk',
      'Sleep and lifestyle tracking',
      'Progress and history tracking',
      'Weekly burnout-risk summary',
      'Other (please specify)',
    ],
    hasOther: true,
    required: true,
  },
  {
    id: 'high_risk_suggestions',
    section: 'Section D: Cognivault AI Requirements',
    question:
      'What types of suggestions would you find most useful when your predicted burnout risk is high?',
    type: 'multi',
    instruction: 'Select all that apply',
    options: [
      'Improve sleep',
      'Reduce screen time',
      'Increase physical activity',
      'Manage academic workload',
      'Plan study time and deadlines',
      'Take time for relaxation',
      'Other (please specify)',
    ],
    hasOther: true,
    required: true,
  },

  // Section E: Open Feedback
  {
    id: 'open_feedback_design',
    section: 'Section E: Open Feedback',
    question:
      'What feature, improvement or concern would you like us to consider when designing Cognivault AI?',
    type: 'textarea',
    placeholder: 'Write your thoughts, suggestions, or concerns here...',
    required: false,
  },
]
