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
import { useLang } from '@/i18n/LangProvider'

export function GuardianAlertDetailScreen() {
  const { wardId = '', alertId = '' } = useParams()
  const { t } = useLang()
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
    onSuccess: () => showToast({ message: t({ en: 'Warning SMS sent.', th: 'ส่ง SMS เตือนแล้ว' }), tone: 'success' }),
  })
  const blockMutation = useMutation({
    mutationFn: () => api.family.blockWardNumber(wardId, alertQuery.data?.elderPhone ?? ''),
    onSuccess: (res) => {
      if ('error' in res) showToast({ message: t({ en: "The elder hasn't allowed you to block numbers.", th: 'ผู้สูงอายุยังไม่ได้อนุญาตให้คุณบล็อกเบอร์' }), tone: 'error' })
      else showToast({ message: t({ en: 'Number blocked.', th: 'บล็อกเบอร์แล้ว' }), tone: 'success' })
    },
  })

  useEffect(() => {
    ackMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardId, alertId])

  return (
    <div className="flex flex-1 flex-col bg-night">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3.5 px-5 pb-6 pt-3 text-fg sm:max-w-2xl sm:px-6 lg:max-w-3xl">
      <header className="flex items-center gap-2 py-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t({ en: 'Back', th: 'ย้อนกลับ' })}
          className="flex min-h-tap min-w-tap items-center justify-center rounded-full text-mid hover:text-fg"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-h2 font-bold">{t({ en: 'Family alert', th: 'แจ้งเตือนครอบครัว' })}</h1>
      </header>

      {alertQuery.isPending && <Skeleton variant="card" className="h-64" />}
      {alertQuery.isError && <ErrorState onRetry={() => alertQuery.refetch()} />}

      {alertQuery.data && (
        <>
          <AlertBanner
            level={alertQuery.data.level}
            reasonMain={t({
              en: `${alertQuery.data.elderName} may be on a scam call right now`,
              th: `${alertQuery.data.elderName} อาจกำลังคุยกับมิจฉาชีพอยู่ในขณะนี้`,
            })}
            actions={<div />}
          />

          <section className="flex items-center gap-3 rounded-[18px] border border-hairline/10 bg-panel p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60">
              <CircleUserRound className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-body-sm text-fg">
                {alertQuery.data.elderName} · {alertQuery.data.elderPhone}
              </p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-tag font-semibold',
                  alertQuery.data.callOngoing ? 'bg-danger-500 text-white' : 'bg-hairline/10 text-mid',
                )}
              >
                {alertQuery.data.callOngoing ? t({ en: 'Call ongoing', th: 'สายกำลังดำเนินอยู่' }) : t({ en: 'Call ended', th: 'วางสายแล้ว' })}
              </span>
            </div>
          </section>

          <section className="rounded-[18px] border border-hairline/10 bg-panel p-4">
            <h2 className="text-label text-fg">{t({ en: "What's happening", th: 'เกิดอะไรขึ้น' })}</h2>
            <p className="mt-1.5 text-small text-mid">{alertQuery.data.whatsHappening}</p>
          </section>

          <Button
            variant="gold"
            fullWidth
            href={`tel:${alertQuery.data.elderPhone}`}
            leftIcon={<Phone className="h-4 w-4" aria-hidden="true" />}
          >
            {t({
              en: `Call ${alertQuery.data.elderName.split(' ')[0]} now`,
              th: `โทรหา ${alertQuery.data.elderName.split(' ')[0]} เดี๋ยวนี้`,
            })}
          </Button>
          <Button
            variant="outline-light"
            fullWidth
            onClick={() => notifyMutation.mutate()}
            loading={notifyMutation.isPending}
            leftIcon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
          >
            {t({ en: 'Send warning SMS', th: 'ส่ง SMS เตือน' })}
          </Button>
          <Button
            variant="outline-danger"
            fullWidth
            onClick={() => blockMutation.mutate()}
            loading={blockMutation.isPending}
            leftIcon={<Ban className="h-4 w-4" aria-hidden="true" />}
          >
            {t({ en: 'Block this number', th: 'บล็อกเบอร์นี้' })}
          </Button>

          <p className="text-center text-caption text-low">
            {t({
              en: "If you don't respond, PaTuean will keep monitoring and notify you of any updates.",
              th: 'หากคุณไม่ตอบสนอง ป้าเตือน จะเฝ้าระวังต่อและแจ้งคุณเมื่อมีอัปเดต',
            })}
          </p>
        </>
      )}
      </div>
    </div>
  )
}
