import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Circle } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { VerdictPill } from '@/components/VerdictPill'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreTimelineChart } from '@/components/ScoreTimelineChart'
import { ReasonRow } from '@/components/ReasonRow'
import { Button } from '@/components/Button'
import { Sheet } from '@/components/Sheet'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/cn'
import { useLang } from '@/i18n/LangProvider'

type OpenSheet = null | 'report' | 'share' | 'false-alarm'

export function CallDetailScreen({ callId: callIdProp }: { callId?: string } = {}) {
  const { callId: routeCallId = '' } = useParams()
  // When embedded (e.g. the home/landing feature-preview phone) the id is passed
  // as a prop since there is no /app-preview/:callId route param to read.
  const callId = callIdProp ?? routeCallId
  const { t } = useLang()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { showToast } = useToast()
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null)
  const [reportCategory, setReportCategory] = useState('impersonation')
  const [note, setNote] = useState('')

  const callQuery = useQuery({ queryKey: queryKeys.call(callId), queryFn: () => api.calls.get(callId) })
  const timelineQuery = useQuery({
    queryKey: queryKeys.callTimeline(callId),
    queryFn: () => api.calls.getTimeline(callId),
  })
  const guardiansQuery = useQuery({ queryKey: queryKeys.guardians, queryFn: api.family.listGuardians, enabled: openSheet === 'share' })

  const blockMutation = useMutation({
    mutationFn: () => api.settings.addBlocklistEntry(callQuery.data!.callerNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings })
      showToast({ message: t({ en: 'Number blocked.', th: 'บล็อกเบอร์แล้ว' }), tone: 'success' })
    },
  })
  const reportMutation = useMutation({
    mutationFn: () => api.calls.report(callId, { category: reportCategory, comment: note || undefined }),
    onSuccess: () => {
      setOpenSheet(null)
      setNote('')
      showToast({ message: t({ en: 'Thanks for the report.', th: 'ขอบคุณสำหรับการรายงาน' }), tone: 'success' })
    },
  })
  const shareMutation = useMutation({
    mutationFn: (guardianId: string) => api.calls.share(callId, { guardianId }),
    onSuccess: () => {
      setOpenSheet(null)
      showToast({ message: t({ en: 'Shared with your guardian.', th: 'แชร์ให้ผู้ดูแลของคุณแล้ว' }), tone: 'success' })
    },
  })
  const feedbackMutation = useMutation({
    mutationFn: () => api.calls.submitFeedback(callId, { verdictCorrect: false, note: note || undefined }),
    onSuccess: () => {
      setOpenSheet(null)
      setNote('')
      showToast({ message: t({ en: 'Thanks — this helps us improve.', th: 'ขอบคุณ — ข้อมูลนี้ช่วยให้เราพัฒนาให้ดีขึ้น' }), tone: 'success' })
    },
  })

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
        <h1 className="text-h2 font-bold">{t({ en: 'Call details', th: 'รายละเอียดสาย' })}</h1>
      </header>

      {(callQuery.isPending || timelineQuery.isPending) && (
        <div className="flex flex-col gap-3">
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-32" />
        </div>
      )}

      {callQuery.isError && <ErrorState onRetry={() => callQuery.refetch()} />}

      {callQuery.data && (
        <>
          <Panel className="flex flex-col items-center gap-3.5 text-center">
            <p className="text-body-medium font-semibold text-fg">{callQuery.data.callerNumber}</p>
            <VerdictPill verdict={callQuery.data.verdict} size="md" />
            <div className="flex gap-8">
              <ScoreRing value={callQuery.data.spoofScore} size={80} label={t({ en: 'Fake voice', th: 'เสียงปลอม' })} tone="danger" />
              <ScoreRing value={callQuery.data.riskScore} size={80} label={t({ en: 'Scam risk', th: 'ความเสี่ยงมิจฉาชีพ' })} tone="danger" />
            </div>
          </Panel>

          <Panel>
            <h2 className="text-label text-fg">{t({ en: 'Risk over time', th: 'ความเสี่ยงตามเวลา' })}</h2>
            {timelineQuery.data ? (
              <ScoreTimelineChart data={timelineQuery.data.points} threshold={timelineQuery.data.threshold} />
            ) : (
              <Skeleton variant="card" className="mt-2 h-28" />
            )}
          </Panel>

          <Panel>
            <h2 className="text-label text-fg">{t({ en: 'Conversation summary', th: 'สรุปบทสนทนา' })}</h2>
            <p className="mt-1.5 text-small text-mid">{callQuery.data.transcriptSummary}</p>
          </Panel>

          <Panel>
            <h2 className="text-label text-fg">{t({ en: 'Why this verdict', th: 'เหตุผลของผลตัดสินนี้' })}</h2>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {callQuery.data.reasons.map((r) => (
                <ReasonRow key={r.text} icon={<Circle className="h-2 w-2 fill-current" />} text={r.text} tone={r.tone} />
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="danger" onClick={() => blockMutation.mutate()} loading={blockMutation.isPending}>
              {t({ en: 'Block', th: 'บล็อก' })}
            </Button>
            <Button variant="outline-danger" onClick={() => setOpenSheet('report')}>
              {t({ en: 'Report', th: 'รายงาน' })}
            </Button>
            <Button variant="outline-gold" onClick={() => setOpenSheet('share')}>
              {t({ en: 'Share to guardian', th: 'แชร์ให้ผู้ดูแล' })}
            </Button>
            <Button variant="outline-gold" onClick={() => setOpenSheet('false-alarm')}>
              {t({ en: 'Mark false alarm', th: 'ระบุว่าแจ้งเตือนผิดพลาด' })}
            </Button>
          </div>
        </>
      )}

      <Sheet open={openSheet === 'report'} onClose={() => setOpenSheet(null)} title={t({ en: 'Report this call', th: 'รายงานสายนี้' })}>
        <div className="flex flex-col gap-3">
          <select
            value={reportCategory}
            onChange={(e) => setReportCategory(e.target.value)}
            className={sheetInputClass}
          >
            <option value="impersonation">{t({ en: 'Impersonation', th: 'แอบอ้างตัวตน' })}</option>
            <option value="voice-clone">{t({ en: 'Voice clone', th: 'โคลนเสียง' })}</option>
            <option value="phishing">{t({ en: 'Phishing / OTP request', th: 'ฟิชชิง / ขอรหัส OTP' })}</option>
            <option value="other">{t({ en: 'Other', th: 'อื่น ๆ' })}</option>
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t({ en: 'Additional details (optional)', th: 'รายละเอียดเพิ่มเติม (ไม่บังคับ)' })}
            className={cn(sheetInputClass, 'min-h-24 py-3')}
          />
          <Button variant="gold" fullWidth loading={reportMutation.isPending} onClick={() => reportMutation.mutate()}>
            {t({ en: 'Submit report', th: 'ส่งรายงาน' })}
          </Button>
        </div>
      </Sheet>

      <Sheet open={openSheet === 'share'} onClose={() => setOpenSheet(null)} title={t({ en: 'Share to guardian', th: 'แชร์ให้ผู้ดูแล' })}>
        <div className="flex flex-col gap-2">
          {guardiansQuery.data?.length ? (
            guardiansQuery.data.map((g) => (
              <button
                key={g.id}
                onClick={() => shareMutation.mutate(g.id)}
                className="min-h-tap rounded-[12px] border border-hairline/20 bg-panel-2 px-3 text-left text-body-sm text-fg hover:border-gold-400/50"
              >
                {g.name} · {g.phone}
              </button>
            ))
          ) : (
            <p className="text-small text-mid">{t({ en: 'No guardians added yet.', th: 'ยังไม่ได้เพิ่มผู้ดูแล' })}</p>
          )}
        </div>
      </Sheet>

      <Sheet open={openSheet === 'false-alarm'} onClose={() => setOpenSheet(null)} title={t({ en: 'Mark false alarm', th: 'ระบุว่าแจ้งเตือนผิดพลาด' })}>
        <div className="flex flex-col gap-3">
          <p className="text-small text-mid">
            {t({
              en: 'Let us know this call was actually safe — it helps PaTuean improve.',
              th: 'แจ้งให้เราทราบว่าสายนี้ปลอดภัยจริง ๆ — ช่วยให้ ป้าเตือน พัฒนาให้ดีขึ้น',
            })}
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t({ en: 'What made this call safe? (optional)', th: 'อะไรทำให้สายนี้ปลอดภัย? (ไม่บังคับ)' })}
            className={cn(sheetInputClass, 'min-h-24 py-3')}
          />
          <Button variant="gold" fullWidth loading={feedbackMutation.isPending} onClick={() => feedbackMutation.mutate()}>
            {t({ en: 'Submit feedback', th: 'ส่งความคิดเห็น' })}
          </Button>
        </div>
      </Sheet>
      </div>
    </div>
  )
}

const sheetInputClass =
  'min-h-tap rounded-[12px] border border-hairline/20 bg-panel-2 px-3 text-body-sm text-fg placeholder:text-low focus:border-gold-400/60 focus:outline-none'

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('rounded-[18px] border border-hairline/10 bg-panel p-4', className)}>{children}</section>
  )
}
