import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Banner } from '@/components/Pill'
import { VerdictPill } from '@/components/VerdictPill'
import { ReasonRow } from '@/components/ReasonRow'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useLang } from '@/i18n/LangProvider'

export function DemoDebriefScreen({ scenarioId, onRestart }: { scenarioId: string; onRestart: () => void }) {
  const { t, lang } = useLang()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [...queryKeys.demoDebrief(scenarioId), lang],
    queryFn: () => api.demo.getDebrief(scenarioId),
  })

  return (
    <div className="flex flex-1 flex-col gap-3 bg-night text-fg">
      <Banner tone="demo">
        {t({ en: 'PREVIEW · simulated call showing the in-call experience', th: 'ตัวอย่าง · สายจำลองเพื่อแสดงประสบการณ์ระหว่างสาย' })}
      </Banner>
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
            <section className="flex flex-col items-center gap-2 rounded-[18px] border border-hairline/10 bg-panel p-5 text-center">
              <h1 className="flex items-center gap-1.5 text-alert-title font-bold">
                <CircleCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                {data.verdict === 'safe'
                  ? t({ en: 'No scam detected', th: 'ไม่พบมิจฉาชีพ' })
                  : t({ en: 'Demo call blocked', th: 'บล็อกสายเดโมแล้ว' })}
              </h1>
              <VerdictPill verdict={data.verdict} size="md" />
              <p className="text-small text-mid">{data.caption}</p>
            </section>

            <section className="rounded-[18px] border border-hairline/10 bg-panel p-4">
              <h2 className="text-label text-fg">
                {data.verdict === 'safe'
                  ? t({ en: 'How it caught the scam', th: 'ป้าเตือน วิเคราะห์สายนี้อย่างไร' })
                  : t({ en: 'How it caught the scam', th: 'ป้าเตือน จับสายมิจฉาชีพได้อย่างไร' })}
              </h2>
              <div className="mt-2.5 flex flex-col gap-3">
                {data.stages.map((stage, i) => (
                  <ReasonRow key={stage.title} index={i + 1} text={`${stage.title} — ${stage.description}`} />
                ))}
              </div>
            </section>

            <section className="rounded-[18px] bg-gold-grad p-5 shadow-[0_16px_40px_-18px_rgba(231,124,42,0.7)]">
              <h2 className="text-body-medium font-semibold text-white">
                {t({ en: 'Want this protection on every call?', th: 'อยากได้การป้องกันแบบนี้ในทุกสายไหม?' })}
              </h2>
              <Link to="/signup" className="mt-3 block">
                <button
                  type="button"
                  className="min-h-tap w-full rounded-[14px] bg-white text-body-sm font-semibold text-gold-600 shadow-card transition hover:-translate-y-0.5"
                >
                  {t({ en: 'Sign Up Free', th: 'สมัครฟรี' })}
                </button>
              </Link>
              <Button
                variant="outline-light"
                fullWidth
                className="mt-2 !border-white/40 !text-white"
                onClick={onRestart}
              >
                {t({ en: 'Try another scenario', th: 'ลองสถานการณ์อื่น' })}
              </Button>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
