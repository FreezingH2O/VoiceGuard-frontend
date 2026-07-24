import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  ArrowRight,
  PhoneIncoming,
  AudioLines,
  Users,
  Fingerprint,
  History as HistoryIcon,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/Button'
import { PreviewThemeProvider } from '@/app/PreviewTheme'
import { PhoneMockup } from '@/components/web/PhoneMockup'
import { StatusBar } from '@/components/StatusBar'
import { EmbeddedPreviewProvider } from '@/app/EmbeddedPreview'
import { CallDetailScreen } from '@/screens/history/CallDetailScreen'
import { CallHistoryScreen } from '@/screens/history/CallHistoryScreen'
import { FamilyScreen } from '@/screens/family/FamilyScreen'
import { SettingsScreen } from '@/screens/settings/SettingsScreen'
import { useLang, type Localized } from '@/i18n/LangProvider'
import { cn } from '@/lib/cn'

/** The six features the left column offers; each maps to a real app screen. */
export type PhoneScreen = 'incoming' | 'clone' | 'family' | 'scamType' | 'history' | 'settings'

/**
 * Single source of truth for the feature list shown beside the preview phone on
 * both the landing and home pages. Each feature selects a *real* app-preview
 * screen (same components as /app-preview) to render inside the device.
 */
export const PREVIEW_FEATURES: { key: PhoneScreen; icon: LucideIcon; title: Localized; line: Localized }[] = [
  {
    key: 'incoming',
    icon: PhoneIncoming,
    title: { en: 'Incoming call — live analysis', th: 'สายเข้า — วิเคราะห์สด' },
    line: {
      en: 'A scam verdict with dual-signal rings (fake-voice + risk) and the transcript that triggered it.',
      th: 'คำตัดสินสแกมพร้อมวงแหวนสองสัญญาณ (เสียงปลอม + ความเสี่ยง) และถอดเสียงที่เป็นต้นเหตุ',
    },
  },
  {
    key: 'clone',
    icon: AudioLines,
    title: { en: 'Catch the voice clone', th: 'จับเสียงโคลน' },
    line: {
      en: 'A caller posing as a grandchild — flagged as an AI-cloned voice from the audio itself.',
      th: 'ผู้โทรอ้างเป็นหลาน — ถูกตั้งค่าสถานะว่าเป็นเสียงโคลนด้วย AI จากตัวเสียงเอง',
    },
  },
  {
    key: 'family',
    icon: Users,
    title: { en: 'Family alerts (Elder Mode)', th: 'แจ้งเตือนครอบครัว (โหมดผู้สูงอายุ)' },
    line: {
      en: 'Scam alerts also reach a linked family member, so no one faces a call alone.',
      th: 'การแจ้งเตือนสแกมถึงคนในครอบครัวที่เชื่อมต่อด้วย เพื่อไม่ให้ใครเผชิญสายเพียงลำพัง',
    },
  },
  {
    key: 'scamType',
    icon: Fingerprint,
    title: { en: 'Know the scam type', th: 'รู้ทันชนิดสแกม' },
    line: {
      en: 'The reasons behind a verdict — impersonation, urgency, authority — spelled out in plain words.',
      th: 'เหตุผลเบื้องหลังคำตัดสิน — การแอบอ้าง ความเร่งด่วน การอ้างอำนาจ — อธิบายเป็นภาษาที่เข้าใจง่าย',
    },
  },
  {
    key: 'history',
    icon: HistoryIcon,
    title: { en: 'Call history', th: 'ประวัติสาย' },
    line: {
      en: 'Every past call with a verdict chip — safe, suspicious or scam — you can open for the reason.',
      th: 'ทุกสายที่ผ่านมาพร้อมป้ายคำตัดสิน — ปลอดภัย น่าสงสัย หรือสแกม — เปิดดูเหตุผลได้',
    },
  },
  {
    key: 'settings',
    icon: SlidersHorizontal,
    title: { en: 'Settings', th: 'การตั้งค่า' },
    line: {
      en: 'Sensitivity, which calls to check, and your block & allow lists.',
      th: 'ความไว เลือกว่าจะตรวจสายแบบไหน และรายการบล็อกและอนุญาต',
    },
  },
]

function ScreenFor({ screen }: { screen: PhoneScreen }) {
  switch (screen) {
    case 'incoming':
      return <CallDetailScreen callId="call-1" />
    case 'clone':
      return <CallDetailScreen callId="call-5" />
    case 'scamType':
      return <CallDetailScreen callId="call-2" />
    case 'family':
      return <FamilyScreen />
    case 'history':
      return <CallHistoryScreen />
    case 'settings':
      return <SettingsScreen />
  }
}

/**
 * Feature-display phone for the landing + home "phone app" sections. Renders the
 * REAL app-preview screens (same components as /app-preview) inside the device,
 * but strictly *display-only*: the content is `inert` + pointer-events-none and
 * there is no bottom tab bar, so the interactive experience lives only at
 * /app-preview. Hover / tap reveals a shortcut into that full preview.
 *
 * Data comes from an isolated QueryClient so reads never touch the real signed-in
 * cache; the screens used here all read auth-free mock endpoints, so this works on
 * the public landing page as well as the signed-in home page.
 */
export function PreviewFeaturePhone({ screen }: { screen: PhoneScreen }) {
  const { t } = useLang()
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  )
  const contentRef = useRef<HTMLDivElement>(null)

  // Keep the embedded screens fully non-interactive (no focus, no tabbing in).
  useEffect(() => {
    if (contentRef.current) contentRef.current.inert = true
  }, [screen])

  return (
    <div className="group relative mx-auto w-full max-w-[404px] sm:w-[412px]">
      <PreviewThemeProvider>
      <PhoneMockup className="shadow-glow-soft">
        <QueryClientProvider client={client}>
          <EmbeddedPreviewProvider value={true}>
            <StatusBar />
            <div className="w-full bg-coral-500 px-3 py-1 text-center text-tag font-semibold uppercase tracking-wide text-white">
              {t({ en: 'PREVIEW · sample data', th: 'พรีวิว · ข้อมูลตัวอย่าง' })}
            </div>
            <div ref={contentRef} className="flex flex-1 select-none flex-col overflow-hidden bg-slate-50 [pointer-events:none]">
              <ScreenFor screen={screen} />
            </div>
          </EmbeddedPreviewProvider>
        </QueryClientProvider>
      </PhoneMockup>
      </PreviewThemeProvider>

      {/* Hover / focus overlay → jump to the full, interactive preview (login-gated) */}
      <Link
        to="/app-preview"
        className={cn(
          'absolute inset-0 z-30 flex items-end justify-center rounded-[44px] p-8 sm:rounded-[52px]',
          'bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent',
          'opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100',
        )}
        aria-label={t({ en: 'Go to preview page', th: 'ไปที่หน้าพรีวิว' })}
      >
        <span className="pointer-events-none">
          <Button variant="primary" className="px-6">
            {t({ en: 'Go to preview page', th: 'ไปที่หน้าพรีวิว' })}{' '}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </span>
      </Link>
    </div>
  )
}
