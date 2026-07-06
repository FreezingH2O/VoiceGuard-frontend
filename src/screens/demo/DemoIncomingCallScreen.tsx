import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Shield, X, Phone } from 'lucide-react'
import { Banner } from '@/components/Pill'
import { Button } from '@/components/Button'
import { getScenarioCallerName } from '@/services/mock/scenarios.data'
import { ScenarioIcon } from '@/lib/scenarioIcons'

interface LocationState {
  elderMode?: boolean
}

export function DemoIncomingCallScreen() {
  const { scenarioId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const elderMode = (location.state as LocationState | null)?.elderMode ?? false
  const caller = getScenarioCallerName(scenarioId)

  return (
    <div className="flex flex-1 flex-col bg-navy-900 text-white">
      <Banner tone="demo">PREVIEW · simulated call showing the in-call experience</Banner>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center sm:max-w-lg md:max-w-xl">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
          <ScenarioIcon slug={caller.icon} className="h-10 w-10 text-navy-900" />
        </span>
        <div>
          <p className="text-h1-mobile">{caller.name}</p>
          <p className="mt-1 text-body text-slate-300">Unknown number</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-body-sm text-navy-900">
          <Shield className="h-4 w-4" aria-hidden="true" /> VoiceGuard is monitoring
        </span>
      </div>

      <div className="flex justify-center bg-navy-950 py-8">
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-16 sm:max-w-lg md:max-w-xl">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="danger"
              aria-label="Decline"
              className="!h-16 !w-16 !rounded-full !p-0"
              onClick={() => navigate('/demo')}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
            <span className="text-caption text-slate-400">Decline</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="primary"
              aria-label="Accept"
              className="!h-16 !w-16 !rounded-full !bg-safe-500 !p-0"
              onClick={() => navigate(`/demo/monitor/${scenarioId}`, { state: { elderMode } })}
            >
              <Phone className="h-6 w-6" aria-hidden="true" />
            </Button>
            <span className="text-caption text-slate-400">Accept</span>
          </div>
        </div>
      </div>
    </div>
  )
}
