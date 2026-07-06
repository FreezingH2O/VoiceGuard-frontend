import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mic, Square, Lightbulb, Check, Loader2, Lock, ArrowRight } from 'lucide-react'
import { api, ApiError } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Button } from '@/components/Button'
import { ScoreRing } from '@/components/ScoreRing'
import { IntentPillRow } from '@/components/IntentPillRow'
import { StatusBadge } from '@/components/web/StatusBadge'
import { Reveal } from '@/components/motion/Reveal'
import { useMediaRecorderClip } from '@/hooks/useMediaRecorderClip'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/i18n/LangProvider'
import type { LiveTestResponse } from '@/services/types'

/**
 * The hero working surface (frontend-feature §E), dark web workspace. Access tiers
 * (voiceguard-spec §2): logged-out gets the anti-spoof score only (the free voice
 * check); logged-in gets the full pipeline — spoof + ASR transcript + LLM context
 * + combined scam verdict — and the result is saved to history. The LIVE bar must
 * stay at least as prominent as any PREVIEW marker (honesty mechanism).
 */
export function LiveDetectorTestScreen() {
  const { t } = useLang()
  const { isAuthed } = useAuth()
  const recorder = useMediaRecorderClip()
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (blob: Blob) => api.demo.submitLiveTest(blob),
    onSuccess: (data) => {
      if (isAuthed) {
        api.detector.recordTest({ spoofProb: data.spoofProb, scamProb: data.scamProb })
        qc.invalidateQueries({ queryKey: queryKeys.detectorTests })
      }
    },
  })

  const audioUrl = useMemo(() => (recorder.blob ? URL.createObjectURL(recorder.blob) : null), [recorder.blob])
  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  useEffect(() => {
    if (recorder.status === 'stopped' && recorder.blob) mutation.mutate(recorder.blob)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, recorder.blob])

  function recordAgain() {
    mutation.reset()
    recorder.reset()
  }

  const isAnalyzing = recorder.status === 'stopped' && mutation.isPending
  const isRateLimited = mutation.isError && mutation.error instanceof ApiError && mutation.error.status === 429

  return (
    <div className="w-full">
      {/* LIVE bar — prominent, honesty mechanism */}
      <div className="flex items-center justify-center gap-2 bg-blue-600 py-2.5 text-center text-body-sm font-semibold text-white">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
        </span>
        {t({ en: 'LIVE · running the real anti-spoof, ASR and LLM pipeline', th: 'LIVE · กำลังรันระบบป้องกันเสียงปลอม ถอดเสียง และ LLM จริง' })}
      </div>

      <div className="mx-auto max-w-content px-6 py-12 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-web-h1 text-white">
              {isAuthed
                ? t({ en: 'Full analysis', th: 'วิเคราะห์เต็มรูปแบบ' })
                : t({ en: 'Free voice check', th: 'ตรวจเสียงฟรี' })}
            </h1>
            <StatusBadge kind="live" />
          </div>
          <p className="mt-2 max-w-[62ch] text-web-body text-mist-300">
            {isAuthed
              ? t({
                  en: 'Record up to 30 seconds and watch the full pipeline run — voice authenticity, transcript, scam intent and a combined verdict.',
                  th: 'อัดเสียงได้สูงสุด 30 วินาที แล้วดูการทำงานเต็มรูปแบบ — ความแท้ของเสียง ถอดเสียง เจตนาหลอกลวง และคำตัดสินรวม',
                })
              : t({
                  en: 'Record up to 30 seconds and get an instant AI-voice score. No account needed. Sign in free to unlock the transcript, scam analysis and verdict.',
                  th: 'อัดเสียงได้สูงสุด 30 วินาที แล้วรับคะแนนเสียง AI ทันที ไม่ต้องมีบัญชี เข้าสู่ระบบฟรีเพื่อปลดล็อกถอดเสียง การวิเคราะห์สแกม และคำตัดสิน',
                })}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Left — input / controls */}
          <Reveal>
            <div className="flex flex-col gap-4 rounded-web-card border border-white/10 bg-surface-800 p-6">
              <RecordControl recorder={recorder} isAnalyzing={isAnalyzing} />

              {audioUrl && (
                <div className="flex flex-col gap-2 rounded-card bg-ink-950/60 p-3">
                  <audio src={audioUrl} controls className="w-full" />
                  <Button variant="outline-light" onClick={recordAgain} className="self-start !min-h-0 h-10 px-4">
                    {t({ en: 'Record again', th: 'อัดใหม่' })}
                  </Button>
                </div>
              )}

              <div className="rounded-card border border-coral-500/20 bg-coral-500/10 p-4">
                <p className="text-label text-coral-400">{t({ en: 'Say anything, or read this:', th: 'พูดอะไรก็ได้ หรืออ่านประโยคนี้:' })}</p>
                <p className="mt-1 text-small text-white">
                  {t({
                    en: '“Hi, this is your bank calling — we noticed unusual activity and need you to confirm your one-time code.”',
                    th: '“สวัสดีค่ะ ธนาคารโทรมา — เราพบธุรกรรมผิดปกติ รบกวนยืนยันรหัส OTP ของคุณด้วยค่ะ”',
                  })}{' '}
                  <span className="text-mist-500">{t({ en: '(Optional — say anything you like.)', th: '(ไม่บังคับ — พูดอะไรก็ได้)' })}</span>
                </p>
              </div>

              <p className="flex items-center gap-1.5 text-caption text-mist-500">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                {t({ en: 'Your clip is analyzed live and never stored.', th: 'คลิปของคุณถูกวิเคราะห์แบบสดและไม่ถูกจัดเก็บ' })}
              </p>
            </div>
          </Reveal>

          {/* Right — results */}
          <Reveal delay={0.08}>
            <div className="min-h-[320px] rounded-web-card border border-white/10 bg-surface-800 p-6">
              {isRateLimited ? (
                <RateLimited />
              ) : isAnalyzing ? (
                <PipelineProgress full={isAuthed} />
              ) : mutation.isSuccess ? (
                <Results data={mutation.data} full={isAuthed} />
              ) : (
                <EmptyHint />
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

function EmptyHint() {
  const { t } = useLang()
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-mist-300">
        <Mic className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="text-body-sm text-mist-300">{t({ en: 'Record a clip to see the analysis.', th: 'อัดคลิปเพื่อดูผลวิเคราะห์' })}</p>
      <p className="max-w-[36ch] text-caption text-mist-500">
        {t({ en: 'Tip: play an AI-generated voice into your mic and watch the score flip.', th: 'เคล็ดลับ: เปิดเสียงที่สร้างด้วย AI ใส่ไมค์ แล้วดูคะแนนพลิก' })}
      </p>
    </div>
  )
}

function RateLimited() {
  const { t } = useLang()
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
      <p className="max-w-[34ch] text-body-sm text-danger-500">
        {t({ en: 'You’ve hit the free limit for now. Sign up to keep testing.', th: 'คุณใช้สิทธิ์ฟรีครบแล้วในตอนนี้ สมัครเพื่อทดสอบต่อ' })}
      </p>
      <Link to="/signup">
        <Button variant="primary">{t({ en: 'Sign up free', th: 'สมัครฟรี' })}</Button>
      </Link>
    </div>
  )
}

