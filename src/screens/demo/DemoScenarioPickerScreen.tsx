import { useQuery } from '@tanstack/react-query'
import { Play } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Pill, Banner } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { ScenarioIcon } from '@/lib/scenarioIcons'
import { useLang } from '@/i18n/LangProvider'

// Pill tone is derived from the scenario id, not its (translated) tag label.
const pillToneById: Record<string, 'safe' | 'danger' | 'warn'> = {
  'fake-arrest-warrant': 'danger',
  'cloned-son-accident': 'danger',
  'hospital-appointment': 'safe',
  'cloned-daughter-accident': 'danger',
  'bank-fraud-officer': 'danger',
}

export function DemoScenarioPickerScreen({ onSelectScenario }: { onSelectScenario: (scenarioId: string) => void }) {
  const { t, lang } = useLang()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [...queryKeys.demoScenarios, lang],
    queryFn: api.demo.listScenarios,
  })

  return (
    <div className="flex flex-1 flex-col">
      <Banner tone="demo">
        {t({ en: 'PREVIEW · simulated call showing the in-call experience', th: 'ตัวอย่าง · สายจำลองเพื่อแสดงประสบการณ์ระหว่างสาย' })}
      </Banner>
      <div className="flex flex-1 flex-col gap-4 bg-night px-5 py-5 text-fg">
        <div>
          <h1 className="text-h1-mobile font-bold text-accent">
            {t({ en: 'Experience a scam call, safely', th: 'ลองรับสายมิจฉาชีพแบบปลอดภัย' })}
          </h1>
          <p className="mt-1 text-small text-mid">
            {t({
              en: 'Pick a scenario to see how PaTuean detects and reacts to a scam call in real time.',
              th: 'เลือกสถานการณ์เพื่อดูว่า ป้าเตือน ตรวจจับและรับมือสายมิจฉาชีพแบบเรียลไทม์อย่างไร',
            })}
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
              className="flex w-full items-start gap-3 rounded-[18px] border border-hairline/10 bg-panel p-4 text-left transition hover:bg-panel-2"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-gold-400/70 to-blue-600/60">
                <ScenarioIcon slug={scenario.icon} className="h-5 w-5 text-white" />
              </span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm font-semibold text-fg">{scenario.title}</p>
                  <Pill tone={pillToneById[scenario.id] ?? 'warn'} size="xs">
                    {scenario.tag}
                  </Pill>
                </div>
                <p className="mt-1 text-small text-mid">{scenario.description}</p>
                <p className="mt-1.5 flex items-center gap-1 text-small font-semibold text-accent">
                  <Play className="h-3 w-3 fill-current" aria-hidden="true" /> {t({ en: 'Start demo', th: 'เริ่มเดโม' })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
