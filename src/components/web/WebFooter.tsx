import { Link } from 'react-router-dom'
import { ShieldCheck, Lock } from 'lucide-react'
import { useLang } from '@/i18n/LangProvider'

/** Full-bleed navy footer band on the dark surface, multi-column on desktop
 * (design.md §5). Carries the restated privacy / no-raw-audio trust line. */
export function WebFooter() {
  const { t } = useLang()
  return (
    <footer className="w-full border-t border-white/10 bg-ink-900 text-white">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 font-display text-body-medium font-bold">
            <ShieldCheck className="h-5 w-5 text-coral-500" aria-hidden="true" /> VoiceGuard
          </p>
          <p className="max-w-[38ch] text-small text-mist-300">
            {t({
              en: 'Real-time scam-call and AI-voice detection — built to protect elders and the families who look out for them.',
              th: 'ตรวจจับสายหลอกลวงและเสียง AI แบบเรียลไทม์ — สร้างมาเพื่อปกป้องผู้สูงอายุและครอบครัวที่ห่วงใย',
            })}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-small text-mist-500">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />{' '}
            {t({ en: 'Privacy first — no raw call audio is stored.', th: 'ความเป็นส่วนตัวมาก่อน — ไม่เก็บไฟล์เสียงต้นฉบับ' })}
          </p>
        </div>

        <FooterCol
          title={t({ en: 'Product', th: 'ผลิตภัณฑ์' })}
          links={[
            { label: t({ en: 'How it works', th: 'วิธีการทำงาน' }), to: '/how-it-works' },
            { label: t({ en: 'Experience a scam call', th: 'ลองประสบการณ์สายหลอกลวง' }), to: '/demo' },
            { label: t({ en: 'Free voice check', th: 'ตรวจเสียงฟรี' }), to: '/demo/live-test' },
          ]}
        />
        <FooterCol
          title={t({ en: 'Account', th: 'บัญชี' })}
          links={[
            { label: t({ en: 'Sign up', th: 'สมัครใช้งาน' }), to: '/signup' },
            { label: t({ en: 'Privacy policy', th: 'นโยบายความเป็นส่วนตัว' }), to: '/how-it-works' },
            { label: t({ en: 'Terms of service', th: 'เงื่อนไขการใช้งาน' }), to: '/how-it-works' },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-content px-6 py-6 text-caption text-mist-500 sm:px-8">
          {t({
            en: '© VoiceGuard — a proof-of-concept demo. Not a production security product.',
            th: '© VoiceGuard — ตัวอย่างเดโมเชิงพิสูจน์แนวคิด ไม่ใช่ผลิตภัณฑ์ความปลอดภัยเชิงพาณิชย์',
          })}
        </p>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-caption font-semibold uppercase tracking-wide text-mist-500">{title}</p>
      {links.map((l) => (
        <Link key={l.label} to={l.to} className="text-small text-mist-300 transition hover:text-white">
          {l.label}
        </Link>
      ))}
    </div>
  )
}