function RecordControl({
  recorder,
  isAnalyzing,
}: {
  recorder: ReturnType<typeof useMediaRecorderClip>
  isAnalyzing: boolean
}) {
  const { t } = useLang()
  const recording = recorder.status === 'recording'
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={recording ? recorder.stop : recorder.start}
        disabled={recorder.status === 'requesting' || isAnalyzing}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
        className={
          'flex h-24 w-24 items-center justify-center rounded-full text-white transition disabled:opacity-60 ' +
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral-500 ' +
          (recording ? 'bg-danger-500 animate-pulse shadow-glow-coral' : 'bg-coral-500 hover:bg-coral-400 hover:shadow-glow-coral')
        }
      >
        {recording ? <Square className="h-8 w-8 fill-current" aria-hidden="true" /> : <Mic className="h-9 w-9" aria-hidden="true" />}
      </button>

      {recording ? (
        <div className="flex flex-col items-center gap-2">
          <Waveform />
          <p className="text-body-sm tabular-nums text-white">
            {formatSec(recorder.elapsedSec)} / {formatSec(recorder.maxDurationSec)}
          </p>
        </div>
      ) : (
        <p className="text-body-sm text-mist-300">
          {recorder.status === 'requesting'
            ? t({ en: 'Requesting microphone access…', th: 'กำลังขอสิทธิ์ไมโครโฟน…' })
            : recorder.status === 'denied'
              ? recorder.error
              : recorder.status === 'stopped'
                ? t({ en: `Recorded ${formatSec(recorder.elapsedSec)}`, th: `อัดแล้ว ${formatSec(recorder.elapsedSec)}` })
                : t({ en: 'Tap the mic to start recording.', th: 'แตะไมค์เพื่อเริ่มอัด' })}
        </p>
      )}
    </div>
  )
}

function Waveform() {
  const bars = [0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.45, 0.75, 0.55]
  return (
    <div className="flex h-8 items-center gap-1" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-danger-500/80"
          style={{ height: `${h * 100}%`, animation: `waveform 0.9s ease-in-out ${i * 0.08}s infinite alternate` }}
        />
      ))}
    </div>
  )
}

