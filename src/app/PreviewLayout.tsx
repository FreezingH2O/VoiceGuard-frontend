import { Link, NavLink, useMatches } from 'react-router-dom'
import { House, History as HistoryIcon, Users, Settings as SettingsIcon, ChevronLeft, type LucideIcon } from 'lucide-react'
import { WebNavbar } from '@/components/web/WebNavbar'
import { PhoneMockup } from '@/components/web/PhoneMockup'
import { StatusBadge } from '@/components/web/StatusBadge'
import { AmbientBackground } from '@/components/motion/AmbientBackground'
import { PreviewPhoneScreen, type PreviewHandle } from '@/app/PreviewPhoneScreen'
import { useAuth } from '@/hooks/useAuth'
import { useLang, type Localized } from '@/i18n/LangProvider'
import { cn } from '@/lib/cn'

const SIDE_LINKS: { to: string; label: Localized; caption: Localized; icon: LucideIcon; end?: boolean }[] = [
  { to: '/app-preview', label: { en: 'Dashboard', th: 'หน้าหลัก' }, caption: { en: 'Protection status & recent calls', th: 'สถานะการป้องกันและสายล่าสุด' }, icon: House, end: true },
  { to: '/app-preview/history', label: { en: 'Call history', th: 'ประวัติสาย' }, caption: { en: 'Every call, logged with a reason', th: 'ทุกสายพร้อมเหตุผล' }, icon: HistoryIcon },
  { to: '/app-preview/family', label: { en: 'Family / Elder Mode', th: 'ครอบครัว / โหมดผู้สูงอายุ' }, caption: { en: 'Guardian alerts for someone you love', th: 'แจ้งเตือนผู้ดูแลสำหรับคนที่คุณรัก' }, icon: Users },
  { to: '/app-preview/settings', label: { en: 'Settings', th: 'การตั้งค่า' }, caption: { en: 'Sensitivity, scope & controls', th: 'ความไว ขอบเขต และการควบคุม' }, icon: SettingsIcon },
]

/**
 * Dark web page framing the mobile preview zone (design.md §1 — the phone mockup
 * sits on a dark page, its light screen glowing like a real device). Carries the
 * navbar, a PREVIEW-marked heading, an exit control, and — for the app zone — a
 * side rail driving the phone's active screen. The persistent PREVIEW marker
 * lives on the heading and inside the device.
 */
export function PreviewLayout() {
  const { isAuthed } = useAuth()
  const { t } = useLang()
  const matches = useMatches()
  const handle = matches.at(-1)?.handle as PreviewHandle | undefined
  const zone = handle?.zone ?? 'demo'
  const exitTo = isAuthed ? '/home' : '/'

  const heading: { title: Localized; sub: Localized } =
    zone === 'app'
      ? {
          title: { en: 'The VoiceGuard mobile app', th: 'แอปมือถือ VoiceGuard' },
          sub: { en: 'Sample data — on your phone this runs automatically during real calls.', th: 'ข้อมูลตัวอย่าง — บนมือถือจะทำงานอัตโนมัติระหว่างสายจริง' },
        }
      : {
          title: { en: 'See VoiceGuard on a live call', th: 'ดู VoiceGuard บนสายจริง' },
          sub: { en: 'A scripted sample call showing the in-call experience. Nothing is recorded.', th: 'สายตัวอย่างแบบสคริปต์แสดงประสบการณ์ระหว่างสาย ไม่มีการบันทึก' },
        }

  return (
    <div className="on-dark relative flex min-h-dvh flex-col bg-ink-950 text-white">
      <AmbientBackground variant="band" className="opacity-60" />
      <div className="relative flex flex-1 flex-col">
        <WebNavbar />

        <div className="mx-auto w-full max-w-content flex-1 px-6 py-8 sm:px-8">
          {/* Heading + persistent PREVIEW pill + exit control */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-web-h1 text-white">{t(heading.title)}</h1>
                <StatusBadge kind="preview" />
              </div>
              <p className="mt-2 max-w-[60ch] text-web-body text-mist-300">{t(heading.sub)}</p>
            </div>
            <Link
              to={exitTo}
              className="inline-flex shrink-0 items-center gap-1 self-start rounded-button border border-white/15 bg-white/5 px-4 py-2.5 text-body-sm font-medium text-mist-300 transition hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Exit preview', th: 'ออกจากพรีวิว' })}
            </Link>
          </div>

          <div className={cn('grid gap-10', zone === 'app' ? 'lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start' : 'place-items-center')}>
            {/* Side rail — app zone only */}
            {zone === 'app' && (
              <nav aria-label="Preview screens" className="order-2 flex flex-col gap-2.5 lg:order-1 lg:max-w-sm">
                {SIDE_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-web-card border p-4 text-left transition',
                        isActive ? 'border-coral-500/50 bg-surface-800 shadow-glow-coral' : 'border-white/10 bg-surface-800 hover:border-white/20',
                      )
                    }
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-white/5 text-mist-300">
                      <l.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-body-medium font-semibold text-white">{t(l.label)}</span>
                      <span className="block text-small text-mist-300">{t(l.caption)}</span>
                    </span>
                  </NavLink>
                ))}
              </nav>
            )}

            {/* The phone */}
            <div className={cn('order-1 lg:order-2', zone === 'app' && 'mx-auto lg:mx-0')}>
              <PhoneMockup className="shadow-glow-soft">
                <PreviewPhoneScreen />
              </PhoneMockup>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
