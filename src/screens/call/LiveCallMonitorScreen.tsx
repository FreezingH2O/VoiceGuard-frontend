import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { MicOff, PhoneOff, Flag, Play, Pause as PauseIcon, Gauge, RotateCcw, FastForward, type LucideIcon } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { ScoreRing } from '@/components/ScoreRing'
import { AlertBanner } from '@/components/AlertBanner'
import { IntentPillRow } from '@/components/IntentPillRow'
import { Button } from '@/components/Button'
import { Sheet } from '@/components/Sheet'
import { Banner } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { useRealtimeCallState } from '@/hooks/useRealtimeCallState'
import { usePlaybackClock } from '@/hooks/usePlaybackClock'
import { useMicChunkStream } from '@/hooks/useMicChunkStream'
import { LiveWebSocketClient } from '@/ws/LiveWebSocketClient'
import { DemoSchedulerClient } from '@/ws/DemoSchedulerClient'
import { hasPlaybackControls } from '@/ws/RealtimeClient'
import { getScenarioCallerName } from '@/services/mock/scenarios.data'
import { ScenarioIcon } from '@/lib/scenarioIcons'
import { useLang } from '@/i18n/LangProvider'
import type { TimedEvent } from '@/ws/types'

interface LocationState {
  elderMode?: boolean
  /** Provided by the start-call flow when a real backend session was opened. */
  wsUrl?: string
  wsToken?: string
}

interface DemoInlineProps {
  /** Set when embedded inline (e.g. the landing page) instead of routed at /demo/monitor/:scenarioId. */
  scenarioId?: string
  elderMode?: boolean
  /** Called instead of navigating to /demo/debrief/:scenarioId when embedded inline. */
  onExitDemo?: (scenarioId: string) => void
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function LiveCallMonitorScreen(props: DemoInlineProps = {}) {
  const { callId, scenarioId: routeScenarioId } = useParams()
  const scenarioId = props.scenarioId ?? routeScenarioId
  const isDemo = !!scenarioId
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as LocationState | null
  const elderMode = props.elderMode ?? locationState?.elderMode ?? false
  const { t, lang } = useLang()

  const scenarioQuery = useQuery({
    queryKey: [...queryKeys.demoScenario(scenarioId ?? ''), lang],
    queryFn: () => api.demo.getScenario(scenarioId!),
    enabled: isDemo,
  })

  const timeline: TimedEvent[] = scenarioQuery.data?.events ?? []
  const audioUrl = isDemo ? scenarioQuery.data?.audioUrl : undefined
  const audioRef = useRef<HTMLAudioElement>(null)

  const client = useMemo(() => {
    if (isDemo) return new DemoSchedulerClient(timeline)
    return new LiveWebSocketClient(
      callId ?? 'unknown',
      locationState?.wsUrl ?? `mock://${callId}`,
      locationState?.wsToken ?? 'mock-token',
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, callId, scenarioQuery.data])

  const state = useRealtimeCallState(client)
  // Real monitored call: stream speakerphone mic audio into the analysis pipeline.
  const { stopMic } = useMicChunkStream(client, !isDemo && !USE_MOCKS)
  const endCallMutation = useMutation({ mutationFn: () => api.calls.end(callId ?? '') })

  const [showSummary, setShowSummary] = useState(false)
  const [showGuardianInterstitial, setShowGuardianInterstitial] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState<1 | 2>(1)
  const shownInterstitialRef = useRef(false)
  const exitedRef = useRef(false)

  // The single source of truth for "how far into this call are we" — drives both
  // the on-screen timer and the auto-advance, so Pause and 2x affect both.
  const [elapsedMs, seek] = usePlaybackClock({
    running: state.connectionState === 'open' && !paused,
    rate: isDemo ? rate : 1,
  })
  const timerSeconds = Math.floor(elapsedMs / 1000)

  function exitToDebrief() {
    if (props.onExitDemo) props.onExitDemo(scenarioId!)
    else navigate(`/demo/debrief/${scenarioId}`)
  }

  // Demo: play the scenario's voice track alongside the scripted timeline. The
  // scripted events remain the source of truth — a missing or blocked audio file
  // is swallowed so the visual demo always runs.
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (state.connectionState === 'open' && !paused) {
      el.play().catch(() => {
        /* autoplay blocked or file absent — the timeline still drives the demo */
      })
    } else {
      el.pause()
    }
  }, [state.connectionState, paused, audioUrl])

