import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { TiltCard } from '@/components/motion/TiltCard'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useLang } from '@/i18n/LangProvider'

/**
 * The recommended hero visual (design.md §7): a voice waveform flowing
 * rightward that resolves into a shield, with a shimmer sweep and mouse-tilt.
 * A glitch/tremor in the left bars hints at "fake voice detected"; the shield
 * side settles into a calm, verified state. Lightweight vector, no video.
 */
export function WaveformShieldVisual() {
  const reduced = useReducedMotion()
  const { t } = useLang()

  return (
    <TiltCard className="mx-auto w-full max-w-[440px]">
      <div className="relative overflow-hidden rounded-web-card border border-white/10 bg-surface-800/80 p-8 shadow-glow-soft backdrop-blur">
        {/* shimmer sweep */}
        {!reduced && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 animate-shimmer bg-[length:200%_100%] opacity-40"
            style={{
              backgroundImage: 'linear-gradient(100deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
            }}
          />
        )}

        <svg viewBox="0 0 360 160" className="relative w-full" role="img" aria-label={t({ en: 'A voice waveform resolving into a verified shield', th: 'คลื่นเสียงที่คลี่คลายกลายเป็นโล่ยืนยันความปลอดภัย' })}>
          <defs>
            <linearGradient id="wf-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EB7449" />
              <stop offset="55%" stopColor="#EB7449" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#34D6C4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* waveform bars, left half — tremor hints at a suspicious signal */}
          {WAVEFORM_BARS.map((h, i) => (
            <motion.rect
              key={i}
              x={10 + i * 11}
              width={5}
              rx={2.5}
              fill="url(#wf-fade)"
              initial={false}
              animate={reduced ? { y: 80 - (h * 60) / 2, height: h * 60 } : { y: [80 - (h * 60) / 2, 80 - (h * 0.6 * 60) / 2, 80 - (h * 60) / 2], height: [h * 60, h * 0.6 * 60, h * 60] }}
              transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
            />
          ))}

          {/* shield, right half — the resolved / verified state */}
          <g transform="translate(255, 30)">
            <path
              d="M50 0 L95 16 V52 C95 82 74 100 50 108 C26 100 5 82 5 52 V16 Z"
              fill="rgba(52,214,196,0.12)"
              stroke="#34D6C4"
              strokeWidth="2.5"
            />
            <path
              d="M32 54 L45 67 L70 38"
              fill="none"
              stroke="#34D6C4"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>

        <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <p className="font-mono text-tag uppercase tracking-[0.08em] text-mist-500">
              {t({ en: 'Voice signal', th: 'สัญญาณเสียง' })}
            </p>
            <p className="mt-0.5 text-body-sm font-semibold text-white">
              {t({ en: 'AI clone suspected', th: 'สงสัยเป็นเสียงโคลน AI' })}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-pill bg-teal-400/15 px-3 py-1.5 text-tag font-semibold uppercase tracking-wide text-teal-400 ring-1 ring-teal-400/30">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t({ en: 'Verified', th: 'ยืนยันแล้ว' })}
          </span>
        </div>
      </div>
    </TiltCard>
  )
}

const WAVEFORM_BARS = [0.35, 0.7, 0.5, 0.85, 0.4, 0.65, 0.9, 0.45, 0.6, 0.3, 0.55, 0.4, 0.25, 0.15, 0.1, 0.08]
