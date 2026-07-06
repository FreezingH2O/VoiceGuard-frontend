import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { MicOff, PhoneOff, Flag } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
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
import type { TimedEvent } from '@/ws/types'

interface LocationState {
  elderMode?: boolean
  /** Provided by the start-call flow when a real backend session was opened. */
  wsUrl?: string
  wsToken?: string
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function LiveCallMonitorScreen() {
  const { callId, scenarioId } = useParams()
  const isDemo = !!scenarioId
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as LocationState | null
  const elderMode = locationState?.elderMode ?? false

  const scenarioQuery = useQuery({
    queryKey: queryKeys.demoScenario(scenarioId ?? ''),
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
    const id = setTimeout(() => navigate(`/demo/debrief/${scenarioId}`), lastT + 2500)
    return () => clearTimeout(id)
  }, [isDemo, timeline, scenarioId, navigate])

  const caller = isDemo && scenarioId ? getScenarioCallerName(scenarioId) : { name: `Call ${callId?.slice(0, 8)}`, icon: 'phone' }

  const stripColor =
    state.callState === 'alerted' ? 'bg-danger-600' : state.callState === 'suspicious' ? 'bg-warn-500' : 'bg-slate-600'

  function handleEndCall() {
    stopMic()
    client.send({ type: 'user_action', action: 'ended_call' })
    if (!isDemo && callId) {
      endCallMutation.mutate()
      setShowSummary(true)
    } else {
      navigate(`/demo/debrief/${scenarioId}`)
    }
  }

  function handleKeepTalking() {
    client.send({ type: 'user_action', action: 'kept_talking' })
  }

  const playback = hasPlaybackControls(client) ? client : null

  return (
    <div className="flex flex-1 flex-col bg-navy-950 text-white">
      {isDemo && <Banner tone="demo">PREVIEW · simulated call showing the in-call experience</Banner>}

      <div className={`h-1 w-full ${stripColor}`} aria-hidden="true" />

      {state.connectionState === 'reconnecting' && (
        <div className="bg-warn-500 px-4 py-1 text-center text-caption text-white">
          Protection limited, reconnecting…
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-3 px-4 py-4 sm:max-w-lg md:max-w-xl">
        <div className="flex flex-col items-center gap-1">
          <ScenarioIcon slug={caller.icon} className="h-10 w-10" />
          <p className="text-screen-header">{caller.name}</p>
          <p className="text-small text-slate-400">
            {formatTimer(timerSeconds)} · {state.connectionState === 'open' ? 'Analyzing' : state.connectionState}
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
          <ScoreRing value={state.spoofScore} size={84} label="Fake voice" tone="danger" />
          <ScoreRing value={state.riskScore} size={84} label="Scam risk" tone="danger" />
        </div>

        <Card padding="md" className="w-full">
          <h2 className="text-label">Conversation context</h2>
          <p className="mt-1.5 text-small text-slate-400">
            {state.contextSummary ?? 'Listening for context…'}
          </p>
          {state.intents.length > 0 && (
            <div className="mt-2">
              <IntentPillRow intents={state.intents} />
            </div>
          )}
        </Card>

        <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto">
          {state.transcript.length === 0 && <Skeleton variant="line" className="w-3/4" />}
          {state.transcript.map((line) => (
            <div
              key={line.seq}
              className="max-w-[85%] self-start rounded-tr-card rounded-bl-card rounded-tl-[4px] rounded-br-card bg-card px-3 py-2 text-small"
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
              {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="outline-neutral" onClick={() => playback.restart()}>
              Restart
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
            <Button variant="outline-neutral" onClick={() => playback.skipToAlert()}>
              Skip to alert
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-center bg-navy-bar px-4 py-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-4 sm:max-w-lg md:max-w-xl">
          <Button variant="outline-neutral" className="!h-[52px] !w-[52px] !rounded-full !p-0" aria-label="Mute" onClick={handleKeepTalking}>
            <MicOff className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button variant="danger" className="!h-[64px] !w-[64px] !rounded-full !p-0" aria-label="End call" onClick={handleEndCall}>
            <PhoneOff className="h-6 w-6" aria-hidden="true" />
          </Button>
          <Button variant="outline-neutral" className="!h-[52px] !w-[52px] !rounded-full !p-0" aria-label="Flag">
            <Flag className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Sheet open={showGuardianInterstitial} onClose={() => setShowGuardianInterstitial(false)} title="Guardian notified">
        <p className="text-small text-slate-600">
          Because Elder Mode is on, your guardian was notified in real time about this likely scam call.
        </p>
        <Button variant="primary" fullWidth className="mt-4" onClick={() => setShowGuardianInterstitial(false)}>
          Continue
        </Button>
      </Sheet>

      <Sheet open={showSummary} onClose={() => navigate('/app-preview/history')} title="Call ended">
        <p className="text-small text-slate-600">This call has been added to your call history.</p>
        <Button variant="primary" fullWidth className="mt-4" onClick={() => navigate('/app-preview/history')}>
          View history
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
