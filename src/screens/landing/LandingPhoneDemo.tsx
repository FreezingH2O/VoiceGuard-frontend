import { useState } from 'react'
import {
  ShieldCheck,
  TriangleAlert,
  Users,
  Phone,
  MessageSquare,
  Ban,
  PhoneIncoming,
  ChevronRight,
} from 'lucide-react'
import { PhoneMockup } from '@/components/web/PhoneMockup'
import { PreviewThemeProvider } from '@/app/PreviewTheme'
import { StatusBar } from '@/components/StatusBar'
import { useLang, type Localized } from '@/i18n/LangProvider'
import { cn } from '@/lib/cn'

type Screen = 'dashboard' | 'alert' | 'family'

/**
 * Self-contained, tappable phone preview for the landing Phone App section
 * (landing-page §7). Light app screens glowing inside the device on the dark
 * page — the honest "this is the coming mobile product" taste, on mock data.
 * Persistently PREVIEW-labelled. Not the real preview zone; a marketing sampler.
 */
export function LandingPhoneDemo() {
  const { t } = useLang()
  const [screen, setScreen] = useState<Screen>('dashboard')

  const tabs: { key: Screen; label: Localized }[] = [
    { key: 'dashboard', label: { en: 'Dashboard', th: 'หน้าหลัก' } },
    { key: 'alert', label: { en: 'Live alert', th: 'แจ้งเตือนสด' } },
    { key: 'family', label: { en: 'Elder Mode', th: 'โหมดผู้สูงอายุ' } },
  ]

  return (
    <div className="flex flex-col items-center gap-5">
      <PreviewThemeProvider>
      <PhoneMockup className="shadow-glow-soft">
        <StatusBar />
        <div className="w-full bg-coral-500 px-3 py-1 text-center text-tag font-semibold uppercase tracking-wide text-white">
          {t({ en: 'PREVIEW · sample data', th: 'พรีวิว · ข้อมูลตัวอย่าง' })}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50">
          {screen === 'dashboard' && <DashboardScreen />}
          {screen === 'alert' && <AlertScreen />}
          {screen === 'family' && <FamilyScreenMini />}
        </div>
      </PhoneMockup>
      </PreviewThemeProvider>

      {/* Segmented screen switcher */}
      <div role="tablist" aria-label="Phone preview screens" className="flex flex-wrap justify-center gap-1.5 rounded-pill bg-white/5 p-1 ring-1 ring-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={screen === tab.key}
            onClick={() => setScreen(tab.key)}
            className={cn(
              'rounded-pill px-4 py-2 text-body-sm font-medium transition',
              screen === tab.key ? 'bg-coral-500 text-white' : 'text-mist-300 hover:text-white',
            )}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
    </div>
  )
}

function DashboardScreen() {
  const { t } = useLang()
  return (
    <div className="flex flex-col gap-3 p-4 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption uppercase tracking-wide text-slate-600">{t({ en: 'Protection', th: 'การป้องกัน' })}</p>
          <p className="text-h2 font-bold text-safe-500">{t({ en: 'Active', th: 'เปิดใช้งาน' })}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-safe-100 text-safe-500">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <StatTile value="128" label={t({ en: 'Calls screened', th: 'สายที่ตรวจ' })} />
        <StatTile value="6" label={t({ en: 'Scams blocked', th: 'บล็อกสแกม' })} tone="danger" />
      </div>
      <p className="mt-1 text-caption font-semibold uppercase tracking-wide text-slate-600">
        {t({ en: 'Recent calls', th: 'สายล่าสุด' })}
      </p>
      <CallRow name="+66 2 111 3333" verdict={t({ en: 'Safe', th: 'ปลอดภัย' })} tone="safe" />
      <CallRow name={t({ en: '“Bank security”', th: '“ฝ่ายความปลอดภัยธนาคาร”' })} verdict={t({ en: 'Scam', th: 'สแกม' })} tone="danger" />
      <CallRow name="+66 81 555 0198" verdict={t({ en: 'Safe', th: 'ปลอดภัย' })} tone="safe" />
    </div>
  )
}

