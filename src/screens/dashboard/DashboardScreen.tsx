import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Activity, Check, Ear, Pause, Sparkles, UserRound } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Switch } from '@/components/Switch'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { useProtectionToggle } from '@/hooks/useProtectionToggle'
import { formatRelativeTime } from '@/lib/format'
import { useLang } from '@/i18n/LangProvider'

export function DashboardScreen() {
  const { t, lang } = useLang()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: api.dashboard.get,
  })
  const protectionToggle = useProtectionToggle()
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-3 text-fg">
      <header className="flex items-center justify-between">
        <h1 className="text-h1 font-bold tracking-tight text-accent">PaTuean</h1>
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 ring-2 ring-gold-400/60">
          <UserRound className="h-5 w-5 text-white" aria-hidden="true" />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-gold-400" aria-hidden="true" />
        </span>
      </header>

      {isPending && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-28" />
        </div>
      )}

      {isError && !isPending && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <>
          {/* Status hero */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-label font-semibold text-fg">{t({ en: 'Status', th: 'สถานะ' })}</h2>
            {/*
              The card used to BE the start-call button with the toggle nested inside
              it — invalid nested interactives, patched with a stopPropagation wrapper,
              and the tap-anywhere-to-simulate-a-call action was invisible. It's now a
              plain container with two clearly labelled controls.
            */}
            <div className="flex flex-col gap-4 rounded-[22px] bg-gold-grad p-5 shadow-[0_16px_40px_-16px_rgba(231,124,42,0.7)]">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white/80">
                  {data.protectionEnabled ? (
                    <Check className="h-7 w-7 text-white" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <Pause className="h-7 w-7 text-white" strokeWidth={3} aria-hidden="true" />
                  )}
                </span>
                <p className="flex-1 text-h1-mobile font-bold leading-tight text-white">
                  {data.protectionEnabled
                    ? t({ en: 'Your line is secure', th: 'สายของคุณปลอดภัย' })
                    : t({ en: 'Protection is paused', th: 'หยุดการป้องกันชั่วคราว' })}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-[16px] bg-black/20 px-4 py-3">
                <span className="text-body font-semibold text-white">
                  {t({ en: 'Protection', th: 'การป้องกัน' })}
                </span>
                <Switch
                  label={t({ en: 'Protection enabled', th: 'เปิดการป้องกัน' })}
                  tone="onGold"
                  showState
                  onLabel={t({ en: 'ON', th: 'เปิด' })}
                  offLabel={t({ en: 'OFF', th: 'ปิด' })}
                  checked={data.protectionEnabled}
                  onChange={(checked) => protectionToggle.mutate(checked)}
                />
              </div>

              <p className="text-body-sm font-normal text-white/90">
                {data.protectionEnabled
                  ? t({ en: 'Every call is checked automatically.', th: 'ทุกสายถูกตรวจโดยอัตโนมัติ' })
                  : t({ en: 'Calls are not being checked right now.', th: 'ขณะนี้ยังไม่มีการตรวจสาย' })}
                {data.lastCall &&
                  ` · ${t({ en: 'Last check:', th: 'ตรวจล่าสุด:' })} ${formatRelativeTime(data.lastCall.startedAt, lang)}`}
              </p>
            </div>
          </section>

          {/*
            Was a 2-up grid of cards captioned "Encourage", which says nothing. One
            column, one plain sentence each — at the enlarged body size two columns
            leave ~14 characters per line in Thai, which wraps to mush.
          */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-label font-semibold text-fg">{t({ en: 'How calls get checked', th: 'วิธีตรวจสาย' })}</h2>
            <div className="flex flex-col gap-2.5">
              <ActionCard
                icon={Activity}
                title={t({ en: 'Live call review', th: 'ตรวจสายแบบเรียลไทม์' })}
                caption={t({ en: 'Warns you while the call is still going.', th: 'เตือนคุณระหว่างที่ยังคุยสายอยู่' })}
              />
              <ActionCard
                icon={Ear}
                title={t({ en: 'Background call check', th: 'ตรวจสายเบื้องหลัง' })}
                caption={t({ en: 'Runs quietly on every call you answer.', th: 'ทำงานเงียบ ๆ กับทุกสายที่คุณรับ' })}
              />
            </div>
          </section>

          {/* Metrics */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-label font-semibold text-fg">{t({ en: 'Today', th: 'วันนี้' })}</h2>
            <div className="grid grid-cols-3 gap-3">
              <Metric value={data.today.calls} label={t({ en: 'Calls checked', th: 'สายที่ตรวจ' })} />
              <Metric value={data.today.alerts} label={t({ en: 'Blocked', th: 'บล็อก' })} />
              <Metric value={`${data.today.highestRisk}%`} label={t({ en: 'Peak risk', th: 'ความเสี่ยงสูงสุด' })} />
            </div>
          </section>

          {/* Recent reviews */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-label font-semibold text-fg">{t({ en: 'Recent Call Reviews', th: 'การตรวจสายล่าสุด' })}</h2>
            {data.recentAlerts.length === 0 && !data.lastCall && (
              <div className="rounded-[18px] border border-hairline/10 bg-panel p-5">
                <EmptyState
                  title={t({ en: 'No calls yet', th: 'ยังไม่มีสาย' })}
                  description={t({ en: 'Try a simulated scam call to see PaTuean in action.', th: 'ลองสายมิจฉาชีพจำลองเพื่อดู ป้าเตือน ทำงาน' })}
                  actionLabel={t({ en: 'Try the demo', th: 'ลองเดโม' })}
                  onAction={() => navigate('/#how-it-works')}
                />
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {data.recentAlerts.map((alert) => (
                <ReviewRow
                  key={alert.alertId}
                  to={`/app-preview/history/${alert.callId}`}
                  title={t({ en: 'Connecting You Safely', th: 'เชื่อมต่อคุณอย่างปลอดภัย' })}
                  subtitle={alert.reasonMain || t({ en: 'Review suggested for new caller', th: 'แนะนำให้ตรวจสอบผู้โทรรายใหม่' })}
                  time={formatRelativeTime(alert.createdAt, lang)}
                />
              ))}
              {data.recentAlerts.length === 0 && data.lastCall && (
                <ReviewRow
                  to={`/app-preview/history/${data.lastCall.callId}`}
                  title={t({ en: 'Connecting You Safely', th: 'เชื่อมต่อคุณอย่างปลอดภัย' })}
                  subtitle={t({ en: 'Review suggested for recent caller', th: 'แนะนำให้ตรวจสอบผู้โทรล่าสุด' })}
                  time={formatRelativeTime(data.lastCall.startedAt, lang)}
                />
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  caption,
}: {
  icon: typeof Activity
  title: string
  caption: string
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] border border-hairline/10 bg-panel p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-body font-semibold leading-snug text-fg">{title}</p>
        <p className="mt-0.5 text-body-sm font-normal leading-snug text-mid">{caption}</p>
      </div>
    </div>
  )
}

/** One number, one label. The old tile stacked two labels (e.g. "Blocked" over
 *  "(potential issues)") at 10px and 9px, which read as noise rather than a stat. */
function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[18px] bg-metric-tile px-2 py-4 text-center ring-1 ring-white/[0.06]">
      <span className="text-score font-bold leading-none text-gold-400 tabular-nums">{value}</span>
      <span className="text-caption font-semibold leading-tight text-white/90">{label}</span>
    </div>
  )
}

function ReviewRow({ to, title, subtitle, time }: { to: string; title: string; subtitle: string; time: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-[18px] border border-hairline/10 bg-panel p-3.5 transition hover:bg-panel-2"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60">
        <UserRound className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-fg">{title}</p>
        <p className="truncate text-body-sm font-normal text-mid">{subtitle}</p>
      </div>
      {/* Time sits on its own axis rather than as a third stacked line, so the row
          scans as "who / what · when" instead of a three-deep paragraph. */}
      <span className="shrink-0 self-start text-caption text-low">{time}</span>
    </Link>
  )
}
