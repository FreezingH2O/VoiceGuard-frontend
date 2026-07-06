import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Mic,
  Captions,
  BrainCircuit,
  ShieldAlert,
  ArrowRight,
  ArrowDown,
  Globe,
  Smartphone,
  Code2,
  Lightbulb,
  Lock,
  Check,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/Button'
import { StatusBadge, type StatusKind } from '@/components/web/StatusBadge'
import { AmbientBackground } from '@/components/motion/AmbientBackground'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { HeroReveal, HeroFollow } from '@/components/motion/HeroReveal'
import { Marquee } from '@/components/motion/Marquee'
import { LandingPhoneDemo } from '@/screens/landing/LandingPhoneDemo'
import { useLang, type Localized } from '@/i18n/LangProvider'
import { useCountUp } from '@/hooks/useCountUp'
import { scrollToAnchor } from '@/hooks/useLenis'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/cn'

export function LandingScreen() {
  const location = useLocation()

  // Arriving from another route with /#anchor → smooth-scroll to it once mounted.
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      requestAnimationFrame(() => setTimeout(() => scrollToAnchor(id), 60))
    }
  }, [location.hash])

  return (
    <div className="w-full overflow-x-clip">
      <Hero />
      <TrustMarquee />
      <ProblemSection />
      <KeyFeatureSection />
      <HowItWorksSection />
      <ServiceCardsSection />
      <WebAppDetail />
      <PhoneAppDetail />
      <ApiDetail />
      <RoadmapSection />
      <ClosingCta />
    </div>
  )
}

/* ─────────────────────────── shared bits ─────────────────────────── */

function Section({
  id,
  bg = 'ink-950',
  className,
  children,
}: {
  id?: string
  bg?: 'ink-950' | 'ink-900'
  className?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className={cn('relative scroll-mt-20 px-6 py-24 sm:px-8 lg:py-32', bg === 'ink-900' ? 'bg-ink-900' : 'bg-ink-950', className)}
    >
      <div className="mx-auto max-w-content">{children}</div>
    </section>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-web-caption font-semibold uppercase tracking-[0.18em] text-coral-400">{children}</p>
}

function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('font-display text-web-section text-white', className)}>{children}</h2>
}

/* ─────────────────────────── 1. Hero ─────────────────────────── */

function Hero() {
  const { t, lang } = useLang()
  const headline: { text: string; className?: string }[] =
    lang === 'th'
      ? [
          { text: 'รู้ทันว่า' },
          { text: 'เสียง' },
          { text: 'ปลายสาย' },
          { text: 'จริง', className: 'text-coral-500' },
          { text: 'หรือไม่' },
        ]
      : [
          { text: 'Know' },
          { text: 'if' },
          { text: 'the' },
          { text: 'voice' },
          { text: 'is' },
          { text: 'real', className: 'text-coral-500' },
        ]

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden px-6 pb-16 pt-12 sm:px-8">
      <AmbientBackground variant="hero" />
      <div className="relative mx-auto grid w-full max-w-content items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start gap-6">
          <HeroFollow delay={0}>
            <StatusBadge kind="live">
              {t({ en: 'Real-time AI voice-scam detection', th: 'ตรวจจับสายหลอกลวงเสียง AI แบบเรียลไทม์' })}
            </StatusBadge>
          </HeroFollow>

          <HeroReveal words={headline} className="font-display text-web-hero text-white" />

          <HeroFollow delay={0.5}>
            <p className="max-w-[54ch] text-web-sub text-mist-300">
              {t({
                en: 'VoiceGuard listens for AI-cloned voices and scam patterns while a call is happening — and warns you before anyone sends money or shares a code.',
                th: 'VoiceGuard ฟังหาเสียงที่ถูกโคลนด้วย AI และรูปแบบการหลอกลวงระหว่างการโทร — และเตือนคุณก่อนที่ใครจะโอนเงินหรือบอกรหัส',
              })}
            </p>
          </HeroFollow>

          <HeroFollow delay={0.62}>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/demo/live-test">
                <Button variant="primary" className="px-6" leftIcon={<Mic className="h-5 w-5" aria-hidden="true" />}>
                  {t({ en: 'Try live detection', th: 'ทดลองตรวจจับสด' })}
                </Button>
              </Link>
              <button type="button" onClick={() => scrollToAnchor('how-it-works')}>
                <Button variant="outline-light" className="px-6">
                  {t({ en: 'See how it works', th: 'ดูวิธีการทำงาน' })}
                </Button>
              </button>
            </div>
          </HeroFollow>

          <HeroFollow delay={0.72}>
            <p className="flex items-center gap-1.5 text-web-caption text-mist-500">
              <Lock className="h-4 w-4" aria-hidden="true" />
              {t({ en: 'Analyzed live, never stored.', th: 'วิเคราะห์แบบสด ไม่เก็บไฟล์เสียง' })}
            </p>
          </HeroFollow>
        </div>

        <HeroFollow delay={0.4}>
          <HeroVisual />
        </HeroFollow>
      </div>

      <button
        type="button"
        aria-label="Scroll down"
        onClick={() => scrollToAnchor('how-it-works')}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-mist-500 transition hover:text-white lg:block"
      >
        <ArrowDown className="h-5 w-5 animate-float" aria-hidden="true" />
      </button>
    </section>
  )
}

