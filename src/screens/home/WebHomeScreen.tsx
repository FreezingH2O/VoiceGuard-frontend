import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Mic,
  Bell,
  Users,
  History as HistoryIcon,
  SlidersHorizontal,
  PhoneCall,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { StatusBadge } from '@/components/web/StatusBadge'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { useAuth } from '@/hooks/useAuth'
import { useLang, type Localized } from '@/i18n/LangProvider'
import { formatRelativeTime } from '@/lib/format'

const SHOWCASE: { icon: LucideIcon; title: Localized; description: Localized; to: string }[] = [
  {
    icon: PhoneCall,
    title: { en: 'Automatic call monitoring', th: 'ตรวจสอบสายอัตโนมัติ' },
    description: { en: 'We listen during your calls and score the caller’s voice in real time.', th: 'เราฟังระหว่างสายและให้คะแนนเสียงผู้โทรแบบเรียลไทม์' },
    to: '/demo',
  },
  {
    icon: Bell,
    title: { en: 'Instant scam alerts', th: 'แจ้งเตือนสแกมทันที' },
    description: { en: 'The moment a call looks like a scam, you get a clear warning to hang up.', th: 'ทันทีที่สายดูเหมือนหลอกลวง คุณจะได้รับคำเตือนชัดเจนให้วางสาย' },
    to: '/app-preview/history',
  },
  {
    icon: Users,
    title: { en: 'Family alerts (Elder Mode)', th: 'แจ้งเตือนครอบครัว (โหมดผู้สูงอายุ)' },
    description: { en: 'Scam alerts also reach a family member, so no one faces it alone.', th: 'การแจ้งเตือนสแกมถึงคนในครอบครัวด้วย เพื่อไม่ให้ใครเผชิญเพียงลำพัง' },
    to: '/app-preview/family',
  },
  {
    icon: HistoryIcon,
    title: { en: 'Call history & explanations', th: 'ประวัติสาย & คำอธิบาย' },
    description: { en: 'Every call is logged with a plain-language reason for its verdict.', th: 'ทุกสายถูกบันทึกพร้อมเหตุผลของคำตัดสินที่เข้าใจง่าย' },
    to: '/app-preview/history',
  },
  {
    icon: SlidersHorizontal,
    title: { en: 'Your controls', th: 'การตั้งค่าของคุณ' },
    description: { en: 'Tune sensitivity, choose which calls to monitor, block and report numbers.', th: 'ปรับความไว เลือกสายที่จะตรวจ บล็อกและรายงานเบอร์' },
    to: '/app-preview/settings',
  },
]

