import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft, CircleUserRound, Phone, MessageSquare, Ban } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { AlertBanner } from '@/components/AlertBanner'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/cn'

export function GuardianAlertDetailScreen() {
  const { wardId = '', alertId = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const alertQuery = useQuery({
    queryKey: queryKeys.wardAlert(wardId, alertId),
    queryFn: () => api.family.getWardAlert(wardId, alertId),
    refetchInterval: (query) => (query.state.data?.callOngoing ? 5000 : false),
  })

  const ackMutation = useMutation({ mutationFn: () => api.family.ackWardAlert(wardId, alertId) })
  const notifyMutation = useMutation({
    mutationFn: () => api.family.notifyWardContact(wardId, alertId),
    onSuccess: () => showToast({ message: 'Warning SMS sent.', tone: 'success' }),
  })
  const blockMutation = useMutation({
    mutationFn: () => api.family.blockWardNumber(wardId, alertQuery.data?.elderPhone ?? ''),
    onSuccess: (res) => {
      if ('error' in res) showToast({ message: "The elder hasn't allowed you to block numbers.", tone: 'error' })
      else showToast({ message: 'Number blocked.', tone: 'success' })
    },
  })

  useEffect(() => {
    ackMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardId, alertId])

  return (
    <div className="flex flex-1 flex-col bg-night">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3.5 px-5 pb-6 pt-3 text-white sm:max-w-2xl sm:px-6 lg:max-w-3xl">
      <header className="flex items-center gap-2 py-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex min-h-tap min-w-tap items-center justify-center rounded-full text-mist-300 hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-h2 font-bold">Family alert</h1>
      </header>

      {alertQuery.isPending && <Skeleton variant="card" className="h-64" />}
      {alertQuery.isError && <ErrorState onRetry={() => alertQuery.refetch()} />}

      {alertQuery.data && (
        <>
          <AlertBanner
            level={alertQuery.data.level}
            reasonMain={`${alertQuery.data.elderName} may be on a scam call right now`}
            actions={<div />}
          />

          <section className="flex items-center gap-3 rounded-[18px] border border-white/[0.06] bg-panel p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60">
              <CircleUserRound className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-body-sm text-white">
                {alertQuery.data.elderName} · {alertQuery.data.elderPhone}
              </p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-tag font-semibold',
                  alertQuery.data.callOngoing ? 'bg-danger-500 text-white' : 'bg-white/10 text-mist-300',
                )}
              >
                {alertQuery.data.callOngoing ? 'Call ongoing' : 'Call ended'}
              </span>
            </div>
          </section>

          <section className="rounded-[18px] border border-white/[0.06] bg-panel p-4">
            <h2 className="text-label text-white">What's happening</h2>
            <p className="mt-1.5 text-small text-mist-300">{alertQuery.data.whatsHappening}</p>
          </section>

          <Button
            variant="gold"
            fullWidth
            href={`tel:${alertQuery.data.elderPhone}`}
            leftIcon={<Phone className="h-4 w-4" aria-hidden="true" />}
          >
            Call {alertQuery.data.elderName.split(' ')[0]} now
          </Button>
          <Button
            variant="outline-light"
            fullWidth
            onClick={() => notifyMutation.mutate()}
            loading={notifyMutation.isPending}
            leftIcon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
          >
            Send warning SMS
          </Button>
          <Button
            variant="outline-danger"
            fullWidth
            onClick={() => blockMutation.mutate()}
            loading={blockMutation.isPending}
            leftIcon={<Ban className="h-4 w-4" aria-hidden="true" />}
          >
            Block this number
          </Button>

          <p className="text-center text-caption text-mist-500">
            If you don't respond, PaTuean will keep monitoring and notify you of any updates.
          </p>
        </>
      )}
      </div>
    </div>
  )
}
