import { useState } from 'react'
import { CircleUserRound, ChevronRight } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Pill } from '@/components/Pill'

// Purely fictional sample identity — the home-page showcase phone must never show
// or touch the real signed-in user's data. Editing only updates this local state.
const DEMO_PROFILE = {
  name: 'Alex Chen',
  phone: '+66 81 234 5678',
  email: 'alex.chen@example.com',
}

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
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-5 pb-6 pt-2 text-white">
      <h1 className="py-2 text-h1">Profile</h1>

      <Card padding="lg" className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-navy-900">
          <CircleUserRound className="h-8 w-8" aria-hidden="true" />
        </span>
        {!editing ? (
          <>
            <p className="text-body-sm">{profile.name}</p>
            <p className="text-caption text-slate-400">{profile.phone}</p>
            <p className="text-caption text-slate-400">{profile.email}</p>
            <Pill tone="blue">Free plan</Pill>
            <Button
              variant="outline-neutral"
              className="mt-2 !bg-transparent !text-white !border-slate-200"
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
              className="min-h-tap rounded-input border border-slate-200 px-3 text-navy-900"
            />
            <input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              className="min-h-tap rounded-input border border-slate-200 px-3 text-navy-900"
            />
            <input
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              className="min-h-tap rounded-input border border-slate-200 px-3 text-navy-900"
            />
            <div className="flex gap-2">
              <Button variant="primary" type="submit" className="flex-1">
                Save
              </Button>
              <Button variant="outline-neutral" type="button" className="flex-1" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card padding="md" className="flex flex-col divide-y divide-slate-200/10">
        <ProfileLink label="How PaTuean works" />
        <ProfileLink label="Help & support" />
        <ProfileLink label="Privacy policy" />
        <ProfileLink label="Terms of service" />
      </Card>
    </div>
  )
}

function ProfileLink({ label }: { label: string }) {
  return (
    <span className="flex min-h-tap items-center justify-between py-3 text-body-sm">
      {label}
      <ChevronRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
    </span>
  )
}
