import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Maximize2,
  X,
  Phone,
  PhoneOff,
  MicOff,
  Grid3x3,
  Volume2,
  ShieldCheck,
  TriangleAlert,
  RotateCcw,
  Play,
  Mic,
  Square,
  Loader2,
  Radio,
  AlertOctagon,
} from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { PhoneMockup } from '@/components/web/PhoneMockup'
import { ScoreRing } from '@/components/ScoreRing'
import { IntentPillRow } from '@/components/IntentPillRow'
import { DemoSchedulerClient } from '@/ws/DemoSchedulerClient'
import { useRealtimeCallState } from '@/hooks/useRealtimeCallState'
import { usePlaybackClock } from '@/hooks/usePlaybackClock'
import { useMediaRecorderClip } from '@/hooks/useMediaRecorderClip'
import { getScenarioCallerName } from '@/services/mock/scenarios.data'
import { ScenarioIcon } from '@/lib/scenarioIcons'
import { useLang } from '@/i18n/LangProvider'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import type { TimedEvent } from '@/ws/types'
import type { LiveTestResponse } from '@/services/types'

type Phase =
  | { name: 'select' }
  | { name: 'ringing'; scenarioId: string }
  | { name: 'incall'; scenarioId: string; runId: number }

/**
 * A full-screen, "cinematic" presentation of the scripted call demo, launched by a
 * button that expands the experience out of the page. Inside: a phone showing the
 * incoming/in-call UI on the left, a live chat transcript on the right, the two
 * real-time analysis scores across the top, and a Dynamic-Island alert that pops
 * out of the phone the moment PaTuean flags the call as a scam.
 *
 * It reuses the exact scenario timelines and realtime plumbing the in-app monitor
 * uses (DemoSchedulerClient + useRealtimeCallState), so what plays here matches the
 * real demo — only the staging is grander.
 */
export function CinematicCallDemo() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  // Lock page scroll + wire Escape while the overlay is open. The landing page
  // uses Lenis smooth-scroll, which drives the window itself and ignores
  // `overflow: hidden` — so we stop Lenis outright and restart it on close.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-web-card border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-gold-400/40 hover:bg-white/[0.05]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-grad text-white shadow-[0_10px_24px_-10px_rgba(231,124,42,0.8)]">
          <Maximize2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-body-medium font-semibold text-white">
            {t({ en: 'Experience a live scam call', th: 'สัมผัสสายมิจฉาชีพแบบสด' })}
          </span>
          <span className="mt-0.5 block text-small text-mist-300">
            {t({
              en: 'Expand to full screen — watch the transcript, scores, and alert in real time.',
              th: 'ขยายเต็มจอ — ดูบทสนทนา คะแนน และการแจ้งเตือนแบบเรียลไทม์',
            })}
          </span>
        </span>
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>{open && <Overlay onClose={() => setOpen(false)} />}</AnimatePresence>,
          document.body,
        )}
    </>
  )
}

