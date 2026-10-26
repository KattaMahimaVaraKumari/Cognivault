import { SessionConfig } from '@/types/meditation'

export const MEDITATION_SESSIONS: SessionConfig[] = [
  {
    id: 'calm_breathing',
    title: 'Calm Breathing',
    subtitle: 'Rhythmic box breathing to regulate sympathetic nervous system tone.',
    description:
      'Balanced four-count breathwork pattern designed to ease acute study pressure and bring calm focus.',
    preparationPrompt: 'Sit comfortably with a straight yet relaxed posture. Drop your shoulders.',
    phases: [
      {
        name: 'Breathe In',
        durationSec: 4,
        guidance: 'Inhale smoothly through your nose, filling your lungs gently.',
        action: 'inhale',
        targetScale: 1.15,
      },
      {
        name: 'Hold Gently',
        durationSec: 4,
        guidance: 'Hold without straining. Keep your facial muscles soft.',
        action: 'hold',
        targetScale: 1.15,
      },
      {
        name: 'Breathe Out',
        durationSec: 4,
        guidance: 'Exhale slowly and steadily through mouth or nose.',
        action: 'exhale',
        targetScale: 1.0,
      },
      {
        name: 'Relax and Pause',
        durationSec: 4,
        guidance: 'Rest at empty lungs, feeling settled and supported.',
        action: 'pause',
        targetScale: 1.0,
      },
    ],
  },
  {
    id: 'mindful_pause',
    title: 'Mindful Pause',
    subtitle: 'Open awareness and gentle extended exhales for cognitive resets.',
    description:
      'A flexible mindfulness pacing session focused on unhooking from racing study thoughts and restoring sensory grounding.',
    preparationPrompt: 'Rest both feet flat on the floor. Allow your eyes to soften or close.',
    phases: [
      {
        name: 'Breathe In',
        durationSec: 4,
        guidance: 'Notice the sensation of cool air entering as you breathe in naturally.',
        action: 'inhale',
        targetScale: 1.12,
      },
      {
        name: 'Hold Gently',
        durationSec: 2,
        guidance: 'A brief, effortless pause. Savor this quiet moment.',
        action: 'hold',
        targetScale: 1.12,
      },
      {
        name: 'Breathe Out',
        durationSec: 6,
        guidance: 'Long, soft exhale. Let distracting cognitive chatter float away.',
        action: 'exhale',
        targetScale: 1.0,
      },
      {
        name: 'Relax and Pause',
        durationSec: 2,
        guidance: 'Notice the stillness around you before the next breath.',
        action: 'pause',
        targetScale: 1.0,
      },
    ],
  },
  {
    id: 'body_relaxation',
    title: 'Body Relaxation',
    subtitle: 'Somatic sigh breathwork to release physical tension in neck and back.',
    description:
      'Extended recovery breathing combining deep chest opening with elongated sighs to relieve physical fatigue from desk posture.',
    preparationPrompt: 'Unclench your jaw, soften your eyelids, and let your hands rest in your lap.',
    phases: [
      {
        name: 'Breathe In',
        durationSec: 4,
        guidance: 'Take a deep breath in, letting your belly and chest expand.',
        action: 'inhale',
        targetScale: 1.18,
      },
      {
        name: 'Hold Gently',
        durationSec: 2,
        guidance: 'Soft retention. Notice any lingering neck or shoulder stiffness.',
        action: 'hold',
        targetScale: 1.18,
      },
      {
        name: 'Breathe Out',
        durationSec: 7,
        guidance: 'Slow, full sigh out. Imagine physical heaviness draining away.',
        action: 'exhale',
        targetScale: 1.0,
      },
      {
        name: 'Relax and Pause',
        durationSec: 3,
        guidance: 'Feel the relaxation sink through your upper back and arms.',
        action: 'pause',
        targetScale: 1.0,
      },
    ],
  },
]
