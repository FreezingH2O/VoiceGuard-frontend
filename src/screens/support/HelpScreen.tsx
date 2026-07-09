import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Mic, Waypoints, Smartphone, Mail } from 'lucide-react'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import { useLang, type Localized } from '@/i18n/LangProvider'

const SUPPORT_EMAIL = 'support@patuean.example'

export function HelpScreen() {
  const { t } = useLang()
  const { isAuthed } = useAuth()

  const quickLinks: { icon: typeof Mic; title: Localized; desc: Localized; to: string }[] = [
    {
      icon: Mic,
      title: { en: 'Run the live detector', th: 'ลองเครื่องตรวจจับสด' },
      desc: { en: 'Record or upload a clip and see the real models score it.', th: 'อัดหรืออัปโหลดคลิปแล้วดูโมเดลจริงให้คะแนน' },
      to: '/demo/live-test',
    },
    {
      icon: Waypoints,
      title: { en: 'How PaTuean works', th: 'ป้าเตือน ทำงานอย่างไร' },
      desc: { en: 'The four-stage detection pipeline, explained.', th: 'อธิบายกระบวนการตรวจจับสี่ขั้นตอน' },
      to: '/#how-it-works',
    },
    {
      icon: Smartphone,
      title: { en: 'Explore the app preview', th: 'สำรวจตัวอย่างแอป' },
      desc: { en: 'Tap through the full mobile experience on sample data.', th: 'สำรวจประสบการณ์มือถือเต็มรูปแบบบนข้อมูลตัวอย่าง' },
      to: '/app-preview',
    },
  ]

  const faqs: { q: Localized; a: Localized }[] = [
    {
      q: { en: 'Is PaTuean listening to my real phone calls?', th: 'ป้าเตือน ฟังสายจริงของฉันหรือไม่?' },
      a: {
        en: 'No. A browser cannot access live cellular calls, so the web demo only ever analyzes a clip you deliberately record or upload in the Live Detector.',
        th: 'ไม่ เบราว์เซอร์ไม่สามารถเข้าถึงสายจริงได้ เดโมบนเว็บวิเคราะห์เฉพาะคลิปที่คุณตั้งใจอัดหรืออัปโหลดในเครื่องตรวจจับสดเท่านั้น',
      },
    },
    {
      q: { en: 'What is the difference between LIVE and PREVIEW?', th: 'LIVE กับ PREVIEW ต่างกันอย่างไร?' },
      a: {
        en: 'LIVE marks features that run the real anti-spoof, speech-to-text, and language models. PREVIEW marks the simulated mobile app running on sample data — it shows what the product will do, but nothing there is a real detection.',
        th: 'LIVE คือฟีเจอร์ที่รันโมเดลจริง ส่วน PREVIEW คือแอปมือถือจำลองบนข้อมูลตัวอย่าง แสดงสิ่งที่ผลิตภัณฑ์จะทำ แต่ไม่ใช่การตรวจจับจริง',
      },
    },
    {
      q: { en: 'Do you store my voice recordings?', th: 'คุณเก็บเสียงของฉันไหม?' },
      a: {
        en: 'No. A clip is analyzed and the result returned to you; we do not keep the raw audio after analysis and we never sell it.',
        th: 'ไม่ คลิปถูกวิเคราะห์และส่งผลกลับ เราไม่เก็บไฟล์เสียงต้นฉบับหลังการวิเคราะห์และไม่ขายข้อมูลนั้น',
      },
    },
    {
      q: { en: 'What is Elder Mode?', th: 'โหมดผู้สูงอายุคืออะไร?' },
      a: {
        en: 'When the phone belongs to an elderly user, scam alerts also fan out to a linked family guardian, who can call, send a warning, or block the number in one tap.',
        th: 'เมื่อเครื่องเป็นของผู้สูงอายุ การแจ้งเตือนสแกมจะส่งถึงผู้ดูแลในครอบครัวด้วย ซึ่งสามารถโทร เตือน หรือบล็อกเบอร์ได้ในแตะเดียว',
      },
    },
    {
      q: { en: 'Can I use this on my phone yet?', th: 'ใช้บนมือถือได้แล้วหรือยัง?' },
      a: {
        en: 'Not yet. On-device live-call capture is the next phase. Today PaTuean is a web proof-of-concept: the detection engine is real and provable in your browser.',
        th: 'ยัง การดักจับสายบนอุปกรณ์คือขั้นถัดไป วันนี้ ป้าเตือน เป็นเดโมบนเว็บ โดยเครื่องมือตรวจจับทำงานจริงและพิสูจน์ได้ในเบราว์เซอร์',
      },
    },
  ]

  return (
    <div className="mx-auto w-full max-w-content px-6 pb-24 pt-12 sm:px-8">
      <Reveal>
        <Link
          to={isAuthed ? '/profile' : '/'}
          className="inline-flex items-center gap-1.5 text-web-caption font-medium text-mist-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isAuthed ? t({ en: 'Back to account', th: 'กลับไปที่บัญชี' }) : t({ en: 'Back to home', th: 'กลับหน้าแรก' })}
        </Link>
        <h1 className="mt-6 text-balance font-display text-web-display text-white">
          {t({ en: 'Help & support', th: 'ช่วยเหลือ & สนับสนุน' })}
        </h1>
        <p className="mt-6 max-w-[68ch] text-pretty text-web-sub text-mist-300">
          {t({
            en: 'Answers to the questions people ask most about the PaTuean demo — and a direct line to us if you need more.',
            th: 'คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับเดโม ป้าเตือน และช่องทางติดต่อเราโดยตรงหากต้องการเพิ่มเติม',
          })}
        </p>
      </Reveal>

      {/* Quick links */}
      <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-3">
        {quickLinks.map((l) => (
          <RevealItem key={l.to + t(l.title)}>
            <Link
              to={l.to}
              className="group flex h-full flex-col gap-3 rounded-web-card border border-white/10 bg-surface-800 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-glow-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-button bg-glow-grad text-white">
                <l.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-body-medium font-semibold text-white">{t(l.title)}</span>
              <span className="text-small text-mist-300">{t(l.desc)}</span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* FAQ */}
      <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div>
          <h2 className="font-display text-web-section text-white">
            {t({ en: 'Frequently asked questions', th: 'คำถามที่พบบ่อย' })}
          </h2>
          <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {faqs.map((f) => (
              <details key={t(f.q)} className="group [&[open]_svg]:rotate-180">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-body-medium font-medium text-white transition hover:text-coral-400 [&::-webkit-details-marker]:hidden">
                  {t(f.q)}
                  <ChevronDown className="h-5 w-5 shrink-0 text-mist-500 transition-transform duration-200" aria-hidden="true" />
                </summary>
                <p className="max-w-[68ch] pb-5 text-web-body text-mist-300">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact */}
        <Reveal y={16}>
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-web-card border border-white/10 bg-surface-800 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-button bg-white/5 text-coral-400">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-h2 font-semibold text-white">
                {t({ en: 'Still need help?', th: 'ยังต้องการความช่วยเหลือ?' })}
              </h3>
              <p className="mt-2 text-small text-mist-300">
                {t({
                  en: 'Reach the demo team directly and we’ll get back to you.',
                  th: 'ติดต่อทีมเดโมโดยตรง แล้วเราจะติดต่อกลับ',
                })}
              </p>
              <Button href={`mailto:${SUPPORT_EMAIL}`} variant="primary" fullWidth className="mt-5">
                {t({ en: 'Email support', th: 'อีเมลฝ่ายสนับสนุน' })}
              </Button>
              <p className="mt-3 text-center font-mono text-caption text-mist-500">{SUPPORT_EMAIL}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  )
}
