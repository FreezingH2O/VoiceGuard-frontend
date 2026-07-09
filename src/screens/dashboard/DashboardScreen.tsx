import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Activity, Check, Ear, Sparkles, UserRound } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Switch } from '@/components/Switch'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { useToast } from '@/components/ToastProvider'
import { useProtectionToggle } from '@/hooks/useProtectionToggle'
import { formatRelativeTime } from '@/lib/format'

export function DashboardScreen() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: api.dashboard.get,
  })
  const protectionToggle = useProtectionToggle()
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Speakerphone monitoring: open a call session, then stream mic audio from the
  // monitor screen. callerNumber is unknown when the call is happening next to the
  // phone rather than on it.
  const startCallMutation = useMutation({
    mutationFn: () => api.calls.start({ callerNumber: 'unknown', direction: 'inbound' }),
    onSuccess: (res) => {
      if (res.monitoring) {
        navigate(`/app-preview/call/${res.callId}`, { state: { wsUrl: res.wsUrl, wsToken: res.wsToken } })
      } else {
        showToast({
          message:
            res.reason === 'protection_disabled'
              ? 'Turn protection on to monitor a call.'
              : 'Call monitoring is not available right now.',
          tone: 'error',
        })
      }
    },
    onError: () => showToast({ message: "Couldn't start monitoring, try again.", tone: 'error' }),
  })

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pb-6 pt-3 text-white">
      <header className="flex items-center justify-between">
        <h1 className="text-[26px] font-bold tracking-tight text-gold-400">PaTuean</h1>
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
          <section className="flex flex-col gap-3">
            <h2 className="text-label font-semibold text-white/90">Status</h2>
            <button
              type="button"
              onClick={() => startCallMutation.mutate()}
              disabled={startCallMutation.isPending}
              className="flex items-center gap-4 rounded-[22px] bg-gold-grad p-5 text-left shadow-[0_16px_40px_-16px_rgba(231,124,42,0.7)]"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white/80">
                <Check className="h-7 w-7 text-white" strokeWidth={3} aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-[22px] font-bold leading-tight text-white">
                  {data.protectionEnabled ? (
                    <>
                      Your Line
                      <br />
                      is Secure.
                    </>
                  ) : (
                    'Protection Paused'
                  )}
                </p>
                <p className="mt-1 text-caption text-white/85">
                  {data.lastCall ? `Last Check: ${formatRelativeTime(data.lastCall.startedAt)}` : 'No calls checked yet'}
                </p>
              </div>
              <span onClick={(e) => e.stopPropagation()}>
                <Switch
                  label="Protection enabled"
                  tone="onGold"
                  checked={data.protectionEnabled}
                  onChange={(checked) => protectionToggle.mutate(checked)}
                />
              </span>
            </button>
            <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-4 rounded-full bg-white/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            </div>
          </section>

          {/* Two review actions */}
          <div className="grid grid-cols-2 gap-3">
            <ActionCard icon={Activity} title="Live Call Review" caption="Encourage" />
            <ActionCard icon={Ear} title="Background Call Check" caption="Encourage" />
          </div>

          {/* Metrics */}
          <section className="flex flex-col gap-3">
            <h2 className="text-label font-semibold text-white/90">Today's Metrics</h2>
            <div className="grid grid-cols-3 gap-3">
              <Metric value={data.today.calls} top="Connections" bottom="Secured" />
              <Metric value={data.today.alerts} top="Blocked" bottom="(potential issues)" />
              <Metric value={`${data.today.highestRisk}%`} top="Peak Risk" bottom="Detected" />
            </div>
          </section>

          {/* Recent reviews */}
          <section className="flex flex-col gap-3">
            <h2 className="text-label font-semibold text-white/90">Recent Call Reviews</h2>
            {data.recentAlerts.length === 0 && !data.lastCall && (
              <div className="rounded-[18px] border border-white/[0.06] bg-panel p-5">
                <EmptyState
                  title="No calls yet"
                  description="Try a simulated scam call to see PaTuean in action."
                  actionLabel="Try the demo"
                  onAction={() => navigate('/#how-it-works')}
                />
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {data.recentAlerts.map((alert) => (
                <ReviewRow
                  key={alert.alertId}
                  to={`/app-preview/history/${alert.callId}`}
                  subtitle={alert.reasonMain || 'Review suggested for new caller'}
                  time={formatRelativeTime(alert.createdAt)}
                />
              ))}
              {data.recentAlerts.length === 0 && data.lastCall && (
                <ReviewRow
                  to={`/app-preview/history/${data.lastCall.callId}`}
                  subtitle="Review suggested for recent caller"
                  time={formatRelativeTime(data.lastCall.startedAt)}
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
    <div className="flex flex-col gap-3 rounded-[18px] border border-white/[0.06] bg-panel p-4">
      <Icon className="h-6 w-6 text-gold-400" aria-hidden="true" />
      <div>
        <p className="text-body-sm font-semibold leading-snug text-white">{title}</p>
        <p className="mt-0.5 text-caption text-gold-400">{caption}</p>
      </div>
    </div>
  )
}

function Metric({ value, top, bottom }: { value: string | number; top: string; bottom: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[18px] bg-metric-tile px-2 py-4 text-center ring-1 ring-white/[0.06]">
      <span className="text-[26px] font-bold leading-none text-gold-400">{value}</span>
      <span className="text-tag font-semibold leading-tight text-white/90">{top}</span>
      <span className="text-[9px] leading-tight text-white/55">{bottom}</span>
    </div>
  )
}

function ReviewRow({ to, subtitle, time }: { to: string; subtitle: string; time: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-[18px] border border-white/[0.06] bg-panel p-3.5 transition hover:bg-panel-2"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60">
        <UserRound className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-white">Connecting You Safely</p>
        <p className="truncate text-caption text-mist-300">{subtitle}</p>
        <p className="mt-0.5 text-tag text-mist-500">{time}</p>
      </div>
    </Link>
  )
}
