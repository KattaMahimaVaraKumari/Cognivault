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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            <UserRound className="w-3.5 h-3.5" />
            <span>User Profile & Preferences</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Profile
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Manage your display preferences, routine schedule, and personalized wellness goals. All preferences are stored in local session memory.
          </p>
        </div>

        {/* Edit / Cancel Toggle Action */}
        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-500" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Success Banner */}
      {successMessage && (
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Validation Error Banner */}
      {validationError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-200 bg-red-50/50 text-xs text-red-700 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{validationError}</p>
        </div>
      )}

      {/* 4. Profile Overview Card */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Circular Avatar with User Initials */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-lg sm:text-2xl font-bold text-gray-800 shrink-0 shadow-2xs"
            aria-label={`Avatar initials for ${activeProfile.displayName}`}
          >
            <span>{initials}</span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {!isEditing ? (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight truncate">
                  {savedProfile.displayName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
                  {savedProfile.bio || 'No profile description provided.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    <span>{savedProfile.studyRoutine}</span>
                  </span>
                  <span className="text-[11px] text-gray-400">•</span>
                  <span className="text-[11px] text-gray-400">In-Memory Session Account</span>
                </div>
              </>
            ) : (
              <div className="space-y-4 w-full">
                <div>
                  <label
                    htmlFor="profile-display-name"
                    className="text-xs font-semibold uppercase tracking-wider text-gray-900 block mb-1"
                  >
                    Display Name <span className="text-gray-400 normal-case font-normal">(Required)</span>
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
                    className="w-full sm:max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-hidden focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-bio"
                    className="text-xs font-semibold uppercase tracking-wider text-gray-900 block mb-1"
                  >
                    Profile Description <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="profile-bio"
                    rows={2}
                    value={draftProfile.bio}
                    onChange={(e) =>
                      setDraftProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Briefly describe your study routine or wellness goals..."
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-hidden focus:border-gray-400 focus:ring-2 focus:ring-gray-100 leading-relaxed transition-all resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simple Profile Summary Metadata */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-100 space-y-0.5">
            <span className="text-gray-400 block text-[11px]">Session Identifier</span>
            <span className="font-semibold text-gray-800">Local Guest Practitioner</span>
          </div>

          <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-100 space-y-0.5">
            <span className="text-gray-400 block text-[11px]">Primary Wellness Focus</span>
            <span className="font-semibold text-gray-800">Academic Strain & Somatic Care</span>
          </div>

          <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-100 space-y-0.5">
            <span className="text-gray-400 block text-[11px]">Data Storage Scope</span>
            <span className="font-semibold text-gray-800">Active Browser Session Only</span>
          </div>
        </div>
      </section>

      {/* 5. Personal Preferences & Wellness Goals */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-900">Personal Preferences</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Specify your study schedule and routine habits. These preferences are optional personal guideposts and do not alter clinical evaluations or algorithmic predictions.
          </p>
        </div>

        {/* A. Study or Work Routine */}
        <div className="space-y-2.5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Study or Work Routine
            </label>
            <span className="text-xs text-gray-400">Optional</span>
          </div>

          {!isEditing ? (
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{savedProfile.studyRoutine}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Study or Work Routine">
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
                      'text-left px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer',
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
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
        <div className="space-y-2.5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Preferred Wellness Activities
            </label>
            <span className="text-xs text-gray-400">Select all that apply</span>
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {savedProfile.preferredActivities.length > 0 ? (
                savedProfile.preferredActivities.map((act) => (
                  <span
                    key={act}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700 font-medium"
                  >
                    <Check className="w-3 h-3 text-gray-500" />
                    <span>{act}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No preferred activities selected.</span>
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
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                      isChecked
                        ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    <Check
                      className={cn(
                        'w-3 h-3',
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
        <div className="space-y-2.5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Personal Wellness Goals
            </label>
            <span className="text-xs text-gray-400">Optional Focus Areas</span>
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {savedProfile.wellnessGoals.length > 0 ? (
                savedProfile.wellnessGoals.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700 font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-gray-500" />
                    <span>{goal}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No specific wellness goals selected.</span>
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
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                      isChecked
                        ? 'border-gray-900 bg-gray-900 text-white shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    )}
                  >
                    <Check
                      className={cn(
                        'w-3 h-3',
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
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 6. Client Prototype Notice Banner */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
            Frontend Prototype Scope
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Cognivault AI is running as a client-side prototype. Profile updates and personal preferences are held in component React state during the active browser session. No password management, login authentication, or remote database synchronization is active in this block.
          </p>
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
