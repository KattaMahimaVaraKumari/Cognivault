import type { KnowledgeEntry, ChatMessage } from '@/types/assistant'

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ─── STRESS AND STUDY HABITS ────────────────────────────────────────────────
  {
    id: 'study_stress_general',
    title: 'How can I manage study stress?',
    category: 'stress_study',
    categoryLabel: 'Stress & Study Habits',
    keywords: [
      'manage',
      'study',
      'stress',
      'pressure',
      'overwhelmed',
      'exam',
      'anxiety',
      'academic',
      'coping',
      'student',
    ],
    summary:
      'Manage study stress by breaking large goals into bite-sized tasks, respecting mental recovery windows, and using paced breathwork.',
    answer: [
      'Academic pressure builds up when expectations exceed cognitive recovery time. Rather than trying to eliminate all tension, aim to create predictable boundaries around your work.',
      'Begin by prioritizing just two or three high-impact tasks each morning using the "Rule of Three". When large assignments feel overwhelming, reduce the initial commitment to a single 25-minute focused interval.',
      'Remember that rest is an active part of consolidation, not a reward you have to earn. Stepping away for intentional breathing or movement lowers baseline sympathetic arousal and restores working memory.',
    ],
    tips: [
      'Write down all tasks in an external notebook to relieve cognitive load.',
      'Use the 4-4-4-4 Calm Breathing exercise whenever heart rate or mental pressure spikes.',
      'Schedule a non-negotiable shutdown time every evening to decouple from coursework.',
    ],
    relatedLink: {
      path: '/meditation',
      label: 'Open Calm Breathing Timer',
    },
    suggestedFollowups: [
      'How do I take a proper study break?',
      'How can I manage academic workload and deadlines?',
      'What are the common signs of stress and exhaustion?',
    ],
  },
  {
    id: 'stress_signs',
    title: 'What are the common signs of stress and exhaustion?',
    category: 'stress_study',
    categoryLabel: 'Stress & Study Habits',
    keywords: [
      'signs',
      'symptoms',
      'stress',
      'exhaustion',
      'exhausted',
      'burnout',
      'burned out',
      'burnt out',
      'fatigue',
      'tired',
      'warning',
      'irritability',
      'brain fog',
      'overworked',
    ],
    summary:
      'Recognizing subtle early indicators—such as brain fog, persistent muscle tightness, disrupted sleep, or cynicism—helps you course-correct before reaching deep burnout.',
    answer: [
      'Stress rarely appears suddenly; it typically accumulates through physical, cognitive, and emotional cues that indicate your recovery system is strained.',
      'Common cognitive signs include difficulty concentrating, rereading the same paragraph repeatedly, chronic procrastination, and decision fatigue.',
      'Physical signals often present as shallow upper-chest breathing, tension headaches, clenched jaws, and tight shoulder traps.',
      'Emotionally, you may notice reduced patience, cynicism toward subjects you previously enjoyed, or a feeling of constant hurry even during downtime.',
    ],
    tips: [
      'Track subtle warning signs using our 10-question Stress Prediction check-in.',
      'Do a 60-second physical body scan twice daily to notice clenching or jaw tension.',
      'If you notice 3+ signs for over two weeks, actively scale back optional commitments.',
    ],
    relatedLink: {
      path: '/prediction',
      label: 'Take Stress Prediction Questionnaire',
    },
    suggestedFollowups: [
      'How can I balance study and personal time?',
      'What stretches can I do at my desk?',
      'How do I take a proper study break?',
    ],
  },
  {
    id: 'workload_deadlines',
    title: 'How can I manage academic workload and deadlines?',
    category: 'stress_study',
    categoryLabel: 'Stress & Study Habits',
    keywords: [
      'workload',
      'deadline',
      'deadlines',
      'assignments',
      'time management',
      'organize',
      'planning',
      'prioritize',
      'due date',
      'procrastination',
    ],
    summary:
      'Deconstruct long assignments into micro-deliverables, estimate effort realistically, and use structured time-blocking to mitigate deadline panic.',
    answer: [
      'Procrastination and deadline panic often stem from ambiguity rather than laziness. When an assignment prompt is broad, the brain registers it as a threat and resists starting.',
      'Break large projects into low-friction micro-milestones (e.g., "Find 3 source papers" or "Draft a 150-word outline bullet list") rather than "Write 10-page report".',
      'Work backwards from the final submission date and schedule milestones with a 48-hour buffer to absorb unexpected delays or revisions.',
    ],
    tips: [
      'Implement the "Two-Minute Rule": if an academic task takes under 2 minutes, do it immediately.',
      'Group similar administrative tasks (emails, formatting citations) into a single batch.',
      'Protect your peak mental energy hours for primary conceptual work, not busywork.',
    ],
    suggestedFollowups: [
      'How do I stay focused during study sessions?',
      'How can I balance study and personal time?',
      'How do I take a proper study break?',
    ],
  },
  {
    id: 'study_breaks',
    title: 'How do I take a proper study break?',
    category: 'stress_study',
    categoryLabel: 'Stress & Study Habits',
    keywords: [
      'study break',
      'study breaks',
      'proper break',
      'effective break',
      'pause',
      'pomodoro',
      'interval',
      'rest',
      'recharge',
      'refresh',
    ],
    summary:
      'True cognitive breaks require stepping away from screens and desk posture, engaging sensory awareness, and allowing your default mode network to consolidate learning.',
    answer: [
      'Scrolling social media, reading news, or watching videos on the same screen does not constitute a true mental rest. It continues to tax visual and cognitive processing circuits.',
      'An effective study break changes your posture, shifts optical focal distance, and lowers physiological stimulation.',
      'A proven framework is the 50/10 cadence (50 minutes of deep focus followed by 10 minutes of active reset) or the classic 25/5 Pomodoro rhythm.',
    ],
    tips: [
      'Practice the 20-20-20 visual rule: every 20 minutes, gaze at an object 20 feet away for 20 seconds.',
      'Spend your break drinking a glass of cool water and stretching your calves and chest.',
      'Step outdoors or look through a window to expose eyes to natural daylight.',
    ],
    relatedLink: {
      path: '/physical-wellness',
      label: 'Explore 2-Minute Movement Breaks',
    },
    suggestedFollowups: [
      'What stretches can I do at my desk?',
      'How do I stay focused during study sessions?',
      'How can I build a better sleep routine?',
    ],
  },
  {
    id: 'focus_sessions',
    title: 'How do I stay focused during study sessions?',
    category: 'stress_study',
    categoryLabel: 'Stress & Study Habits',
    keywords: [
      'focus',
      'concentration',
      'distraction',
      'attention',
      'deep work',
      'stay focused',
      'phone',
      'social media',
      'multitasking',
    ],
    summary:
      'Protect sustained concentration by removing digital friction, defining single-task objectives, and creating a ritualized study environment.',
    answer: [
      'Focus is not an innate trait; it is an environment-dependent state. Every notification and browser tab creates cognitive residue that degrades memory retention.',
      'Before opening books or code editors, write down the single question or section you will solve in that block. Keep scratch paper nearby to jot down intrusive thoughts without acting on them.',
      'Set your smartphone in another room or inside a drawer. Research demonstrates that simply having a phone visible on your desk decreases working memory capacity.',
    ],
    tips: [
      'Close all unrelated tabs before beginning a work sprint.',
      'Put on noise-cancelling headphones or neutral low-fidelity ambient audio.',
      'Before sitting down, practice a 60-second Mindful Pause to transition into deep focus.',
    ],
    relatedLink: {
      path: '/meditation',
      label: 'Start Mindful Pause Focus Reset',
    },
    suggestedFollowups: [
      'How do I take a proper study break?',
      'How can I manage academic workload and deadlines?',
      'How can I manage study stress?',
    ],
  },
  {
    id: 'work_life_balance',
    title: 'How can I balance study and personal time?',
    category: 'stress_study',
    categoryLabel: 'Stress & Study Habits',
    keywords: [
      'balance',
      'personal time',
      'social life',
      'hobbies',
      'guilt',
      'study life balance',
      'boundaries',
      'burnout',
      'overworking',
    ],
    summary:
      'Establish firm time boundaries, schedule leisure with the same commitment as classes, and abandon the guilt associated with non-academic activities.',
    answer: [
      'Students frequently suffer from "perpetual study guilt"—feeling anxious about not studying when relaxing, and feeling exhausted when attempting to work.',
      'The remedy is clear separation. Define a designated end-of-study ritual every evening (such as closing books, packing your backpack, and closing browser tabs). Once completed, study time is over.',
      'Treat sleep, exercise, social connection, and personal hobbies as foundational prerequisites for high cognitive performance, not as luxury rewards.',
    ],
    tips: [
      'Designate at least one full half-day or evening per week completely free from academic work.',
      'Plan social activities in advance so you have scheduled commitments that pull you away from your desk.',
      'Acknowledge that 4 hours of focused study outperforms 8 hours of distracted, half-hearted work.',
    ],
    suggestedFollowups: [
      'How can I build a better sleep routine?',
      'What are the common signs of stress and exhaustion?',
      'How do I take a proper study break?',
    ],
  },

  // ─── SLEEP AND EVERYDAY WELL-BEING ──────────────────────────────────────────
  {
    id: 'sleep_routine',
    title: 'How can I build a better sleep routine?',
    category: 'sleep_habits',
    categoryLabel: 'Sleep & Everyday Well-Being',
    keywords: [
      'sleep',
      'bedtime',
      'insomnia',
      'routine',
      'circadian',
      'rest',
      'wake up',
      'night',
      'sleep hygiene',
      'tired',
    ],
    summary:
      'Anchor your circadian rhythm by waking up at a consistent time, getting morning daylight, and keeping your sleep environment cool, quiet, and dark.',
    answer: [
      'Sleep is the primary biological driver of memory consolidation, emotional resilience, and neuro-immune restoration. Pulling all-nighters significantly impairs exam retention.',
      'The single most powerful lever is maintaining a consistent wake-up time 7 days a week, regardless of when you fell asleep. This anchors your body clock and builds natural sleep pressure by evening.',
      'Keep your bedroom temperature between 18°C and 20°C (65°F to 68°F), as body temperature must drop by 1°C to initiate restful non-REM sleep.',
    ],
    tips: [
      'Get 10–15 minutes of natural sunlight within an hour of waking to set cortisol rhythms.',
      'Avoid caffeine after 2:00 PM; caffeine has an average half-life of 5 to 7 hours.',
      'Perform a 3-minute Body Relaxation breathing session before lying down.',
    ],
    relatedLink: {
      path: '/meditation',
      label: 'Practice Body Relaxation Session',
    },
    suggestedFollowups: [
      'How should I manage screen time before bed?',
      'How can I establish sustainable daily habits?',
      'How can I manage study stress?',
    ],
  },
  {
    id: 'screen_time_bed',
    title: 'How should I manage screen time before bed?',
    category: 'sleep_habits',
    categoryLabel: 'Sleep & Everyday Well-Being',
    keywords: [
      'screen',
      'phone',
      'blue light',
      'bedtime',
      'night',
      'laptop',
      'scrolling',
      'social media',
      'melatonin',
      'screen time',
    ],
    summary:
      'Minimize blue light and cognitive stimulation for 45–60 minutes before sleeping to allow natural melatonin secretion and calm nervous system arousal.',
    answer: [
      'Digital screens disrupt sleep through two distinct mechanisms: physiological blue-spectrum photon exposure (which suppresses pineal melatonin secretion) and psychological arousal (doomscrolling, interactive messages, or academic emails).',
      'To promote deep sleep, institute a digital wind-down buffer 45 to 60 minutes before sleep. Switch to warm, dim ambient lighting in your living space.',
      'Replace late-night phone habits with low-stimulation alternatives such as reading physical books, listening to calm audio, or doing light gentle stretching.',
    ],
    tips: [
      'Charge your phone across the room or outside your sleeping quarters.',
      'Enable night-shift warm color modes on all study monitors starting at sunset.',
      'Replace screen scrolling with a 5-minute Child’s Pose or gentle seated twist.',
    ],
    relatedLink: {
      path: '/physical-wellness',
      label: 'View Evening Gentle Yoga Poses',
    },
    suggestedFollowups: [
      'How can I build a better sleep routine?',
      'How can I establish sustainable daily habits?',
      'What stretches can I do at my desk?',
    ],
  },
  {
    id: 'sustainable_habits',
    title: 'How can I establish sustainable daily habits?',
    category: 'sleep_habits',
    categoryLabel: 'Sleep & Everyday Well-Being',
    keywords: [
      'habits',
      'routine',
      'consistency',
      'lifestyle',
      'discipline',
      'sustainable',
      'daily routine',
      'atomic habits',
      'motivation',
    ],
    summary:
      'Build enduring wellness routines by habit-stacking onto existing behaviors, starting ridiculously small, and focusing on consistency over intensity.',
    answer: [
      'Ambitious overhauls (like promising to meditate 60 minutes and run 5 miles daily during exam season) almost always collapse under stress.',
      'Instead, rely on "micro-commitments": commit to just 2 minutes of desk stretching right after finishing your morning coffee, or 3 cycles of box breathing when you boot up your laptop.',
      'When an action is so brief that it requires minimal willpower, you develop behavioral momentum that survives heavy academic workloads.',
    ],
    tips: [
      'Use Habit Stacking: "After [Current Habit], I will [New 2-Minute Wellness Habit]".',
      'Track your habit completions on our My Progress dashboard to visualize consistency.',
      'Never miss twice: if a hectic day disrupts your routine, resume immediately the next day.',
    ],
    relatedLink: {
      path: '/progress',
      label: 'Check My Progress Dashboard',
    },
    suggestedFollowups: [
      'How can I build a better sleep routine?',
      'What stretches can I do at my desk?',
      'How do I take a proper study break?',
    ],
  },

  // ─── BREATHING AND RELAXATION ───────────────────────────────────────────────
  {
    id: 'start_breathing',
    title: 'Guide me through a short breathing exercise.',
    category: 'breathing_relaxation',
    categoryLabel: 'Breathing & Relaxation',
    keywords: [
      'guide',
      'breathing',
      'exercise',
      'breathwork',
      'box breathing',
      'calm breathing',
      'inhale',
      'exhale',
      'paced',
      'heart rate',
    ],
    summary:
      'Learn the 4-4-4-4 Calm Breathing (Box Breathing) protocol to rapidly stabilize nervous system arousal and steady your focus.',
    answer: [
      'Box breathing is a clinically validated autonomic regulator used by emergency responders and performers to modulate acute sympathetic fight-or-flight spikes.',
      'Sit comfortably upright with your feet planted flat on the floor and your shoulders dropped away from your ears. Rest one hand on your lower belly.',
      'Follow the four equal sides of the breath cycle:',
      '1. Inhale smoothly through your nose for 4 seconds, feeling your belly expand.',
      '2. Hold gently for 4 seconds without straining your throat or face.',
      '3. Exhale steadily through your nose or mouth for 4 seconds.',
      '4. Pause at empty lungs for 4 seconds, feeling quiet and settled.',
      'Repeat this cycle 4 to 6 times (about 2 minutes) whenever you feel your thoughts racing.',
    ],
    tips: [
      'Use the interactive circular visual timer on our Meditation page to synchronize your pace.',
      'Keep your jaw relaxed and avoid holding your breath with tension.',
      'Focus your attention on the cool air entering your nostrils on the inhale.',
    ],
    relatedLink: {
      path: '/meditation',
      label: 'Open Interactive Breathing Timer',
    },
    suggestedFollowups: [
      'When should I use a short mindful pause?',
      'What are simple relaxation practices for body tension?',
      'How can I manage study stress?',
    ],
  },
  {
    id: 'mindful_pause',
    title: 'When should I use a short mindful pause?',
    category: 'breathing_relaxation',
    categoryLabel: 'Breathing & Relaxation',
    keywords: [
      'mindful pause',
      'mindfulness',
      'sensory',
      'grounding',
      'transition',
      'pause',
      'reset',
      'overwhelmed',
      'scattered',
    ],
    summary:
      'Use a 60–90 second Mindful Pause during task transitions, before exams, or whenever your mind feels scattered and caught in cognitive chatter.',
    answer: [
      'A Mindful Pause is an immediate sensory grounding practice designed to break habitual mental rumination and anchor your awareness in the present moment.',
      'Ideal times to practice include:',
      '• Right before starting a high-stakes exam or study sprint.',
      '• During the transition between two disparate academic subjects.',
      '• When you notice yourself reading the same sentence multiple times without absorbing it.',
      '• After receiving a stressful academic email or grade notification.',
      'Our Mindful Pause session pairs a 4-second inhalation with an extended 6-second exhalation to trigger the vagus nerve and downregulate heart rate.',
    ],
    tips: [
      'Ground yourself with the 5-4-3-2-1 technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
      'Let your eyes soften or close to minimize visual distractions.',
    ],
    relatedLink: {
      path: '/meditation',
      label: 'Launch Mindful Pause Session',
    },
    suggestedFollowups: [
      'Guide me through a short breathing exercise.',
      'What are simple relaxation practices for body tension?',
      'How do I take a proper study break?',
    ],
  },
  {
    id: 'relaxation_practices',
    title: 'What are simple relaxation practices for body tension?',
    category: 'breathing_relaxation',
    categoryLabel: 'Breathing & Relaxation',
    keywords: [
      'relaxation',
      'body tension',
      'practices',
      'tension',
      'somatic',
      'sigh',
      'progressive',
      'tightness',
      'shoulders',
      'jaw',
    ],
    summary:
      'Combine somatic physiological sighs (4s in, 2s hold, 7s out) with progressive muscle unclamping to systematically release physical stress held in your neck and torso.',
    answer: [
      'Under continuous academic stress, the body reflexively clenches the suboccipital neck muscles, traps, jaw, and abdominal wall.',
      'The Physiological Sigh is nature\'s fastest biological reset: take two sharp inhalations through the nose, followed by one long, slow vocalized sigh out through the mouth.',
      'You can pair this with Progressive Tension Release: systematically clench your fists and shoulders for 5 seconds, then deliberately let them drop completely limp for 15 seconds.',
    ],
    tips: [
      'Check your teeth right now: are your upper and lower teeth touching? If so, drop your jaw slightly.',
      'Take 3 physiological sighs before commencing desk work.',
      'Use our 3-minute Body Relaxation timer on the Meditation page.',
    ],
    relatedLink: {
      path: '/meditation',
      label: 'Start Body Relaxation Routine',
    },
    suggestedFollowups: [
      'What stretches can I do at my desk?',
      'Guide me through a short breathing exercise.',
      'What are the common signs of stress and exhaustion?',
    ],
  },

  // ─── PHYSICAL WELLNESS ──────────────────────────────────────────────────────
  {
    id: 'desk_stretches',
    title: 'What stretches can I do at my desk?',
    category: 'physical_wellness',
    categoryLabel: 'Physical Wellness',
    keywords: [
      'stretches',
      'desk',
      'neck',
      'shoulder',
      'wrist',
      'forearm',
      'upper back',
      'sitting',
      'chair',
      'desk stretches',
    ],
    summary:
      'Perform four quick seated desk routines: Gentle Neck Movement, Shoulder Rolls, Wrist and Forearm Stretches, and the Upper-Back Stretch.',
    answer: [
      'You don\'t need gym clothes or special equipment to prevent desk stiffness. Our Physical Wellness module features 4 targeted desk routines:',
      '1. Gentle Neck Movement: Sit tall, relax shoulders down, and slowly lower right ear toward right shoulder for 15s. Repeat on the left side to relieve cervical spine strain.',
      '2. Shoulder Rolls: Inhale as you shrug shoulders to ears, roll backward and down for 5–8 slow circles. Reverse to open tight pectoral muscles.',
      '3. Wrist & Forearm Stretches: Extend arm forward, palm facing away, gently draw fingers back with opposite hand for 15–20s. Flip palm down to stretch extensors. Essential for heavy typing.',
      '4. Upper-Back Stretch: Interlace fingers in front of your chest, turn palms outward, and push forward while rounding your upper thoracic spine.',
    ],
    tips: [
      'Never bounce or jerk during a stretch; hold steady and breathe evenly.',
      'Do one 45-second routine every time you finish reading a chapter or paper.',
      'Mark routines completed on the Physical Wellness page to track daily habits.',
    ],
    relatedLink: {
      path: '/physical-wellness',
      label: 'Open Desk Stretches Module',
    },
    suggestedFollowups: [
      'What gentle yoga routines can I try?',
      'How do I take effective movement breaks?',
      'How do I take a proper study break?',
    ],
  },
  {
    id: 'gentle_yoga',
    title: 'What gentle yoga routines can I try?',
    category: 'physical_wellness',
    categoryLabel: 'Physical Wellness',
    keywords: [
      'yoga',
      'gentle yoga',
      'cat cow',
      'child pose',
      'seated twist',
      'mountain pose',
      'poses',
      'mat',
      'spine',
      'flexibility',
    ],
    summary:
      'Practice gentle grounding yoga postures: Cat–Cow for spinal flexibility, Child\'s Pose for restorative decompression, Seated Twist for torso mobility, and Mountain Pose for posture.',
    answer: [
      'Gentle yoga helps re-establish mind-body connection when you spend hours lost in abstract textbook thinking. The app features 4 accessible postures:',
      '• Cat–Cow: On hands and knees, flow between dropping the belly on inhalation (Cow) and arching the spine upward on exhalation (Cat). Loosens the entire vertebral column.',
      '• Child\'s Pose: Kneel on your mat, sink hips onto heels, fold forward, and rest your forehead down. A classic restorative posture that calms the nervous system.',
      '• Seated Twist: Sit upright, lengthen your spine, place left hand on right knee and rotate torso gently to the right. Gently mobilizes thoracic vertebrae.',
      '• Mountain Pose (Tadasana): Stand grounded with feet hip-width, engage thighs, lengthen spine, and let arms rest at sides with palms forward.',
    ],
    tips: [
      'Keep a soft micro-bend in your knees during standing poses to protect joints.',
      'If your hips feel tight in Child’s Pose, place a pillow between your heels and glutes.',
      'Practice 5 minutes of gentle yoga right before starting your evening study shutdown.',
    ],
    relatedLink: {
      path: '/physical-wellness',
      label: 'View Gentle Yoga Postures',
    },
    suggestedFollowups: [
      'What stretches can I do at my desk?',
      'How do I take effective movement breaks?',
      'Guide me through a short breathing exercise.',
    ],
  },
  {
    id: 'movement_breaks',
    title: 'How do I take effective movement breaks after prolonged sitting?',
    category: 'physical_wellness',
    categoryLabel: 'Physical Wellness',
    keywords: [
      'movement breaks',
      'sitting',
      'walk',
      'hydrate',
      'standing reset',
      'hamstring',
      'chest opener',
      'sedentary',
      'circulation',
      'posture break',
    ],
    summary:
      'Counteract hours of sitting with Standing Reset & Reach, a 2-Minute Walk & Hydrate, Gentle Hamstring & Calf Release, and the Torso & Chest Opener.',
    answer: [
      'Sitting motionless for hours slows venous blood return, tightens hip flexors, and leads to postural slumping. Our Movement Breaks help you re-energize:',
      '1. Standing Reset & Reach: Push your chair back, stand tall, sweep arms overhead with interlaced fingers, and lengthen your ribcage toward the ceiling.',
      '2. 2-Minute Walk & Hydrate: Step completely away from your workstation, walk at a gentle pace, and drink a glass of water while looking out a distant window.',
      '3. Gentle Hamstring & Calf Release: Rest your heel on the floor with toes flexed up, hinge forward from the hips with a flat back to lengthen the posterior chain.',
      '4. Torso & Chest Opener: Stand tall, interlace fingers behind your lower back, draw shoulder blades together, and lift your sternum to reverse desk slouching.',
    ],
    tips: [
      'Set an alarm every 60 minutes to prompt a 2-minute movement break.',
      'Leave your phone at your desk so your movement break is screen-free.',
      'Drink 250ml of water on every walk to stay adequately hydrated.',
    ],
    relatedLink: {
      path: '/physical-wellness',
      label: 'Explore Movement Breaks',
    },
    suggestedFollowups: [
      'What stretches can I do at my desk?',
      'How do I take a proper study break?',
      'How can I build a better sleep routine?',
    ],
  },
]

