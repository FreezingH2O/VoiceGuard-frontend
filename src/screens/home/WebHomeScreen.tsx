import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mic, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { ScoreRing } from '@/components/ScoreRing'
import { IntentPillRow } from '@/components/IntentPillRow'
import { StatusBadge } from '@/components/web/StatusBadge'
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { PreviewFeaturePhone, PREVIEW_FEATURES, type PhoneScreen } from '@/components/landing/PreviewFeaturePhone'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/i18n/LangProvider'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DetectorTestRecord } from '@/services/types'

export function WebHomeScreen() {
  const { user } = useAuth()
  const { t } = useLang()
  const [active, setActive] = useState<PhoneScreen>('incoming')
  const firstName = user?.name?.split(' ')[0] ?? t({ en: 'there', th: 'คุณ' })

  return (
    <div className="relative z-10 -mb-6 rounded-b-[32px] bg-ink-950 shadow-[0_36px_70px_-24px_rgba(0,0,0,0.6)] lg:-mb-8 lg:rounded-b-[48px]">
      <div className="mx-auto w-full max-w-content px-6 py-12 sm:px-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-web-h1 text-white">{t({ en: `Welcome, ${firstName}`, th: `ยินดีต้อนรับ ${firstName}` })}</h1>
            <p className="mt-1 text-web-body text-mist-300">{t({ en: 'Your PaTuean account is ready.', th: 'บัญชี ป้าเตือน ของคุณพร้อมแล้ว' })}</p>
          </div>
          <Link to="/demo/live-test" className="shrink-0">
            <Button variant="primary" leftIcon={<Mic className="h-4 w-4" aria-hidden="true" />}>
              {t({ en: 'Start a test', th: 'เริ่มทดสอบ' })}
            </Button>
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <LiveDetectorPanel />
        <YourTestsPanel />
      </div>

      {/* Secondary: coming to your phone (preview) */}
      <section className="mt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <Reveal>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-web-h1 text-white">{t({ en: 'Coming to your phone', th: 'เร็ว ๆ นี้บนมือถือ' })}</h2>
                <StatusBadge kind="preview" />
              </div>
              <p className="mt-2 max-w-[70ch] text-web-body text-mist-300">
                {t({
                  en: 'Pick a feature to see it on the phone — each one shows what that screen looks like on the device. Hover the phone to open the full preview.',
                  th: 'เลือกฟีเจอร์เพื่อดูบนหน้าจอมือถือ — แต่ละอันแสดงว่าหน้าจอนั้นจะเป็นอย่างไรบนเครื่อง วางเมาส์บนมือถือเพื่อเปิดพรีวิวเต็มรูปแบบ',
                })}
              </p>
            </Reveal>

            <RevealGroup className="mt-6 grid gap-4 md:grid-cols-2">
              {PREVIEW_FEATURES.map((card) => {
                const isActive = card.key === active
                return (
                  <RevealItem key={card.key}>
                    <button
                      type="button"
                      onClick={() => setActive(card.key)}
                      aria-pressed={isActive}
                      className={cn(
                        'group flex h-full w-full items-start gap-4 rounded-web-card border p-5 text-left transition',
                        isActive
                          ? 'border-coral-400/60 bg-coral-500/10 shadow-glow-soft'
                          : 'border-white/10 bg-surface-800 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-glow-soft',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-button transition',
                          isActive ? 'bg-coral-500 text-white' : 'bg-white/5 text-mist-300',
                        )}
                      >
                        <card.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-body-medium font-semibold text-white">{t(card.title)}</span>
                        <span className="mt-0.5 block text-small text-mist-300">{t(card.line)}</span>
                      </span>
                      <ChevronRight
                        className={cn(
                          'h-5 w-5 shrink-0 transition',
                          isActive ? 'text-coral-400' : 'text-mist-500 group-hover:translate-x-0.5',
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </RevealItem>
                )
              })}
            </RevealGroup>
          </div>

          <Reveal className="order-1 flex justify-center lg:order-2 lg:sticky lg:top-28" delay={0.1}>
            <PreviewFeaturePhone screen={active} />
          </Reveal>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link to="/#how-it-works" className="text-body-sm font-medium text-mist-300 underline underline-offset-4 transition hover:text-white">
          {t({ en: 'How PaTuean works', th: 'ป้าเตือน ทำงานอย่างไร' })}
        </Link>
      </div>
      </div>
    </div>
  )
}

/** The visual anchor — the account’s real, working feature: the full analysis. */
function LiveDetectorPanel() {
  const { t } = useLang()
  return (
    <div className="lg:col-span-8">
      <div className="relative h-full overflow-hidden rounded-web-card border border-white/10 bg-surface-800 p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-coral-500/15 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-button bg-glow-grad">
            <Mic className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <StatusBadge kind="live" />
        </div>
        <h2 className="relative mt-5 font-display text-h1 text-white">{t({ en: 'Run the full analysis', th: 'รันการวิเคราะห์เต็มรูปแบบ' })}</h2>
        <p className="relative mt-2 max-w-[52ch] text-web-body text-mist-300">
          {t({
            en: 'Record or upload a voice and run it through the real anti-spoof, ASR and LLM pipeline — the same engine that will protect live calls.',
            th: 'อัดหรืออัปโหลดเสียงแล้วรันผ่านระบบป้องกันเสียงปลอม ถอดเสียง และ LLM จริง — เครื่องมือเดียวกับที่จะปกป้องสายจริง',
          })}
        </p>
        <Link to="/demo/live-test" className="relative mt-6 block sm:inline-block">
          <Button variant="primary" fullWidth className="sm:w-auto sm:px-8">
            {t({ en: 'Start a test', th: 'เริ่มทดสอบ' })}
          </Button>
        </Link>
      </div>
    </div>
  )
}

const TESTS_PER_PAGE = 3

function YourTestsPanel() {
  const { t } = useLang()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<DetectorTestRecord | null>(null)
  const [page, setPage] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.detectorTests,
    queryFn: api.detector.listTests,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.detector.deleteTest(id),
    onSuccess: (_res, id) => {
      if (selected?.id === id) setSelected(null)
      qc.invalidateQueries({ queryKey: queryKeys.detectorTests })
    },
  })

  const total = data?.length ?? 0
  const pageCount = Math.max(1, Math.ceil(total / TESTS_PER_PAGE))
  const safePage = Math.min(page, pageCount - 1) // stays valid as rows are deleted
  const pageRows = data ? data.slice(safePage * TESTS_PER_PAGE, safePage * TESTS_PER_PAGE + TESTS_PER_PAGE) : []

  return (
    <div className="lg:col-span-4">
      <div className="h-full rounded-web-card border border-white/10 bg-surface-800 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-h2 font-semibold text-white">{t({ en: 'Your tests', th: 'การทดสอบของคุณ' })}</h2>
          {total > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="shrink-0 text-caption font-medium text-coral-400 transition hover:text-coral-300"
            >
              {t({ en: `View all (${total})`, th: `ดูทั้งหมด (${total})` })}
            </button>
          )}
        </div>

        {isPending && (
          <div className="mt-4 flex flex-col gap-2">
            <Skeleton variant="line" />
            <Skeleton variant="line" />
          </div>
        )}
        {isError && (
          <div className="mt-4">
            <ErrorState onRetry={() => refetch()} />
          </div>
        )}

        {data && data.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-mist-300">
              <Mic className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-small text-mist-300">{t({ en: 'No tests yet — try the detector.', th: 'ยังไม่มีการทดสอบ — ลองใช้เครื่องตรวจจับ' })}</p>
          </div>
        )}

        {data && data.length > 0 && (
          <>
            <ul className="mt-4 flex flex-col divide-y divide-white/10">
              {pageRows.map((row) => (
                <TestRow
                  key={row.id}
                  row={row}
                  onSelect={() => setSelected(row)}
                  onDelete={() => deleteMutation.mutate(row.id)}
                  deleting={deleteMutation.isPending && deleteMutation.variables === row.id}
                />
              ))}
            </ul>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-caption text-mist-500">
                  {t({
                    en: `${safePage * TESTS_PER_PAGE + 1}–${safePage * TESTS_PER_PAGE + pageRows.length} of ${total}`,
                    th: `${safePage * TESTS_PER_PAGE + 1}–${safePage * TESTS_PER_PAGE + pageRows.length} จาก ${total}`,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(safePage - 1)}
                    disabled={safePage === 0}
                    aria-label={t({ en: 'Previous page', th: 'หน้าก่อนหน้า' })}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-mist-300 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-[3ch] text-center text-caption tabular-nums text-mist-300">
                    {safePage + 1}/{pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(safePage + 1)}
                    disabled={safePage >= pageCount - 1}
                    aria-label={t({ en: 'Next page', th: 'หน้าถัดไป' })}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-mist-300 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAll && data && (
        <FullHistoryModal
          records={data}
          onClose={() => setShowAll(false)}
          onSelect={(row) => setSelected(row)}
          onDelete={(id) => deleteMutation.mutate(id)}
          deletingId={deleteMutation.isPending ? (deleteMutation.variables as string) : null}
        />
      )}

      {selected && (
        <TestDetailModal
          record={selected}
          onClose={() => setSelected(null)}
          onDelete={() => deleteMutation.mutate(selected.id)}
          deleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

function TestRow({
  row,
  onSelect,
  onDelete,
  deleting,
}: {
  row: DetectorTestRecord
  onSelect: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const { t } = useLang()
  const realVoice = 100 - row.spoofProb
  const flagged = row.scamProb >= 50
  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-3 py-3 text-left transition hover:opacity-80"
      >
        <span
          className={
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-tag font-semibold ' +
            (flagged ? 'bg-danger-500/15 text-danger-500' : 'bg-teal-400/15 text-teal-400')
          }
        >
          {flagged ? 'FAKE' : 'REAL'}
        </span>
        <span className="flex-1">
          <span className="block text-small text-white">
            {t({ en: `Real voice ${realVoice}% · Scam ${row.scamProb}%`, th: `เสียงจริง ${realVoice}% · สแกม ${row.scamProb}%` })}
          </span>
          <span className="block text-caption text-mist-500">{formatRelativeTime(row.createdAt)}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        aria-label={t({ en: 'Delete test', th: 'ลบการทดสอบ' })}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mist-500 transition hover:bg-danger-500/15 hover:text-danger-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-500"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  )
}

function FullHistoryModal({
  records,
  onClose,
  onSelect,
  onDelete,
  deletingId,
}: {
  records: DetectorTestRecord[]
  onClose: () => void
  onSelect: (row: DetectorTestRecord) => void
  onDelete: (id: string) => void
  deletingId: string | null
}) {
  const { t } = useLang()
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ink-950/95" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-6 pb-8 pt-20 sm:px-8 sm:pt-24">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-web-h2 text-white">{t({ en: 'All tests', th: 'การทดสอบทั้งหมด' })}</h2>
            <p className="mt-0.5 text-caption text-mist-500">
              {t({ en: `${records.length} saved`, th: `บันทึกไว้ ${records.length} รายการ` })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t({ en: 'Close', th: 'ปิด' })}
            className="flex h-10 w-10 items-center justify-center rounded-full text-mist-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ul className="mt-4 flex min-h-0 flex-1 flex-col divide-y divide-white/10 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
          {records.map((row) => (
            <TestRow
              key={row.id}
              row={row}
              onSelect={() => onSelect(row)}
              onDelete={() => onDelete(row.id)}
              deleting={deletingId === row.id}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

function TestDetailModal({
  record,
  onClose,
  onDelete,
  deleting,
}: {
  record: DetectorTestRecord
  onClose: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const { t } = useLang()
  const realVoice = 100 - record.spoofProb
  const flagged = record.scamProb >= 50

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-web-card border border-white/10 bg-surface-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-h2 font-semibold text-white">{t({ en: 'Test detail', th: 'รายละเอียดการทดสอบ' })}</h3>
            <p className="mt-0.5 text-caption text-mist-500">{formatRelativeTime(record.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t({ en: 'Close', th: 'ปิด' })}
            className="flex h-9 w-9 items-center justify-center rounded-full text-mist-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-10">
          <ScoreRing value={realVoice} size={96} label={t({ en: 'Real voice', th: 'เสียงจริง' })} tone={record.spoofProb > 50 ? 'danger' : 'safe'} />
          <ScoreRing value={record.scamProb} size={96} label={t({ en: 'Scam risk', th: 'ความเสี่ยงสแกม' })} tone={flagged ? 'danger' : 'safe'} />
        </div>

        {record.transcript && (
          <div className="mt-5 rounded-card bg-ink-950/60 p-4">
            <p className="font-mono text-micro uppercase tracking-wide text-mist-500">{t({ en: 'Transcript (ASR)', th: 'ถอดเสียง (ASR)' })}</p>
            <p className="mt-1 text-small text-white">“{record.transcript}”</p>
          </div>
        )}

        <div className="mt-3 rounded-card bg-ink-950/60 p-4">
          <p className="font-mono text-micro uppercase tracking-wide text-mist-500">{t({ en: 'Context (LLM)', th: 'บริบท (LLM)' })}</p>
          <p className="mt-1 text-small text-mist-300">{record.summary}</p>
          {record.intents.length > 0 && (
            <div className="mt-2">
              <IntentPillRow intents={record.intents} />
            </div>
          )}
        </div>

        {record.reasons.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {record.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-small text-mist-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-400" aria-hidden="true" />
                {reason}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-caption text-mist-500">
          {t({ en: `Analyzed in ${(record.latencyMs / 1000).toFixed(1)}s.`, th: `วิเคราะห์ใน ${(record.latencyMs / 1000).toFixed(1)} วินาที` })}
        </p>

        <div className="mt-6 flex justify-end">
          <Button variant="outline-light" onClick={onDelete} loading={deleting} className="!min-h-0 h-10 px-4 text-danger-500">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t({ en: 'Delete', th: 'ลบ' })}
          </Button>
        </div>
      </div>
    </div>
  )
}