function HeroVisual() {
  const { t } = useLang()
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="animate-float rounded-web-card border border-white/10 bg-surface-800/80 p-6 shadow-glow-soft backdrop-blur">
        <div className="flex items-center gap-3 rounded-card bg-danger-500/15 p-3 ring-1 ring-danger-500/30">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-500 text-white">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-body-sm font-bold text-white">{t({ en: 'Likely scam', th: 'น่าจะเป็นสแกม' })}</p>
            <p className="text-caption text-mist-300">{t({ en: 'AI voice · asking for an OTP', th: 'เสียง AI · กำลังขอ OTP' })}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-around">
          <HeroRing pct={91} tone="danger" label={t({ en: 'Fake voice', th: 'เสียงปลอม' })} />
          <span className="text-2xl text-mist-500" aria-hidden="true">+</span>
          <HeroRing pct={87} tone="danger" label={t({ en: 'Scam intent', th: 'เจตนาหลอก' })} />
        </div>

        <div className="mt-5 rounded-card bg-ink-950/60 p-3">
          <p className="text-tag uppercase tracking-wide text-mist-500">{t({ en: 'Transcript', th: 'ถอดเสียง' })}</p>
          <p className="mt-1 text-small text-mist-300">
            {t({ en: '“…confirm the code we just texted you.”', th: '“…ยืนยันรหัสที่เราเพิ่งส่งไปให้หน่อย”' })}
          </p>
        </div>
      </div>

      <div
        className="absolute -bottom-5 -left-4 flex animate-float items-center gap-2 rounded-pill bg-ink-900 px-4 py-2 shadow-glow-teal ring-1 ring-teal-400/30"
        style={{ animationDelay: '-3s' }}
      >
        <Check className="h-4 w-4 text-teal-400" aria-hidden="true" />
        <span className="text-caption font-semibold text-teal-400">{t({ en: 'Real voice verified', th: 'ยืนยันเสียงจริง' })}</span>
      </div>
    </div>
  )
}

function HeroRing({ pct, tone, label }: { pct: number; tone: 'danger' | 'teal'; label: string }) {
  const color = tone === 'danger' ? '#F5455C' : '#34D6C4'
  const r = 30
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-[76px] w-[76px]">
        <svg width="76" height="76" className="-rotate-90">
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-body-sm font-bold tabular-nums text-white">{pct}%</span>
      </div>
      <span className="text-tag uppercase tracking-wide text-mist-500">{label}</span>
    </div>
  )
}

/* ───────────────────── trust marquee under hero ───────────────────── */

function TrustMarquee() {
  const { t } = useLang()
  const items: Localized[] = [
    { en: 'No raw audio stored', th: 'ไม่เก็บไฟล์เสียงต้นฉบับ' },
    { en: 'Analyzed in real time', th: 'วิเคราะห์แบบเรียลไทม์' },
    { en: 'Anti-spoof + ASR + LLM', th: 'ป้องกันเสียงปลอม + ถอดเสียง + LLM' },
    { en: 'Built for Thai families', th: 'สร้างเพื่อครอบครัวไทย' },
    { en: 'Privacy first', th: 'ความเป็นส่วนตัวมาก่อน' },
  ]
  return (
    <div className="border-y border-white/10 bg-ink-900 py-5">
      <Marquee itemClassName="px-8">
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-3 text-body-medium text-mist-300">
            <span className="h-1.5 w-1.5 rounded-full bg-coral-500" aria-hidden="true" />
            {t(it)}
          </span>
        ))}
      </Marquee>
    </div>
  )
}

/* ─────────────────────────── 2. Problem ─────────────────────────── */

