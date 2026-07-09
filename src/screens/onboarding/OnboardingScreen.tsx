import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Mic, Smartphone, Bell, CircleCheck, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/Button'
import { Pill } from '@/components/Pill'
import { LangToggle } from '@/components/web/LangToggle'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/services/api'
import { useToast } from '@/components/ToastProvider'
import { useLang, type Localized } from '@/i18n/LangProvider'

type PermissionState = 'idle' | 'granted' | 'denied'

export function OnboardingScreen() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const { t } = useLang()
  const [micState, setMicState] = useState<PermissionState>('idle')
  const [notifState, setNotifState] = useState<PermissionState>('idle')
  const [consent, setConsent] = useState(false)

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((tr) => tr.stop())
      setMicState('granted')
    } catch {
      setMicState('denied')
    }
  }

  async function requestNotifications() {
    if (!('Notification' in window)) {
      setNotifState('denied')
      return
    }
    const result = await Notification.requestPermission()
    setNotifState(result === 'granted' ? 'granted' : 'denied')
  }

  const continueMutation = useMutation({
    mutationFn: async () => {
      await api.devices.register({ platform: 'web', pushToken: 'mock-push-token' }).catch(() => {})
      await api.consent.record({ policyVersion: '1.0', accepted: true })
      await api.settings.patch({})
    },
    onSuccess: () => {
      if (user) updateUser({ ...user, consentRecorded: true })
      navigate('/home')
    },
    onError: () => {
      showToast({ message: t({ en: 'Couldn’t save your preferences, try again.', th: 'บันทึกการตั้งค่าไม่สำเร็จ ลองอีกครั้ง' }), tone: 'error' })
    },
  })

  return (
    <div className="on-dark flex min-h-dvh flex-1 flex-col bg-glow-grad text-white">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3.5 px-6 pb-6 pt-8 sm:max-w-2xl lg:max-w-3xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-body-medium font-bold">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" /> PaTuean
          </Link>
          <LangToggle />
        </div>

        <div className="mt-2 flex justify-center gap-1.5" role="img" aria-label="Step 2 of 5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={i === 1 ? 'h-2 w-5 rounded-pill bg-white' : 'h-2 w-2 rounded-full bg-white/40'} />
          ))}
        </div>
        <h1 className="font-display text-h1-mobile text-white">{t({ en: 'Permissions & consent', th: 'สิทธิ์การใช้งาน & ความยินยอม' })}</h1>
        <p className="text-small text-white/85">
          {t({
            en: 'PaTuean needs a few permissions to protect your calls. You can change these anytime in Settings.',
            th: 'ป้าเตือน ต้องการสิทธิ์บางอย่างเพื่อปกป้องสายของคุณ เปลี่ยนได้ทุกเมื่อในการตั้งค่า',
          })}
        </p>

        <PermissionCard
          icon={Mic}
          title={t({ en: 'Microphone access', th: 'สิทธิ์ไมโครโฟน' })}
          description={t({ en: 'Needed to listen for scam calls while they happen.', th: 'จำเป็นเพื่อฟังหาสายหลอกลวงขณะเกิดขึ้น' })}
          tag={t({ en: 'Required', th: 'จำเป็น' })}
          tagTone="warn"
          state={micState}
          onGrant={requestMic}
          grantLabels={grantLabels(t)}
        />
        <PermissionCard
          icon={Smartphone}
          title={t({ en: 'Phone state', th: 'สถานะโทรศัพท์' })}
          description={t({ en: 'Not available on web — PaTuean uses this on mobile to detect incoming calls automatically.', th: 'ไม่รองรับบนเว็บ — บนมือถือใช้เพื่อตรวจจับสายเรียกเข้าอัตโนมัติ' })}
          tag={t({ en: 'Recommended', th: 'แนะนำ' })}
          tagTone="neutral"
          state="idle"
          info
          grantLabels={grantLabels(t)}
        />
        <PermissionCard
          icon={Bell}
          title={t({ en: 'Notifications', th: 'การแจ้งเตือน' })}
          description={t({ en: 'So we can alert you and your family the moment a scam call is detected.', th: 'เพื่อแจ้งเตือนคุณและครอบครัวทันทีที่ตรวจพบสายหลอกลวง' })}
          tag={t({ en: 'Recommended', th: 'แนะนำ' })}
          tagTone="neutral"
          state={notifState}
          onGrant={requestNotifications}
          grantLabels={grantLabels(t)}
        />

        <label className="flex items-start gap-3 rounded-card bg-white p-3.5 text-left text-navy-900 shadow-card">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-slate-200 accent-blue-600"
          />
          <span className="text-small text-slate-600">
            {t({
              en: 'I understand PaTuean analyzes my calls in real time to detect scams, and I consent to this monitoring.',
              th: 'ฉันเข้าใจว่า ป้าเตือน วิเคราะห์สายของฉันแบบเรียลไทม์เพื่อตรวจจับการหลอกลวง และยินยอมให้ตรวจสอบ',
            })}
          </span>
        </label>

        <Button variant="secondary" fullWidth disabled={!consent} loading={continueMutation.isPending} onClick={() => continueMutation.mutate()} className="bg-ink-950 hover:bg-ink-900">
          {t({ en: 'Continue', th: 'ดำเนินการต่อ' })}
        </Button>
      </div>
    </div>
  )
}

function grantLabels(t: <T>(p: Localized<T>) => T) {
  return {
    granted: t({ en: 'Granted', th: 'อนุญาตแล้ว' }),
    denied: t({ en: 'Denied — tap to retry', th: 'ถูกปฏิเสธ — แตะเพื่อลองใหม่' }),
    grant: t({ en: 'Grant access', th: 'อนุญาต' }),
  }
}

function PermissionCard({
  icon: Icon,
  title,
  description,
  tag,
  tagTone,
  state,
  onGrant,
  info,
  grantLabels: labels,
}: {
  icon: LucideIcon
  title: string
  description: string
  tag: string
  tagTone: 'warn' | 'neutral'
  state: PermissionState
  onGrant?: () => void
  info?: boolean
  grantLabels: { granted: string; denied: string; grant: string }
}) {
  return (
    <div className="flex items-start gap-3 rounded-card bg-white p-3.5 text-navy-900 shadow-card">
      <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-label">{title}</p>
          <Pill tone={tagTone}>{tag}</Pill>
        </div>
        <p className="mt-1 text-caption text-slate-600">{description}</p>
        {!info && (
          <button
            type="button"
            onClick={onGrant}
            className="mt-2 flex min-h-tap items-center gap-1 text-small font-semibold text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {state === 'granted' ? (
              <>
                <CircleCheck className="h-4 w-4" aria-hidden="true" /> {labels.granted}
              </>
            ) : state === 'denied' ? (
              labels.denied
            ) : (
              labels.grant
            )}
          </button>
        )}
      </div>
    </div>
  )
}
