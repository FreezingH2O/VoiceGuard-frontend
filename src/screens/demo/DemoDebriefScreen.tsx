import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
import { Banner } from '@/components/Pill'
import { VerdictBadge } from '@/components/VerdictBadge'
import { ReasonRow } from '@/components/ReasonRow'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'

export function DemoDebriefScreen() {
  const { scenarioId = '' } = useParams()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.demoDebrief(scenarioId),
    queryFn: () => api.demo.getDebrief(scenarioId),
  })

  return (
    <div className="flex flex-1 flex-col gap-3 bg-navy-950 text-white">
      <Banner tone="demo">PREVIEW · simulated call showing the in-call experience</Banner>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-4 sm:max-w-2xl lg:max-w-3xl">
        {isPending && (
          <div className="flex flex-col gap-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" className="h-32" />
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {data && (
          <>
            <Card padding="lg" className="flex flex-col items-center gap-2 text-center">
              <h1 className="flex items-center gap-1.5 text-alert-title">
                <CircleCheck className="h-5 w-5 shrink-0 text-safe-500" aria-hidden="true" />
                {data.verdict === 'safe' ? 'No scam detected' : 'Demo call blocked'}
              </h1>
              <VerdictBadge verdict={data.verdict} />
              <p className="text-small text-slate-400">{data.caption}</p>
            </Card>

            <Card padding="md">
              <h2 className="text-label">How it caught the scam</h2>
              <div className="mt-2.5 flex flex-col gap-3">
                {data.stages.map((stage, i) => (
                  <ReasonRow key={stage.title} index={i + 1} text={`${stage.title} — ${stage.description}`} />
                ))}
              </div>
            </Card>

            <Card padding="lg" className="bg-gradient-to-br from-card to-blue-600">
              <h2 className="text-body-sm">Want this protection on every call?</h2>
              <Link to="/signup" className="mt-3 block">
                <Button variant="primary" fullWidth>
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/demo" className="mt-2 block">
                <Button variant="outline-neutral" fullWidth className="!bg-transparent !text-white !border-white">
                  Try another scenario
                </Button>
              </Link>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