function ProblemSection() {
  const { t } = useLang()
  const beats: { title: Localized; body: Localized }[] = [
    {
      title: { en: 'Voice cloning is cheap now', th: 'การโคลนเสียงถูกและง่ายขึ้น' },
      body: {
        en: 'A few seconds of audio is enough to fake a convincing voice — a bank officer, a police officer, even a family member.',
        th: 'เสียงเพียงไม่กี่วินาทีก็เพียงพอจะปลอมเสียงให้เหมือนจริง — เจ้าหน้าที่ธนาคาร ตำรวจ หรือแม้แต่คนในครอบครัว',
      },
    },
    {
      title: { en: 'The pressure is the trap', th: 'ความกดดันคือกับดัก' },
      body: {
        en: 'Scammers create urgency — an account frozen, a warrant issued — to rush people into sending money or codes.',
        th: 'มิจฉาชีพสร้างความเร่งด่วน — บัญชีถูกอายัด มีหมายจับ — เพื่อเร่งให้เหยื่อโอนเงินหรือบอกรหัส',
      },
    },
    {
      title: { en: 'Elders are hit hardest', th: 'ผู้สูงอายุคือเป้าหมายหลัก' },
      body: {
        en: 'Older people are targeted most and are least likely to recognise a synthetic voice in the moment.',
        th: 'ผู้สูงอายุถูกหลอกบ่อยที่สุด และมีโอกาสน้อยที่สุดที่จะรู้ทันเสียงปลอมในขณะนั้น',
      },
    },
  ]
  return (
    <Section id="problem" bg="ink-900">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Eyebrow>{t({ en: 'The problem', th: 'ปัญหา' })}</Eyebrow>
          <SectionTitle className="mt-3">
            {t({ en: 'The scam call sounds exactly like someone you trust.', th: 'สายหลอกลวงฟังดูเหมือนคนที่คุณไว้ใจทุกประการ' })}
          </SectionTitle>
          <StatCounter />
        </Reveal>

        <RevealGroup className="flex flex-col gap-4">
          {beats.map((b, i) => (
            <RevealItem key={i}>
              <div className="rounded-web-card border border-white/10 bg-surface-800 p-6 transition hover:border-white/20">
                <p className="text-h2 font-semibold text-white">{t(b.title)}</p>
                <p className="mt-2 text-web-body text-mist-300">{t(b.body)}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  )
}

function StatCounter() {
  const { t } = useLang()
  const { ref, value } = useCountUp(2.6, 1600)
  return (
    <div className="mt-10 rounded-web-card bg-glow-grad p-[1px]">
      <div className="rounded-web-card bg-ink-900 p-6">
        <p className="font-display text-5xl font-bold tabular-nums text-white">
          ฿<span ref={ref}>{value.toFixed(1)}</span>B+
        </p>
        <p className="mt-1 text-web-caption text-mist-300">
          {t({
            en: 'Reported Thai call-scam losses in a single recent year.',
            th: 'มูลค่าความเสียหายจากแก๊งคอลเซ็นเตอร์ในไทยที่มีการรายงานในปีเดียว',
          })}
        </p>
        <p className="mt-2 text-caption text-mist-500">
          {t({ en: 'Illustrative figure for this demo.', th: 'ตัวเลขเพื่อประกอบการสาธิตเท่านั้น' })}
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────── 3. Key feature ─────────────────────────── */

function KeyFeatureSection() {
  const { t } = useLang()
  return (
    <Section id="key-feature">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>{t({ en: 'The core idea', th: 'แนวคิดหลัก' })}</Eyebrow>
          <SectionTitle className="mt-3">
            {t({ en: 'We check the voice and the words — independently.', th: 'เราตรวจทั้งเสียงและเนื้อหา — แยกจากกัน' })}
          </SectionTitle>
          <p className="mt-4 text-web-body text-mist-300">
            {t({
              en: 'VoiceGuard scores whether the caller’s voice is AI-generated, and separately reads the conversation for scam intent. Then it combines both into one verdict.',
              th: 'VoiceGuard ให้คะแนนว่าเสียงผู้โทรถูกสร้างด้วย AI หรือไม่ และอ่านบทสนทนาเพื่อหาเจตนาหลอกลวงแยกกัน แล้วจึงรวมทั้งสองเป็นคำตัดสินเดียว',
            })}
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-web-card border border-teal-400/30 bg-teal-400/5 p-5">
            <Lightbulb className="h-6 w-6 shrink-0 text-teal-400" aria-hidden="true" />
            <p className="text-web-body text-white">
              {t({
                en: 'A real voice can still run a scam, and a fake voice can say harmless things — so we check both, independently.',
                th: 'เสียงจริงก็หลอกได้ และเสียงปลอมก็อาจพูดเรื่องธรรมดา — เราจึงตรวจทั้งสองอย่างแยกกัน',
              })}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <SignalMergeVisual />
        </Reveal>
      </div>
    </Section>
  )
}

function SignalMergeVisual() {
  const { t } = useLang()
  return (
    <div className="relative rounded-web-card border border-white/10 bg-surface-800 p-8">
      <div className="flex items-center justify-around gap-4">
        <DialViz pct={78} color="#34D6C4" label={t({ en: 'Voice authenticity', th: 'ความแท้ของเสียง' })} />
        <DialViz pct={64} color="#EB7449" label={t({ en: 'Scam intent', th: 'เจตนาหลอก' })} />
      </div>
      <div className="my-6 flex items-center justify-center">
        <ArrowDown className="h-6 w-6 text-mist-500" aria-hidden="true" />
      </div>
      <div className="rounded-card bg-glow-grad p-[1px]">
        <div className="flex items-center justify-between rounded-card bg-ink-950 px-5 py-4">
          <span className="text-body-medium font-semibold text-white">{t({ en: 'Combined verdict', th: 'คำตัดสินรวม' })}</span>
          <span className="flex items-center gap-2 rounded-pill bg-danger-500/15 px-3 py-1 text-body-sm font-bold text-danger-500 ring-1 ring-danger-500/30">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Suspicious', th: 'น่าสงสัย' })}
          </span>
        </div>
      </div>
    </div>
  )
}

function DialViz({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg width="112" height="112" className="-rotate-90">
          <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-h1 font-bold tabular-nums text-white">{pct}</span>
      </div>
      <span className="max-w-[12ch] text-center text-caption uppercase tracking-wide text-mist-500">{label}</span>
    </div>
  )
}

/* ─────────────────────────── 4. How it works ─────────────────────────── */

const PIPELINE: { icon: LucideIcon; title: Localized; line: Localized }[] = [
  {
    icon: Mic,
    title: { en: 'Detect the voice', th: 'ตรวจจับเสียง' },
    line: { en: 'An anti-spoof model scores how likely the voice is AI-generated.', th: 'โมเดลป้องกันเสียงปลอมให้คะแนนความน่าจะเป็นเสียง AI' },
  },
  {
    icon: Captions,
    title: { en: 'Read the words', th: 'อ่านคำพูด' },
    line: { en: 'ASR transcribes the conversation in real time.', th: 'ระบบถอดเสียงแปลงบทสนทนาเป็นข้อความแบบเรียลไทม์' },
  },
  {
    icon: BrainCircuit,
    title: { en: 'Understand the intent', th: 'เข้าใจเจตนา' },
    line: { en: 'An LLM flags scam tactics — impersonation, urgency, code or money requests.', th: 'LLM ตรวจจับกลลวง — การแอบอ้าง ความเร่งด่วน การขอรหัสหรือเงิน' },
  },
  {
    icon: ShieldAlert,
    title: { en: 'Decide & alert', th: 'ตัดสิน & เตือน' },
    line: { en: 'A second LLM combines voice score + intent into a verdict and alerts instantly.', th: 'LLM ตัวที่สองรวมคะแนนเสียงกับเจตนาเป็นคำตัดสินและแจ้งเตือนทันที' },
  },
]

function HowItWorksSection() {
  const { t } = useLang()
  return (
    <Section id="how-it-works" bg="ink-900">
      <Reveal className="max-w-2xl">
        <Eyebrow>{t({ en: 'How it works', th: 'วิธีการทำงาน' })}</Eyebrow>
        <SectionTitle className="mt-3">
          {t({ en: 'Four stages run on the live call audio.', th: 'สี่ขั้นตอนทำงานบนเสียงสายที่กำลังโทร' })}
        </SectionTitle>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PIPELINE.map((step, i) => (
          <RevealItem key={i}>
            <div className="group relative h-full rounded-web-card border border-white/10 bg-surface-800 p-6 transition hover:-translate-y-1 hover:border-coral-500/40 hover:shadow-glow-coral">
              {i < PIPELINE.length - 1 && (
                <ArrowRight aria-hidden="true" className="absolute -right-[18px] top-11 z-10 hidden h-5 w-5 text-mist-500 lg:block" />
              )}
              <span className="flex h-11 w-11 items-center justify-center rounded-button bg-glow-grad text-white">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-tag font-semibold uppercase tracking-wide text-coral-400">
                {t({ en: `Stage ${i + 1}`, th: `ขั้นที่ ${i + 1}` })}
              </p>
              <p className="mt-1 text-h2 font-semibold text-white">{t(step.title)}</p>
              <p className="mt-2 text-web-caption text-mist-300">{t(step.line)}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal delay={0.1}>
        <div className="mt-8">
          <Link to="/how-it-works" className="inline-flex items-center gap-1.5 text-body-medium font-medium text-coral-400 hover:text-coral-500">
            {t({ en: 'See the full breakdown', th: 'ดูรายละเอียดทั้งหมด' })} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </Section>
  )
}

/* ─────────────────────────── 5. Service cards ─────────────────────────── */

const SERVICES: {
  icon: LucideIcon
  name: Localized
  status: StatusKind
  line: Localized
  anchor: string
  dimmed?: boolean
}[] = [
  {
    icon: Globe,
    name: { en: 'Web App', th: 'เว็บแอป' },
    status: 'live',
    line: { en: 'Try our real detection engine in your browser now.', th: 'ทดลองเครื่องมือตรวจจับจริงในเบราว์เซอร์ได้เลย' },
    anchor: 'web-app',
  },
  {
    icon: Smartphone,
    name: { en: 'Phone App', th: 'แอปมือถือ' },
    status: 'coming-soon',
    line: { en: 'Automatic protection during real calls, on your phone.', th: 'การป้องกันอัตโนมัติระหว่างสายจริง บนมือถือของคุณ' },
    anchor: 'phone-app',
    dimmed: true,
  },
  {
    icon: Code2,
    name: { en: 'API', th: 'เอพีไอ' },
    status: 'available',
    line: { en: 'Build voice-scam detection into your own product.', th: 'นำระบบตรวจจับไปใส่ในผลิตภัณฑ์ของคุณเอง' },
    anchor: 'api',
  },
]

function ServiceCardsSection() {
  const { t } = useLang()
  return (
    <Section id="services">
      <Reveal className="max-w-2xl">
        <Eyebrow>{t({ en: 'Three ways to use it', th: 'สามวิธีในการใช้งาน' })}</Eyebrow>
        <SectionTitle className="mt-3">{t({ en: 'Pick the one that fits you.', th: 'เลือกแบบที่เหมาะกับคุณ' })}</SectionTitle>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <RevealItem key={s.anchor}>
            <button
              type="button"
              onClick={() => scrollToAnchor(s.anchor)}
              className={cn(
                'group flex h-full w-full flex-col items-start rounded-web-card border p-7 text-left transition',
                s.dimmed
                  ? 'border-dashed border-white/15 bg-surface-800/50 hover:border-coral-500/40'
                  : 'border-white/10 bg-surface-800 hover:-translate-y-1 hover:border-white/20 hover:shadow-glow-soft',
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-button',
                    s.dimmed ? 'bg-white/5 text-mist-300' : 'bg-glow-grad text-white',
                  )}
                >
                  <s.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <StatusBadge kind={s.status} />
              </div>
              <p className="mt-5 font-display text-h1 font-bold text-white">{t(s.name)}</p>
              <p className="mt-2 flex-1 text-web-body text-mist-300">{t(s.line)}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-body-medium font-medium text-coral-400 group-hover:text-coral-500">
                {t({ en: 'Learn more', th: 'ดูเพิ่มเติม' })} <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  )
}

/* ─────────────────────────── 6. Web app detail ─────────────────────────── */

function WebAppDetail() {
  const { t } = useLang()
  return (
    <Section id="web-app" bg="ink-900">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="flex items-center gap-3">
            <Eyebrow>{t({ en: 'Web App', th: 'เว็บแอป' })}</Eyebrow>
            <StatusBadge kind="live" />
          </div>
          <SectionTitle className="mt-3">{t({ en: 'Prove it yourself, in seconds.', th: 'พิสูจน์ด้วยตัวคุณเองในไม่กี่วินาที' })}</SectionTitle>
          <p className="mt-4 text-web-body text-mist-300">
            {t({
              en: 'Record a voice — yours, or an AI-generated clip — and watch the real anti-spoof, ASR and LLM pipeline analyze it live. No account needed for the free voice check; sign in for the full transcript, context and scam verdict.',
              th: 'อัดเสียง — ของคุณ หรือคลิปที่สร้างด้วย AI — แล้วดูระบบป้องกันเสียงปลอม ถอดเสียง และ LLM วิเคราะห์แบบสด ตรวจเสียงฟรีไม่ต้องมีบัญชี เข้าสู่ระบบเพื่อดูถอดเสียง บริบท และคำตัดสินเต็ม',
            })}
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-web-caption text-teal-400">
            <Lock className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Analyzed live, never stored.', th: 'วิเคราะห์สด ไม่เก็บไฟล์เสียง' })}
          </p>
          <div className="mt-7">
            <Link to="/demo/live-test">
              <Button variant="primary" className="px-6" leftIcon={<Mic className="h-5 w-5" aria-hidden="true" />}>
                {t({ en: 'Open the live detector', th: 'เปิดเครื่องตรวจจับสด' })}
              </Button>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <DetectorPreview />
        </Reveal>
      </div>
    </Section>
  )
}

function DetectorPreview() {
  const { t } = useLang()
  return (
    <div className="rounded-web-card border border-white/10 bg-surface-800 p-6 shadow-glow-soft">
      <div className="mb-4 flex items-center gap-2 rounded-card bg-blue-500/15 px-3 py-2 text-body-sm font-semibold text-[#8ea0ff] ring-1 ring-blue-500/25">
        <span className="h-2 w-2 rounded-full bg-teal-400" aria-hidden="true" />
        {t({ en: 'LIVE · real models running', th: 'LIVE · โมเดลจริงกำลังทำงาน' })}
      </div>
      <div className="flex items-center justify-around">
        <HeroRing pct={12} tone="teal" label={t({ en: 'Fake voice', th: 'เสียงปลอม' })} />
        <HeroRing pct={8} tone="teal" label={t({ en: 'Scam risk', th: 'ความเสี่ยง' })} />
      </div>
      <div className="mt-5 rounded-card bg-ink-950/60 p-3">
        <p className="text-tag uppercase tracking-wide text-mist-500">{t({ en: 'Transcript (ASR)', th: 'ถอดเสียง (ASR)' })}</p>
        <p className="mt-1 text-small text-mist-300">
          {t({ en: '“Hey, it’s me — are we still on for lunch tomorrow?”', th: '“นี่ฉันเอง — พรุ่งนี้ยังไปกินข้าวกันใช่ไหม?”' })}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-card bg-teal-400/10 p-3 ring-1 ring-teal-400/20">
        <Check className="h-4 w-4 text-teal-400" aria-hidden="true" />
        <p className="text-small text-white">{t({ en: 'Real voice, no scam signals.', th: 'เสียงจริง ไม่พบสัญญาณหลอกลวง' })}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────── 7. Phone app detail ─────────────────────────── */

const PHONE_FEATURES: { title: Localized; line: Localized }[] = [
  {
    title: { en: 'Automatic call monitoring', th: 'ตรวจสอบสายอัตโนมัติ' },
    line: { en: 'Scores every caller in real time while you talk.', th: 'ให้คะแนนผู้โทรทุกคนแบบเรียลไทม์ขณะคุยสาย' },
  },
  {
    title: { en: 'Instant in-call alerts', th: 'แจ้งเตือนกลางสายทันที' },
    line: { en: 'A clear warning the moment a call looks like a scam.', th: 'คำเตือนชัดเจนทันทีที่สายดูเหมือนหลอกลวง' },
  },
  {
    title: { en: 'Family / Elder Mode', th: 'ครอบครัว / โหมดผู้สูงอายุ' },
    line: { en: 'Alerts also reach a family member, so no one faces a scam alone.', th: 'การแจ้งเตือนถึงคนในครอบครัวด้วย เพื่อไม่ให้ใครเผชิญสแกมเพียงลำพัง' },
  },
  {
    title: { en: 'Call history & explanations', th: 'ประวัติสาย & คำอธิบาย' },
    line: { en: 'Every call logged with a plain-language reason.', th: 'บันทึกทุกสายพร้อมเหตุผลที่เข้าใจง่าย' },
  },
  {
    title: { en: 'Your controls', th: 'การตั้งค่าของคุณ' },
    line: { en: 'Tune sensitivity, scope, blocking and reporting.', th: 'ปรับความไว ขอบเขต การบล็อกและการรายงาน' },
  },
]

function PhoneAppDetail() {
  const { t } = useLang()
  const { showToast } = useToast()
  return (
    <Section id="phone-app">
      <div className="grid items-start gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 lg:order-1">
          <Reveal>
            <div className="flex items-center gap-3">
              <Eyebrow>{t({ en: 'Phone App', th: 'แอปมือถือ' })}</Eyebrow>
              <StatusBadge kind="coming-soon" />
            </div>
            <SectionTitle className="mt-3">
              {t({ en: 'The full product runs automatically during real calls.', th: 'ผลิตภัณฑ์เต็มรูปแบบทำงานอัตโนมัติระหว่างสายจริง' })}
            </SectionTitle>
            <p className="mt-4 text-web-body text-mist-300">
              {t({
                en: 'On your phone, VoiceGuard listens on every call and warns you the instant something sounds wrong. Play with the preview — it runs on sample data.',
                th: 'บนมือถือ VoiceGuard ฟังทุกสายและเตือนคุณทันทีที่มีบางอย่างผิดปกติ ลองเล่นพรีวิว — ใช้ข้อมูลตัวอย่าง',
              })}
            </p>
          </Reveal>

          <RevealGroup className="mt-8 flex flex-col gap-3">
            {PHONE_FEATURES.map((f, i) => (
              <RevealItem key={i}>
                <div className="flex items-start gap-3 rounded-card border border-white/10 bg-surface-800 p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" aria-hidden="true" />
                  <div>
                    <p className="text-body-medium font-semibold text-white">{t(f.title)}</p>
                    <p className="text-web-caption text-mist-300">{t(f.line)}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/app-preview">
                <Button variant="primary" className="px-6">{t({ en: 'Explore the app preview', th: 'สำรวจพรีวิวแอป' })}</Button>
              </Link>
              <Button
                variant="outline-light"
                className="px-6"
                onClick={() => showToast({ message: t({ en: 'We’ll let you know when the phone app launches.', th: 'เราจะแจ้งให้ทราบเมื่อแอปมือถือเปิดตัว' }) })}
              >
                {t({ en: 'Notify me when it launches', th: 'แจ้งเตือนฉันเมื่อเปิดตัว' })}
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <LandingPhoneDemo />
        </Reveal>
      </div>
    </Section>
  )
}

/* ─────────────────────────── 8. API detail (developer) ─────────────────────────── */

function ApiDetail() {
  const { t } = useLang()
  const { showToast } = useToast()
  return (
    <Section id="api" bg="ink-900" className="border-y border-white/5">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="flex items-center gap-3">
            <p className="font-mono text-web-caption font-semibold uppercase tracking-[0.18em] text-teal-400">{'</> API'}</p>
            <StatusBadge kind="available" />
          </div>
          <SectionTitle className="mt-3">{t({ en: 'Build with our detection engine.', th: 'สร้างด้วยเครื่องมือตรวจจับของเรา' })}</SectionTitle>
          <p className="mt-4 text-web-body text-mist-300">
            {t({
              en: 'The same anti-spoof, ASR and scam-analysis models, available as an API for your own product or project — endpoints for spoof scoring, transcription and scam analysis.',
              th: 'โมเดลป้องกันเสียงปลอม ถอดเสียง และวิเคราะห์สแกมชุดเดียวกัน พร้อมใช้เป็น API สำหรับผลิตภัณฑ์ของคุณ — มีเอนด์พอยต์สำหรับให้คะแนนเสียงปลอม ถอดเสียง และวิเคราะห์สแกม',
            })}
          </p>
          <ul className="mt-5 flex flex-col gap-2">
            {[
              { en: 'POST /v1/spoof — voice authenticity score', th: 'POST /v1/spoof — คะแนนความแท้ของเสียง' },
              { en: 'POST /v1/transcribe — real-time ASR', th: 'POST /v1/transcribe — ถอดเสียงเรียลไทม์' },
              { en: 'POST /v1/analyze — combined scam verdict', th: 'POST /v1/analyze — คำตัดสินสแกมรวม' },
            ].map((li, i) => (
              <li key={i} className="flex items-center gap-2 font-mono text-small text-mist-300">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" /> {t(li)}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              className="px-6"
              onClick={() => showToast({ message: t({ en: 'Thanks — we’ll be in touch about early API access.', th: 'ขอบคุณ — เราจะติดต่อกลับเรื่องสิทธิ์เข้าถึง API ก่อนใคร' }) })}
            >
              {t({ en: 'Request early access', th: 'ขอสิทธิ์เข้าถึงก่อนใคร' })}
            </Button>
            <Link to="/how-it-works">
              <Button variant="outline-light" className="px-6">{t({ en: 'Read the docs', th: 'อ่านเอกสาร' })}</Button>
            </Link>
          </div>
          <p className="mt-4 text-caption text-mist-500">
            {t({ en: 'Access model: contact us for early access while we finalise pricing.', th: 'รูปแบบการเข้าถึง: ติดต่อเราเพื่อขอสิทธิ์ก่อนใคร ระหว่างที่เรากำหนดราคา' })}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <CodeCard />
        </Reveal>
      </div>
    </Section>
  )
}

function CodeCard() {
  const { t } = useLang()
  return (
    <div className="overflow-hidden rounded-web-card border border-white/10 bg-[#0a0d1f] shadow-glow-soft">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-danger-500/70" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-coral-500/70" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-teal-400/70" aria-hidden="true" />
        <span className="ml-2 font-mono text-caption text-mist-500">{t({ en: 'example request', th: 'ตัวอย่างคำขอ' })}</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-mist-300">
        <code>
          <span className="text-mist-500"># Score a voice clip for AI-spoofing</span>
          {'\n'}
          <span className="text-teal-400">curl</span> https://api.voiceguard.ai/v1/analyze \{'\n'}
          {'  '}-H <span className="text-coral-400">"Authorization: Bearer $KEY"</span> \{'\n'}
          {'  '}-F <span className="text-coral-400">audio=@call.wav</span>
          {'\n\n'}
          <span className="text-mist-500"># → response</span>
          {'\n'}
          {'{'}
          {'\n'}
          {'  '}<span className="text-[#8ea0ff]">"spoof_prob"</span>: <span className="text-teal-400">0.92</span>,{'\n'}
          {'  '}<span className="text-[#8ea0ff]">"scam_prob"</span>: <span className="text-teal-400">0.88</span>,{'\n'}
          {'  '}<span className="text-[#8ea0ff]">"verdict"</span>: <span className="text-coral-400">"scam"</span>{'\n'}
          {'}'}
        </code>
      </pre>
    </div>
  )
}

/* ─────────────────────────── 9. Roadmap ─────────────────────────── */

function RoadmapSection() {
  const { t } = useLang()
  const items: { tag: Localized; title: Localized; body: Localized; status: StatusKind }[] = [
    {
      tag: { en: 'Live today', th: 'พร้อมใช้วันนี้' },
      status: 'live',
      title: { en: 'The detection engine', th: 'เครื่องมือตรวจจับ' },
      body: { en: 'Real anti-spoof, ASR and LLM analysis — in the web app and the API.', th: 'ระบบป้องกันเสียงปลอม ถอดเสียง และ LLM จริง — ทั้งในเว็บแอปและ API' },
    },
    {
      tag: { en: 'Next phase', th: 'ขั้นถัดไป' },
      status: 'coming-soon',
      title: { en: 'On-device call capture', th: 'ดักจับสายบนอุปกรณ์' },
      body: { en: 'Mobile telephony integration so the engine runs automatically during real calls.', th: 'เชื่อมต่อระบบโทรศัพท์มือถือ เพื่อให้เครื่องมือทำงานอัตโนมัติระหว่างสายจริง' },
    },
    {
      tag: { en: 'Then', th: 'จากนั้น' },
      status: 'coming-soon',
      title: { en: 'Elder Mode & more languages', th: 'โหมดผู้สูงอายุ & ภาษาเพิ่มเติม' },
      body: { en: 'Guardian alerts in production, plus multi-language support (Thai + English) and beyond.', th: 'การแจ้งเตือนผู้ดูแลในระบบจริง พร้อมรองรับหลายภาษา (ไทย + อังกฤษ) และต่อไป' },
    },
  ]
  return (
    <Section id="roadmap">
      <Reveal className="max-w-2xl">
        <Eyebrow>{t({ en: 'Where we’re going', th: 'ทิศทางของเรา' })}</Eyebrow>
        <SectionTitle className="mt-3">
          {t({ en: 'A working engine today, automatic protection next.', th: 'เครื่องมือที่ใช้ได้จริงวันนี้ การป้องกันอัตโนมัติในขั้นถัดไป' })}
        </SectionTitle>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
        {items.map((it, i) => (
          <RevealItem key={i}>
            <div className="relative h-full rounded-web-card border border-white/10 bg-surface-800 p-7">
              <div className="flex items-center gap-3">
                <span className="font-display text-h1 font-bold text-white/20">{`0${i + 1}`}</span>
                <StatusBadge kind={it.status}>{t(it.tag)}</StatusBadge>
              </div>
              <p className="mt-4 text-h2 font-semibold text-white">{t(it.title)}</p>
              <p className="mt-2 text-web-caption text-mist-300">{t(it.body)}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  )
}

/* ─────────────────────────── 10. Closing CTA ─────────────────────────── */

function ClosingCta() {
  const { t } = useLang()
  return (
    <section className="relative overflow-hidden px-6 py-28 sm:px-8">
      <div aria-hidden="true" className="absolute inset-0 bg-glow-grad opacity-95" />
      <AmbientBackground variant="band" className="opacity-40 mix-blend-overlay" />
      <Reveal className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-web-section text-white">{t({ en: 'Ready to hear the difference?', th: 'พร้อมจะฟังความต่างหรือยัง?' })}</h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-web-sub text-white/90">
          {t({ en: 'Test the real detector now, or build it into your own product.', th: 'ทดลองเครื่องตรวจจับจริงตอนนี้ หรือนำไปใส่ในผลิตภัณฑ์ของคุณ' })}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/demo/live-test">
            <Button variant="secondary" className="bg-ink-950 px-7 hover:bg-ink-900">{t({ en: 'Try live detection', th: 'ทดลองตรวจจับสด' })}</Button>
          </Link>
          <button type="button" onClick={() => scrollToAnchor('api')}>
            <Button variant="outline-light" className="border-white/40 px-7 text-white hover:bg-white/10">{t({ en: 'Get the API', th: 'ใช้งาน API' })}</Button>
          </button>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-web-caption text-white/80">
          <Lock className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Privacy first — no raw audio stored.', th: 'ความเป็นส่วนตัวมาก่อน — ไม่เก็บไฟล์เสียง' })}
        </p>
      </Reveal>
    </section>
  )
}