function PipelineProgress({ full }: { full: boolean }) {
  const { t } = useLang()
  const steps = full
    ? [
        t({ en: 'Scoring the voice', th: 'ให้คะแนนเสียง' }),
        t({ en: 'Transcribing', th: 'ถอดเสียง' }),
        t({ en: 'Reading intent', th: 'อ่านเจตนา' }),
        t({ en: 'Final verdict', th: 'คำตัดสิน' }),
      ]
    : [t({ en: 'Scoring the voice', th: 'ให้คะแนนเสียง' })]

  const [active, setActive] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    timer.current = setInterval(() => setActive((a) => Math.min(a + 1, steps.length - 1)), 650)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [steps.length])

  return (
    <div className="flex min-h-[280px] flex-col justify-center gap-3">
      <p className="text-label text-mist-300">{t({ en: 'Analyzing…', th: 'กำลังวิเคราะห์…' })}</p>
      {steps.map((step, i) => {
        const done = i < active
        const current = i === active
        return (
          <div key={step} className="flex items-center gap-3">
            <span
              className={
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ' +
                (done ? 'bg-teal-400' : current ? 'bg-blue-600' : 'bg-white/10')
              }
            >
              {done ? (
                <Check className="h-4 w-4 text-ink-950" aria-hidden="true" />
              ) : current ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <span className="text-tag font-semibold text-mist-500">{i + 1}</span>
              )}
            </span>
            <span className={current || done ? 'text-body-sm text-white' : 'text-body-sm text-mist-500'}>{step}</span>
          </div>
        )
      })}
    </div>
  )
}

function Results({ data, full }: { data: LiveTestResponse; full: boolean }) {
  const { t } = useLang()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center gap-10">
        <ScoreRing value={100 - data.spoofProb} size={100} label={t({ en: 'Real voice', th: 'เสียงจริง' })} tone={data.spoofProb > 50 ? 'danger' : 'safe'} />
        {full && (
          <ScoreRing value={data.scamProb} size={100} label={t({ en: 'Scam risk', th: 'ความเสี่ยงสแกม' })} tone={data.scamProb >= 50 ? 'danger' : 'safe'} />
        )}
      </div>

      {full ? (
        <>
          <div className="rounded-card bg-ink-950/60 p-4">
            <p className="text-micro uppercase tracking-wide text-mist-500">{t({ en: 'Transcript (ASR)', th: 'ถอดเสียง (ASR)' })}</p>
            <p className="mt-1 text-small text-white">“{data.transcript}”</p>
          </div>

          <div className="rounded-card bg-ink-950/60 p-4">
            <p className="text-micro uppercase tracking-wide text-mist-500">{t({ en: 'Context (LLM)', th: 'บริบท (LLM)' })}</p>
            <p className="mt-1 text-small text-mist-300">{data.summary}</p>
            <div className="mt-2">
              <IntentPillRow intents={data.intents} />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-card bg-white/5 p-4">
            <Lightbulb className="h-4 w-4 shrink-0 translate-y-0.5 text-coral-400" aria-hidden="true" />
            <p className="text-small text-mist-300">
              {data.reasons[0]}.{' '}
              <span className="text-mist-500">{t({ en: `Analyzed in ${(data.latencyMs / 1000).toFixed(1)}s.`, th: `วิเคราะห์ใน ${(data.latencyMs / 1000).toFixed(1)} วินาที` })}</span>
            </p>
          </div>
        </>
      ) : (
        <UpsellPanel />
      )}
    </div>
  )
}

/** Logged-out result footer: shows only the spoof score above, then invites
 * sign-in to unlock the rest of the pipeline (voiceguard-spec §2). */
function UpsellPanel() {
  const { t } = useLang()
  return (
    <div className="rounded-web-card border border-coral-500/25 bg-gradient-to-br from-surface-700/60 to-surface-800 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-500/15 text-coral-400">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-body-medium font-semibold text-white">{t({ en: 'Unlock the full analysis', th: 'ปลดล็อกการวิเคราะห์เต็มรูปแบบ' })}</p>
          <p className="mt-1 text-small text-mist-300">
            {t({
              en: 'Create a free account to also see the transcript, scam-intent analysis, a combined verdict, and saved history.',
              th: 'สร้างบัญชีฟรีเพื่อดูถอดเสียง การวิเคราะห์เจตนาหลอกลวง คำตัดสินรวม และประวัติที่บันทึกไว้',
            })}
          </p>
        </div>
      </div>
      <Link to="/signup" className="mt-4 inline-block">
        <Button variant="primary" className="px-5">
          {t({ en: 'Sign up free', th: 'สมัครฟรี' })}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </div>
  )
}

function formatSec(sec: number): string {
  return `0:${sec.toString().padStart(2, '0')}`
}