  // Keep the audio at the selected demo speed (Speed toggle).
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = isDemo ? rate : 1
  }, [rate, isDemo, audioUrl])

  // Elder Mode: show the guardian-notified interstitial once, at the alert moment.
  useEffect(() => {
    if (isDemo && elderMode && state.alert?.guardiansNotified && !shownInterstitialRef.current) {
      shownInterstitialRef.current = true
      setShowGuardianInterstitial(true)
    }
  }, [isDemo, elderMode, state.alert])

  // Demo: auto-advance to the debrief once playback naturally finishes. Keyed off
  // the playback clock rather than a wall-clock timeout, so a paused demo stays put
  // instead of yanking the user to the debrief mid-read.
  useEffect(() => {
    if (!isDemo || timeline.length === 0 || exitedRef.current) return
    const lastT = Math.max(0, ...timeline.map((e) => e.t))
    if (elapsedMs >= lastT + 2500) {
      exitedRef.current = true
      exitToDebrief()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, timeline, scenarioId, elapsedMs])

  const caller = isDemo && scenarioId ? getScenarioCallerName(scenarioId) : { name: `Call ${callId?.slice(0, 8)}`, icon: 'phone' }

  const stripColor =
    // bg-white/15 for the calm state was invisible on the light screen — theme token.
    state.callState === 'alerted' ? 'bg-danger-500' : state.callState === 'suspicious' ? 'bg-coral-500' : 'bg-hairline/20'

  function handleEndCall() {
    stopMic()
    client.send({ type: 'user_action', action: 'ended_call' })
    if (!isDemo && callId) {
      endCallMutation.mutate()
      setShowSummary(true)
    } else {
      exitToDebrief()
    }
  }

  function handleKeepTalking() {
    client.send({ type: 'user_action', action: 'kept_talking' })
  }

  const playback = hasPlaybackControls(client) ? client : null

  return (
    <div className="flex flex-1 flex-col bg-night text-fg">
      {isDemo && audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
      {isDemo && (
        <Banner tone="demo">
          {t({ en: 'PREVIEW · simulated call showing the in-call experience', th: 'ตัวอย่าง · สายจำลองเพื่อแสดงประสบการณ์ระหว่างสาย' })}
        </Banner>
      )}

      <div className={`h-1 w-full ${stripColor}`} aria-hidden="true" />

      {state.connectionState === 'reconnecting' && (
        <div className="bg-coral-500 px-4 py-1 text-center text-caption text-white">
          {t({ en: 'Protection limited, reconnecting…', th: 'การป้องกันจำกัดชั่วคราว กำลังเชื่อมต่อใหม่…' })}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-3 px-4 py-4 sm:max-w-lg md:max-w-xl">
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60 text-white">
            <ScenarioIcon slug={caller.icon} className="h-8 w-8" />
          </span>
          <p className="mt-1 text-h2 font-bold">{caller.name}</p>
          <p className="text-body text-mid">
            {formatTimer(timerSeconds)} ·{' '}
            {state.connectionState === 'open'
              ? paused
                ? t({ en: 'Paused', th: 'หยุดชั่วคราว' })
                : t({ en: 'Checking this call…', th: 'กำลังตรวจสายนี้…' })
              : state.connectionState}
          </p>
        </div>

        {state.alert && (
          <div className="w-full">
            <AlertBanner
              level={state.alert.level}
              reasonMain={state.alert.reasonMain}
              reasons={state.alert.reasons}
              guardiansNotified={state.alert.guardiansNotified}
              onEndCall={handleEndCall}
              onKeepTalking={handleKeepTalking}
            />
          </div>
        )}

        {/* The two signals. Both rings used to be hardcoded `tone="danger"`, so a 4%
            score still drew in alarm red — the colour carried no information. Tone
            now tracks the value, and each ring says the number in words. */}
        <div className="flex w-full justify-center gap-6 rounded-[18px] border border-hairline/10 bg-panel p-4">
          <ScoreRing
            value={state.spoofScore}
            size={104}
            label={t({ en: 'Fake voice', th: 'เสียงปลอม' })}
            tone={scoreTone(state.spoofScore)}
            caption={t(scoreWord(state.spoofScore))}
          />
          <ScoreRing
            value={state.riskScore}
            size={104}
            label={t({ en: 'Scam risk', th: 'ความเสี่ยงมิจฉาชีพ' })}
            tone={scoreTone(state.riskScore)}
            caption={t(scoreWord(state.riskScore))}
          />
        </div>

        <section className="w-full rounded-[18px] border border-hairline/10 bg-panel p-4">
          <h2 className="text-body font-bold text-fg">{t({ en: 'What this call is about', th: 'สายนี้เกี่ยวกับอะไร' })}</h2>
          <p className="mt-2 text-body text-mid">
            {state.contextSummary ?? t({ en: 'Listening…', th: 'กำลังฟัง…' })}
          </p>
          {state.intents.length > 0 && (
            <div className="mt-3">
              <IntentPillRow intents={state.intents} />
            </div>
          )}
        </section>

        <section className="flex w-full flex-1 flex-col overflow-hidden">
          <h2 className="mb-2 text-body font-bold text-fg">{t({ en: 'Live transcript', th: 'บทสนทนาแบบสด' })}</h2>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
            {state.transcript.length === 0 && <Skeleton variant="line" className="w-3/4" />}
            {state.transcript.map((line) => {
              const isCaller = line.speaker === 'caller'
              return (
                <div key={line.seq} className={`flex flex-col ${isCaller ? 'items-start' : 'items-end'}`}>
                  <span className="mb-0.5 px-1 text-caption font-semibold text-low">
                    {isCaller ? t({ en: 'Caller', th: 'ผู้โทร' }) : t({ en: 'You', th: 'คุณ' })}
                  </span>
                  <div
                    className={
                      isCaller
                        ? 'max-w-[90%] rounded-tr-[16px] rounded-bl-[16px] rounded-tl-[4px] rounded-br-[16px] bg-panel-2 px-4 py-3 text-body text-fg'
                        : 'max-w-[90%] rounded-tl-[16px] rounded-br-[16px] rounded-tr-[4px] rounded-bl-[16px] bg-blue-600/20 px-4 py-3 text-body text-fg'
                    }
                  >
                    {line.text}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {isDemo && playback && (
          /* Demo playback controls. Laid out 2-up rather than 4-across: at four to a
             row each button was ~70px wide, well under a comfortable target, and the
             bare "2x" gave no clue what it controlled. */
          <div className="w-full rounded-[18px] border border-hairline/10 bg-panel-2 p-3">
            <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-low">
              {t({ en: 'Demo controls', th: 'ตัวควบคุมเดโม' })}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant={paused ? 'gold' : 'outline-neutral'}
                className="!min-h-[52px] text-body"
                leftIcon={paused ? <Play className="h-5 w-5" aria-hidden="true" /> : <PauseIcon className="h-5 w-5" aria-hidden="true" />}
                onClick={() => {
                  if (paused) playback.resume()
                  else playback.pause()
                  setPaused(!paused)
                }}
              >
                {paused ? t({ en: 'Resume', th: 'เล่นต่อ' }) : t({ en: 'Pause', th: 'หยุด' })}
              </Button>
              <Button
                variant="outline-neutral"
                className="!min-h-[52px] text-body"
                leftIcon={<Gauge className="h-5 w-5" aria-hidden="true" />}
                aria-label={t({ en: `Playback speed, currently ${rate}x`, th: `ความเร็ว ขณะนี้ ${rate}x` })}
                onClick={() => {
                  const next = rate === 1 ? 2 : 1
                  setRate(next)
                  playback.setPlaybackRate(next)
                }}
              >
                {t({ en: 'Speed', th: 'ความเร็ว' })} {rate}x
              </Button>
              <Button
                variant="outline-neutral"
                className="!min-h-[52px] text-body"
                leftIcon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}
                onClick={() => {
                  playback.restart()
                  seek(0)
                  if (audioRef.current) audioRef.current.currentTime = 0
                  setPaused(false)
                }}
              >
                {t({ en: 'Restart', th: 'เริ่มใหม่' })}
              </Button>
              <Button
                variant="outline-neutral"
                className="!min-h-[52px] text-body"
                leftIcon={<FastForward className="h-5 w-5" aria-hidden="true" />}
                onClick={() => {
                  playback.skipToAlert()
                  const alertAt = timeline.find((e) => e.event.type === 'alert')?.t ?? 0
                  seek(alertAt)
                  if (audioRef.current) audioRef.current.currentTime = alertAt / 1000
                  setPaused(false)
                }}
              >
                {t({ en: 'Skip to alert', th: 'ข้ามไปแจ้งเตือน' })}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Call actions. The three controls were bare circles — an older user has to
          guess what each glyph does, and "end the call" is the one action that must
          never be ambiguous mid-scam. Each now carries a visible word, and End Call
          is a wide labelled button rather than one more circle in a row. */}
      <div className="border-t border-hairline/10 bg-panel px-4 py-4">
        <div className="mx-auto flex w-full max-w-md items-end justify-center gap-3 sm:max-w-lg md:max-w-xl">
          <CallAction
            icon={MicOff}
            label={t({ en: 'Mute', th: 'ปิดเสียง' })}
            onClick={handleKeepTalking}
          />
          <Button
            variant="danger"
            className="!min-h-[64px] flex-1 !rounded-[18px] text-h2"
            leftIcon={<PhoneOff className="h-6 w-6" aria-hidden="true" />}
            onClick={handleEndCall}
          >
            {t({ en: 'End call', th: 'วางสาย' })}
          </Button>
          <CallAction icon={Flag} label={t({ en: 'Report', th: 'รายงาน' })} />
        </div>
      </div>

      <Sheet
        open={showGuardianInterstitial}
        onClose={() => setShowGuardianInterstitial(false)}
        title={t({ en: 'Guardian notified', th: 'แจ้งผู้ดูแลแล้ว' })}
      >
        <p className="text-small text-mid">
          {t({
            en: 'Because Elder Mode is on, your guardian was notified in real time about this likely scam call.',
            th: 'เนื่องจากเปิดโหมดผู้สูงอายุไว้ ระบบจึงแจ้งผู้ดูแลของคุณแบบเรียลไทม์เกี่ยวกับสายที่น่าจะเป็นมิจฉาชีพนี้',
          })}
        </p>
        <Button variant="gold" fullWidth className="mt-4" onClick={() => setShowGuardianInterstitial(false)}>
          {t({ en: 'Continue', th: 'ดำเนินการต่อ' })}
        </Button>
      </Sheet>

      <Sheet open={showSummary} onClose={() => navigate('/app-preview/history')} title={t({ en: 'Call ended', th: 'วางสายแล้ว' })}>
        <p className="text-small text-mid">
          {t({ en: 'This call has been added to your call history.', th: 'สายนี้ถูกบันทึกลงในประวัติการโทรของคุณแล้ว' })}
        </p>
        <Button variant="gold" fullWidth className="mt-4" onClick={() => navigate('/app-preview/history')}>
          {t({ en: 'View history', th: 'ดูประวัติ' })}
        </Button>
      </Sheet>
    </div>
  )
}

/** A secondary in-call control: icon in a round target, with its name underneath. */
function CallAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-[16px] py-1 text-mid transition hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-hairline/20 bg-panel-2">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="text-caption font-semibold">{label}</span>
    </button>
  )
}

/** Colour and wording for a 0-100 signal. Thresholds match the alert levels the
 *  backend uses, so the ring never disagrees with the banner above it. */
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
