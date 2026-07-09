import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ban, Check, Info, ListFilter, TriangleAlert, UserRound, type LucideIcon } from 'lucide-react'
import { api } from '@/services/api'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/cn'
import type { Verdict } from '@/types/domain'

type FilterKey = 'all' | Verdict

const filters: { key: FilterKey; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All', icon: ListFilter },
  { key: 'safe', label: 'Safe', icon: Check },
  { key: 'suspicious', label: 'Needs Review', icon: TriangleAlert },
  { key: 'scam', label: 'Scam', icon: Ban },
]

const verdictStyle: Record<Verdict, { label: string; icon: LucideIcon; className: string }> = {
  safe: { label: 'Safe', icon: Check, className: 'bg-gold-500 text-white' },
  suspicious: { label: 'Needs Review', icon: TriangleAlert, className: 'bg-coral-500 text-white' },
  scam: { label: 'Scam', icon: Ban, className: 'bg-danger-500 text-white' },
}

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
    <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-3 text-white">
      <h1 className="text-h1 font-bold">Call History</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by phone number"
        aria-label="Search call history"
        className="min-h-tap w-full rounded-[14px] border border-white/[0.08] bg-panel px-4 text-body text-white placeholder:text-mist-500 focus:border-gold-400/60 focus:outline-none"
      />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by verdict">
        {filters.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                'inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-pill border px-3.5 text-caption font-semibold transition',
                active
                  ? 'border-gold-400 bg-gold-400/15 text-gold-400'
                  : 'border-white/[0.1] bg-panel text-mist-300 hover:text-white',
              )}
            >
              <f.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {f.label}
            </button>
          )
        })}
      </div>

      {query.isPending && (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {query.isError && !query.isPending && <ErrorState onRetry={() => query.refetch()} />}

      {query.isSuccess && items.length === 0 && (
        <EmptyState
          title={search || filter !== 'all' ? 'No matches' : 'No calls yet'}
          description={
            search || filter !== 'all' ? 'Try a different search or filter.' : 'Your call history will show up here.'
          }
        />
      )}

      <div className="flex flex-col gap-2.5">
        {items.map((call) => {
          const v = verdictStyle[call.verdict]
          return (
            <Link
              key={call.callId}
              to={`/app-preview/history/${call.callId}`}
              className="flex items-center gap-3 rounded-[18px] border border-white/[0.06] bg-panel p-3 transition hover:bg-panel-2"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-panel-2 to-blue-600/40">
                <UserRound className="h-5 w-5 text-mist-300" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body-medium text-white">{call.callerNumber}</p>
                <span
                  className={cn(
                    'mt-1.5 inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption font-semibold',
                    v.className,
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {v.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-body-sm font-bold text-white">{call.spoofScore}%</p>
                  <p className="text-tag text-mist-500">spoof</p>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10" aria-hidden="true">
                  <Info className="h-3.5 w-3.5 text-mist-300" />
                </span>
              </div>
            </Link>
          )
        })}
        <div ref={sentinelRef} className="col-span-full" />
        {query.isFetchingNextPage && <Skeleton variant="line" className="mx-auto w-24" />}
      </div>
    </div>
  )
}
