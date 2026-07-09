import { forwardRef, useState } from 'react'
import { Play, ShieldAlert } from 'lucide-react'
import { PhoneMockup } from '@/components/web/PhoneMockup'
import { StatusBar } from '@/components/StatusBar'
import { DemoScenarioPickerScreen } from '@/screens/demo/DemoScenarioPickerScreen'
import { DemoIncomingCallScreen } from '@/screens/demo/DemoIncomingCallScreen'
import { LiveCallMonitorScreen } from '@/screens/call/LiveCallMonitorScreen'
import { DemoDebriefScreen } from '@/screens/demo/DemoDebriefScreen'
import { useLang } from '@/i18n/LangProvider'

type Phase =
  | { name: 'idle' }
  | { name: 'picker' }
  | { name: 'ringing'; scenarioId: string }
  | { name: 'live'; scenarioId: string }
  | { name: 'debrief'; scenarioId: string }

/**
 * The real /demo flow (scenario picker → ringing → live monitor → debrief),
 * driven by local phase state instead of routing, embedded inline in the
 * phone on the landing page's How It Works section. The screens themselves
 * are unmodified except for taking callbacks instead of `useNavigate` — a
 * nested <Router> inside the app's data router isn't supported by React
 * Router, so this is the way to reuse the real screens without a page nav.
 */
export const EmbeddedScamDemoPhone = forwardRef<HTMLDivElement, object>(function EmbeddedScamDemoPhone(_props, ref) {
  const [phase, setPhase] = useState<Phase>({ name: 'idle' })

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <PhoneMockup className="shadow-glow-soft">
        <StatusBar />
        {phase.name === 'idle' && <IdleCover onStart={() => setPhase({ name: 'picker' })} />}
        {phase.name === 'picker' && (
          <DemoScenarioPickerScreen onSelectScenario={(scenarioId) => setPhase({ name: 'ringing', scenarioId })} />
        )}
        {phase.name === 'ringing' && (
          <DemoIncomingCallScreen
            scenarioId={phase.scenarioId}
            onDecline={() => setPhase({ name: 'picker' })}
            onAccept={() => setPhase({ name: 'live', scenarioId: phase.scenarioId })}
          />
        )}
        {phase.name === 'live' && (
          <LiveCallMonitorScreen
            scenarioId={phase.scenarioId}
            onExitDemo={(scenarioId) => setPhase({ name: 'debrief', scenarioId })}
          />
        )}
        {phase.name === 'debrief' && (
          <DemoDebriefScreen scenarioId={phase.scenarioId} onRestart={() => setPhase({ name: 'picker' })} />
        )}
      </PhoneMockup>

      {phase.name !== 'idle' && (
        <button
          type="button"
          onClick={() => setPhase({ name: 'picker' })}
          className="text-body-sm font-medium text-mist-300 underline-offset-4 transition hover:text-white hover:underline"
        >
          <RestartLabel />
        </button>
      )}
    </div>
  )
})

function RestartLabel() {
  const { t } = useLang()
  return <>{t({ en: 'Restart demo', th: 'เริ่มใหม่' })}</>
}

function IdleCover({ onStart }: { onStart: () => void }) {
  const { t } = useLang()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-navy-950 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500/15 text-coral-500">
        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
      </span>
      <div>
        <p className="text-h2 font-semibold text-white">
          {t({ en: 'See a scam call in real time', th: 'ดูสายหลอกลวงแบบเรียลไทม์' })}
        </p>
        <p className="mt-2 max-w-[26ch] text-body-sm text-mist-300">
          {t({
            en: 'The real scripted demo, running right here — pick a scenario and watch PaTuean detect it.',
            th: 'เดโมจริงแบบสคริปต์ ทำงานตรงนี้เลย — เลือกสถานการณ์แล้วดู ป้าเตือน ตรวจจับ',
          })}
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-white shadow-glow-coral transition hover:-translate-y-0.5 hover:bg-coral-400"
        aria-label={t({ en: 'Start demo', th: 'เริ่มเดโม' })}
      >
        <Play className="h-6 w-6 fill-current" aria-hidden="true" />
      </button>
    </div>
  )
}
