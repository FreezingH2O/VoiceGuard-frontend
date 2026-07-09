import { useState } from 'react'
import { CircleUserRound, ChevronRight } from 'lucide-react'
import { Button } from '@/components/Button'

// Purely fictional sample identity — the home-page showcase phone must never show
// or touch the real signed-in user's data. Editing only updates this local state.
const DEMO_PROFILE = {
  name: 'Alex Chen',
  phone: '+66 81 234 5678',
  email: 'alex.chen@example.com',
}

const inputClass =
  'min-h-tap rounded-[12px] border border-white/[0.1] bg-panel-2 px-3 text-body-sm text-white placeholder:text-mist-500 focus:border-gold-400/60 focus:outline-none'

/**
 * Mock Profile screen for the home-page showcase phone only. Self-contained on
 * fake data with no real API calls, no getMe, no logout — so the demo has
 * "nothing to do with the user data" (see HomeAppPreviewPhone).
 */
export function PhoneDemoProfileScreen() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(DEMO_PROFILE)
  const [draft, setDraft] = useState(DEMO_PROFILE)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-5 pb-6 pt-3 text-white">
      <h1 className="text-h1 font-bold">Profile</h1>

      <section className="flex flex-col items-center gap-2 rounded-[20px] border border-white/[0.06] bg-panel p-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 ring-2 ring-gold-400/60">
          <CircleUserRound className="h-8 w-8 text-white" aria-hidden="true" />
        </span>
        {!editing ? (
          <>
            <p className="text-body-medium font-semibold text-white">{profile.name}</p>
            <p className="text-caption text-mist-300">{profile.phone}</p>
            <p className="text-caption text-mist-300">{profile.email}</p>
            <span className="mt-1 inline-flex items-center rounded-pill bg-gold-400/15 px-3 py-1 text-caption font-semibold text-gold-400">
              Free plan
            </span>
            <Button
              variant="outline-gold"
              className="mt-2"
              onClick={() => {
                setDraft(profile)
                setEditing(true)
              }}
            >
              Edit profile
            </Button>
          </>
        ) : (
          <form
            className="flex w-full flex-col gap-2 text-left"
            onSubmit={(e) => {
              e.preventDefault()
              setProfile(draft)
              setEditing(false)
            }}
          >
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={inputClass}
            />
            <input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              className={inputClass}
            />
            <input
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              className={inputClass}
            />
            <div className="flex gap-2">
              <Button variant="gold" type="submit" className="flex-1">
                Save
              </Button>
              <Button variant="outline-light" type="button" className="flex-1" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="flex flex-col divide-y divide-white/[0.06] rounded-[20px] border border-white/[0.06] bg-panel px-4">
        <ProfileLink label="How PaTuean works" />
        <ProfileLink label="Help & support" />
        <ProfileLink label="Privacy policy" />
        <ProfileLink label="Terms of service" />
      </section>
    </div>
  )
}

function ProfileLink({ label }: { label: string }) {
  return (
    <span className="flex min-h-tap items-center justify-between py-3.5 text-body-sm text-white">
      {label}
      <ChevronRight className="h-5 w-5 text-mist-500" aria-hidden="true" />
    </span>
  )
}
