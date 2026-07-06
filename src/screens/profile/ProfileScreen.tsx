import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleUserRound, ChevronRight } from 'lucide-react'
import { api } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Pill } from '@/components/Pill'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { useToast } from '@/components/ToastProvider'
import { useAuth } from '@/hooks/useAuth'

interface ProfileForm {
  name: string
  phone: string
  email: string
}

export function ProfileScreen() {
  const [editing, setEditing] = useState(false)
  const { logout, updateUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const qc = useQueryClient()

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

  if (meQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-3 px-5 pt-2">
        <Skeleton variant="card" />
      </div>
    )
  }
  if (meQuery.isError || !meQuery.data) {
    return <ErrorState onRetry={() => meQuery.refetch()} />
  }

  const user = meQuery.data

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-5 pb-6 pt-2 text-white sm:max-w-2xl sm:px-8 lg:max-w-3xl">
      <h1 className="py-2 text-h1">Profile</h1>

      <Card padding="lg" className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-navy-900">
          <CircleUserRound className="h-8 w-8" aria-hidden="true" />
        </span>
        {!editing ? (
          <>
            <p className="text-body-sm">{user.name}</p>
            <p className="text-caption text-slate-400">{user.phone}</p>
            <p className="text-caption text-slate-400">{user.email}</p>
            <Pill tone="blue">Free plan</Pill>
            <Button
              variant="outline-neutral"
              className="mt-2 !bg-transparent !text-white !border-slate-200"
              onClick={() => {
                form.reset({ name: user.name, phone: user.phone, email: user.email })
                setEditing(true)
              }}
            >
              Edit profile
            </Button>
          </>
        ) : (
          <form
            className="flex w-full flex-col gap-2 text-left"
            onSubmit={form.handleSubmit((values) => patchMutation.mutate(values))}
          >
            <input {...form.register('name')} className="min-h-tap rounded-input border border-slate-200 px-3 text-navy-900" />
            <input {...form.register('phone')} className="min-h-tap rounded-input border border-slate-200 px-3 text-navy-900" />
            <input {...form.register('email')} className="min-h-tap rounded-input border border-slate-200 px-3 text-navy-900" />
            <div className="flex gap-2">
              <Button variant="primary" type="submit" loading={patchMutation.isPending} className="flex-1">
                Save
              </Button>
              <Button variant="outline-neutral" type="button" className="flex-1" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card padding="md" className="flex flex-col divide-y divide-slate-200/10">
        <Link to="/#how-it-works" className="flex min-h-tap items-center justify-between py-3 text-body-sm">
          How VoiceGuard works
          <ChevronRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </Link>
        <ProfileLink label="Help & support" />
        <ProfileLink label="Privacy policy" />
        <ProfileLink label="Terms of service" />
      </Card>

      {import.meta.env.DEV && (
        <Card padding="md" className="flex items-center justify-between gap-2">
          <span className="text-caption text-slate-400">Dev: view as</span>
          <div className="flex gap-2">
            <Button
              variant="outline-neutral"
              onClick={() => {
                api.family.switchRole('elder')
                qc.invalidateQueries()
              }}
            >
              Elder
            </Button>
            <Button
              variant="outline-neutral"
              onClick={() => {
                api.family.switchRole('guardian')
                qc.invalidateQueries()
              }}
            >
              Guardian
            </Button>
          </div>
        </Card>
      )}

      <Button
        variant="ghost"
        fullWidth
        onClick={() => {
          logout()
          navigate('/')
        }}
      >
        Log out
      </Button>
    </div>
  )
}

function ProfileLink({ label }: { label: string }) {
  return (
    <a href="#" className="flex min-h-tap items-center justify-between py-3 text-body-sm">
      {label}
      <ChevronRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
    </a>
  )
}
