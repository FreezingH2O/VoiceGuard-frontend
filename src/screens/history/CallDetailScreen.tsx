import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Circle } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
import { VerdictBadge } from '@/components/VerdictBadge'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreTimelineChart } from '@/components/ScoreTimelineChart'
import { ReasonRow } from '@/components/ReasonRow'
import { Button } from '@/components/Button'
import { Sheet } from '@/components/Sheet'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'

type OpenSheet = null | 'report' | 'share' | 'false-alarm'

export function CallDetailScreen() {
  const { callId = '' } = useParams()
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
    <div className="flex flex-1 flex-col bg-navy-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 pb-6 pt-2 text-white sm:max-w-2xl sm:px-6 lg:max-w-3xl">
      <header className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex min-h-tap min-w-tap items-center justify-center"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-screen-header">Call details</h1>
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
          <Card padding="lg" className="flex flex-col items-center gap-3.5 text-center">
            <p className="text-body-sm text-white">{callQuery.data.callerNumber}</p>
            <VerdictBadge verdict={callQuery.data.verdict} />
            <div className="flex gap-8">
              <ScoreRing value={callQuery.data.spoofScore} size={80} label="Fake voice" tone="danger" />
              <ScoreRing value={callQuery.data.riskScore} size={80} label="Scam risk" tone="danger" />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-label">Risk over time</h2>
            {timelineQuery.data ? (
              <ScoreTimelineChart data={timelineQuery.data.points} threshold={timelineQuery.data.threshold} />
            ) : (
              <Skeleton variant="card" className="mt-2 h-28" />
            )}
          </Card>

          <Card padding="md">
            <h2 className="text-label">Conversation summary</h2>
            <p className="mt-1.5 text-small text-slate-400">{callQuery.data.transcriptSummary}</p>
          </Card>

          <Card padding="md">
            <h2 className="text-label">Why this verdict</h2>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {callQuery.data.reasons.map((r) => (
                <ReasonRow key={r.text} icon={<Circle className="h-2 w-2 fill-current" />} text={r.text} tone={r.tone} />
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="danger" onClick={() => blockMutation.mutate()} loading={blockMutation.isPending}>
              Block
            </Button>
            <Button variant="outline-danger" onClick={() => setOpenSheet('report')}>
              Report
            </Button>
            <Button variant="outline-neutral" onClick={() => setOpenSheet('share')}>
              Share to guardian
            </Button>
            <Button variant="outline-neutral" onClick={() => setOpenSheet('false-alarm')}>
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
            className="min-h-tap rounded-input border border-slate-200 px-3"
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
            className="min-h-24 rounded-input border border-slate-200 p-3 text-body"
          />
          <Button variant="primary" fullWidth loading={reportMutation.isPending} onClick={() => reportMutation.mutate()}>
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
                className="min-h-tap rounded-input border border-slate-200 px-3 text-left text-body"
              >
                {g.name} · {g.phone}
              </button>
            ))
          ) : (
            <p className="text-small text-slate-600">No guardians added yet.</p>
          )}
        </div>
      </Sheet>

      <Sheet open={openSheet === 'false-alarm'} onClose={() => setOpenSheet(null)} title="Mark false alarm">
        <div className="flex flex-col gap-3">
          <p className="text-small text-slate-600">
            Let us know this call was actually safe — it helps VoiceGuard improve.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What made this call safe? (optional)"
            className="min-h-24 rounded-input border border-slate-200 p-3 text-body"
          />
          <Button variant="primary" fullWidth loading={feedbackMutation.isPending} onClick={() => feedbackMutation.mutate()}>
            Submit feedback
          </Button>
        </div>
      </Sheet>
      </div>
    </div>
  )
}
