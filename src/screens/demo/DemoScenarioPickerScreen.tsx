import { useQuery } from '@tanstack/react-query'
import { Play } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Pill, Banner } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { ScenarioIcon } from '@/lib/scenarioIcons'

export function DemoScenarioPickerScreen({ onSelectScenario }: { onSelectScenario: (scenarioId: string) => void }) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.demoScenarios,
    queryFn: api.demo.listScenarios,
  })

  return (
    <div className="flex flex-1 flex-col">
      <Banner tone="demo">PREVIEW · simulated call showing the in-call experience</Banner>
      <div className="flex flex-1 flex-col gap-4 bg-night px-5 py-5 text-white">
        <div>
          <h1 className="text-h1-mobile font-bold text-gold-400">Experience a scam call, safely</h1>
          <p className="mt-1 text-small text-mist-300">
            Pick a scenario to see how PaTuean detects and reacts to a scam call in real time.
          </p>
        </div>

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
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario.id)}
              className="flex w-full items-start gap-3 rounded-[18px] border border-white/[0.06] bg-panel p-4 text-left transition hover:bg-panel-2"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-gold-400/70 to-blue-600/60">
                <ScenarioIcon slug={scenario.icon} className="h-5 w-5 text-white" />
              </span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm font-semibold text-white">{scenario.title}</p>
                  <Pill tone={scenario.tag === 'Control' ? 'safe' : scenario.tag === 'Voice clone' ? 'danger' : 'warn'} size="xs">
                    {scenario.tag}
                  </Pill>
                </div>
                <p className="mt-1 text-small text-mist-300">{scenario.description}</p>
                <p className="mt-1.5 flex items-center gap-1 text-small font-semibold text-gold-400">
                  <Play className="h-3 w-3 fill-current" aria-hidden="true" /> Start demo
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
