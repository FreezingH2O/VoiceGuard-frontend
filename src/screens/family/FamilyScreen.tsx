import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { UserRound, Users, ChevronRight, ShieldCheck, Bell } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Pill } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/cn'
import type { Ward } from '@/services/types'

type Role = 'family' | 'elder'

/**
 * On web, Family teaches and previews Elder Mode rather than operating it
 * (migration spec §8). Everything below runs on the session-local mock store
 * inside the preview shell.
 */
export function FamilyScreen() {
  const [role, setRole] = useState<Role>('family')
  const { showToast } = useToast()

  return (
    <div className="flex flex-1 flex-col gap-3 px-5 pb-6 pt-3 text-white">
      {/* 1. Feature intro */}
      <Card surface="white" padding="lg">
        <h1 className="text-h2 text-navy-900">Protect someone you love</h1>
        <p className="mt-1.5 text-small text-slate-600">
          When the person on the phone is elderly, VoiceGuard's scam alerts also go to a linked family member — so
          they can step in, call, warn, or block, the moment a call turns dangerous.
        </p>
      </Card>

      {/* 2. Role toggle — styled like the onboarding profile-type cards */}
      <div className="grid grid-cols-2 gap-2">
        <RoleCard
          icon={Users}
          label="I'm the family member"
          selected={role === 'family'}
          onSelect={() => setRole('family')}
        />
        <RoleCard
          icon={UserRound}
          label="I'm setting it up for an elder"
          selected={role === 'elder'}
          onSelect={() => setRole('elder')}
        />
      </div>

      {role === 'family' ? <GuardianView /> : <ElderLinkingView />}

      {/* 4. Interest capture */}
      <div className="mt-auto pt-2">
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Bell className="h-4 w-4" aria-hidden="true" />}
          onClick={() => showToast({ message: "Thanks — we'll let you know.", tone: 'success' })}
        >
          Notify me when Elder Mode launches
        </Button>
      </div>
    </div>
  )
}

function RoleCard({
  icon: Icon,
  label,
  selected,
  onSelect,
}: {
  icon: typeof Users
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex flex-col gap-2 rounded-card border bg-white p-3.5 text-left text-navy-900 transition',
        selected ? 'border-[1.5px] border-blue-600 bg-blue-600/5' : 'border-slate-200',
      )}
    >
      <Icon className={cn('h-6 w-6', selected ? 'text-blue-600' : 'text-slate-400')} aria-hidden="true" />
      <span className="text-body-sm">{label}</span>
    </button>
  )
}

/** "I'm the family member" — interactive guardian view. */
function GuardianView() {
  const wardsQuery = useQuery({ queryKey: queryKeys.wards, queryFn: api.family.listWards })

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-caption uppercase tracking-wide text-slate-400">People you watch over</p>
      {wardsQuery.isPending && <Skeleton variant="card" />}
      {wardsQuery.isError && <ErrorState onRetry={() => wardsQuery.refetch()} />}
      {wardsQuery.data?.length === 0 && (
        <Card surface="white" padding="md">
          <p className="text-small text-slate-600">No one linked yet. Ask a family member to invite you.</p>
        </Card>
      )}
      {wardsQuery.data?.map((ward) => <ElderRow key={ward.id} ward={ward} />)}
    </div>
  )
}

function ElderRow({ ward }: { ward: Ward }) {
  // Link straight to the Guardian Alert example (screen 07) — the emotional centerpiece.
  const alertsQuery = useQuery({
    queryKey: queryKeys.wardAlerts(ward.id),
    queryFn: () => api.family.listWardAlerts(ward.id),
  })
  const latestAlert = alertsQuery.data?.[0]

  const inner = (
    <Card surface="white" padding="md" className="flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-navy-900">
        <UserRound className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="text-body-sm text-navy-900">{ward.name}</p>
        <Pill tone="safe" size="xs" icon={<ShieldCheck className="h-3 w-3" aria-hidden="true" />} className="mt-1">
          Protected
        </Pill>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
    </Card>
  )

  if (!latestAlert) return inner
  return <Link to={`/app-preview/family/alerts/${ward.id}/${latestAlert.alertId}`}>{inner}</Link>
}

/** "I'm setting it up for an elder" — mock guardian-linking flow. */
function ElderLinkingView() {
  const inviteMutation = useMutation({ mutationFn: api.family.inviteGuardian })

  return (
    <Card surface="white" padding="md" className="flex flex-col items-center gap-3 text-center">
      <p className="text-body-sm text-navy-900">Link a family member</p>
      <p className="text-caption text-slate-600">
        Share this code or QR with the person you want to receive scam alerts on your behalf.
      </p>
      {inviteMutation.data ? (
        <>
          <img src={inviteMutation.data.qrDataUrl} alt="Invite QR code" className="h-40 w-40" />
          <p className="text-h2 tracking-widest text-navy-900">{inviteMutation.data.code}</p>
          <Button variant="outline-neutral" onClick={() => inviteMutation.mutate()}>
            Generate a new code
          </Button>
        </>
      ) : (
        <Button variant="primary" loading={inviteMutation.isPending} onClick={() => inviteMutation.mutate()}>
          Generate invite code
        </Button>
      )}
    </Card>
  )
}
