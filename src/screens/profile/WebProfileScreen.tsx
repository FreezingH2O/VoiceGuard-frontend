import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Waypoints,
  LifeBuoy,
  ShieldCheck,
  FileText,
  ChevronRight,
  LogOut,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Button } from '@/components/Button'
import { Pill } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { Reveal } from '@/components/motion/Reveal'
import { useAuth } from '@/hooks/useAuth'
import { useLang, type Localized } from '@/i18n/LangProvider'
import { cn } from '@/lib/cn'

interface ProfileForm {
  name: string
  phone: string
  email: string
}

const NAV: { id: string; label: Localized }[] = [
  { id: 'profile', label: { en: 'Profile', th: 'โปรไฟล์' } },
  { id: 'support', label: { en: 'Support', th: 'สนับสนุน' } },
  { id: 'legal', label: { en: 'Legal', th: 'กฎหมาย' } },
  { id: 'session', label: { en: 'Session', th: 'เซสชัน' } },
]

/**
 * The signed-in account page — a real desktop webapp settings surface on the dark
 * WebLayout canvas (design.md §3/§5): identity header, inline-editable personal
 * details, and linked support/legal/session sections down a left rail. The phone
 * mockup no longer owns a profile; the navbar avatar routes here.
 */
export function WebProfileScreen() {
  const { t } = useLang()
  const [active, setActive] = useState('profile')

  return (
    <div className="mx-auto w-full max-w-content px-6 pb-24 pt-12 sm:px-8">
      <Reveal>
        <h1 className="font-display text-web-h1 text-white">{t({ en: 'Account', th: 'บัญชี' })}</h1>
        <p className="mt-2 max-w-[60ch] text-web-body text-mist-300">
          {t({
            en: 'Manage your PaTuean profile, find support, and review the legal details.',
            th: 'จัดการโปรไฟล์ ป้าเตือน ค้นหาความช่วยเหลือ และดูรายละเอียดทางกฎหมาย',
          })}
        </p>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
        {/* Section rail — desktop only */}
        <nav aria-label={t({ en: 'Account sections', th: 'ส่วนของบัญชี' })} className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-1">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setActive(n.id)}
                className={cn(
                  'rounded-button px-3 py-2 text-web-caption font-medium transition',
                  active === n.id ? 'bg-white/5 text-white' : 'text-mist-300 hover:bg-white/5 hover:text-white',
                )}
              >
                {t(n.label)}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-6">
          <ProfileSection />
          <SupportSection />
          <LegalSection />
          <SessionSection />
        </div>
      </div>
    </div>
  )
}

