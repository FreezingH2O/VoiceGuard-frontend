import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Leaf, ShieldHalf, BellRing, Smartphone, Volume2, Vibrate, Sun, Moon, Monitor, type LucideIcon } from 'lucide-react'
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
import { usePreviewTheme, type ThemePref } from '@/app/PreviewTheme'
import { cn } from '@/lib/cn'
import { useLang, type Localized } from '@/i18n/LangProvider'
import type { Sensitivity, Settings } from '@/services/types'

const themeOptions: { value: ThemePref; label: Localized; icon: LucideIcon }[] = [
  { value: 'light', label: { en: 'Light', th: 'สว่าง' }, icon: Sun },
  { value: 'dark', label: { en: 'Dark', th: 'มืด' }, icon: Moon },
  { value: 'system', label: { en: 'System', th: 'ตามระบบ' }, icon: Monitor },
]

const levels: { value: Sensitivity; label: Localized; icon: LucideIcon; iconClass: string }[] = [
  { value: 'low', label: { en: 'Safe', th: 'ผ่อนปรน' }, icon: Leaf, iconClass: 'text-safe-500' },
  { value: 'balanced', label: { en: 'Balanced', th: 'สมดุล' }, icon: ShieldHalf, iconClass: 'text-accent' },
  { value: 'high', label: { en: 'Vigilant', th: 'เข้มงวด' }, icon: BellRing, iconClass: 'text-coral-500' },
]

const sensitivityCopy: Record<Sensitivity, Localized> = {
  low: {
    en: 'Fewer alerts, only very high-confidence scams are flagged. Best if you get a lot of false alarms.',
    th: 'แจ้งเตือนน้อยลง ระบบจะเตือนเฉพาะสายที่มั่นใจสูงว่าเป็นมิจฉาชีพ เหมาะกับผู้ที่เจอการแจ้งเตือนผิดพลาดบ่อย ๆ',
  },
  balanced: {
    en: 'A balanced mix of protection and fewer interruptions. Recommended for most people.',
    th: 'สมดุลระหว่างการป้องกันและการรบกวนที่น้อยลง แนะนำสำหรับผู้ใช้ส่วนใหญ่',
  },
  high: {
    en: 'Maximum protection — more calls get flagged for review, including some that turn out safe.',
    th: 'ป้องกันสูงสุด ระบบจะเตือนสายมากขึ้น รวมถึงบางสายที่จริง ๆ แล้วปลอดภัย',
  },
}

