import React, { useState } from 'react'
import {
  UserRound,
  Pencil,
  Check,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileState {
  displayName: string
  bio: string
  studyRoutine: string
  preferredActivities: string[]
  wellnessGoals: string[]
}

const DEFAULT_PROFILE: ProfileState = {
  displayName: 'Student Practitioner',
  bio: 'Focusing on building sustainable study habits, taking regular movement breaks, and reducing evening screen fatigue.',
  studyRoutine: 'Full-Time Student',
  preferredActivities: [
    'Desk Stretches (Neck & Shoulders)',
    'Mindful Box Breathing (4-4-4-4)',
    '2-Minute Walking Breaks',
  ],
  wellnessGoals: [
    'Prevent physical neck & shoulder stiffness',
    'Maintain sustained focus without burnout',
    'Establish consistent evening sleep wind-down',
  ],
}

const ROUTINE_OPTIONS = [
  'Full-Time Student',
  'Working Student (Part-Time / Hybrid)',
  'Graduate Student & Researcher',
  'Independent / Professional Learner',
]

const ACTIVITY_OPTIONS = [
  'Desk Stretches (Neck & Shoulders)',
  'Mindful Box Breathing (4-4-4-4)',
  '2-Minute Walking Breaks',
  'Gentle Yoga Postures (Cat-Cow, Child’s Pose)',
  'Sensory Grounding Pauses',
  'Evening Screen-Free Wind-Down',
]

const GOAL_OPTIONS = [
  'Prevent physical neck & shoulder stiffness',
  'Maintain sustained focus without burnout',
  'Establish consistent evening sleep wind-down',
  'Take structured 50/10 study breaks',
  'Stay hydrated during long study sprints',
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CV'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ProfilePage: React.FC = () => {
  // Saved profile in session state
  const [savedProfile, setSavedProfile] = useState<ProfileState>(DEFAULT_PROFILE)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [draftProfile, setDraftProfile] = useState<ProfileState>(DEFAULT_PROFILE)

  // Feedback notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleStartEdit = () => {
    setDraftProfile({ ...savedProfile })
    setIsEditing(true)
    setSuccessMessage(null)
    setValidationError(null)
  }

  const handleCancelEdit = () => {
    setDraftProfile({ ...savedProfile })
    setIsEditing(false)
    setValidationError(null)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: Display name cannot be empty
    if (!draftProfile.displayName.trim()) {
      setValidationError('Display name cannot be blank.')
      return
    }

    setSavedProfile({
      ...draftProfile,
      displayName: draftProfile.displayName.trim(),
      bio: draftProfile.bio.trim(),
    })
    setIsEditing(false)
    setValidationError(null)
    setSuccessMessage('Profile details updated successfully for this browser session.')
  }

  const handleResetToDefaults = () => {
    setDraftProfile({ ...DEFAULT_PROFILE })
    setSavedProfile({ ...DEFAULT_PROFILE })
    setIsEditing(false)
    setValidationError(null)
    setSuccessMessage('Profile reset to initial default settings.')
  }

  const toggleDraftActivity = (activity: string) => {
    setDraftProfile((prev) => {
      const exists = prev.preferredActivities.includes(activity)
      return {
        ...prev,
        preferredActivities: exists
          ? prev.preferredActivities.filter((a) => a !== activity)
          : [...prev.preferredActivities, activity],
      }
    })
  }

  const toggleDraftGoal = (goal: string) => {
    setDraftProfile((prev) => {
      const exists = prev.wellnessGoals.includes(goal)
      return {
        ...prev,
        wellnessGoals: exists
          ? prev.wellnessGoals.filter((g) => g !== goal)
          : [...prev.wellnessGoals, goal],
      }
    })
  }

  const activeProfile = isEditing ? draftProfile : savedProfile
  const initials = getInitials(activeProfile.displayName)

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#ffdce4]/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fcaec2]/80 bg-[#fff0f4] text-[11px] font-semibold uppercase tracking-wider text-[#8c1d3c] shadow-2xs backdrop-blur-md">
            <UserRound className="w-3.5 h-3.5 text-[#e0567b]" />
            <span>User Profile & Preferences</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2d1b24]">
            Profile
          </h1>

          <p className="text-xs sm:text-sm text-[#735562] max-w-2xl leading-relaxed">
            Manage your display preferences, routine schedule, and personalized wellness goals. All preferences are stored in local session memory.
          </p>
        </div>

        {/* Edit / Cancel Toggle Action */}
        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEdit}
            className="btn-wellness-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-[#e0567b]" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn-wellness-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-[#735562]" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Success Banner */}
      {successMessage && (
        <div className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] backdrop-blur-md text-xs text-[#166534] shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-[#16a34a] hover:text-[#14532d] p-0.5 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Validation Error Banner */}
      {validationError && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-rose-200 bg-rose-50/90 backdrop-blur-md text-xs text-rose-800 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{validationError}</p>
        </div>
      )}

      {/* 4. Profile Overview Card */}
      <section className="glass-panel p-6 sm:p-8 space-y-6 border border-[#ffdce4]/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Circular Avatar with User Initials */}
          <div
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-[#f87d9f] via-[#f0507e] to-[#e0567b] border-2 border-white/90 p-0.5 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0 shadow-md shadow-[#e0567b]/25"
            aria-label={`Avatar initials for ${activeProfile.displayName}`}
          >
            <div className="w-full h-full rounded-[22px] bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <span>{initials}</span>
            </div>
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            {!isEditing ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2d1b24] tracking-tight truncate">
                  {savedProfile.displayName}
                </h2>
                <p className="text-xs sm:text-sm text-[#614752] leading-relaxed max-w-2xl">
                  {savedProfile.bio || 'No profile description provided.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8c1d3c] bg-[#fff0f4] border border-[#fcaec2]/70 px-3 py-1 rounded-full shadow-2xs backdrop-blur-xs">
                    <span>{savedProfile.studyRoutine}</span>
                  </span>
                  <span className="text-[11px] text-[#e5ccd3]">•</span>
                  <span className="text-[11px] font-medium text-[#735562]">In-Memory Session Account</span>
                </div>
              </>
            ) : (
              <div className="space-y-4 w-full">
                <div>
                  <label
                    htmlFor="profile-display-name"
                    className="text-xs font-semibold uppercase tracking-wider text-[#3b121e] block mb-1.5"
                  >
                    Display Name <span className="text-rose-500 normal-case font-normal">*</span>
                  </label>
                  <input
                    id="profile-display-name"
                    type="text"
                    value={draftProfile.displayName}
                    onChange={(e) => {
                      setDraftProfile((prev) => ({ ...prev, displayName: e.target.value }))
                      if (validationError) setValidationError(null)
                    }}
                    placeholder="Enter your preferred name..."
                    className="w-full sm:max-w-md rounded-xl border border-[#fed5df] bg-white/95 px-4 py-2.5 text-sm text-[#2d1b24] shadow-2xs focus:outline-hidden focus:border-[#f0507e] focus:ring-3 focus:ring-[#fcaec2]/40 transition-all backdrop-blur-xs placeholder:text-[#9f7988]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-bio"
                    className="text-xs font-semibold uppercase tracking-wider text-[#3b121e] block mb-1.5"
                  >
                    Profile Description <span className="text-[#9c7886] normal-case font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="profile-bio"
                    rows={2}
                    value={draftProfile.bio}
                    onChange={(e) =>
                      setDraftProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Briefly describe your study routine or wellness goals..."
                    className="w-full rounded-xl border border-[#fed5df] bg-white/95 px-4 py-2.5 text-sm text-[#2d1b24] shadow-2xs focus:outline-hidden focus:border-[#f0507e] focus:ring-3 focus:ring-[#fcaec2]/40 leading-relaxed transition-all resize-none backdrop-blur-xs placeholder:text-[#9f7988]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simple Profile Summary Metadata */}
        <div className="pt-5 border-t border-[#ffeef2] grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1 border border-[#fed5df]">
            <span className="text-[#8a6874] block text-[11px] font-medium">Session Identifier</span>
            <span className="font-semibold text-[#2d1b24]">Local Guest Practitioner</span>
          </div>

          <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1 border border-[#fed5df]">
            <span className="text-[#8a6874] block text-[11px] font-medium">Primary Wellness Focus</span>
            <span className="font-semibold text-[#2d1b24]">Academic Strain & Somatic Care</span>
          </div>

          <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1 border border-[#fed5df]">
            <span className="text-[#8a6874] block text-[11px] font-medium">Data Storage Scope</span>
            <span className="font-semibold text-[#2d1b24]">Active Browser Session Only</span>
          </div>
        </div>
      </section>

      {/* 5. Personal Preferences & Wellness Goals */}
      <section className="glass-panel p-6 sm:p-8 space-y-6 border border-[#ffdce4]/90">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-[#2d1b24]">Personal Preferences</h2>
          <p className="text-xs sm:text-sm text-[#614752] leading-relaxed">
            Specify your study schedule and routine habits. These preferences are optional personal guideposts and do not alter clinical evaluations or algorithmic predictions.
          </p>
        </div>

        {/* A. Study or Work Routine */}
        <div className="space-y-3 pt-4 border-t border-[#ffeef2]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e]">
              Study or Work Routine
            </label>
            <span className="text-xs font-medium text-[#9c7886]">Optional</span>
          </div>

          {!isEditing ? (
            <div className="p-3.5 rounded-xl border border-[#fed5df] bg-white/70 backdrop-blur-md text-xs font-medium text-[#2d1b24] flex items-center gap-2.5 shadow-2xs">
              <Clock className="w-4 h-4 text-[#e0567b]" />
              <span className="font-semibold">{savedProfile.studyRoutine}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Study or Work Routine">
              {ROUTINE_OPTIONS.map((option) => {
                const isSelected = draftProfile.studyRoutine === option
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() =>
                      setDraftProfile((prev) => ({ ...prev, studyRoutine: option }))
                    }
                    className={cn(
                      'text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer backdrop-blur-sm',
                      isSelected
                        ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                        : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* B. Preferred Wellness Activities */}
        <div className="space-y-3 pt-4 border-t border-[#ffeef2]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e]">
              Preferred Wellness Activities
            </label>
            <span className="text-xs font-medium text-[#9c7886]">Select all that apply</span>
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {savedProfile.preferredActivities.length > 0 ? (
                savedProfile.preferredActivities.map((act) => (
                  <span
                    key={act}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#fcaec2]/70 bg-[#fff0f4] text-xs text-[#8c1d3c] font-medium backdrop-blur-xs shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 text-[#e0567b]" />
                    <span>{act}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#9c7886] italic">No preferred activities selected.</span>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Preferred Wellness Activities">
              {ACTIVITY_OPTIONS.map((act) => {
                const isChecked = draftProfile.preferredActivities.includes(act)
                return (
                  <button
                    key={act}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleDraftActivity(act)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-all cursor-pointer backdrop-blur-sm',
                      isChecked
                        ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                        : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                    )}
                  >
                    <Check
                      className={cn(
                        'w-3.5 h-3.5',
                        isChecked ? 'text-white' : 'text-transparent'
                      )}
                    />
                    <span>{act}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* C. Personal Wellness Goals */}
        <div className="space-y-3 pt-4 border-t border-[#ffeef2]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3b121e]">
              Personal Wellness Goals
            </label>
            <span className="text-xs font-medium text-[#9c7886]">Optional Focus Areas</span>
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {savedProfile.wellnessGoals.length > 0 ? (
                savedProfile.wellnessGoals.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#fcaec2]/70 bg-[#fff0f4] text-xs text-[#8c1d3c] font-medium backdrop-blur-xs shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#e0567b]" />
                    <span>{goal}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#9c7886] italic">No specific wellness goals selected.</span>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Personal Wellness Goals">
              {GOAL_OPTIONS.map((goal) => {
                const isChecked = draftProfile.wellnessGoals.includes(goal)
                return (
                  <button
                    key={goal}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleDraftGoal(goal)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-all cursor-pointer backdrop-blur-sm',
                      isChecked
                        ? 'border-[#f0507e] bg-gradient-to-r from-[#f87d9f] to-[#e0567b] text-white shadow-xs font-semibold'
                        : 'border-[#fed5df] bg-white/70 text-[#553b46] hover:bg-[#fff5f8] shadow-2xs'
                    )}
                  >
                    <Check
                      className={cn(
                        'w-3.5 h-3.5',
                        isChecked ? 'text-white' : 'text-transparent'
                      )}
                    />
                    <span>{goal}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Edit Action Bar */}
        {isEditing && (
          <div className="pt-6 border-t border-[#ffeef2] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-[#735562] hover:text-[#2d1b24] underline decoration-[#fed5df] underline-offset-4 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#9c7886]" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-wellness-secondary w-full sm:w-auto px-4 py-2 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn-wellness-primary w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 6. Client Prototype Notice Banner */}
      <section className="glass-panel p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4 border border-[#ffdce4]/90">
        <div className="p-3 rounded-xl bg-[#fff0f4] border border-[#fcaec2]/80 text-[#c0385c] shrink-0 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#2d1b24]">
            Frontend Prototype Scope
          </h2>
          <p className="text-xs text-[#614752] leading-relaxed">
            Cognivault AI is running as a client-side prototype. Profile updates and personal preferences are held in component React state during the active browser session. No password management, login authentication, or remote database synchronization is active in this block.
          </p>
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
