import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { UserRound, Users, ChevronRight, ShieldCheck, Bell, Plus, UserPlus, Sparkles } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/cn'
import { formatRelativeTime } from '@/lib/format'
import { useLang } from '@/i18n/LangProvider'
import type { Ward } from '@/services/types'

type Role = 'family' | 'elder'

/**
 * On web, Family teaches and previews Elder Mode rather than operating it
 * (migration spec §8). Everything below runs on the session-local mock store
 * inside the preview shell.
 */
export function FamilyScreen() {
  const { t } = useLang()
  const [role, setRole] = useState<Role>('family')
  const { showToast } = useToast()
  const inviteMutation = useMutation({ mutationFn: api.family.inviteGuardian })

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pb-6 pt-4 text-fg">
      {/* 1. Feature intro */}
      <div className="relative overflow-hidden rounded-[22px] bg-gold-grad p-5 shadow-[0_16px_40px_-18px_rgba(231,124,42,0.7)]">
        <Sparkles className="absolute right-4 top-4 h-6 w-6 text-white/90" aria-hidden="true" />
        <h1 className="pr-8 text-[22px] font-bold leading-tight text-white">
          {t({ en: 'Supporting those you care for', th: 'ดูแลคนที่คุณห่วงใย' })}
        </h1>
        <p className="mt-2 text-caption leading-relaxed text-white/90">
          {t({
            en: "When the person on the phone is elderly, PaTuean's scam alerts also go to a linked family member — so they can step in, warn, or block the moment a call turns dangerous.",
            th: 'เมื่อผู้ที่รับสายเป็นผู้สูงอายุ การแจ้งเตือนมิจฉาชีพของ ป้าเตือน จะส่งถึงคนในครอบครัวที่เชื่อมโยงไว้ด้วย เพื่อให้เข้ามาช่วย เตือน หรือบล็อกได้ทันทีที่สายเริ่มอันตราย',
          })}
        </p>
      </div>

      {/* 2. Role toggle */}
      <section className="flex flex-col gap-3">
        <p className="text-tag font-semibold uppercase tracking-[0.12em] text-low">{t({ en: 'Set-up choices', th: 'ตัวเลือกการตั้งค่า' })}</p>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            icon={Users}
            label={t({ en: "I'm the family member", th: 'ฉันเป็นคนในครอบครัว' })}
            selected={role === 'family'}
            onSelect={() => setRole('family')}
          />
          <RoleCard
            icon={UserRound}
            label={t({ en: "I'm setting it up for an elder", th: 'ฉันตั้งค่าให้ผู้สูงอายุ' })}
            selected={role === 'elder'}
            onSelect={() => setRole('elder')}
          />
        </div>
      </section>

      {role === 'family' ? <GuardianView /> : <ElderLinkingView inviteMutation={inviteMutation} />}

      {/* 4. Actions */}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <ActionButton
          variant="solid"
          icon={<Plus className="h-4 w-4" aria-hidden="true" />}
          onClick={() => showToast({ message: t({ en: 'Family invite flow coming soon.', th: 'ระบบเชิญครอบครัวกำลังจะมาเร็ว ๆ นี้' }), tone: 'success' })}
        >
          {t({ en: 'Add Family Member', th: 'เพิ่มคนในครอบครัว' })}
        </ActionButton>
        <ActionButton
          variant="outline"
          icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
          onClick={() => inviteMutation.mutate()}
        >
          {t({ en: 'Invite Elder', th: 'เชิญผู้สูงอายุ' })}
        </ActionButton>
        <ActionButton
          variant="ghost"
          icon={<Bell className="h-4 w-4" aria-hidden="true" />}
          onClick={() => showToast({ message: t({ en: "Thanks — we'll let you know.", th: 'ขอบคุณ — เราจะแจ้งให้คุณทราบ' }), tone: 'success' })}
        >
          {t({ en: 'Notify me when Elder Mode launches', th: 'แจ้งฉันเมื่อโหมดผู้สูงอายุเปิดใช้งาน' })}
        </ActionButton>
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
        'flex flex-col gap-3 rounded-[18px] border p-4 text-left transition',
        selected
          ? 'border-transparent bg-role-grad text-white shadow-[0_12px_30px_-14px_rgba(231,124,42,0.8)]'
          : 'border-hairline/10 bg-panel text-fg',
      )}
    >
      <Icon className={cn('h-6 w-6', selected ? 'text-white' : 'text-accent')} aria-hidden="true" />
      <span className="text-body-sm font-semibold leading-snug">{label}</span>
    </button>
  )
}

