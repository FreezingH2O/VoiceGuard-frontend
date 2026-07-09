import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft, CircleUserRound, Phone, MessageSquare, Ban } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { AlertBanner } from '@/components/AlertBanner'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Pill } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'

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
    <div className="flex flex-1 flex-col bg-navy-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3.5 px-4 pb-6 pt-2 text-white sm:max-w-2xl sm:px-6 lg:max-w-3xl">
      <header className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex min-h-tap min-w-tap items-center justify-center"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-screen-header">Family alert</h1>
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

          <Card surface="white" padding="md" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <CircleUserRound className="h-6 w-6 text-navy-900" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-body-sm text-navy-900">
                {alertQuery.data.elderName} · {alertQuery.data.elderPhone}
              </p>
              <Pill tone="danger" size="xs" className="mt-1">
                {alertQuery.data.callOngoing ? 'Call ongoing' : 'Call ended'}
              </Pill>
            </div>
          </Card>

          <Card surface="white" padding="md">
            <h2 className="text-label text-navy-900">What's happening</h2>
            <p className="mt-1.5 text-small text-slate-600">{alertQuery.data.whatsHappening}</p>
          </Card>

          <Button
            variant="primary"
            fullWidth
            href={`tel:${alertQuery.data.elderPhone}`}
            leftIcon={<Phone className="h-4 w-4" aria-hidden="true" />}
          >
            Call {alertQuery.data.elderName.split(' ')[0]} now
          </Button>
          <Button
            variant="outline-blue"
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

          <p className="text-center text-caption text-slate-400">
            If you don't respond, PaTuean will keep monitoring and notify you of any updates.
          </p>
        </>
      )}
      </div>
    </div>
  )
}
