import { Routine } from '@/types/wellness'

export const WELLNESS_ROUTINES: Routine[] = [
  // Desk Stretches
  {
    id: 'neck_movement',
    name: 'Gentle Neck Movement',
    category: 'desk_stretches',
    categoryLabel: 'Desk Stretches',
    duration: '30–45 seconds',
    difficulty: 'Beginner',
    targetAreas: ['Cervical Spine', 'Trapezius', 'Upper Neck'],
    instructions: [
      'Sit tall with feet grounded and relax both shoulders downward.',
      'Slowly lower your right ear toward your right shoulder without lifting the shoulder.',
      'Hold gently for 15 seconds, feeling a mild release along the left side of your neck.',
      'Return to center with a breath and repeat slowly on the left side.',
    ],
    safetyReminder:
      'Keep movements slow and avoid jerking your neck. Stop immediately if you feel sharp pain or dizziness.',
  },
  {
    id: 'shoulder_rolls',
    name: 'Shoulder Rolls',
    category: 'desk_stretches',
    categoryLabel: 'Desk Stretches',
    duration: '45–60 seconds',
    difficulty: 'Beginner',
    targetAreas: ['Deltoids', 'Scapula', 'Upper Back'],
    instructions: [
      'Inhale deeply as you gently shrug your shoulders up toward your ears.',
      'Roll your shoulder blades backward and down as you smoothly exhale.',
      'Complete 5–8 slow, smooth backward circular motions.',
      'Reverse direction for 5 slow forward circles to loosen tight upper back tissue.',
    ],
    safetyReminder:
      'Avoid hunching your chest forward; maintain an open, natural posture throughout.',
  },
  {
    id: 'wrist_forearm',
    name: 'Wrist and Forearm Stretches',
    category: 'desk_stretches',
    categoryLabel: 'Desk Stretches',
    duration: '30–45 seconds per arm',
    difficulty: 'Beginner',
    targetAreas: ['Wrist Flexors', 'Extensors', 'Forearms'],
    instructions: [
      'Extend your right arm forward with palm facing up and elbow straight.',
      'With your left hand, gently draw your right fingers back toward your body.',
      'Hold for 15–20 seconds while taking natural, relaxed breaths.',
      'Flip the palm downward and lightly draw the knuckles toward you. Switch arms.',
    ],
    safetyReminder:
      'Apply light, steady pressure only. Do not hyperextend or force the wrist joint.',
  },
  {
    id: 'upper_back_stretch',
    name: 'Upper-Back Stretch',
    category: 'desk_stretches',
    categoryLabel: 'Desk Stretches',
    duration: '45–60 seconds',
    difficulty: 'Beginner',
    targetAreas: ['Rhomboids', 'Thoracic Spine', 'Posterior Shoulders'],
    instructions: [
      'Interlace your fingers in front of your chest at chest height.',
      'Turn your palms outward and push forward as you gently round your upper back.',
      'Tuck your chin slightly and breathe into the space between your shoulder blades.',
      'Hold the stretch for 20–30 seconds, taking slow, deep diaphragmatic breaths.',
    ],
    safetyReminder:
      'Do not collapse into your lower back; focus the roundness on your upper thoracic spine.',
  },

  // Gentle Yoga
  {
    id: 'cat_cow',
    name: 'Cat–Cow',
    category: 'gentle_yoga',
    categoryLabel: 'Gentle Yoga',
    duration: '1–2 minutes',
    difficulty: 'Beginner',
    targetAreas: ['Spinal Column', 'Core', 'Chest & Neck'],
    instructions: [
      'Start on all fours with wrists under shoulders and knees under hips (or sit upright in a chair).',
      'Inhale for Cow: gently drop your belly, lifting your chest and gaze slightly upward.',
      'Exhale for Cat: draw your navel toward your spine, rounding your back toward the ceiling.',
      'Flow between Cat and Cow in sync with your breath for 5–8 continuous cycles.',
    ],
    safetyReminder:
      'Keep the movement flowing and fluid; avoid aggressive end-range spinal arching.',
  },
  {
    id: 'childs_pose',
    name: "Child's Pose",
    category: 'gentle_yoga',
    categoryLabel: 'Gentle Yoga',
    duration: '1–2 minutes',
    difficulty: 'Beginner',
    targetAreas: ['Hips', 'Lumbar Spine', 'Ankles & Mind'],
    instructions: [
      'Kneel on the floor, bringing your big toes to touch with knees comfortably wide.',
      'Sink your hips back toward your heels and walk your hands forward onto the floor.',
      'Rest your forehead comfortably down on your mat or a soft folded towel.',
      'Allow your chest to soften between your thighs and breathe deeply into your back ribs.',
    ],
    safetyReminder:
      'If your knees or hips feel tight, place a cushion between your hips and heels for support.',
  },
  {
    id: 'seated_twist',
    name: 'Seated Twist',
    category: 'gentle_yoga',
    categoryLabel: 'Gentle Yoga',
    duration: '30–45 seconds per side',
    difficulty: 'Beginner',
    targetAreas: ['Obliques', 'Mid-Spine', 'Chest Opener'],
    instructions: [
      'Sit tall with your spine neutral and both feet flat on the floor.',
      'Inhale to lengthen upward through the crown of your head.',
      'Exhale and gently twist your torso to the right, placing your left hand on your right outer knee.',
      'Rest your right hand on your chair arm or behind your hip. Hold for 4 breaths, then switch.',
    ],
    safetyReminder:
      'Twist gently from your core and mid-back—never yank with your arms or strain your neck.',
  },
  {
    id: 'mountain_pose',
    name: 'Mountain Pose',
    category: 'gentle_yoga',
    categoryLabel: 'Gentle Yoga',
    duration: '1 minute',
    difficulty: 'Beginner',
    targetAreas: ['Postural Alignment', 'Quadriceps', 'Grounding'],
    instructions: [
      'Stand upright with feet hip-width apart and arms hanging naturally by your sides.',
      'Distribute your body weight evenly across the balls and heels of both feet.',
      'Lightly engage your thigh muscles and align your shoulders over your hips.',
      'Soften your gaze or close your eyes, taking 5 steady, grounding breaths.',
    ],
    safetyReminder:
      'Keep a subtle micro-bend in your knees to prevent locking the joints.',
  },

  // Movement Breaks
  {
    id: 'standing_reset',
    name: 'Standing Reset & Reach',
    category: 'movement_breaks',
    categoryLabel: 'Movement Breaks',
    duration: '1 minute',
    difficulty: 'Beginner',
    targetAreas: ['Full Body', 'Intercostals', 'Postural Reset'],
    instructions: [
      'Push your chair back and stand up tall away from your workstation.',
      'Interlace your fingers and turn palms up, reaching overhead toward the ceiling.',
      'Take a long, deep inhale as you elongate your spine and ribcage.',
      'Gently sway your upper body slightly to the left and right, then release with an exhale.',
    ],
    safetyReminder:
      'Keep your lower ribs slightly drawn in to avoid over-arching your lower back.',
  },
  {
    id: 'walk_hydrate',
    name: '2-Minute Walk & Hydrate',
    category: 'movement_breaks',
    categoryLabel: 'Movement Breaks',
    duration: '2 minutes',
    difficulty: 'Beginner',
    targetAreas: ['Lower Limb Circulation', 'Hydration', 'Eye Focus Reset'],
    instructions: [
      'Step completely away from all electronic screens and study materials.',
      'Take a relaxed, comfortable walk down your hallway, around the room, or outdoor area.',
      'Drink a full glass of cool water to refresh your cognitive focus and body tissues.',
      'Look out a window at a distant point (20+ feet away) to relieve optical strain.',
    ],
    safetyReminder:
      'Use this time for mental decompression; leave your smartphone behind.',
  },
  {
    id: 'hamstring_calf_release',
    name: 'Gentle Hamstring & Calf Release',
    category: 'movement_breaks',
    categoryLabel: 'Movement Breaks',
    duration: '45–60 seconds per leg',
    difficulty: 'Beginner',
    targetAreas: ['Hamstrings', 'Calves', 'Posterior Chain'],
    instructions: [
      'Stand facing a stable chair or step. Place your right heel on the edge with toes flexed up.',
      'Keep your left knee softly bent and your hands resting on your hips or thighs.',
      'Hinge forward from your hips with a flat back until you feel a mild hamstring stretch.',
      'Hold for 20 seconds while breathing steadily, then slowly switch to your left leg.',
    ],
    safetyReminder:
      'Keep your spine straight as you hinge; do not collapse or round into your lower back.',
  },
  {
    id: 'torso_chest_opener',
    name: 'Torso & Chest Opener',
    category: 'movement_breaks',
    categoryLabel: 'Movement Breaks',
    duration: '45 seconds',
    difficulty: 'Beginner',
    targetAreas: ['Pectoralis Major', 'Anterior Deltoids', 'Sternum'],
    instructions: [
      'Stand with feet hip-distance apart and interlace your hands behind your lower back.',
      'Roll your shoulders back and gently draw your shoulder blades together.',
      'Gently lift your hands an inch or two away from your lower back, opening your chest.',
      'Breathe deeply into your upper chest for 4–5 slow breaths, then gently release.',
    ],
    safetyReminder:
      'Do not strain your elbows or force your hands higher than comfortable.',
  },
]