/** "I'm the family member" — interactive guardian view. */
function GuardianView() {
  const { t } = useLang()
  const wardsQuery = useQuery({ queryKey: queryKeys.wards, queryFn: api.family.listWards })

  return (
    <section className="flex flex-col gap-3">
      <p className="text-tag font-semibold uppercase tracking-[0.12em] text-low">{t({ en: 'My protected circle', th: 'คนที่ฉันดูแล' })}</p>
      {wardsQuery.isPending && <Skeleton variant="card" />}
      {wardsQuery.isError && <ErrorState onRetry={() => wardsQuery.refetch()} />}
      {wardsQuery.data?.length === 0 && (
        <div className="rounded-[18px] border border-hairline/10 bg-panel p-4">
          <p className="text-small text-mid">{t({ en: 'No one linked yet. Ask a family member to invite you.', th: 'ยังไม่มีการเชื่อมโยง ลองขอให้คนในครอบครัวเชิญคุณ' })}</p>
        </div>
      )}
      {wardsQuery.data?.map((ward) => <ElderRow key={ward.id} ward={ward} />)}
    </section>
  )
}

function ElderRow({ ward }: { ward: Ward }) {
  const { t, lang } = useLang()
  // Link straight to the Guardian Alert example (screen 07) — the emotional centerpiece.
  const alertsQuery = useQuery({
    queryKey: queryKeys.wardAlerts(ward.id),
    queryFn: () => api.family.listWardAlerts(ward.id),
  })
  const latestAlert = alertsQuery.data?.[0]

  const inner = (
    <div className="rounded-[18px] border border-hairline/10 bg-panel p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/70 to-blue-600/60">
          <UserRound className="h-6 w-6 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body-medium font-semibold text-fg">{ward.name}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-pill border border-gold-400/50 px-2.5 py-0.5 text-tag font-semibold text-accent">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            {t({ en: 'Active Protection', th: 'กำลังป้องกันอยู่' })}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 text-low" aria-hidden="true" />
      </div>
      <div className="mt-3 space-y-0.5 border-t border-hairline/10 pt-3 text-tag text-low">
        <p>{t({ en: 'Recent check', th: 'ตรวจล่าสุด' })} {formatRelativeTime(ward.lastActivity, lang)}</p>
        <p>{t({ en: 'Linked check at', th: 'เชื่อมโยงที่เบอร์' })} {ward.phone}</p>
        <p>{t({ en: 'Linked elder mode', th: 'เชื่อมโยงโหมดผู้สูงอายุแล้ว' })}</p>
      </div>
    </div>
  )

  if (!latestAlert) return inner
  return <Link to={`/app-preview/family/alerts/${ward.id}/${latestAlert.alertId}`}>{inner}</Link>
}

/** "I'm setting it up for an elder" — mock guardian-linking flow. */
function ElderLinkingView({
  inviteMutation,
}: {
  inviteMutation: ReturnType<typeof useMutation<{ code: string; qrDataUrl: string }, unknown, void>>
}) {
  const { t } = useLang()
  return (
    <section className="flex flex-col gap-3">
      <p className="text-tag font-semibold uppercase tracking-[0.12em] text-low">{t({ en: 'Link a family member', th: 'เชื่อมโยงคนในครอบครัว' })}</p>
      <div className="flex flex-col items-center gap-3 rounded-[18px] border border-hairline/10 bg-panel p-5 text-center">
        <p className="text-caption text-mid">
          {t({
            en: 'Share this code or QR with the person you want to receive scam alerts on your behalf.',
            th: 'แชร์รหัสหรือ QR นี้ให้คนที่คุณต้องการให้รับการแจ้งเตือนมิจฉาชีพแทนคุณ',
          })}
        </p>
        {inviteMutation.data ? (
          <>
            <img
              src={inviteMutation.data.qrDataUrl}
              alt={t({ en: 'Invite QR code', th: 'คิวอาร์โค้ดคำเชิญ' })}
              className="h-40 w-40 rounded-xl bg-white p-2"
            />
            <p className="text-h2 tracking-[0.3em] text-accent">{inviteMutation.data.code}</p>
          </>
        ) : (
          <p className="text-small text-low">{t({ en: 'Tap “Invite Elder” below to generate a code.', th: 'แตะ "เชิญผู้สูงอายุ" ด้านล่างเพื่อสร้างรหัส' })}</p>
        )}
      </div>
    </section>
  )
}

function ActionButton({
  children,
  icon,
  variant,
  onClick,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  variant: 'solid' | 'outline' | 'ghost'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-tap w-full items-center justify-between rounded-[16px] px-5 text-body-sm font-semibold transition',
        variant === 'solid' && 'bg-gold-grad text-white shadow-[0_12px_28px_-14px_rgba(231,124,42,0.8)]',
        variant === 'outline' && 'border border-gold-400/60 bg-transparent text-accent hover:bg-gold-400/10',
        variant === 'ghost' && 'bg-panel-2 text-fg hover:bg-panel',
      )}
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {children}
      </span>
      <ChevronRight className="h-4 w-4 opacity-70" aria-hidden="true" />
    </button>
  )
}
