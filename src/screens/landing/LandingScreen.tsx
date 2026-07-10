import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/Button'
import { StatusBadge, type StatusKind } from '@/components/web/StatusBadge'
import { AmbientBackground } from '@/components/motion/AmbientBackground'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { HeroReveal, HeroFollow } from '@/components/motion/HeroReveal'
import { Marquee } from '@/components/motion/Marquee'
import { ScrollLine } from '@/components/motion/ScrollLine'
import { SectionPanel, SectionGlow } from '@/components/landing/SectionPanel'
import { EmbeddedScamDemoPhone } from '@/components/landing/EmbeddedScamDemoPhone'
import { HeroAppPreviewPhone } from '@/components/landing/HeroAppPreviewPhone'
import { PreviewFeaturePhone, PREVIEW_FEATURES, type PhoneScreen } from '@/components/landing/PreviewFeaturePhone'
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

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={cn(
        'font-mono text-web-caption font-semibold uppercase tracking-[0.18em]',
        light ? 'text-blue-600' : 'text-coral-400',
      )}
    >
      {children}
    </p>
  )
}

function SectionTitle({ children, className, light = false }: { children: ReactNode; className?: string; light?: boolean }) {
  return <h2 className={cn('font-display text-web-section', light ? 'text-slate-900' : 'text-white', className)}>{children}</h2>
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
          { text: 'on' },
          { text: 'the' },
          { text: 'line' },
          { text: 'is' },
          { text: 'real.', className: 'text-coral-500' },
        ]

  return (
    <section className="relative z-10 -mb-6 flex min-h-[88vh] items-center overflow-hidden rounded-b-[32px] bg-ink-900 px-6 pb-16 pt-12 sm:px-8 lg:-mb-8 lg:rounded-b-[48px]">
      <AmbientBackground variant="hero" />
      <SectionGlow position="bottom" color="coral-blue" drift />
      <div className="relative z-[1] mx-auto grid w-full max-w-content items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
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
                en: 'PaTuean detects AI-cloned voices and reads scam intent in real time — built to understand Thai voices, accent by accent.',
                th: 'ป้าเตือน ตรวจจับเสียงที่ถูกโคลนด้วย AI และอ่านเจตนาหลอกลวงแบบเรียลไทม์ — สร้างมาเพื่อเข้าใจเสียงคนไทยในทุกสำเนียง',
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
              <Button variant="outline-light" className="px-6" onClick={() => scrollToAnchor('how-it-works')}>
                {t({ en: 'See how it works', th: 'ดูวิธีการทำงาน' })}
              </Button>
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
          <HeroAppPreviewPhone />
        </HeroFollow>
      </div>

      <button
        type="button"
        aria-label="Scroll down"
        onClick={() => scrollToAnchor('how-it-works')}
        className="absolute bottom-6 left-1/2 z-[1] hidden -translate-x-1/2 text-mist-500 transition hover:text-white lg:block"
      >
        <ArrowDown className="h-5 w-5 animate-float" aria-hidden="true" />
      </button>
    </section>
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
      <span className="font-mono text-tag uppercase tracking-wide text-mist-500">{label}</span>
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
    <div className="relative bg-slate-50 py-14 sm:py-16">
      <Marquee itemClassName="px-8">
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-3 text-body-medium text-slate-600">
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
    <SectionPanel id="problem" mode="dark" tone="raised" roundedTop glowTop="blue-teal">
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
    </SectionPanel>
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
    <SectionPanel id="key-feature" mode="dark" tone="base" roundedBottom glowBottom="teal">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>{t({ en: 'The core idea', th: 'แนวคิดหลัก' })}</Eyebrow>
          <SectionTitle className="mt-3">
            {t({ en: 'We check the voice and the words — independently.', th: 'เราตรวจทั้งเสียงและเนื้อหา — แยกจากกัน' })}
          </SectionTitle>
          <p className="mt-4 text-web-body text-mist-300">
            {t({
              en: 'PaTuean scores whether the caller’s voice is AI-generated, and separately reads the conversation for scam intent. Then it combines both into one verdict.',
              th: 'ป้าเตือน ให้คะแนนว่าเสียงผู้โทรถูกสร้างด้วย AI หรือไม่ และอ่านบทสนทนาเพื่อหาเจตนาหลอกลวงแยกกัน แล้วจึงรวมทั้งสองเป็นคำตัดสินเดียว',
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
          <p className="mt-4 font-mono text-web-caption font-medium text-coral-400">
            {t({
              en: 'And we understand Thai the way it’s really spoken — Central Thai, Isan, and more — where foreign models fail.',
              th: 'และเราเข้าใจภาษาไทยแบบที่คนไทยพูดจริง — ภาษาไทยกลาง อีสาน และอื่น ๆ — จุดที่โมเดลต่างชาติทำไม่ได้',
            })}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <SignalMergeVisual />
        </Reveal>
      </div>
    </SectionPanel>
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
    <SectionPanel id="how-it-works" mode="light">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="order-2 lg:order-1">
          <Reveal className="max-w-2xl">
            <Eyebrow light>{t({ en: 'How it works', th: 'วิธีการทำงาน' })}</Eyebrow>
            <SectionTitle light className="mt-3">
              {t({ en: 'Four stages run on the live call audio.', th: 'สี่ขั้นตอนทำงานบนเสียงสายที่กำลังโทร' })}
            </SectionTitle>
          </Reveal>

          <RevealGroup className="relative mt-14 flex flex-col gap-10 pl-10 sm:pl-14">
            <div aria-hidden="true" className="absolute inset-y-2 left-3 w-px bg-slate-200 sm:left-5" />
            {PIPELINE.map((step, i) => (
              <RevealItem key={i}>
                <div className="group relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-10 top-1 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-slate-50 bg-glow-grad text-white shadow-card sm:-left-14"
                  >
                    <step.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <p className="text-tag font-semibold uppercase tracking-wide text-blue-600">
                    {t({ en: `Stage ${i + 1}`, th: `ขั้นที่ ${i + 1}` })}
                  </p>
                  <p className="mt-1 text-h2 font-semibold text-slate-900">{t(step.title)}</p>
                  <p className="mt-2 max-w-[52ch] text-web-caption text-slate-600">{t(step.line)}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div className="order-1 lg:sticky lg:top-28 lg:order-2">
          <EmbeddedScamDemoPhone />
        </div>
      </div>
    </SectionPanel>
  )
}

/* ─────────────────────────── 5. Service cards ─────────────────────────── */

const SERVICES: {
  icon: LucideIcon
  name: Localized
  status: StatusKind
  whatItIs: Localized
  line: Localized
  anchor: string
  primaryLabel: Localized
  primaryTo?: string
  dimmed?: boolean
}[] = [
  {
    icon: Globe,
    name: { en: 'Web App', th: 'เว็บแอป' },
    status: 'live',
    whatItIs: { en: 'Analyze any voice recording, right in your browser.', th: 'วิเคราะห์คลิปเสียงใดก็ได้ ผ่านเบราว์เซอร์ของคุณ' },
    line: {
      en: 'Upload or record a clip — get a fake-voice score free, or sign in for the full transcript, scam analysis, and verdict.',
      th: 'อัปโหลดหรืออัดคลิป — รับคะแนนเสียงปลอมฟรี หรือเข้าสู่ระบบเพื่อดูถอดเสียง วิเคราะห์สแกม และคำตัดสินเต็มรูปแบบ',
    },
    anchor: 'web-app',
    primaryLabel: { en: 'Try live detection', th: 'ทดลองตรวจจับสด' },
    primaryTo: '/demo/live-test',
  },
  {
    icon: Smartphone,
    name: { en: 'Phone App', th: 'แอปมือถือ' },
    status: 'coming-soon',
    whatItIs: { en: 'Automatic protection during real phone calls.', th: 'การป้องกันอัตโนมัติระหว่างสายโทรศัพท์จริง' },
    line: {
      en: 'PaTuean listens in the background and alerts you — and your family — the instant a call looks like a scam.',
      th: 'ป้าเตือน ฟังอยู่เบื้องหลังและแจ้งเตือนคุณ — และครอบครัว — ทันทีที่สายดูเหมือนหลอกลวง',
    },
    anchor: 'phone-app',
    primaryLabel: { en: 'Preview the app', th: 'พรีวิวแอป' },
    primaryTo: '/app-preview',
    dimmed: true,
  },
  {
    icon: Code2,
    name: { en: 'API', th: 'เอพีไอ' },
    status: 'available',
    whatItIs: { en: 'Build voice-scam detection into your own product.', th: 'นำระบบตรวจจับเสียงหลอกลวงไปใส่ในผลิตภัณฑ์ของคุณ' },
    line: {
      en: 'The same anti-spoof, transcription, and scam-analysis engine, as an API for your app or project.',
      th: 'เครื่องมือป้องกันเสียงปลอม ถอดเสียง และวิเคราะห์สแกมชุดเดียวกัน พร้อมใช้เป็น API สำหรับแอปหรือโปรเจกต์ของคุณ',
    },
    anchor: 'api',
    primaryLabel: { en: 'Get an API key', th: 'ขอรับ API key' },
  },
]

function ServiceCardsSection() {
  const { t } = useLang()
  const { showToast } = useToast()
  return (
    <SectionPanel id="services" mode="dark" tone="base" roundedTop glowTop="blue-teal">
      <Reveal className="max-w-2xl">
        <Eyebrow>{t({ en: 'Three ways to use it', th: 'สามวิธีในการใช้งาน' })}</Eyebrow>
        <SectionTitle className="mt-3">{t({ en: 'Pick the one that fits you.', th: 'เลือกแบบที่เหมาะกับคุณ' })}</SectionTitle>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <RevealItem key={s.anchor}>
            <div
              className={cn(
                'flex h-full flex-col items-start rounded-web-card border p-7 text-left transition',
                s.dimmed
                  ? 'border-dashed border-white/15 bg-surface-800/50'
                  : 'border-white/10 bg-surface-800 hover:border-white/20 hover:shadow-glow-soft',
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
              <p className="mt-2 text-web-body font-medium text-white">{t(s.whatItIs)}</p>
              <p className="mt-2 flex-1 text-web-caption text-mist-300">{t(s.line)}</p>

              <div className="mt-6 flex w-full flex-col gap-3">
                {s.primaryTo ? (
                  <Link to={s.primaryTo} className="w-full">
                    <Button variant={s.dimmed ? 'outline-light' : 'primary'} fullWidth className="px-5">
                      {t(s.primaryLabel)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    className="px-5"
                    onClick={() =>
                      showToast({
                        message: t({
                          en: 'Thanks — we’ll be in touch about early API access.',
                          th: 'ขอบคุณ — เราจะติดต่อกลับเรื่องสิทธิ์เข้าถึง API ก่อนใคร',
                        }),
                      })
                    }
                  >
                    {t(s.primaryLabel)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => scrollToAnchor(s.anchor)}
                  className="group inline-flex items-center gap-1.5 self-start text-body-medium font-medium text-coral-400 hover:text-coral-500"
                >
                  {t({ en: 'Learn more', th: 'ดูเพิ่มเติม' })}{' '}
                  <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionPanel>
  )
}

/* ─────────────────────────── 6. Web app detail ─────────────────────────── */

function WebAppDetail() {
  const { t } = useLang()
  return (
    <SectionPanel id="web-app" mode="dark" tone="raised">
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
    </SectionPanel>
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
        <p className="font-mono text-tag uppercase tracking-wide text-mist-500">{t({ en: 'Transcript (ASR)', th: 'ถอดเสียง (ASR)' })}</p>
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

// Landing shows only the core features — live call analysis, call history, and
// Elder Mode — three distinct screens (the full six live on the home page).
const CORE_PHONE_FEATURES: PhoneScreen[] = ['incoming', 'history', 'family']

function PhoneAppDetail() {
  const { t } = useLang()
  const { showToast } = useToast()
  const [active, setActive] = useState<PhoneScreen>('incoming')
  const features = PREVIEW_FEATURES.filter((f) => CORE_PHONE_FEATURES.includes(f.key))
  return (
    <SectionPanel id="phone-app" mode="dark" tone="base">
      <div className="grid items-start gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal className="order-1 lg:sticky lg:top-28">
          <PreviewFeaturePhone screen={active} />
        </Reveal>

        <div className="order-2">
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
                en: 'Pick a feature to see it on the phone — each one shows the real app screen on the device. Hover the phone to open the full, interactive preview.',
                th: 'เลือกฟีเจอร์เพื่อดูบนหน้าจอมือถือ — แต่ละอันแสดงหน้าจอแอปจริงบนเครื่อง วางเมาส์บนมือถือเพื่อเปิดพรีวิวเต็มรูปแบบที่โต้ตอบได้',
              })}
            </p>
          </Reveal>

          <RevealGroup className="mt-8 flex flex-col gap-3">
            {features.map((f) => {
              const isActive = f.key === active
              return (
                <RevealItem key={f.key}>
                  <button
                    type="button"
                    onClick={() => setActive(f.key)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-card border p-4 text-left transition',
                      isActive
                        ? 'border-coral-400/60 bg-coral-500/10 shadow-glow-soft'
                        : 'border-white/10 bg-surface-800 hover:border-white/25',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition',
                        isActive ? 'bg-coral-500 text-white' : 'bg-white/5 text-mist-300',
                      )}
                    >
                      <f.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-body-medium font-semibold text-white">{t(f.title)}</p>
                      <p className="mt-0.5 text-web-caption text-mist-300">{t(f.line)}</p>
                    </div>
                  </button>
                </RevealItem>
              )
            })}
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
      </div>
    </SectionPanel>
  )
}

/* ─────────────────────────── 8. API detail (developer) ─────────────────────────── */

function ApiDetail() {
  const { t } = useLang()
  const { showToast } = useToast()
  return (
    <SectionPanel id="api" mode="dark" tone="raised" className="border-y border-white/5">
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
            <Button variant="outline-light" className="px-6" onClick={() => scrollToAnchor('how-it-works')}>
              {t({ en: 'Read the docs', th: 'อ่านเอกสาร' })}
            </Button>
          </div>
          <p className="mt-4 text-caption text-mist-500">
            {t({ en: 'Access model: contact us for early access while we finalise pricing.', th: 'รูปแบบการเข้าถึง: ติดต่อเราเพื่อขอสิทธิ์ก่อนใคร ระหว่างที่เรากำหนดราคา' })}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <CodeCard />
        </Reveal>
      </div>
    </SectionPanel>
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
          <span className="text-teal-400">curl</span> https://api.patuean.ai/v1/analyze \{'\n'}
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

/* ─────────────────────────── 9. Roadmap — 4-beat scroll story ─────────────────────────── */

const ROADMAP_BEATS: { tag: Localized; title: Localized; body: Localized; status: StatusKind }[] = [
  {
    tag: { en: 'Why', th: 'ทำไม' },
    status: 'coming-soon',
    title: { en: 'Built for the voices others ignore.', th: 'สร้างมาเพื่อเสียงที่คนอื่นมองข้าม' },
    body: {
      en: 'Foreign detection models struggle with Thai — especially regional accents. The people most targeted by scams are the least protected by existing tech. That’s the gap we exist to close.',
      th: 'โมเดลตรวจจับจากต่างประเทศมักเข้าใจสำเนียงไทยได้ไม่ดี โดยเฉพาะสำเนียงท้องถิ่น คนที่ตกเป็นเป้าของมิจฉาชีพมากที่สุด กลับเป็นกลุ่มที่เทคโนโลยีที่มีอยู่ปกป้องได้น้อยที่สุด นี่คือช่องว่างที่เรามีอยู่เพื่อปิด',
    },
  },
  {
    tag: { en: 'Now', th: 'ตอนนี้' },
    status: 'live',
    title: { en: 'An engine that understands Thai.', th: 'เครื่องมือที่เข้าใจภาษาไทย' },
    body: {
      en: 'Live today: the Web App and API, with anti-spoof detection and conversation analysis — covering English, Central Thai, and Isan (Northeastern) with high accuracy. We already do what foreign models can’t.',
      th: 'พร้อมใช้วันนี้: เว็บแอปและ API พร้อมระบบตรวจจับเสียงปลอมและวิเคราะห์บทสนทนา — ครอบคลุมภาษาอังกฤษ ภาษาไทยกลาง และภาษาอีสาน ด้วยความแม่นยำสูง เราทำในสิ่งที่โมเดลต่างชาติทำไม่ได้ ตั้งแต่วันนี้',
    },
  },
  {
    tag: { en: 'Next', th: 'ถัดไป' },
    status: 'coming-soon',
    title: { en: 'Protection where scams actually happen.', th: 'ป้องกันตรงจุดที่สแกมเกิดขึ้นจริง' },
    body: {
      en: 'The phone app launches — moving from analyzing recordings to guarding your live calls automatically, with Elder Mode so families protect each other.',
      th: 'แอปมือถือกำลังจะเปิดตัว — จากการวิเคราะห์ไฟล์เสียง สู่การเฝ้าระวังสายที่กำลังโทรแบบอัตโนมัติ พร้อมโหมดผู้สูงอายุให้ครอบครัวช่วยดูแลกันได้',
    },
  },
  {
    tag: { en: 'The vision', th: 'วิสัยทัศน์' },
    status: 'coming-soon',
    title: { en: 'Every Thai voice, every accent.', th: 'ทุกเสียงไทย ทุกสำเนียง' },
    body: {
      en: 'We expand the model to cover all Thai regional dialects — North, South, every accent — so no one is left unprotected because of how they speak. English and beyond follow.',
      th: 'เราจะขยายโมเดลให้ครอบคลุมสำเนียงไทยทุกภูมิภาค — เหนือ ใต้ และทุกสำเนียง — เพื่อไม่ให้ใครขาดการปกป้องเพียงเพราะสำเนียงที่พูด ตามด้วยภาษาอังกฤษและภาษาอื่น ๆ ต่อไป',
    },
  },
]

function RoadmapSection() {
  const { t } = useLang()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <SectionPanel id="roadmap" mode="dark" tone="base" roundedBottom glowBottom="coral-blue" zIndex={20}>
      <Reveal className="max-w-2xl">
        <Eyebrow>{t({ en: 'Where we’re going', th: 'ทิศทางของเรา' })}</Eyebrow>
        <SectionTitle className="mt-3">{t({ en: 'Where we’re going.', th: 'ทิศทางที่เรากำลังมุ่งไป' })}</SectionTitle>
      </Reveal>

      <div ref={containerRef} className="relative mt-16 pl-10 sm:pl-14">
        <ScrollLine containerRef={containerRef} className="absolute inset-y-0 left-3 sm:left-5" />

        <div className="flex flex-col gap-14">
          {ROADMAP_BEATS.map((beat, i) => (
            <Reveal key={i} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-10 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-ink-950 bg-coral-500 sm:-left-14"
              />
              <div className="flex items-center gap-3">
                <StatusBadge kind={beat.status}>{t(beat.tag)}</StatusBadge>
              </div>
              <p className="mt-3 font-display text-h1 font-semibold text-white">{t(beat.title)}</p>
              <p className="mt-2 max-w-[62ch] text-web-body text-mist-300">{t(beat.body)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionPanel>
  )
}

/* ─────────────────────────── 10. Closing CTA ─────────────────────────── */

function ClosingCta() {
  const { t } = useLang()
  return (
    <SectionPanel id="cta" mode="gradient" roundedBottom className="overflow-hidden py-20 text-center lg:py-24">
      <AmbientBackground variant="band" className="opacity-30 mix-blend-overlay" />
      <Reveal className="relative mx-auto max-w-3xl">
        <h2 className="font-display text-web-section text-white">
          {t({ en: 'Ready to hear the difference?', th: 'พร้อมจะฟังความต่างหรือยัง?' })}
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-web-sub text-white/90">
          {t({ en: 'Test the real detector now, or build it into your own product.', th: 'ทดลองเครื่องตรวจจับจริงตอนนี้ หรือนำไปใส่ในผลิตภัณฑ์ของคุณ' })}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/demo/live-test">
            <Button variant="secondary" className="bg-ink-950 px-7 hover:bg-ink-900">
              {t({ en: 'Try live detection', th: 'ทดลองตรวจจับสด' })}
            </Button>
          </Link>
          <Button
            variant="outline-light"
            className="border-white/40 px-7 text-white hover:bg-white/10"
            onClick={() => scrollToAnchor('api')}
          >
            {t({ en: 'Get the API', th: 'ใช้งาน API' })}
          </Button>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-web-caption text-white/80">
          <Lock className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Privacy first — no raw audio stored.', th: 'ความเป็นส่วนตัวมาก่อน — ไม่เก็บไฟล์เสียง' })}
        </p>
      </Reveal>
    </SectionPanel>
  )
}
