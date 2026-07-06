import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Mic, ChevronRight, Play } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
import { Pill, Banner } from '@/components/Pill'
import { Switch } from '@/components/Switch'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { ScenarioIcon } from '@/lib/scenarioIcons'

export function DemoScenarioPickerScreen() {
  const [elderMode, setElderMode] = useState(false)
  const navigate = useNavigate()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.demoScenarios,
    queryFn: api.demo.listScenarios,
  })

  return (
    <div className="flex flex-1 flex-col">
      <Banner tone="demo">PREVIEW · simulated call showing the in-call experience</Banner>
      <div className="flex flex-col gap-4 bg-navy-950 px-5 py-5 text-white">
        <div>
          <h1 className="text-h1-mobile text-coral-500">Experience a scam call, safely</h1>
          <p className="mt-1 text-small text-slate-400">
            Pick a scenario to see how VoiceGuard detects and reacts to a scam call in real time.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-input bg-navy-600 px-3.5 py-3">
          <div>
            <p className="text-label">Elder Mode</p>
            <p className="text-caption text-slate-400">Bigger text, and guardians are notified during alerts.</p>
          </div>
          <Switch label="Elder Mode" checked={elderMode} onChange={setElderMode} />
        </div>

        <Link to="/demo/live-test">
          <Card padding="md" className="!bg-coral-500 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-button bg-white">
              <Mic className="h-5 w-5 text-coral-500" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-body-sm text-white">Test the real detector</p>
                <Pill active>LIVE</Pill>
              </div>
              <p className="text-caption text-white/90">Record your own voice and see it analyzed live.</p>
            </div>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Card>
        </Link>

        {isPending && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}

        <div className="grid grid-cols-1 gap-3">
          {data?.map((scenario) => (
            <Card
              key={scenario.id}
              as="button"
              onClick={() => navigate(`/demo/call/${scenario.id}`, { state: { elderMode } })}
              padding="md"
              className="flex items-start gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-button bg-slate-100">
                <ScenarioIcon slug={scenario.icon} className="h-5 w-5 text-navy-900" />
              </span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm text-white">{scenario.title}</p>
                  <Pill tone={scenario.tag === 'Control' ? 'safe' : scenario.tag === 'Voice clone' ? 'danger' : 'warn'} size="xs">
                    {scenario.tag}
                  </Pill>
                </div>
                <p className="mt-1 text-small text-slate-400">{scenario.description}</p>
                <p className="mt-1 flex items-center gap-1 text-small font-semibold text-coral-500">
                  <Play className="h-3 w-3 fill-current" aria-hidden="true" /> Start demo
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
