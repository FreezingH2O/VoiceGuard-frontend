import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Leaf, ShieldHalf, BellRing, Smartphone, Volume2, Vibrate, type LucideIcon } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Button } from '@/components/Button'
import { Switch } from '@/components/Switch'
import { Sheet } from '@/components/Sheet'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { useAuth } from '@/hooks/useAuth'
import { useEmbeddedPreview } from '@/app/EmbeddedPreview'
import { cn } from '@/lib/cn'
import type { Sensitivity, Settings } from '@/services/types'

const levels: { value: Sensitivity; label: string; icon: LucideIcon; iconClass: string }[] = [
  { value: 'low', label: 'Safe', icon: Leaf, iconClass: 'text-safe-500' },
  { value: 'balanced', label: 'Balanced', icon: ShieldHalf, iconClass: 'text-gold-400' },
  { value: 'high', label: 'Vigilant', icon: BellRing, iconClass: 'text-coral-500' },
]

const sensitivityCopy: Record<Sensitivity, string> = {
  low: 'Fewer alerts, only very high-confidence scams are flagged. Best if you get a lot of false alarms.',
  balanced: 'A balanced mix of protection and fewer interruptions. Recommended for most people.',
  high: 'Maximum protection — more calls get flagged for review, including some that turn out safe.',
}

