import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { api } from '@/services/api'
import { Card } from '@/components/Card'
import { VerdictBadge } from '@/components/VerdictBadge'
import { FilterChip } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { formatRelativeTime } from '@/lib/format'
import type { Verdict } from '@/types/domain'

type FilterKey = 'all' | Verdict

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'safe', label: 'Safe' },
  { key: 'suspicious', label: 'Suspicious' },
  { key: 'scam', label: 'Scam' },
]

export function CallHistoryScreen() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const sentinelRef = useRef<HTMLDivElement>(null)

  const query = useInfiniteQuery({
    queryKey: ['calls', { search, filter }],
    queryFn: ({ pageParam }) =>
      api.calls.list({
        q: search || undefined,
        verdict: filter === 'all' ? undefined : filter,
        page: pageParam,
        limit: 20,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
  })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage()
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [query])

  const items = query.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-2 text-white">
      <h1 className="text-h1 py-2">Call History</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by phone number"
        aria-label="Search call history"
        className="min-h-tap w-full rounded-input border border-slate-200 bg-white px-3.5 text-body text-navy-900 placeholder:text-slate-400 sm:max-w-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by verdict">
        {filters.map((f) => (
          <FilterChip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </FilterChip>
        ))}
      </div>

      {query.isPending && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {query.isError && !query.isPending && <ErrorState onRetry={() => query.refetch()} />}

      {query.isSuccess && items.length === 0 && (
        <EmptyState
          title={search || filter !== 'all' ? 'No matches' : 'No calls yet'}
          description={search || filter !== 'all' ? 'Try a different search or filter.' : 'Your call history will show up here.'}
        />
      )}

      <div className="grid grid-cols-1 gap-2">
        {items.map((call) => (
          <Link key={call.callId} to={`/app-preview/history/${call.callId}`}>
            <Card
              padding="sm"
              className={call.verdict === 'scam' ? 'border-l-4 border-danger-600' : call.verdict === 'suspicious' ? 'border-l-4 border-warn-500' : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-body-sm text-white">{call.callerNumber}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <VerdictBadge verdict={call.verdict} size="sm" />
                    <span className="text-caption text-slate-400">{formatRelativeTime(call.startedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-label text-white">{call.spoofScore}%</p>
                    <p className="text-tag text-slate-400">spoof</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
        <div ref={sentinelRef} className="col-span-full" />
        {query.isFetchingNextPage && <Skeleton variant="line" className="col-span-full mx-auto w-24" />}
      </div>
    </div>
  )
}
