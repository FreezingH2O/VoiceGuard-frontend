import { Link } from 'react-router-dom'
import { Mic, Captions, BrainCircuit, ShieldAlert, ArrowRight, Lightbulb, Check, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/web/StatusBadge'
import { AmbientBackground } from '@/components/motion/AmbientBackground'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { useLang, type Localized } from '@/i18n/LangProvider'

const STAGES: { icon: LucideIcon; title: Localized; description: Localized }[] = [
  {
    icon: Mic,
    title: { en: 'Detect the voice', th: 'ตรวจจับเสียง' },
    description: { en: 'An anti-spoof model scores how likely the caller’s voice is AI-generated.', th: 'โมเดลป้องกันเสียงปลอมให้คะแนนความน่าจะเป็นว่าเสียงถูกสร้างด้วย AI' },
  },
  {
    icon: Captions,
    title: { en: 'Read the words', th: 'อ่านคำพูด' },
    description: { en: 'ASR transcribes the conversation in real time.', th: 'ระบบถอดเสียงแปลงบทสนทนาเป็นข้อความแบบเรียลไทม์' },
  },
  {
    icon: BrainCircuit,
    title: { en: 'Understand the intent', th: 'เข้าใจเจตนา' },
    description: { en: 'An LLM reads that text for scam context and pressure tactics.', th: 'LLM อ่านข้อความนั้นเพื่อหาบริบทการหลอกลวงและการกดดัน' },
  },
  {
    icon: ShieldAlert,
    title: { en: 'Decide & alert', th: 'ตัดสิน & เตือน' },
    description: { en: 'A second LLM combines the voice score and context into a verdict and alerts you if it crosses the threshold.', th: 'LLM ตัวที่สองรวมคะแนนเสียงและบริบทเป็นคำตัดสิน และเตือนคุณเมื่อเกินเกณฑ์' },
  },
]

const LIVE_TODAY: Localized[] = [
  { en: 'Anti-spoof model — scores synthetic vs. real voices', th: 'โมเดลป้องกันเสียงปลอม — แยกเสียงสังเคราะห์กับเสียงจริง' },
  { en: 'Automatic speech recognition (ASR)', th: 'ระบบถอดเสียงอัตโนมัติ (ASR)' },
  { en: 'LLM context + risk analysis', th: 'การวิเคราะห์บริบทและความเสี่ยงด้วย LLM' },
  { en: 'The live detector you can run right now', th: 'เครื่องตรวจจับสดที่คุณรันได้ทันที' },
]

export function HowItWorksScreen() {
  const { t } = useLang()
  return (
    <div className="w-full">
      {/* Header */}
      <section className="relative overflow-hidden px-6 pb-10 pt-20 sm:px-8">
        <AmbientBackground variant="band" />
        <Reveal className="relative mx-auto max-w-content">
          <StatusBadge kind="live" />
          <h1 className="mt-4 font-display text-web-hero text-white">{t({ en: 'How VoiceGuard works', th: 'VoiceGuard ทำงานอย่างไร' })}</h1>
          <p className="mt-3 max-w-[60ch] text-web-sub text-mist-300">
            {t({ en: 'Four stages, running the moment a call starts.', th: 'สี่ขั้นตอน ทำงานตั้งแต่วินาทีที่สายเริ่มต้น' })}
          </p>
        </Reveal>
      </section>

      {/* Pipeline */}
      <section className="mx-auto max-w-content px-6 py-8 sm:px-8">
        <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <RevealItem key={i}>
              <div className="group relative h-full rounded-web-card border border-white/10 bg-surface-800 p-6 transition hover:-translate-y-1 hover:border-coral-500/40 hover:shadow-glow-coral">
                {i < STAGES.length - 1 && (
                  <ArrowRight aria-hidden="true" className="absolute -right-[18px] top-11 z-10 hidden h-5 w-5 text-mist-500 lg:block" />
                )}
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-glow-grad text-body-sm font-bold text-white">{i + 1}</span>
                  <stage.icon className="h-5 w-5 text-coral-400" aria-hidden="true" />
                </div>
                <p className="mt-4 text-h2 font-semibold text-white">{t(stage.title)}</p>
                <p className="mt-2 text-web-caption text-mist-300">{t(stage.description)}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Check both signals callout */}
      <section className="mx-auto max-w-content px-6 py-6 sm:px-8">
        <Reveal>
          <div className="flex items-start gap-3 rounded-web-card border border-teal-400/30 bg-teal-400/5 p-6">
            <Lightbulb className="h-6 w-6 shrink-0 text-teal-400" aria-hidden="true" />
            <p className="text-web-body text-white">
              {t({
                en: 'A real voice can still run a scam, and a fake voice can say harmless things. That’s why we check both signals — independently.',
                th: 'เสียงจริงก็หลอกได้ และเสียงปลอมก็อาจพูดเรื่องธรรมดา นั่นคือเหตุผลที่เราตรวจทั้งสองสัญญาณ — แยกจากกัน',
              })}
            </p>
          </div>
        </Reveal>
      </section>

      {/* Live today + roadmap */}
      <section className="mx-auto max-w-content px-6 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-web-card border border-teal-400/25 bg-teal-400/5 p-7">
              <div className="flex items-center gap-2.5">
                <h2 className="text-h1 font-bold text-white">{t({ en: 'What’s live today', th: 'อะไรใช้ได้แล้ววันนี้' })}</h2>
                <StatusBadge kind="live" />
              </div>
              <ul className="mt-5 flex flex-1 flex-col gap-3">
                {LIVE_TODAY.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-web-body text-mist-300">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-400 text-ink-950">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {t(item)}
                  </li>
                ))}
              </ul>
              <Link to="/demo/live-test" className="mt-7 block sm:inline-block">
                <Button variant="primary" fullWidth className="sm:w-auto sm:px-6">
                  {t({ en: 'Try the live detector', th: 'ลองเครื่องตรวจจับสด' })}
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-web-card border border-blue-500/25 bg-blue-500/5 p-7">
              <h2 className="text-h1 font-bold text-white">{t({ en: 'Roadmap / next phase', th: 'แผนพัฒนา / ขั้นถัดไป' })}</h2>
              <dl className="mt-5 flex flex-col gap-5">
                <RoadmapRow
                  term={t({ en: 'Live today', th: 'ใช้ได้วันนี้' })}
                  detail={t({ en: 'Detection engine — real anti-spoof, ASR and LLM analysis.', th: 'เครื่องมือตรวจจับ — ระบบป้องกันเสียงปลอม ถอดเสียง และ LLM จริง' })}
                  tone="live"
                />
                <RoadmapRow
                  term={t({ en: 'Next phase', th: 'ขั้นถัดไป' })}
                  detail={t({ en: 'On-device live call capture (mobile telephony) so the engine runs automatically during real calls.', th: 'การดักจับสายบนอุปกรณ์ เพื่อให้เครื่องมือทำงานอัตโนมัติระหว่างสายจริง' })}
                  tone="next"
                />
                <RoadmapRow
                  term={t({ en: 'Also planned', th: 'ที่วางแผนไว้' })}
                  detail={t({ en: 'Elder Mode guardian alerts in production, and multi-language support.', th: 'การแจ้งเตือนผู้ดูแลในโหมดผู้สูงอายุในระบบจริง และรองรับหลายภาษา' })}
                  tone="planned"
                />
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bottom CTAs */}
      <section className="mx-auto max-w-content px-6 py-14 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/demo/live-test" className="sm:w-auto">
            <Button variant="primary" fullWidth className="sm:w-auto sm:px-8">
              {t({ en: 'Test the real detector', th: 'ทดสอบเครื่องตรวจจับจริง' })}
            </Button>
          </Link>
          <Link to="/demo" className="sm:w-auto">
            <Button variant="outline-light" fullWidth className="sm:w-auto sm:px-8">
              {t({ en: 'Experience a scam call', th: 'ลองประสบการณ์สายหลอกลวง' })}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function RoadmapRow({ term, detail, tone }: { term: string; detail: string; tone: 'live' | 'next' | 'planned' }) {
  const dot = tone === 'live' ? 'bg-teal-400' : tone === 'next' ? 'bg-blue-500' : 'bg-mist-500'
  return (
    <div className="flex gap-3">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      <div>
        <dt className="text-body-medium font-semibold text-white">{term}</dt>
        <dd className="mt-0.5 text-web-caption text-mist-300">{detail}</dd>
      </div>
    </div>
  )
}