export function SettingsScreen() {
  const qc = useQueryClient()
  const { showToast } = useToast()
  const { logout } = useAuth()
  const navigate = useNavigate()
  // In the home-page showcase phone this screen must not touch the real session,
  // so the account-deletion path (logout + navigate away) is hidden there.
  const isEmbeddedPreview = useEmbeddedPreview()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [newBlockedNumber, setNewBlockedNumber] = useState('')

  const settingsQuery = useQuery({ queryKey: queryKeys.settings, queryFn: api.settings.get })

  const patchMutation = useMutation({
    mutationFn: (patch: Partial<Settings>) => api.settings.patch(patch),
    onSuccess: (data) => qc.setQueryData(queryKeys.settings, data),
    onError: () => showToast({ message: "Couldn't save, try again.", tone: 'error' }),
  })
  const addBlockMutation = useMutation({
    mutationFn: (phone: string) => api.settings.addBlocklistEntry(phone),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.settings, data)
      setNewBlockedNumber('')
    },
  })
  const removeBlockMutation = useMutation({
    mutationFn: (phone: string) => api.settings.removeBlocklistEntry(phone),
    onSuccess: (data) => qc.setQueryData(queryKeys.settings, data),
  })
  const deleteAccountMutation = useMutation({
    mutationFn: api.settings.deleteAccount,
    onSuccess: () => {
      logout()
      navigate('/')
    },
  })

  if (settingsQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-3 px-5 pt-3">
        <Skeleton variant="card" className="h-96" />
      </div>
    )
  }
  if (settingsQuery.isError || !settingsQuery.data) {
    return <ErrorState onRetry={() => settingsQuery.refetch()} />
  }

  const s = settingsQuery.data

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-3 text-white">
      <h1 className="text-h1 font-bold">Settings</h1>

      {/* Protection Level */}
      <Panel title="Protection Level">
        <div role="radiogroup" aria-label="Protection level" className="flex gap-2 rounded-[16px] bg-night p-1.5">
          {levels.map((lvl) => {
            const active = s.sensitivity === lvl.value
            return (
              <button
                key={lvl.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => patchMutation.mutate({ sensitivity: lvl.value })}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1.5 rounded-[12px] py-3 text-caption font-semibold transition',
                  active ? 'bg-panel-2 text-white ring-1 ring-white/10' : 'text-mist-300 hover:text-white',
                )}
              >
                <lvl.icon className={cn('h-5 w-5', active ? lvl.iconClass : 'text-mist-500')} aria-hidden="true" />
                {lvl.label}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-caption leading-relaxed text-mist-300">{sensitivityCopy[s.sensitivity]}</p>
      </Panel>

      {/* Notifications */}
      <Panel title="Notifications">
        <div className="flex flex-col gap-4">
          <ToggleRow
            icon={Smartphone}
            label="Screen Notifier"
            checked={s.alertStyles.includes('banner')}
            onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'banner', checked) })}
          />
          <ToggleRow
            icon={Volume2}
            label="Audible Alerts"
            checked={s.alertStyles.includes('sound')}
            onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'sound', checked) })}
          />
          <ToggleRow
            icon={Vibrate}
            label="Haptic Feedback"
            checked={s.alertStyles.includes('vibrate')}
            onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'vibrate', checked) })}
          />
        </div>
      </Panel>

      {/* Call analysis */}
      <Panel title="Call analysis">
        <div className="flex flex-col gap-4">
          <SelectRow label="ASR Language">
            <select
              aria-label="ASR language"
              value={s.asrLanguage}
              onChange={(e) => patchMutation.mutate({ asrLanguage: e.target.value })}
              className="min-h-[38px] rounded-[10px] border border-white/[0.1] bg-panel-2 px-3 text-body-sm text-white focus:border-gold-400/60 focus:outline-none"
            >
              <option value="en-US">🇺🇸 English</option>
              <option value="th-TH">🇹🇭 Thai</option>
            </select>
          </SelectRow>
          <SelectRow label="Data Retention">
            <select
              aria-label="Data retention"
              value={s.dataRetentionDays}
              onChange={(e) => patchMutation.mutate({ dataRetentionDays: Number(e.target.value) })}
              className="min-h-[38px] rounded-[10px] border border-white/[0.1] bg-panel-2 px-3 text-body-sm text-white focus:border-gold-400/60 focus:outline-none"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          </SelectRow>
          <ToggleRow
            label="Store call transcripts"
            checked={s.storeTranscripts}
            onChange={(checked) => patchMutation.mutate({ storeTranscripts: checked })}
          />
        </div>
        <p className="mt-3 text-caption italic leading-relaxed text-mist-500">
          Your data privacy and support settings protect your information at every step.
        </p>
      </Panel>

      {/* Blocklist */}
      <Panel title="Blocklist">
        <div className="flex gap-2">
          <input
            value={newBlockedNumber}
            onChange={(e) => setNewBlockedNumber(e.target.value)}
            placeholder="Add a phone number"
            className="min-h-tap flex-1 rounded-[10px] border border-white/[0.1] bg-panel-2 px-3 text-body-sm text-white placeholder:text-mist-500 focus:border-gold-400/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => newBlockedNumber && addBlockMutation.mutate(newBlockedNumber)}
            className="min-h-tap rounded-[10px] bg-gold-grad px-4 text-body-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
        {s.blocklist.length === 0 && <p className="mt-3 text-caption text-mist-500">No blocked numbers.</p>}
        <div className="mt-2 flex flex-col gap-2">
          {s.blocklist.map((phone) => (
            <div key={phone} className="flex items-center justify-between text-body-sm">
              <span>{phone}</span>
              <button
                type="button"
                onClick={() => removeBlockMutation.mutate(phone)}
                className="min-h-tap text-small font-semibold text-danger-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Notification channels */}
      <Panel title="Notification channels">
        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Push"
            checked={s.notificationPrefs.push}
            onChange={(checked) => api.settings.patchNotificationPrefs({ push: checked }).then(() => settingsQuery.refetch())}
          />
          <ToggleRow
            label="Email"
            checked={s.notificationPrefs.email}
            onChange={(checked) => api.settings.patchNotificationPrefs({ email: checked }).then(() => settingsQuery.refetch())}
          />
          <ToggleRow
            label="SMS"
            checked={s.notificationPrefs.sms}
            onChange={(checked) => api.settings.patchNotificationPrefs({ sms: checked }).then(() => settingsQuery.refetch())}
          />
        </div>
      </Panel>

      {!isEmbeddedPreview && (
        <>
          <Button variant="outline-danger" fullWidth onClick={() => setDeleteOpen(true)}>
            Delete all data / delete account
          </Button>

          <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Are you sure?">
            <p className="text-small text-mist-300">
              This permanently deletes your account and all call history. This cannot be undone.
            </p>
            <Button
              variant="danger"
              fullWidth
              className="mt-4"
              loading={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              Delete my account
            </Button>
          </Sheet>
        </>
      )}
    </div>
  )
}

function toggleIn<T>(list: T[], value: T, checked: boolean): T[] {
  return checked ? [...new Set([...list, value])] : list.filter((v) => v !== value)
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-white/[0.06] bg-panel p-4">
      <h2 className="mb-3 text-h2 font-semibold text-white">{title}</h2>
      {children}
    </section>
  )
}

function SelectRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body-sm text-mist-300">{label}</span>
      {children}
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon?: LucideIcon
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-gold-400" aria-hidden="true" />}
        <span className="text-body-sm text-white">{label}</span>
      </span>
      <Switch label={label} checked={checked} onChange={onChange} />
    </div>
  )
}