function Overlay({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  const [phase, setPhase] = useState<Phase>({ name: 'select' })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] flex flex-col bg-slate-50/85 text-slate-900 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={t({ en: 'Live scam call demo', th: 'เดโมสายมิจฉาชีพแบบสด' })}
    >
      {/* Top chrome */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <span className="inline-flex items-center gap-2 rounded-pill border border-gold-400/50 bg-gold-400/20 px-3 py-1 text-caption font-semibold uppercase tracking-wide text-[#a85c12]">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {t({ en: 'PREVIEW · simulated call', th: 'พรีวิว · สายจำลอง' })}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
          aria-label={t({ en: 'Close', th: 'ปิด' })}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
        <div className="mx-auto w-full max-w-[1180px] px-8 py-3">
          {phase.name === 'select' && (
            <ScenarioSelect onPick={(scenarioId) => setPhase({ name: 'ringing', scenarioId })} />
          )}
          {phase.name === 'ringing' && (
            <RingingStage
              scenarioId={phase.scenarioId}
              onDecline={() => setPhase({ name: 'select' })}
              onAccept={() => setPhase({ name: 'incall', scenarioId: phase.scenarioId, runId: 0 })}
            />
          )}
          {phase.name === 'incall' && (
            <InCallStage
              key={`${phase.scenarioId}-${phase.runId}`}
              scenarioId={phase.scenarioId}
              onRestart={() =>
                setPhase({ name: 'incall', scenarioId: phase.scenarioId, runId: phase.runId + 1 })
              }
              onPickAnother={() => setPhase({ name: 'select' })}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Scenario chooser                                                   */
/* ------------------------------------------------------------------ */

function ScenarioSelect({ onPick }: { onPick: (id: string) => void }) {
  const { t, lang } = useLang()
  const { data } = useQuery({
    queryKey: [...queryKeys.demoScenarios, lang],
    queryFn: api.demo.listScenarios,
  })

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-h1-mobile font-bold text-slate-900">
        {t({ en: 'Pick a call to receive', th: 'เลือกสายที่จะรับ' })}
      </h2>
      <p className="mt-1 text-small text-slate-600">
        {t({
          en: 'An unknown number is about to call. Choose the scenario and answer it.',
          th: 'มีเบอร์ที่ไม่รู้จักกำลังจะโทรเข้า เลือกสถานการณ์แล้วรับสาย',
        })}
      </p>
      <div className="mt-5 grid gap-3">
        {data?.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.id)}
            className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-gold-400/50 hover:bg-slate-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-gold-400/70 to-blue-600/60 text-white">
              <ScenarioIcon slug={s.icon} className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-body-sm font-semibold text-slate-900">{s.title}</span>
              <span className="mt-0.5 block text-small text-slate-600">{s.description}</span>
            </span>
            <Phone className="h-5 w-5 text-accent" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Ringing (incoming call)                                            */
/* ------------------------------------------------------------------ */

function RingingStage({
  scenarioId,
  onDecline,
  onAccept,
}: {
  scenarioId: string
  onDecline: () => void
  onAccept: () => void
}) {
  const { t } = useLang()
  const caller = getScenarioCallerName(scenarioId)

  return (
    <div className="mx-auto flex max-w-sm justify-center">
      <PhoneMockup className="shadow-glow-soft">
        <IslandBar state="idle" />
        <div className="flex flex-1 flex-col items-center justify-between bg-gradient-to-b from-night to-[#0b0f1a] px-6 pb-8 pt-20 text-fg">
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60 ring-2 ring-white/10"
            >
              <ScenarioIcon slug={caller.icon} className="h-10 w-10 text-white" />
            </motion.span>
            <div>
              <p className="text-h2 font-bold">{caller.name}</p>
              <p className="mt-1 text-body text-mid">{t({ en: 'Unknown number', th: 'เบอร์ที่ไม่รู้จัก' })}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-gold-400/40 bg-gold-400/15 px-3 py-1 text-caption font-semibold text-accent">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t({ en: 'PaTuean is monitoring', th: 'ป้าเตือน กำลังเฝ้าระวัง' })}
              </p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between px-2">
            <CallCircle tone="danger" label={t({ en: 'Decline', th: 'ปฏิเสธ' })} onClick={onDecline}>
              <X className="h-7 w-7" aria-hidden="true" />
            </CallCircle>
            <CallCircle tone="safe" label={t({ en: 'Accept', th: 'รับสาย' })} onClick={onAccept} pulse>
              <Phone className="h-7 w-7" aria-hidden="true" />
            </CallCircle>
          </div>
        </div>
      </PhoneMockup>
    </div>
  )
}

function CallCircle({
  children,
  tone,
  label,
  onClick,
  pulse,
}: {
  children: React.ReactNode
  tone: 'safe' | 'danger'
  label: string
  onClick: () => void
  pulse?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={label}
        animate={pulse ? { scale: [1, 1.08, 1] } : undefined}
        transition={pulse ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition',
          tone === 'safe' ? 'bg-safe-500 hover:bg-safe-400' : 'bg-danger-500 hover:bg-danger-400',
        )}
      >
        {children}
      </motion.button>
      <span className="text-caption text-mid">{label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* In-call (the main event)                                           */
/* ------------------------------------------------------------------ */

function InCallStage({
  scenarioId,
  onRestart,
  onPickAnother,
}: {
  scenarioId: string
  onRestart: () => void
  onPickAnother: () => void
}) {
  const { t, lang } = useLang()
  const caller = getScenarioCallerName(scenarioId)

  const scenarioQuery = useQuery({
    queryKey: [...queryKeys.demoScenario(scenarioId), lang],
    queryFn: () => api.demo.getScenario(scenarioId),
    // Keep the data reference stable for the life of the call. A refetch would hand
    // back a new object, recreate the scheduler, and replay the whole timeline —
    // re-typing the transcript. One run per call; Replay is explicit.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  const debriefQuery = useQuery({
    queryKey: [...queryKeys.demoDebrief(scenarioId), lang],
    queryFn: () => api.demo.getDebrief(scenarioId),
  })

  const timeline: TimedEvent[] = scenarioQuery.data?.events ?? []
  const audioUrl = scenarioQuery.data?.audioUrl
  const audioRef = useRef<HTMLAudioElement>(null)

  // How long each transcript line has before the next one arrives. The typewriter
  // paces itself to this so a line neither races ahead of the voice nor crawls
  // behind it — and it adapts per scenario instead of a fixed global speed.
  const lineBudgets = useMemo(() => {
    const lines = timeline.filter((e) => e.event.type === 'transcript')
    const map: Record<number, number> = {}
    lines.forEach((e, idx) => {
      if (e.event.type !== 'transcript') return
      const next = lines[idx + 1]
      map[e.event.seq] = next ? Math.max(1200, next.t - e.t) : 3500
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioQuery.data])

  const client = useMemo(
    () => new DemoSchedulerClient(timeline),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenarioQuery.data],
  )
  const state = useRealtimeCallState(client)

  const [ended, setEnded] = useState(false)
  const [elapsedMs] = usePlaybackClock({ running: state.connectionState === 'open' && !ended, rate: 1 })
  const timerSeconds = Math.floor(elapsedMs / 1000)

  // The "special" ending: after this scam's final question, the viewer answers out
  // loud and their reply is transcribed + analysed by the real live engine. Their
  // transcribed words are appended to the conversation as a "You" bubble.
  const interactive = scenarioId === 'bank-fraud-officer'
  const [myReply, setMyReply] = useState<string | null>(null)
  const transcriptLines = myReply
    ? [...state.transcript, { seq: 1_000_000, speaker: 'user' as const, text: myReply }]
    : state.transcript

  // Play the scenario's voice track alongside the scripted timeline.
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (state.connectionState === 'open' && !ended) {
      el.play().catch(() => {
        /* autoplay blocked or file absent — the timeline still drives the demo */
      })
    } else {
      el.pause()
    }
  }, [state.connectionState, ended, audioUrl])

  // End the call a beat after the last scripted event.
  useEffect(() => {
    if (timeline.length === 0 || ended) return
    const lastT = Math.max(0, ...timeline.map((e) => e.t))
    if (elapsedMs >= lastT + 2500) setEnded(true)
  }, [timeline, elapsedMs, ended])

  const islandState: IslandState = state.alert
    ? 'scam'
    : state.callState === 'suspicious'
      ? 'suspicious'
      : 'monitoring'

  return (
    <div className="flex flex-col gap-3">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Real-time analysis, across the top. `data-vg-theme="light"` flips the
          token-driven bits (ScoreRing numbers/labels, IntentPillRow) to their
          dark-on-light form so they read on the white panel. */}
      <div
        data-vg-theme="light"
        className="flex flex-col items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-between sm:gap-8"
      >
        <div className="flex items-center gap-6">
          <ScoreRing
            value={state.spoofScore}
            size={88}
            label={t({ en: 'Fake voice', th: 'เสียงปลอม' })}
            tone={scoreTone(state.spoofScore)}
            caption={t(scoreWord(state.spoofScore))}
          />
          <ScoreRing
            value={state.riskScore}
            size={88}
            label={t({ en: 'Scam risk', th: 'ความเสี่ยง' })}
            tone={scoreTone(state.riskScore)}
            caption={t(scoreWord(state.riskScore))}
          />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-caption font-semibold uppercase tracking-wide text-slate-500">
            {t({ en: 'What this call is about', th: 'สายนี้เกี่ยวกับอะไร' })}
          </p>
          <p className="mt-1 text-body-sm text-slate-900">
            {state.contextSummary ?? t({ en: 'Listening…', th: 'กำลังฟัง…' })}
          </p>
          {state.intents.length > 0 && (
            <div className="mt-2 flex justify-center sm:justify-start">
              <IntentPillRow intents={state.intents} />
            </div>
          )}
        </div>
      </div>

      {/* Phone + transcript. The phone is scaled down with `zoom` — PhoneMockup pins
          its own width (sm:w-[412px]), so shrinking the layout box is the only way to
          both fit the height and keep it from overlapping the transcript. */}
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-14">
        <div className="shrink-0" style={{ zoom: 0.85 } as React.CSSProperties}>
          <PhoneMockup className="shadow-glow-soft">
            <IslandBar state={islandState} reasonMain={state.alert?.reasonMain} />
            <div className="flex flex-1 flex-col items-center justify-between bg-gradient-to-b from-night to-[#0b0f1a] px-6 pb-8 pt-24 text-fg">
              <div className="flex flex-col items-center gap-3 text-center">
                <span
                  className={cn(
                    'flex h-20 w-20 items-center justify-center rounded-full ring-2 transition-colors',
                    islandState === 'scam'
                      ? 'bg-gradient-to-br from-danger-500/80 to-danger-600/70 ring-danger-500/40'
                      : 'bg-gradient-to-br from-gold-400/70 to-blue-600/60 ring-white/10',
                  )}
                >
                  <ScenarioIcon slug={caller.icon} className="h-9 w-9 text-white" />
                </span>
                <div>
                  <p className="text-h2 font-bold">{caller.name}</p>
                  <p className="mt-1 text-body text-mid tabular-nums">
                    {formatTimer(timerSeconds)} ·{' '}
                    {ended
                      ? t({ en: 'Call ended', th: 'วางสายแล้ว' })
                      : t({ en: 'Checking this call…', th: 'กำลังตรวจสายนี้…' })}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col items-center gap-5">
                <div className="grid w-full grid-cols-3 gap-3 px-2">
                  <PhoneAction icon={MicOff} label={t({ en: 'Mute', th: 'ปิดเสียง' })} />
                  <PhoneAction icon={Grid3x3} label={t({ en: 'Keypad', th: 'แป้นกด' })} />
                  <PhoneAction icon={Volume2} label={t({ en: 'Speaker', th: 'ลำโพง' })} />
                </div>
                <button
                  type="button"
                  onClick={() => setEnded(true)}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-500 text-white shadow-lg transition hover:bg-danger-400"
                  aria-label={t({ en: 'End call', th: 'วางสาย' })}
                >
                  <PhoneOff className="h-7 w-7" aria-hidden="true" />
                </button>
              </div>
            </div>
          </PhoneMockup>
        </div>

        <div className="min-w-0 flex-1">
          <TranscriptPanel transcript={transcriptLines} budgets={lineBudgets} />
        </div>
      </div>

      {/* Special interactive ending: answer the caller, analysed live. */}
      {ended && interactive && (
        <LiveResponseStep
          onReply={(text) => setMyReply(text)}
          onRestart={onRestart}
          onPickAnother={onPickAnother}
        />
      )}

      {/* Ended footer: verdict + actions (non-interactive scenarios) */}
      <AnimatePresence>
        {ended && !interactive && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-between gap-4 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full',
                  debriefQuery.data?.verdict === 'safe'
                    ? 'bg-safe-100 text-safe-500'
                    : 'bg-danger-100 text-danger-600',
                )}
              >
                {debriefQuery.data?.verdict === 'safe' ? (
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <TriangleAlert className="h-6 w-6" aria-hidden="true" />
                )}
              </span>
              <p className="max-w-md text-body-sm text-slate-900">
                {debriefQuery.data?.caption ?? t({ en: 'Call complete.', th: 'จบสายแล้ว' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="inline-flex items-center gap-2 rounded-button border border-slate-300 px-4 py-2.5 text-body-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Replay', th: 'เล่นซ้ำ' })}
              </button>
              <button
                type="button"
                onClick={onPickAnother}
                className="inline-flex items-center gap-2 rounded-button bg-gold-grad px-4 py-2.5 text-body-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" /> {t({ en: 'Try another', th: 'ลองสายอื่น' })}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Interactive "your turn" ending — real speech-to-text + analysis    */
/* ------------------------------------------------------------------ */

/** 0-1 or 0-100 → integer percent. The backend may report either scale. */
function toPct(p: number): number {
  return Math.round(p <= 1 ? p * 100 : p)
}

/**
 * The special finale for the bank-fraud call: the caller has just demanded the
 * viewer's ID number, so the viewer answers out loud. The clip goes to the REAL
 * `/demo/live-test` engine, which returns a genuine transcript (speech-to-text) plus
 * a scam/context analysis — proving the pipeline works on the viewer's own voice.
 * Clearly badged LIVE to separate it from the simulated PREVIEW call above.
 */
function LiveResponseStep({
  onReply,
  onRestart,
  onPickAnother,
}: {
  onReply: (transcript: string) => void
  onRestart: () => void
  onPickAnother: () => void
}) {
  const { t } = useLang()
  const recorder = useMediaRecorderClip()
  const submittedRef = useRef(false)
  const analysis = useMutation({
    mutationFn: (clip: Blob) => api.demo.submitLiveTest(clip),
    onSuccess: (res: LiveTestResponse) => onReply(res.transcript),
  })

  // As soon as a clip is captured, send it off for transcription + analysis (once).
  useEffect(() => {
    if (recorder.blob && !submittedRef.current) {
      submittedRef.current = true
      analysis.mutate(recorder.blob)
    }
  }, [recorder.blob, analysis])

  function respondAgain() {
    submittedRef.current = false
    analysis.reset()
    recorder.reset()
  }

  const result = analysis.data
  const scamPct = result ? toPct(result.scamProb) : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border-2 border-danger-500/40 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-pill bg-danger-600 px-3 py-1 text-caption font-bold uppercase tracking-wide text-white">
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          {t({ en: 'LIVE · analysing your real voice', th: 'สด · วิเคราะห์เสียงจริงของคุณ' })}
        </span>
        <span className="text-caption text-slate-500">
          {t({ en: 'The call above was simulated. This part is real.', th: 'สายด้านบนเป็นการจำลอง ส่วนนี้เป็นของจริง' })}
        </span>
      </div>

      <p className="mt-3 text-body font-semibold text-slate-900">
        {t({
          en: '“…give me your thirteen-digit ID number.” — how do you answer?',
          th: '“…ขอเลขบัตรประชาชนสิบสามหลักของคุณ” — คุณจะตอบว่าอย่างไร',
        })}
      </p>
      <p className="mt-1 text-small text-slate-600">
        {t({
          en: 'Answer out loud. PaTuean transcribes what you say and analyses it in real time — try refusing, or try reading out a fake number.',
          th: 'พูดตอบออกมา ป้าเตือน จะถอดเสียงและวิเคราะห์สิ่งที่คุณพูดแบบเรียลไทม์ — ลองปฏิเสธ หรือลองอ่านเลขปลอมดู',
        })}
      </p>

      {/* ---- state machine ---- */}
      {result ? (
        <div className="mt-4 flex flex-col gap-4">
          <div className="rounded-[14px] bg-slate-100 p-3">
            <p className="text-caption font-semibold uppercase tracking-wide text-slate-500">
              {t({ en: 'Speech-to-text · what you said', th: 'ถอดเสียง · สิ่งที่คุณพูด' })}
            </p>
            <p className="mt-1 text-web-body text-slate-900">
              {result.transcript || t({ en: '(nothing was heard)', th: '(ไม่ได้ยินเสียงพูด)' })}
            </p>
          </div>

          <div data-vg-theme="light" className="flex flex-wrap items-center gap-6">
            <ScoreRing value={scamPct} size={80} label={t({ en: 'Scam risk', th: 'ความเสี่ยง' })} tone={scoreTone(scamPct)} caption={t(scoreWord(scamPct))} />
            <div className="min-w-0 flex-1">
              <p className="text-caption font-semibold uppercase tracking-wide text-slate-500">
                {t({ en: 'Context analysis', th: 'การวิเคราะห์บริบท' })}
              </p>
              <p className="mt-1 text-body-sm text-slate-900">{result.summary}</p>
              {result.intents.length > 0 && (
                <div className="mt-2">
                  <IntentPillRow intents={result.intents} />
                </div>
              )}
            </div>
          </div>

          {result.reasons.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-body-sm text-slate-700">
                  <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={respondAgain} className="inline-flex items-center gap-2 rounded-button border border-slate-300 px-4 py-2.5 text-body-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              <Mic className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Answer again', th: 'ตอบใหม่' })}
            </button>
            <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-button border border-slate-300 px-4 py-2.5 text-body-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Replay call', th: 'เล่นสายซ้ำ' })}
            </button>
            <button type="button" onClick={onPickAnother} className="inline-flex items-center gap-2 rounded-button bg-gold-grad px-4 py-2.5 text-body-sm font-semibold text-white transition hover:-translate-y-0.5">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" /> {t({ en: 'Try another', th: 'ลองสายอื่น' })}
            </button>
          </div>
        </div>
      ) : analysis.isPending ? (
        <div className="mt-4 flex items-center gap-3 text-slate-700">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {t({ en: 'Transcribing and analysing your reply…', th: 'กำลังถอดเสียงและวิเคราะห์คำตอบของคุณ…' })}
        </div>
      ) : analysis.isError ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-body-sm text-danger-600">
            {t({ en: "Couldn't reach the live analysis engine. Is the detector backend running?", th: 'เชื่อมต่อระบบวิเคราะห์สดไม่ได้ ระบบตรวจจับกำลังทำงานอยู่หรือไม่' })}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={respondAgain} className="inline-flex items-center gap-2 rounded-button border border-slate-300 px-4 py-2.5 text-body-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              <Mic className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Try again', th: 'ลองอีกครั้ง' })}
            </button>
            <button type="button" onClick={onPickAnother} className="inline-flex items-center gap-2 rounded-button bg-gold-grad px-4 py-2.5 text-body-sm font-semibold text-white transition hover:-translate-y-0.5">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" /> {t({ en: 'Try another', th: 'ลองสายอื่น' })}
            </button>
          </div>
        </div>
      ) : recorder.status === 'recording' ? (
        <div className="mt-4 flex items-center gap-4">
          <button type="button" onClick={recorder.stop} className="inline-flex items-center gap-2 rounded-button bg-danger-600 px-5 py-3 text-body-sm font-bold text-white transition hover:bg-danger-500">
            <Square className="h-4 w-4 fill-current" aria-hidden="true" /> {t({ en: 'Stop & analyse', th: 'หยุดและวิเคราะห์' })}
          </button>
          <span className="inline-flex items-center gap-2 text-body-sm font-semibold text-danger-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger-600" /> {t({ en: 'Recording', th: 'กำลังอัด' })} {recorder.elapsedSec}s
          </span>
        </div>
      ) : recorder.status === 'denied' ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-body-sm text-danger-600">
            {t({ en: 'Microphone access is off. Enable it in your browser to try the live analysis.', th: 'ไมโครโฟนถูกปิด เปิดในเบราว์เซอร์เพื่อลองการวิเคราะห์สด' })}
          </p>
          <button type="button" onClick={onPickAnother} className="inline-flex w-fit items-center gap-2 rounded-button bg-gold-grad px-4 py-2.5 text-body-sm font-semibold text-white transition hover:-translate-y-0.5">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> {t({ en: 'Try another', th: 'ลองสายอื่น' })}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={recorder.start}
            className="inline-flex items-center gap-2 rounded-button bg-danger-600 px-5 py-3 text-body-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-danger-500"
          >
            <Mic className="h-5 w-5" aria-hidden="true" /> {t({ en: 'Answer out loud', th: 'พูดตอบออกมา' })}
          </button>
          <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 text-body-sm font-semibold text-slate-600 transition hover:text-slate-900">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t({ en: 'Replay call', th: 'เล่นสายซ้ำ' })}
          </button>
          <button type="button" onClick={onPickAnother} className="inline-flex items-center gap-2 text-body-sm font-semibold text-slate-600 transition hover:text-slate-900">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> {t({ en: 'Try another', th: 'ลองสายอื่น' })}
          </button>
        </div>
      )}
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/* Dynamic Island                                                     */
/* ------------------------------------------------------------------ */

type IslandState = 'idle' | 'monitoring' | 'suspicious' | 'scam'

/**
 * The pill that lives where the phone's Dynamic Island sits. It grows from a small
 * "monitoring" capsule into a full-width scam alert the instant the call is flagged.
 */
function IslandBar({ state, reasonMain }: { state: IslandState; reasonMain?: string }) {
  const { t } = useLang()

  if (state === 'idle') {
    // Just the camera capsule — nothing to announce before the call connects.
    return (
      <div className="pointer-events-none absolute left-1/2 top-[10px] z-30 h-[30px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
    )
  }

  const isScam = state === 'scam'
  const isSuspicious = state === 'suspicious'

  return (
    <div className="pointer-events-none absolute left-1/2 top-[10px] z-30 flex w-full -translate-x-1/2 justify-center px-4">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className={cn(
          'flex items-center gap-2 overflow-hidden rounded-[20px] text-white shadow-lg',
          isScam
            ? 'w-full max-w-[300px] bg-danger-600 px-3 py-2'
            : isSuspicious
              ? 'bg-coral-500 px-3 py-1.5'
              : 'bg-black px-3 py-1.5',
        )}
      >
        {isScam ? (
          <>
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex h-6 w-6 shrink-0 items-center justify-center"
            >
              <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            </motion.span>
            <span className="min-w-0">
              <span className="block text-caption font-bold uppercase leading-tight tracking-wide">
                {t({ en: 'Likely scam', th: 'น่าจะเป็นสแกม' })}
              </span>
              <span className="block truncate text-[11px] leading-tight text-white/90">
                {reasonMain ?? t({ en: 'PaTuean flagged this call', th: 'ป้าเตือน แจ้งเตือนสายนี้' })}
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                  isSuspicious ? 'bg-white' : 'bg-safe-500',
                )}
              />
              <span
                className={cn(
                  'relative inline-flex h-2.5 w-2.5 rounded-full',
                  isSuspicious ? 'bg-white' : 'bg-safe-500',
                )}
              />
            </span>
            <span className="text-caption font-semibold">
              {isSuspicious
                ? t({ en: 'Checking…', th: 'กำลังตรวจ…' })
                : t({ en: 'PaTuean monitoring', th: 'ป้าเตือน เฝ้าระวัง' })}
            </span>
          </>
        )}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Transcript chat panel                                              */
/* ------------------------------------------------------------------ */

function TranscriptPanel({
  transcript,
  budgets,
}: {
  transcript: { seq: number; speaker: 'caller' | 'user'; text: string }[]
  budgets: Record<number, number>
}) {
  const { t } = useLang()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [transcript.length])

  return (
    <section className="flex min-h-[320px] flex-col rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm lg:min-h-0">
      <h3 className="mb-3 text-body font-bold text-slate-900">{t({ en: 'Live transcript', th: 'บทสนทนาแบบสด' })}</h3>
      <div ref={scrollRef} className="flex max-h-[52vh] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {transcript.length === 0 && (
          <p className="text-small text-slate-500">{t({ en: 'Waiting for the caller to speak…', th: 'กำลังรอผู้โทรพูด…' })}</p>
        )}
        <AnimatePresence initial={false}>
          {transcript.map((line) => {
            const isCaller = line.speaker === 'caller'
            return (
              <motion.div
                key={line.seq}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn('flex flex-col', isCaller ? 'items-start' : 'items-end')}
              >
                <span className="mb-0.5 px-1 text-caption font-semibold text-slate-500">
                  {isCaller ? t({ en: 'Caller', th: 'ผู้โทร' }) : t({ en: 'You', th: 'คุณ' })}
                </span>
                <div
                  className={cn(
                    'max-w-[88%] px-4 py-3 text-web-body text-slate-900',
                    isCaller
                      ? 'rounded-tr-[18px] rounded-bl-[18px] rounded-br-[18px] rounded-tl-[4px] bg-slate-100'
                      : 'rounded-tl-[18px] rounded-br-[18px] rounded-bl-[18px] rounded-tr-[4px] bg-blue-600/15',
                  )}
                >
                  <TypedText text={line.text} budgetMs={budgets[line.seq]} />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                      */
/* ------------------------------------------------------------------ */

const SENTENCE_END = '.?!…'
const PHRASE_END = ', ' // comma + space (Thai separates phrases with spaces)

/**
 * Types a line out one character at a time — the caller/receiver "speaking" as the
 * bubble appears. Rather than a uniform speed (which finishes a long turn too fast
 * and then sits idle through the speaker's pauses), it pauses at phrase and sentence
 * boundaries, so a whole turn is spread across its sub-sentences with natural gaps.
 * Each bubble mounts once (keyed by seq) so it types just once and then holds.
 * Honours prefers-reduced-motion by showing the full line immediately.
 */
function TypedText({
  text,
  budgetMs,
}: {
  text: string
  /** Time until the next line — the whole line is paced to finish within it. */
  budgetMs?: number
}) {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(reduced ? text.length : 0)

  useEffect(() => {
    if (reduced) {
      setCount(text.length)
      return
    }
    setCount(0)
    const len = Math.max(text.length, 1)
    // Pace the line to finish within ~70% of the gap before the next one, clamped so
    // it never crawls (long gaps) or blurs (short gaps).
    const charMs = budgetMs ? Math.max(20, Math.min(46, (budgetMs * 0.7) / len)) : 40
    const phrasePauseMs = charMs * 3
    const sentencePauseMs = charMs * 6
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const isDot = (c: string) => c === '.' || c === '…'

    const step = () => {
      i += 1
      setCount(i)
      if (i >= text.length) return
      const prev = text[i - 1]
      const next = text[i]
      let delay = charMs
      // Pause at the end of a sentence, but glide through the dots of an ellipsis.
      if (SENTENCE_END.includes(prev) && !isDot(next)) delay = sentencePauseMs
      else if (PHRASE_END.includes(prev)) delay = phrasePauseMs
      timer = setTimeout(step, delay)
    }
    // No lead — a line begins typing the moment it arrives, in step with the audio.
    timer = setTimeout(step, 0)
    return () => clearTimeout(timer)
  }, [text, budgetMs, reduced])

  const done = count >= text.length
  return (
    <span>
      {text.slice(0, count)}
      {!done && <span className="ml-0.5 inline-block w-[2px] animate-pulse align-middle text-slate-500">▍</span>}
    </span>
  )
}

function PhoneAction({ icon: Icon, label }: { icon: typeof Phone; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-mid">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-caption">{label}</span>
    </div>
  )
}

function scoreTone(value: number): 'safe' | 'warn' | 'danger' {
  if (value >= 70) return 'danger'
  if (value >= 40) return 'warn'
  return 'safe'
}

function scoreWord(value: number): { en: string; th: string } {
  if (value >= 70) return { en: 'High', th: 'สูง' }
  if (value >= 40) return { en: 'Medium', th: 'ปานกลาง' }
  return { en: 'Low', th: 'ต่ำ' }
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