function AlertScreen() {
  const { t } = useLang()
  return (
    <div className="flex h-full flex-col text-slate-900">
      <div className="bg-danger-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          <p className="text-alert-title font-bold">{t({ en: 'Likely scam', th: 'น่าจะเป็นสแกม' })}</p>
        </div>
        <p className="mt-1 text-small text-white/90">
          {t({ en: 'AI voice detected · asking for a one-time code', th: 'ตรวจพบเสียง AI · กำลังขอรหัส OTP' })}
        </p>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-around rounded-card bg-white p-3 shadow-card">
          <MiniRing pct={92} label={t({ en: 'Fake voice', th: 'เสียงปลอม' })} tone="danger" />
          <MiniRing pct={88} label={t({ en: 'Scam risk', th: 'ความเสี่ยง' })} tone="danger" />
        </div>
        <div className="rounded-card bg-white p-3 shadow-card">
          <p className="text-caption uppercase tracking-wide text-slate-600">{t({ en: 'Transcript', th: 'ถอดเสียง' })}</p>
          <p className="mt-1 text-small text-slate-600">
            {t({
              en: '“…confirm the 6-digit code we just sent to keep your account safe.”',
              th: '“…ยืนยันรหัส 6 หลักที่เราเพิ่งส่งไป เพื่อความปลอดภัยของบัญชี”',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

function FamilyScreenMini() {
  const { t } = useLang()
  return (
    <div className="flex flex-col gap-3 p-4 text-slate-900">
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
          <Users className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-body-sm font-semibold text-slate-900">{t({ en: 'Elder Mode', th: 'โหมดผู้สูงอายุ' })}</p>
          <p className="text-caption text-slate-600">{t({ en: 'Guardian: you', th: 'ผู้ดูแล: คุณ' })}</p>
        </div>
      </div>
      <div className="rounded-card border border-danger-100 bg-white p-3 shadow-card">
        <div className="flex items-center gap-2 text-danger-600">
          <PhoneIncoming className="h-4 w-4" aria-hidden="true" />
          <p className="text-body-sm font-semibold">{t({ en: 'Mom got a scam call', th: 'คุณแม่ได้รับสายหลอกลวง' })}</p>
        </div>
        <p className="mt-1 text-small text-slate-600">
          {t({ en: 'Flagged 12s ago · impersonating her bank', th: 'ตรวจพบเมื่อ 12 วินาทีก่อน · แอบอ้างเป็นธนาคาร' })}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <GuardianAction icon={Phone} label={t({ en: 'Call', th: 'โทร' })} />
          <GuardianAction icon={MessageSquare} label={t({ en: 'SMS', th: 'ส่ง SMS' })} />
          <GuardianAction icon={Ban} label={t({ en: 'Block', th: 'บล็อก' })} />
        </div>
      </div>
      <p className="text-caption text-slate-600">
        {t({ en: 'Alerts reach you even when she’s unsure what to do.', th: 'การแจ้งเตือนถึงคุณ แม้ท่านไม่รู้ว่าต้องทำอย่างไร' })}
      </p>
    </div>
  )
}

function StatTile({ value, label, tone = 'safe' }: { value: string; label: string; tone?: 'safe' | 'danger' }) {
  return (
    <div className="rounded-card bg-white p-3 shadow-card">
      <p className={cn('text-h1 font-bold tabular-nums', tone === 'danger' ? 'text-danger-600' : 'text-slate-900')}>{value}</p>
      <p className="text-caption text-slate-600">{label}</p>
    </div>
  )
}

function CallRow({ name, verdict, tone }: { name: string; verdict: string; tone: 'safe' | 'danger' }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-card p-3 shadow-card',
        tone === 'danger' ? 'bg-danger-100 ring-1 ring-danger-600/20' : 'bg-white',
      )}
    >
      <span className="truncate text-small font-medium text-slate-900">{name}</span>
      <span className="flex items-center gap-1">
        <span
          className={cn(
            'rounded-pill px-2 py-0.5 text-tag font-semibold',
            tone === 'danger' ? 'bg-danger-100 text-danger-600' : 'bg-safe-100 text-safe-500',
          )}
        >
          {verdict}
        </span>
        <ChevronRight className="h-4 w-4 text-slate-600" aria-hidden="true" />
      </span>
    </div>
  )
}

function GuardianAction({ icon: Icon, label }: { icon: typeof Phone; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-button bg-slate-100 py-2 text-slate-900">
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="text-tag font-medium">{label}</span>
    </div>
  )
}

function MiniRing({ pct, label, tone }: { pct: number; label: string; tone: 'danger' | 'safe' }) {
  const color = tone === 'danger' ? '#D93A3A' : '#2E9E6B'
  const r = 22
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-14 w-14">
        <svg width="56" height="56" className="-rotate-90">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(139,145,181,0.2)" strokeWidth="5" />
          <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-small font-bold tabular-nums text-slate-900">{pct}%</span>
      </div>
      <span className="text-tag uppercase tracking-wide text-slate-600">{label}</span>
    </div>
  )
}