export function SettingsScreen() {
  const qc = useQueryClient()
  const { t } = useLang()
  const { showToast } = useToast()
  const { logout } = useAuth()
  const navigate = useNavigate()
  // In the home-page showcase phone this screen must not touch the real session,
  // so the account-deletion path (logout + navigate away) is hidden there.
  const isEmbeddedPreview = useEmbeddedPreview()
  const theme = usePreviewTheme()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [newBlockedNumber, setNewBlockedNumber] = useState('')

  const settingsQuery = useQuery({ queryKey: queryKeys.settings, queryFn: api.settings.get })

  const patchMutation = useMutation({
    mutationFn: (patch: Partial<Settings>) => api.settings.patch(patch),
    onSuccess: (data) => qc.setQueryData(queryKeys.settings, data),
    onError: () => showToast({ message: t({ en: "Couldn't save, try again.", th: 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง' }), tone: 'error' }),
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
    <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-3 text-fg">
      <h1 className="text-h1 font-bold">{t({ en: 'Settings', th: 'ตั้งค่า' })}</h1>

      {/* Protection Level */}
      <Panel title={t({ en: 'Protection Level', th: 'ระดับการป้องกัน' })}>
        <div role="radiogroup" aria-label={t({ en: 'Protection level', th: 'ระดับการป้องกัน' })} className="flex gap-2 rounded-[16px] bg-night p-1.5">
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
                  active ? 'bg-panel-2 text-fg ring-1 ring-hairline/10' : 'text-mid hover:text-fg',
                )}
              >
                <lvl.icon className={cn('h-5 w-5', active ? lvl.iconClass : 'text-low')} aria-hidden="true" />
                {t(lvl.label)}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-caption leading-relaxed text-mid">{t(sensitivityCopy[s.sensitivity])}</p>
      </Panel>

      {/* Appearance */}
      {theme && (
        <Panel title={t({ en: 'Appearance', th: 'ธีมการแสดงผล' })}>
          <div role="radiogroup" aria-label={t({ en: 'Appearance', th: 'ธีมการแสดงผล' })} className="flex gap-2 rounded-[16px] bg-night p-1.5">
            {themeOptions.map((opt) => {
              const active = theme.pref === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => theme.setPref(opt.value)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1.5 rounded-[12px] py-3 text-caption font-semibold transition',
                    active ? 'bg-panel-2 text-fg ring-1 ring-hairline/10' : 'text-mid hover:text-fg',
                  )}
                >
                  <opt.icon className={cn('h-5 w-5', active ? 'text-accent' : 'text-low')} aria-hidden="true" />
                  {t(opt.label)}
                </button>
              )
            })}
          </div>
        </Panel>
      )}

      {/* Notifications */}
      <Panel title={t({ en: 'Notifications', th: 'การแจ้งเตือน' })}>
        <div className="flex flex-col gap-4">
          <ToggleRow
            icon={Smartphone}
            label={t({ en: 'Screen Notifier', th: 'แจ้งเตือนบนหน้าจอ' })}
            checked={s.alertStyles.includes('banner')}
            onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'banner', checked) })}
          />
          <ToggleRow
            icon={Volume2}
            label={t({ en: 'Audible Alerts', th: 'เสียงเตือน' })}
            checked={s.alertStyles.includes('sound')}
            onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'sound', checked) })}
          />
          <ToggleRow
            icon={Vibrate}
            label={t({ en: 'Haptic Feedback', th: 'สั่นเตือน' })}
            checked={s.alertStyles.includes('vibrate')}
            onChange={(checked) => patchMutation.mutate({ alertStyles: toggleIn(s.alertStyles, 'vibrate', checked) })}
          />
        </div>
      </Panel>

      {/* Call analysis */}
      <Panel title={t({ en: 'Call analysis', th: 'การวิเคราะห์สาย' })}>
        <div className="flex flex-col gap-4">
          <SelectRow label={t({ en: 'ASR Language', th: 'ภาษาที่ใช้ถอดเสียง' })}>
            <select
              aria-label={t({ en: 'ASR language', th: 'ภาษาที่ใช้ถอดเสียง' })}
              value={s.asrLanguage}
              onChange={(e) => patchMutation.mutate({ asrLanguage: e.target.value })}
              className="min-h-[38px] rounded-[10px] border border-hairline/20 bg-panel-2 px-3 text-body-sm text-fg focus:border-gold-400/60 focus:outline-none"
            >
              <option value="en-US">🇺🇸 {t({ en: 'English', th: 'อังกฤษ' })}</option>
              <option value="th-TH">🇹🇭 {t({ en: 'Thai', th: 'ไทย' })}</option>
            </select>
          </SelectRow>
          <SelectRow label={t({ en: 'Data Retention', th: 'ระยะเวลาเก็บข้อมูล' })}>
            <select
              aria-label={t({ en: 'Data retention', th: 'ระยะเวลาเก็บข้อมูล' })}
              value={s.dataRetentionDays}
              onChange={(e) => patchMutation.mutate({ dataRetentionDays: Number(e.target.value) })}
              className="min-h-[38px] rounded-[10px] border border-hairline/20 bg-panel-2 px-3 text-body-sm text-fg focus:border-gold-400/60 focus:outline-none"
            >
              <option value={30}>{t({ en: '30 days', th: '30 วัน' })}</option>
              <option value={90}>{t({ en: '90 days', th: '90 วัน' })}</option>
              <option value={365}>{t({ en: '1 year', th: '1 ปี' })}</option>
            </select>
          </SelectRow>
          <ToggleRow
            label={t({ en: 'Store call transcripts', th: 'จัดเก็บบทถอดเสียงของสาย' })}
            checked={s.storeTranscripts}
            onChange={(checked) => patchMutation.mutate({ storeTranscripts: checked })}
          />
        </div>
        <p className="mt-3 text-caption italic leading-relaxed text-low">
          {t({
            en: 'Your data privacy and support settings protect your information at every step.',
            th: 'การตั้งค่าความเป็นส่วนตัวและการช่วยเหลือช่วยปกป้องข้อมูลของคุณในทุกขั้นตอน',
          })}
        </p>
      </Panel>

      {/* Blocklist */}
      <Panel title={t({ en: 'Blocklist', th: 'รายการบล็อก' })}>
        <div className="flex gap-2">
          <input
            value={newBlockedNumber}
            onChange={(e) => setNewBlockedNumber(e.target.value)}
            placeholder={t({ en: 'Add a phone number', th: 'เพิ่มเบอร์โทรศัพท์' })}
            className="min-h-tap flex-1 rounded-[10px] border border-hairline/20 bg-panel-2 px-3 text-body-sm text-fg placeholder:text-low focus:border-gold-400/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => newBlockedNumber && addBlockMutation.mutate(newBlockedNumber)}
            className="min-h-tap rounded-[10px] bg-gold-grad px-4 text-body-sm font-semibold text-white"
          >
            {t({ en: 'Add', th: 'เพิ่ม' })}
          </button>
        </div>
        {s.blocklist.length === 0 && (
          <p className="mt-3 text-caption text-low">{t({ en: 'No blocked numbers.', th: 'ยังไม่มีเบอร์ที่ถูกบล็อก' })}</p>
        )}
        <div className="mt-2 flex flex-col gap-2">
          {s.blocklist.map((phone) => (
            <div key={phone} className="flex items-center justify-between text-body-sm">
              <span>{phone}</span>
              <button
                type="button"
                onClick={() => removeBlockMutation.mutate(phone)}
                className="min-h-tap text-small font-semibold text-danger-500"
              >
                {t({ en: 'Remove', th: 'ลบออก' })}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Notification channels */}
      <Panel title={t({ en: 'Notification channels', th: 'ช่องทางการแจ้งเตือน' })}>
        <div className="flex flex-col gap-4">
          <ToggleRow
            label={t({ en: 'Push', th: 'การแจ้งเตือนแบบพุช' })}
            checked={s.notificationPrefs.push}
            onChange={(checked) => api.settings.patchNotificationPrefs({ push: checked }).then(() => settingsQuery.refetch())}
          />
          <ToggleRow
            label={t({ en: 'Email', th: 'อีเมล' })}
            checked={s.notificationPrefs.email}
            onChange={(checked) => api.settings.patchNotificationPrefs({ email: checked }).then(() => settingsQuery.refetch())}
          />
          <ToggleRow
            label={t({ en: 'SMS', th: 'ข้อความ SMS' })}
            checked={s.notificationPrefs.sms}
            onChange={(checked) => api.settings.patchNotificationPrefs({ sms: checked }).then(() => settingsQuery.refetch())}
          />
        </div>
      </Panel>

      {!isEmbeddedPreview && (
        <>
          <Button variant="outline-danger" fullWidth onClick={() => setDeleteOpen(true)}>
            {t({ en: 'Delete all data / delete account', th: 'ลบข้อมูลทั้งหมด / ลบบัญชี' })}
          </Button>

          <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t({ en: 'Are you sure?', th: 'ยืนยันหรือไม่?' })}>
            <p className="text-small text-mid">
              {t({
                en: 'This permanently deletes your account and all call history. This cannot be undone.',
                th: 'การดำเนินการนี้จะลบบัญชีและประวัติการโทรทั้งหมดอย่างถาวร และไม่สามารถกู้คืนได้',
              })}
            </p>
            <Button
              variant="danger"
              fullWidth
              className="mt-4"
              loading={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {t({ en: 'Delete my account', th: 'ลบบัญชีของฉัน' })}
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
    <section className="rounded-[20px] border border-hairline/10 bg-panel p-4">
      <h2 className="mb-3 text-h2 font-semibold text-fg">{title}</h2>
      {children}
    </section>
  )
}

function SelectRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body-sm text-mid">{label}</span>
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
        {Icon && <Icon className="h-5 w-5 text-accent" aria-hidden="true" />}
        <span className="text-body-sm text-fg">{label}</span>
      </span>
      <Switch label={label} checked={checked} onChange={onChange} />
    </div>
  )
}
