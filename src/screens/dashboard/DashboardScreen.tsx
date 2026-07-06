import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CircleUserRound, History as HistoryIcon, PhoneCall, SlidersHorizontal, Users, type LucideIcon } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { VerdictBadge } from '@/components/VerdictBadge'
import { ScoreRing } from '@/components/ScoreRing'
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
    <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-2 text-white">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-h1">Home</h1>
        <Link
          to="/app-preview/profile"
          aria-label="Profile"
          className="flex min-h-tap min-w-tap items-center justify-center"
        >
          <CircleUserRound className="h-6 w-6" aria-hidden="true" />
        </Link>
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
          <Card surface="navy-900" padding="lg" className="bg-gradient-to-br from-navy-900 to-coral-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-h1-mobile">Protected</p>
                <p className="text-caption text-slate-200">
                  {data.protectionEnabled ? 'VoiceGuard is actively monitoring your calls.' : 'Protection is paused.'}
                </p>
              </div>
              <Switch
                label="Protection enabled"
                checked={data.protectionEnabled}
                onChange={(checked) => protectionToggle.mutate(checked)}
              />
            </div>
          </Card>

          <Button
            variant="primary"
            fullWidth
            onClick={() => startCallMutation.mutate()}
            disabled={startCallMutation.isPending}
          >
            <PhoneCall className="h-5 w-5" aria-hidden="true" />
            {startCallMutation.isPending ? 'Starting…' : 'Monitor a call on speakerphone'}
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Calls today" value={data.today.calls} />
            <Stat label="Alerts" value={data.today.alerts} tone="danger" />
            <Stat label="Highest risk" value={`${data.today.highestRisk}%`} tone="warn" />
          </div>

          {data.lastCall ? (
            <Link to={`/app-preview/history/${data.lastCall.callId}`}>
              <Card padding="md" className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-white">{data.lastCall.callerNumber}</p>
                  <p className="mt-1 text-caption text-slate-400">{formatRelativeTime(data.lastCall.startedAt)}</p>
                  <div className="mt-2">
                    <VerdictBadge verdict={data.lastCall.verdict} />
                  </div>
                </div>
                <ScoreRing value={data.lastCall.riskScore} size={56} label="Risk" tone={toneFor(data.lastCall.riskScore)} />
              </Card>
            </Link>
          ) : (
            <Card padding="lg">
              <EmptyState
                title="No calls yet"
                description="Try a simulated scam call to see VoiceGuard in action."
                actionLabel="Try the demo"
                onAction={() => navigate('/demo')}
              />
            </Card>
          )}

          <div className="grid grid-cols-3 gap-2">
            <QuickAction to="/app-preview/history" icon={HistoryIcon} label="History" />
            <QuickAction to="/app-preview/settings" icon={SlidersHorizontal} label="Sensitivity" />
            <QuickAction to="/app-preview/family" icon={Users} label="Guardian" />
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-h2">Recent alerts</h2>
            {data.recentAlerts.length === 0 && <p className="text-small text-slate-400">No alerts recently.</p>}
            <div className="grid grid-cols-1 gap-2">
              {data.recentAlerts.map((alert) => (
                <Link key={alert.alertId} to={`/app-preview/history/${alert.callId}`}>
                  <Card
                    padding="sm"
                    className={alert.level === 'scam' ? 'border-l-4 border-danger-600' : 'border-l-4 border-warn-500'}
                  >
                    <p className="text-body-sm text-white">{alert.reasonMain}</p>
                    <p className="mt-1 text-caption text-slate-400">{formatRelativeTime(alert.createdAt)}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function toneFor(score: number): 'safe' | 'warn' | 'danger' {
  if (score >= 70) return 'danger'
  if (score >= 40) return 'warn'
  return 'safe'
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: 'danger' | 'warn' }) {
  const toneClass = tone === 'danger' ? 'text-danger-600' : tone === 'warn' ? 'text-warn-500' : 'text-white'
  return (
    <Card padding="sm" className="flex flex-col items-center gap-1 text-center md:p-4 lg:p-5">
      <span className={`text-h1-mobile ${toneClass}`}>{value}</span>
      <span className="text-tag text-slate-400">{label}</span>
    </Card>
  )
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Link to={to}>
      <Card padding="sm" className="flex flex-col items-center gap-1 text-center md:p-4 lg:p-5">
        <Icon className="h-6 w-6" aria-hidden="true" />
        <span className="text-caption text-slate-200">{label}</span>
      </Card>
    </Link>
  )
}
