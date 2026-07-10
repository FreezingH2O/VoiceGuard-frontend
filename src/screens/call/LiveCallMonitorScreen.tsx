import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { MicOff, PhoneOff, Flag } from 'lucide-react'
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
import { useCountUpTimer } from '@/hooks/useCountUpTimer'
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
  const timerSeconds = useCountUpTimer(state.connectionState === 'open')
  const endCallMutation = useMutation({ mutationFn: () => api.calls.end(callId ?? '') })

  const [showSummary, setShowSummary] = useState(false)
  const [showGuardianInterstitial, setShowGuardianInterstitial] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState<1 | 2>(1)
  const shownInterstitialRef = useRef(false)

  function exitToDebrief() {
    if (props.onExitDemo) props.onExitDemo(scenarioId!)
    else navigate(`/demo/debrief/${scenarioId}`)
  }

  // Elder Mode: show the guardian-notified interstitial once, at the alert moment.
  useEffect(() => {
    if (isDemo && elderMode && state.alert?.guardiansNotified && !shownInterstitialRef.current) {
      shownInterstitialRef.current = true
      setShowGuardianInterstitial(true)
    }
  }, [isDemo, elderMode, state.alert])

  // Demo: auto-advance to the debrief once playback naturally finishes.
  useEffect(() => {
    if (!isDemo || timeline.length === 0) return
    const lastT = Math.max(0, ...timeline.map((e) => e.t))
    const id = setTimeout(exitToDebrief, lastT + 2500)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, timeline, scenarioId])

  const caller = isDemo && scenarioId ? getScenarioCallerName(scenarioId) : { name: `Call ${callId?.slice(0, 8)}`, icon: 'phone' }

  const stripColor =
    state.callState === 'alerted' ? 'bg-danger-500' : state.callState === 'suspicious' ? 'bg-coral-500' : 'bg-white/15'

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
          <p className="text-screen-header mt-1 font-semibold">{caller.name}</p>
          <p className="text-small text-mid">
            {formatTimer(timerSeconds)} · {state.connectionState === 'open' ? t({ en: 'Analyzing', th: 'กำลังวิเคราะห์' }) : state.connectionState}
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

        <div className="flex gap-7">
          <ScoreRing value={state.spoofScore} size={84} label={t({ en: 'Fake voice', th: 'เสียงปลอม' })} tone="danger" />
          <ScoreRing value={state.riskScore} size={84} label={t({ en: 'Scam risk', th: 'ความเสี่ยงมิจฉาชีพ' })} tone="danger" />
        </div>

        <section className="w-full rounded-[18px] border border-hairline/10 bg-panel p-4">
          <h2 className="text-label text-fg">{t({ en: 'Conversation context', th: 'บริบทการสนทนา' })}</h2>
          <p className="mt-1.5 text-small text-mid">
            {state.contextSummary ?? t({ en: 'Listening for context…', th: 'กำลังฟังเพื่อจับบริบท…' })}
          </p>
          {state.intents.length > 0 && (
            <div className="mt-2">
              <IntentPillRow intents={state.intents} />
            </div>
          )}
        </section>

        <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto">
          {state.transcript.length === 0 && <Skeleton variant="line" className="w-3/4" />}
          {state.transcript.map((line) => (
            <div
              key={line.seq}
              className="max-w-[85%] self-start rounded-tr-[16px] rounded-bl-[16px] rounded-tl-[4px] rounded-br-[16px] bg-panel-2 px-3 py-2 text-small text-mid"
            >
              {line.text}
            </div>
          ))}
        </div>

        {isDemo && playback && (
          <div className="flex w-full items-center justify-center gap-2 pb-1">
            <Button
              variant="outline-neutral"
              onClick={() => {
                if (paused) playback.resume()
                else playback.pause()
                setPaused(!paused)
              }}
            >
              {paused ? t({ en: 'Resume', th: 'เล่นต่อ' }) : t({ en: 'Pause', th: 'หยุดชั่วคราว' })}
            </Button>
            <Button variant="outline-light" onClick={() => playback.restart()}>
              {t({ en: 'Restart', th: 'เริ่มใหม่' })}
            </Button>
            <Button
              variant="outline-neutral"
              onClick={() => {
                const next = rate === 1 ? 2 : 1
                setRate(next)
                playback.setPlaybackRate(next)
              }}
            >
              {rate}x
            </Button>
            <Button variant="outline-light" onClick={() => playback.skipToAlert()}>
              {t({ en: 'Skip to alert', th: 'ข้ามไปที่การแจ้งเตือน' })}
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-center border-t border-hairline/10 bg-panel px-4 py-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-4 sm:max-w-lg md:max-w-xl">
          <Button variant="outline-neutral" className="!h-[52px] !w-[52px] !rounded-full !p-0" aria-label={t({ en: 'Mute', th: 'ปิดเสียง' })} onClick={handleKeepTalking}>
            <MicOff className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button variant="danger" className="!h-[64px] !w-[64px] !rounded-full !p-0" aria-label={t({ en: 'End call', th: 'วางสาย' })} onClick={handleEndCall}>
            <PhoneOff className="h-6 w-6" aria-hidden="true" />
          </Button>
          <Button variant="outline-neutral" className="!h-[52px] !w-[52px] !rounded-full !p-0" aria-label={t({ en: 'Flag', th: 'รายงานสาย' })}>
            <Flag className="h-5 w-5" aria-hidden="true" />
          </Button>
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

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
