import { Link } from 'react-router-dom'
import { ShieldCheck, Lock } from 'lucide-react'
import { useLang } from '@/i18n/LangProvider'

/** Clean white footer band, multi-column on desktop (design.md §5). Carries
 * the restated privacy / no-raw-audio trust line. Per
 * landing-visual-corrections.md, the footer itself stays flat and passive —
 * the gradient CTA band above it is the one that rounds + overlaps down onto
 * it. The footer only carries a very low-opacity multi-color wash bleeding
 * from its bottom edges (far lower peak opacity than the strong dark-section
 * glows) plus a faint dark-speckle grain, so it still reads as "clean bright
 * white" rather than tinted. */
export function WebFooter() {
  const { t } = useLang()
  return (
    <footer className="relative w-full overflow-hidden bg-white text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full opacity-[0.14] blur-[110px]"
        style={{ backgroundImage: 'radial-gradient(closest-side, rgba(43,58,159,0.9), transparent 75%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full opacity-[0.14] blur-[110px]"
        style={{ backgroundImage: 'radial-gradient(closest-side, rgba(235,116,73,0.85), rgba(52,214,196,0.6) 60%, transparent 78%)' }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] mix-blend-multiply"
      >
        <rect width="100%" height="100%" filter="url(#vg-grain)" />
      </svg>

      <div className="relative z-[1] mx-auto grid max-w-content gap-10 px-6 pb-16 pt-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 font-display text-body-medium font-bold text-slate-900">
            <ShieldCheck className="h-5 w-5 text-coral-500" aria-hidden="true" /> VoiceGuard
          </p>
          <p className="max-w-[38ch] text-small text-slate-600">
            {t({
              en: 'Real-time scam-call and AI-voice detection — built to protect elders and the families who look out for them.',
              th: 'ตรวจจับสายหลอกลวงและเสียง AI แบบเรียลไทม์ — สร้างมาเพื่อปกป้องผู้สูงอายุและครอบครัวที่ห่วงใย',
            })}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-small text-slate-400">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />{' '}
            {t({ en: 'Privacy first — no raw call audio is stored.', th: 'ความเป็นส่วนตัวมาก่อน — ไม่เก็บไฟล์เสียงต้นฉบับ' })}
          </p>
        </div>

        <FooterCol
          title={t({ en: 'Product', th: 'ผลิตภัณฑ์' })}
          links={[
            { label: t({ en: 'How it works', th: 'วิธีการทำงาน' }), to: '/#how-it-works' },
            { label: t({ en: 'Experience a scam call', th: 'ลองประสบการณ์สายหลอกลวง' }), to: '/#how-it-works' },
            { label: t({ en: 'Free voice check', th: 'ตรวจเสียงฟรี' }), to: '/demo/live-test' },
          ]}
        />
        <FooterCol
          title={t({ en: 'Account', th: 'บัญชี' })}
          links={[
            { label: t({ en: 'Sign up', th: 'สมัครใช้งาน' }), to: '/signup' },
            { label: t({ en: 'Help & support', th: 'ช่วยเหลือ & สนับสนุน' }), to: '/help' },
            { label: t({ en: 'Privacy policy', th: 'นโยบายความเป็นส่วนตัว' }), to: '/privacy' },
            { label: t({ en: 'Terms of service', th: 'เงื่อนไขการใช้งาน' }), to: '/terms' },
          ]}
        />
      </div>
      <div className="relative z-[1] border-t border-slate-200">
        <p className="mx-auto max-w-content px-6 py-6 text-caption text-slate-400 sm:px-8">
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
      <p className="text-caption font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {links.map((l) => (
        <Link key={l.label} to={l.to} className="text-small text-slate-600 transition hover:text-slate-900">
          {l.label}
        </Link>
      ))}
    </div>
  )
}