// ─── SUGGESTED PROMPT CHIPS ──────────────────────────────────────────────────
export const SUGGESTED_QUESTIONS = [
  'How can I manage study stress?',
  'How do I take a proper study break?',
  'How can I build a better sleep routine?',
  'What stretches can I do at my desk?',
  'Guide me through a short breathing exercise.',
]

// ─── CRISIS PHRASES & SAFETY RESPONSE ────────────────────────────────────────
const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'self harm',
  'hurting myself',
  'harm myself',
  'overdose',
  'cut myself',
  'end it all',
  'no reason to live',
  'better off dead',
]

export const CRISIS_RESPONSE: ChatMessage = {
  id: 'crisis-safety-alert',
  sender: 'assistant',
  text: 'If you are experiencing overwhelming distress, thoughts of self-harm, or an immediate mental health crisis, please reach out for professional support right away. You do not have to carry this alone.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  categoryLabel: 'Crisis Support & Safety',
  isCrisis: true,
  tips: [
    'India National Tele-Mental Health Programme (Tele-MANAS): Call toll-free 14416 or 1800-891-4416 (available 24/7 across India, multi-lingual, free, and confidential).',
    'KIRAN Mental Health Rehabilitation Helpline (Govt. of India): Call toll-free 1800-599-0019 (24/7 national support).',
    'National Emergency Services (India): Dial 112 for immediate emergency assistance.',
    'Campus & Community Support: Reach out to your campus health clinic, student psychological counselor, or a trusted family member or mentor.',
    'International & Other Regions: If you are outside India, contact your local emergency services (e.g. 112, 999, 911) or find confidential support services at findahelpline.com.',
  ],
  suggestedFollowups: [
    'How can I manage study stress?',
    'Guide me through a short breathing exercise.',
    'When should I use a short mindful pause?',
  ],
}

