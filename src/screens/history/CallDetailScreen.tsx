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

type OpenSheet = null | 'report' | 'share' | 'false-alarm'

export function CallDetailScreen({ callId: callIdProp }: { callId?: string } = {}) {
  const { callId: routeCallId = '' } = useParams()
  // When embedded (e.g. the home/landing feature-preview phone) the id is passed
  // as a prop since there is no /app-preview/:callId route param to read.
  const callId = callIdProp ?? routeCallId
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
      showToast({ message: 'Number blocked.', tone: 'success' })
    },
  })
  const reportMutation = useMutation({
    mutationFn: () => api.calls.report(callId, { category: reportCategory, comment: note || undefined }),
    onSuccess: () => {
      setOpenSheet(null)
      setNote('')
      showToast({ message: 'Thanks for the report.', tone: 'success' })
    },
  })
  const shareMutation = useMutation({
    mutationFn: (guardianId: string) => api.calls.share(callId, { guardianId }),
    onSuccess: () => {
      setOpenSheet(null)
      showToast({ message: 'Shared with your guardian.', tone: 'success' })
    },
  })
  const feedbackMutation = useMutation({
    mutationFn: () => api.calls.submitFeedback(callId, { verdictCorrect: false, note: note || undefined }),
    onSuccess: () => {
      setOpenSheet(null)
      setNote('')
      showToast({ message: 'Thanks — this helps us improve.', tone: 'success' })
    },
  })

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
        <h1 className="text-h2 font-bold">Call details</h1>
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
            <p className="text-body-medium font-semibold text-white">{callQuery.data.callerNumber}</p>
            <VerdictPill verdict={callQuery.data.verdict} size="md" />
            <div className="flex gap-8">
              <ScoreRing value={callQuery.data.spoofScore} size={80} label="Fake voice" tone="danger" />
              <ScoreRing value={callQuery.data.riskScore} size={80} label="Scam risk" tone="danger" />
            </div>
          </Panel>

          <Panel>
            <h2 className="text-label text-white">Risk over time</h2>
            {timelineQuery.data ? (
              <ScoreTimelineChart data={timelineQuery.data.points} threshold={timelineQuery.data.threshold} />
            ) : (
              <Skeleton variant="card" className="mt-2 h-28" />
            )}
          </Panel>

          <Panel>
            <h2 className="text-label text-white">Conversation summary</h2>
            <p className="mt-1.5 text-small text-mist-300">{callQuery.data.transcriptSummary}</p>
          </Panel>

          <Panel>
            <h2 className="text-label text-white">Why this verdict</h2>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {callQuery.data.reasons.map((r) => (
                <ReasonRow key={r.text} icon={<Circle className="h-2 w-2 fill-current" />} text={r.text} tone={r.tone} />
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="danger" onClick={() => blockMutation.mutate()} loading={blockMutation.isPending}>
              Block
            </Button>
            <Button variant="outline-danger" onClick={() => setOpenSheet('report')}>
              Report
            </Button>
            <Button variant="outline-gold" onClick={() => setOpenSheet('share')}>
              Share to guardian
            </Button>
            <Button variant="outline-gold" onClick={() => setOpenSheet('false-alarm')}>
              Mark false alarm
            </Button>
          </div>
        </>
      )}

      <Sheet open={openSheet === 'report'} onClose={() => setOpenSheet(null)} title="Report this call">
        <div className="flex flex-col gap-3">
          <select
            value={reportCategory}
            onChange={(e) => setReportCategory(e.target.value)}
            className={sheetInputClass}
          >
            <option value="impersonation">Impersonation</option>
            <option value="voice-clone">Voice clone</option>
            <option value="phishing">Phishing / OTP request</option>
            <option value="other">Other</option>
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional details (optional)"
            className={cn(sheetInputClass, 'min-h-24 py-3')}
          />
          <Button variant="gold" fullWidth loading={reportMutation.isPending} onClick={() => reportMutation.mutate()}>
            Submit report
          </Button>
        </div>
      </Sheet>

      <Sheet open={openSheet === 'share'} onClose={() => setOpenSheet(null)} title="Share to guardian">
        <div className="flex flex-col gap-2">
          {guardiansQuery.data?.length ? (
            guardiansQuery.data.map((g) => (
              <button
                key={g.id}
                onClick={() => shareMutation.mutate(g.id)}
                className="min-h-tap rounded-[12px] border border-white/[0.1] bg-panel-2 px-3 text-left text-body-sm text-white hover:border-gold-400/50"
              >
                {g.name} · {g.phone}
              </button>
            ))
          ) : (
            <p className="text-small text-mist-300">No guardians added yet.</p>
          )}
        </div>
      </Sheet>

      <Sheet open={openSheet === 'false-alarm'} onClose={() => setOpenSheet(null)} title="Mark false alarm">
        <div className="flex flex-col gap-3">
          <p className="text-small text-mist-300">
            Let us know this call was actually safe — it helps PaTuean improve.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What made this call safe? (optional)"
            className={cn(sheetInputClass, 'min-h-24 py-3')}
          />
          <Button variant="gold" fullWidth loading={feedbackMutation.isPending} onClick={() => feedbackMutation.mutate()}>
            Submit feedback
          </Button>
        </div>
      </Sheet>
      </div>
    </div>
  )
}

const sheetInputClass =
  'min-h-tap rounded-[12px] border border-white/[0.1] bg-panel-2 px-3 text-body-sm text-white placeholder:text-mist-500 focus:border-gold-400/60 focus:outline-none'

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('rounded-[18px] border border-white/[0.06] bg-panel p-4', className)}>{children}</section>
  )
}