export function WebHomeScreen() {
  const { user } = useAuth()
  const { t } = useLang()
  const firstName = user?.name?.split(' ')[0] ?? t({ en: 'there', th: 'คุณ' })

  return (
    <div className="mx-auto w-full max-w-content px-6 py-12 sm:px-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-web-h1 text-white">{t({ en: `Welcome, ${firstName}`, th: `ยินดีต้อนรับ ${firstName}` })}</h1>
            <p className="mt-1 text-web-body text-mist-300">{t({ en: 'Your VoiceGuard account is ready.', th: 'บัญชี VoiceGuard ของคุณพร้อมแล้ว' })}</p>
          </div>
          <Link to="/demo/live-test" className="shrink-0">
            <Button variant="primary" leftIcon={<Mic className="h-4 w-4" aria-hidden="true" />}>
              {t({ en: 'Start a test', th: 'เริ่มทดสอบ' })}
            </Button>
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <LiveDetectorPanel />
        <YourTestsPanel />
      </div>

      {/* Secondary: coming to your phone (preview) */}
      <section className="mt-16">
        <Reveal>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-web-h1 text-white">{t({ en: 'Coming to your phone', th: 'เร็ว ๆ นี้บนมือถือ' })}</h2>
            <StatusBadge kind="preview" />
          </div>
          <p className="mt-2 max-w-[70ch] text-web-body text-mist-300">
            {t({
              en: 'Explore the full app below. On your phone it runs automatically during real calls — that’s our next phase.',
              th: 'สำรวจแอปเต็มรูปแบบด้านล่าง บนมือถือจะทำงานอัตโนมัติระหว่างสายจริง — นั่นคือขั้นถัดไปของเรา',
            })}
          </p>
        </Reveal>

        <RevealGroup className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((card) => (
            <RevealItem key={card.to + t(card.title)}>
              <Link
                to={card.to}
                className="group flex h-full items-start gap-4 rounded-web-card border border-white/10 bg-surface-800 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-glow-soft"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-white/5 text-mist-300">
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-body-medium font-semibold text-white">{t(card.title)}</span>
                  <span className="mt-0.5 block text-small text-mist-300">{t(card.description)}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-mist-500 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <div className="mt-12 text-center">
        <Link to="/how-it-works" className="text-body-sm font-medium text-mist-300 underline underline-offset-4 transition hover:text-white">
          {t({ en: 'How VoiceGuard works', th: 'VoiceGuard ทำงานอย่างไร' })}
        </Link>
      </div>
    </div>
  )
}

/** The visual anchor — the account’s real, working feature: the full analysis. */
function LiveDetectorPanel() {
  const { t } = useLang()
  return (
    <div className="lg:col-span-8">
      <div className="relative h-full overflow-hidden rounded-web-card border border-white/10 bg-surface-800 p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-coral-500/15 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-button bg-glow-grad">
            <Mic className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <StatusBadge kind="live" />
        </div>
        <h2 className="relative mt-5 font-display text-h1 text-white">{t({ en: 'Run the full analysis', th: 'รันการวิเคราะห์เต็มรูปแบบ' })}</h2>
        <p className="relative mt-2 max-w-[52ch] text-web-body text-mist-300">
          {t({
            en: 'Record or upload a voice and run it through the real anti-spoof, ASR and LLM pipeline — the same engine that will protect live calls.',
            th: 'อัดหรืออัปโหลดเสียงแล้วรันผ่านระบบป้องกันเสียงปลอม ถอดเสียง และ LLM จริง — เครื่องมือเดียวกับที่จะปกป้องสายจริง',
          })}
        </p>
        <Link to="/demo/live-test" className="relative mt-6 block sm:inline-block">
          <Button variant="primary" fullWidth className="sm:w-auto sm:px-8">
            {t({ en: 'Start a test', th: 'เริ่มทดสอบ' })}
          </Button>
        </Link>
      </div>
    </div>
  )
}

function YourTestsPanel() {
  const { t } = useLang()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.detectorTests,
    queryFn: api.detector.listTests,
  })

  return (
    <div className="lg:col-span-4">
      <div className="h-full rounded-web-card border border-white/10 bg-surface-800 p-6">
        <h2 className="text-h2 font-semibold text-white">{t({ en: 'Your tests', th: 'การทดสอบของคุณ' })}</h2>

        {isPending && (
          <div className="mt-4 flex flex-col gap-2">
            <Skeleton variant="line" />
            <Skeleton variant="line" />
          </div>
        )}
        {isError && (
          <div className="mt-4">
            <ErrorState onRetry={() => refetch()} />
          </div>
        )}

        {data && data.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-mist-300">
              <Mic className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-small text-mist-300">{t({ en: 'No tests yet — try the detector.', th: 'ยังไม่มีการทดสอบ — ลองใช้เครื่องตรวจจับ' })}</p>
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="mt-4 flex flex-col divide-y divide-white/10">
            {data.map((row) => {
              const realVoice = 100 - row.spoofProb
              const flagged = row.scamProb >= 50
              return (
                <li key={row.id}>
                  <Link to="/demo/live-test" className="flex items-center gap-3 py-3 transition hover:opacity-80">
                    <span
                      className={
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-tag font-semibold ' +
                        (flagged ? 'bg-danger-500/15 text-danger-500' : 'bg-teal-400/15 text-teal-400')
                      }
                    >
                      {flagged ? 'FAKE' : 'REAL'}
                    </span>
                    <span className="flex-1">
                      <span className="block text-small text-white">
                        {t({ en: `Real voice ${realVoice}% · Scam ${row.scamProb}%`, th: `เสียงจริง ${realVoice}% · สแกม ${row.scamProb}%` })}
                      </span>
                      <span className="block text-caption text-mist-500">{formatRelativeTime(row.createdAt)}</span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-mist-500" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