// ─── SEARCH & MATCHING FUNCTION ──────────────────────────────────────────────
export function searchKnowledgeBase(rawQuery: string): {
  match?: KnowledgeEntry
  isCrisis?: boolean
  isFallback?: boolean
} {
  const normalized = rawQuery.toLowerCase().trim()

  // 1. Check for immediate crisis keywords
  for (const phrase of CRISIS_KEYWORDS) {
    if (normalized.includes(phrase)) {
      return { isCrisis: true }
    }
  }

  // 2. Tokenize user query
  const stopWords = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'of',
    'to',
    'in',
    'for',
    'with',
    'on',
    'at',
    'from',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'do',
    'does',
    'did',
    'can',
    'could',
    'should',
    'would',
    'i',
    'me',
    'my',
    'we',
    'you',
    'your',
    'how',
    'what',
    'when',
    'where',
    'why',
    'tell',
    'about',
    'some',
  ])

  const tokens = normalized
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word))

  if (tokens.length === 0) {
    // If user input had only punctuation or stop words
    return { isFallback: true }
  }

  // 3. Score each knowledge base entry
  let bestEntry: KnowledgeEntry | undefined = undefined
  let highestScore = 0

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0
    const entryTitle = entry.title.toLowerCase()
    const entrySummary = entry.summary.toLowerCase()
    const entryCategory = entry.categoryLabel.toLowerCase()
    const entryKeywords = entry.keywords.map((k) => k.toLowerCase())

    // Direct match: query matches title or title matches query
    if (entryTitle.includes(normalized) || normalized.includes(entryTitle)) {
      score += 100
    }

    // Keyword matches (highest weight)
    for (const kw of entryKeywords) {
      if (normalized.includes(kw)) {
        score += 35
      }
      for (const t of tokens) {
        if (kw === t) {
          score += 30
        } else if (kw.includes(t) || t.includes(kw)) {
          score += 15
        } else if (kw.length >= 4 && t.length >= 4 && kw.slice(0, 4) === t.slice(0, 4)) {
          score += 18
        }
      }
    }

    // Title token matches
    for (const t of tokens) {
      if (entryTitle.includes(t)) {
        score += 20
      } else if (t.length >= 4) {
        const titleWords = entryTitle.split(/\s+/)
        if (titleWords.some((tw) => tw.length >= 4 && tw.slice(0, 4) === t.slice(0, 4))) {
          score += 12
        }
      }
    }

    // Summary & Category matches
    for (const t of tokens) {
      if (entrySummary.includes(t)) {
        score += 8
      }
      if (entryCategory.includes(t)) {
        score += 10
      }
    }

    // Answer text token matches
    const answerCombined = entry.answer.join(' ').toLowerCase()
    for (const t of tokens) {
      if (answerCombined.includes(t)) {
        score += 4
      }
    }

    if (score > highestScore) {
      highestScore = score
      bestEntry = entry
    }
  }

  // Minimum relevance threshold
  if (highestScore >= 18 && bestEntry) {
    return { match: bestEntry }
  }

  return { isFallback: true }
}

export const FALLBACK_MESSAGE: {
  text: string
  tips: string[]
  suggestedFollowups: string[]
} = {
  text: "I couldn't find a direct match for your question in our static wellness knowledge base. As an educational guide, I specialize in topics related to academic stress, desk ergonomics, sleep hygiene, and guided breathing.",
  tips: [
    'Stress and Study: Managing workload, handling deadlines, staying focused, and setting boundaries.',
    'Breathing & Relaxation: 4-4-4-4 box breathing, sensory grounding, and releasing physical tension.',
    'Physical Wellness: Desk stretches (neck, shoulders, wrists, upper back), gentle yoga, and movement breaks.',
    'Sleep & Habits: Building consistent sleep routines, managing evening screens, and forming micro-habits.',
  ],
  suggestedFollowups: [
    'How can I manage study stress?',
    'What stretches can I do at my desk?',
    'How can I build a better sleep routine?',
    'Guide me through a short breathing exercise.',
  ],
}
