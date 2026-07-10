import { useState } from 'react'
import { CircleUserRound, ChevronRight } from 'lucide-react'
import { Button } from '@/components/Button'
import { useLang } from '@/i18n/LangProvider'

// Purely fictional sample identity — the home-page showcase phone must never show
// or touch the real signed-in user's data. Editing only updates this local state.
const DEMO_PROFILE = {
  name: 'Alex Chen',
  phone: '+66 81 234 5678',
  email: 'alex.chen@example.com',
}

const inputClass =
  'min-h-tap rounded-[12px] border border-hairline/20 bg-panel-2 px-3 text-body-sm text-fg placeholder:text-low focus:border-gold-400/60 focus:outline-none'

/**
 * Mock Profile screen for the home-page showcase phone only. Self-contained on
 * fake data with no real API calls, no getMe, no logout — so the demo has
 * "nothing to do with the user data" (see HomeAppPreviewPhone).
 */
export function PhoneDemoProfileScreen() {
  const { t } = useLang()
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(DEMO_PROFILE)
  const [draft, setDraft] = useState(DEMO_PROFILE)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-5 pb-6 pt-3 text-fg">
      <h1 className="text-h1 font-bold">{t({ en: 'Profile', th: 'โปรไฟล์' })}</h1>

      <section className="flex flex-col items-center gap-2 rounded-[20px] border border-hairline/10 bg-panel p-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 ring-2 ring-gold-400/60">
          <CircleUserRound className="h-8 w-8 text-white" aria-hidden="true" />
        </span>
        {!editing ? (
          <>
            <p className="text-body-medium font-semibold text-fg">{profile.name}</p>
            <p className="text-caption text-mid">{profile.phone}</p>
            <p className="text-caption text-mid">{profile.email}</p>
            <span className="mt-1 inline-flex items-center rounded-pill bg-gold-400/15 px-3 py-1 text-caption font-semibold text-accent">
              {t({ en: 'Free plan', th: 'แพ็กเกจฟรี' })}
            </span>
            <Button
              variant="outline-gold"
              className="mt-2"
              onClick={() => {
                setDraft(profile)
                setEditing(true)
              }}
            >
              {t({ en: 'Edit profile', th: 'แก้ไขโปรไฟล์' })}
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
                {t({ en: 'Save', th: 'บันทึก' })}
              </Button>
              <Button variant="outline-light" type="button" className="flex-1" onClick={() => setEditing(false)}>
                {t({ en: 'Cancel', th: 'ยกเลิก' })}
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="flex flex-col divide-y divide-hairline/10 rounded-[20px] border border-hairline/10 bg-panel px-4">
        <ProfileLink label={t({ en: 'How PaTuean works', th: 'ป้าเตือน ทำงานอย่างไร' })} />
        <ProfileLink label={t({ en: 'Help & support', th: 'ช่วยเหลือและสนับสนุน' })} />
        <ProfileLink label={t({ en: 'Privacy policy', th: 'นโยบายความเป็นส่วนตัว' })} />
        <ProfileLink label={t({ en: 'Terms of service', th: 'ข้อกำหนดการให้บริการ' })} />
      </section>
    </div>
  )
}

function ProfileLink({ label }: { label: string }) {
  return (
    <span className="flex min-h-tap items-center justify-between py-3.5 text-body-sm text-fg">
      {label}
      <ChevronRight className="h-5 w-5 text-low" aria-hidden="true" />
    </span>
  )
}