function ProfileSection() {
  const { t } = useLang()
  const { updateUser } = useAuth()
  const { showToast } = useToast()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)

  const meQuery = useQuery({ queryKey: queryKeys.me, queryFn: api.family.getMe })
  const form = useForm<ProfileForm>()

  const patchMutation = useMutation({
    mutationFn: (values: ProfileForm) => api.family.patchMe(values),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me, user)
      updateUser(user)
      setEditing(false)
      showToast({ message: 'Profile updated.', tone: 'success' })
    },
  })

  return (
    <section id="profile" className="scroll-mt-24 rounded-web-card border border-white/10 bg-surface-800">
      {meQuery.isPending && (
        <div className="p-6 sm:p-8">
          <Skeleton variant="card" />
        </div>
      )}
      {meQuery.isError && (
        <div className="p-6 sm:p-8">
          <ErrorState onRetry={() => meQuery.refetch()} />
        </div>
      )}
      {meQuery.data && (
        <>
          {/* Identity header */}
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-glow-grad text-h1 font-semibold text-white">
                {initials(meQuery.data.name)}
              </span>
              <div>
                <p className="text-h1 font-semibold text-white">{meQuery.data.name}</p>
                <p className="text-web-body text-mist-300">{meQuery.data.email}</p>
                <Pill tone="blue" className="mt-2">
                  {t({ en: 'Free plan', th: 'แพ็กเกจฟรี' })}
                </Pill>
              </div>
            </div>
            {!editing && (
              <Button
                variant="outline-light"
                leftIcon={<Pencil className="h-4 w-4" aria-hidden="true" />}
                onClick={() => {
                  form.reset({ name: meQuery.data.name, phone: meQuery.data.phone, email: meQuery.data.email })
                  setEditing(true)
                }}
              >
                {t({ en: 'Edit', th: 'แก้ไข' })}
              </Button>
            )}
          </div>

          <div className="border-t border-white/10 p-6 sm:p-8">
            {!editing ? (
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Field label={t({ en: 'Full name', th: 'ชื่อ-นามสกุล' })} value={meQuery.data.name} />
                <Field label={t({ en: 'Phone number', th: 'หมายเลขโทรศัพท์' })} value={meQuery.data.phone} />
                <Field label={t({ en: 'Email', th: 'อีเมล' })} value={meQuery.data.email} />
              </dl>
            ) : (
              <form
                className="flex flex-col gap-5"
                onSubmit={form.handleSubmit((values) => patchMutation.mutate(values))}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <LabeledInput label={t({ en: 'Full name', th: 'ชื่อ-นามสกุล' })} {...form.register('name')} />
                  <LabeledInput label={t({ en: 'Phone number', th: 'หมายเลขโทรศัพท์' })} {...form.register('phone')} />
                  <LabeledInput label={t({ en: 'Email', th: 'อีเมล' })} type="email" {...form.register('email')} />
                </div>
                <div className="flex gap-3">
                  <Button variant="primary" type="submit" loading={patchMutation.isPending}>
                    {t({ en: 'Save changes', th: 'บันทึกการเปลี่ยนแปลง' })}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setEditing(false)}>
                    {t({ en: 'Cancel', th: 'ยกเลิก' })}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function SupportSection() {
  const { t } = useLang()
  return (
    <LinkPanel
      id="support"
      title={t({ en: 'Support', th: 'สนับสนุน' })}
      rows={[
        {
          icon: Waypoints,
          label: t({ en: 'How PaTuean works', th: 'ป้าเตือน ทำงานอย่างไร' }),
          desc: t({ en: 'The four-stage detection pipeline.', th: 'กระบวนการตรวจจับสี่ขั้นตอน' }),
          to: '/#how-it-works',
        },
        {
          icon: LifeBuoy,
          label: t({ en: 'Help & support', th: 'ช่วยเหลือ & สนับสนุน' }),
          desc: t({ en: 'FAQs and a direct line to the team.', th: 'คำถามที่พบบ่อยและติดต่อทีม' }),
          to: '/help',
        },
      ]}
    />
  )
}

function LegalSection() {
  const { t } = useLang()
  return (
    <LinkPanel
      id="legal"
      title={t({ en: 'Legal', th: 'กฎหมาย' })}
      rows={[
        {
          icon: ShieldCheck,
          label: t({ en: 'Privacy policy', th: 'นโยบายความเป็นส่วนตัว' }),
          desc: t({ en: 'What we do — and don’t do — with your data.', th: 'สิ่งที่เราทำและไม่ทำกับข้อมูลของคุณ' }),
          to: '/privacy',
        },
        {
          icon: FileText,
          label: t({ en: 'Terms of service', th: 'ข้อกำหนดการใช้งาน' }),
          desc: t({ en: 'The ground rules for using the demo.', th: 'กติกาพื้นฐานในการใช้เดโม' }),
          to: '/terms',
        },
      ]}
    />
  )
}

function SessionSection() {
  const { t } = useLang()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return (
    <section id="session" className="scroll-mt-24 flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-web-card border border-white/10 bg-surface-800 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-body-medium font-semibold text-white">{t({ en: 'Sign out', th: 'ออกจากระบบ' })}</p>
          <p className="mt-0.5 text-small text-mist-300">
            {t({ en: 'End your session on this device.', th: 'สิ้นสุดเซสชันบนอุปกรณ์นี้' })}
          </p>
        </div>
        <Button
          variant="outline-light"
          leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          {t({ en: 'Log out', th: 'ออกจากระบบ' })}
        </Button>
      </div>

      {import.meta.env.DEV && (
        <div className="flex flex-col gap-3 rounded-web-card border border-dashed border-white/15 p-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-small text-mist-500">Dev only · view app as</span>
          <div className="flex gap-2">
            <Button
              variant="outline-light"
              onClick={() => {
                api.family.switchRole('elder')
                qc.invalidateQueries()
              }}
            >
              Elder
            </Button>
            <Button
              variant="outline-light"
              onClick={() => {
                api.family.switchRole('guardian')
                qc.invalidateQueries()
              }}
            >
              Guardian
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

function LinkPanel({
  id,
  title,
  rows,
}: {
  id: string
  title: string
  rows: { icon: LucideIcon; label: string; desc: string; to: string }[]
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="px-1 text-web-caption font-semibold uppercase tracking-wide text-mist-500">{title}</h2>
      <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-web-card border border-white/10 bg-surface-800">
        {rows.map((r) => (
          <Link
            key={r.to + r.label}
            to={r.to}
            className="group flex items-center gap-4 p-5 transition hover:bg-white/5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-white/5 text-mist-300 transition group-hover:text-white">
              <r.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block text-body-medium font-semibold text-white">{r.label}</span>
              <span className="mt-0.5 block text-small text-mist-300">{r.desc}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-mist-500 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption font-medium uppercase tracking-wide text-mist-500">{label}</dt>
      <dd className="mt-1 text-web-body text-white">{value}</dd>
    </div>
  )
}

function LabeledInput({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-caption font-medium uppercase tracking-wide text-mist-500">{label}</span>
      <input
        className="min-h-tap rounded-input border border-white/15 bg-white/5 px-3.5 text-web-body text-white placeholder:text-mist-500 transition focus:border-coral-500/60 focus:bg-white/10 focus:outline-none"
        {...rest}
      />
    </label>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
