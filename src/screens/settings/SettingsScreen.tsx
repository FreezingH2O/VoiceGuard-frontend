import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Switch } from '@/components/Switch'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Sheet } from '@/components/Sheet'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { useAuth } from '@/hooks/useAuth'
import type { Sensitivity, Settings } from '@/services/types'

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
      <div className="flex flex-1 flex-col gap-3 px-5 pt-2">
        <Skeleton variant="card" className="h-96" />
      </div>
    )
  }
  if (settingsQuery.isError || !settingsQuery.data) {
    return <ErrorState onRetry={() => settingsQuery.refetch()} />
  }

  const s = settingsQuery.data

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-5 pb-6 pt-2 text-white sm:max-w-2xl sm:px-8 lg:max-w-3xl">
      <h1 className="py-2 text-h1">Settings</h1>

      <Card padding="md" className="flex flex-col gap-2">
        <h2 className="text-label">Sensitivity</h2>
        <SegmentedControl
          aria-label="Detection sensitivity"
          value={s.sensitivity}
          onChange={(value) => patchMutation.mutate({ sensitivity: value })}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'high', label: 'High' },
          ]}
        />
        <p className="text-caption text-slate-400">{sensitivityCopy[s.sensitivity]}</p>
      </Card>

      <Card padding="md" className="flex flex-col gap-3">
        <h2 className="text-label">Alerts</h2>
        <ToggleRow
          label="Banner alert"
          checked={s.alertStyles.includes('banner')}
          onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'banner', checked) })}
        />
        <ToggleRow
          label="Sound"
          checked={s.alertStyles.includes('sound')}
          onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'sound', checked) })}
        />
        <ToggleRow
          label="Vibrate"
          checked={s.alertStyles.includes('vibrate')}
          onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'vibrate', checked) })}
        />
        <div className="flex items-center justify-between">
          <span className="text-body-sm">Alert scope</span>
          <SegmentedControl
            aria-label="Alert scope"
            value={s.alertScope}
            onChange={(value) => patchMutation.mutate({ alertScope: value })}
            options={[
              { value: 'all-calls', label: 'All calls' },
              { value: 'unknown-only', label: 'Unknown only' },
            ]}
          />
        </div>
      </Card>

      <Card padding="md" className="flex flex-col gap-3">
        <h2 className="text-label">Detection</h2>
        <div className="flex items-center justify-between">
          <span className="text-body-sm">ASR language</span>
          <select
            value={s.asrLanguage}
            onChange={(e) => patchMutation.mutate({ asrLanguage: e.target.value })}
            className="min-h-tap rounded-input border border-slate-200 bg-white px-2 text-navy-900"
          >
            <option value="en-US">English (US)</option>
            <option value="th-TH">Thai</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-sm">Data retention</span>
          <select
            value={s.dataRetentionDays}
            onChange={(e) => patchMutation.mutate({ dataRetentionDays: Number(e.target.value) })}
            className="min-h-tap rounded-input border border-slate-200 bg-white px-2 text-navy-900"
          >
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
        <ToggleRow
          label="Store call transcripts"
          checked={s.storeTranscripts}
          onChange={(checked) => patchMutation.mutate({ storeTranscripts: checked })}
        />
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <h2 className="text-label">Blocklist</h2>
        <div className="flex gap-2">
          <input
            value={newBlockedNumber}
            onChange={(e) => setNewBlockedNumber(e.target.value)}
            placeholder="Add a phone number"
            className="min-h-tap flex-1 rounded-input border border-slate-200 bg-white px-3 text-navy-900"
          />
          <Button variant="secondary" onClick={() => newBlockedNumber && addBlockMutation.mutate(newBlockedNumber)}>
            Add
          </Button>
        </div>
        {s.blocklist.length === 0 && <p className="text-caption text-slate-400">No blocked numbers.</p>}
        {s.blocklist.map((phone) => (
          <div key={phone} className="flex items-center justify-between text-body-sm">
            <span>{phone}</span>
            <button
              type="button"
              onClick={() => removeBlockMutation.mutate(phone)}
              className="min-h-tap text-small font-semibold text-danger-600"
            >
              Remove
            </button>
          </div>
        ))}
      </Card>

      <Card padding="md" className="flex flex-col gap-3">
        <h2 className="text-label">Notifications</h2>
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
      </Card>

      <Button variant="outline-danger" fullWidth onClick={() => setDeleteOpen(true)}>
        Delete all data / delete account
      </Button>

      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Are you sure?">
        <p className="text-small text-slate-600">
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
    </div>
  )
}

function toggleIn<T>(list: T[], value: T, checked: boolean): T[] {
  return checked ? [...new Set([...list, value])] : list.filter((v) => v !== value)
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body-sm">{label}</span>
      <Switch label={label} checked={checked} onChange={onChange} />
    </div>
  )
}
