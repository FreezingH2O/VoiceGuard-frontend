import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ShieldCheck, Lock, MicOff, Zap } from 'lucide-react'
import { Button } from '@/components/Button'
import { LangToggle } from '@/components/web/LangToggle'
import { AmbientBackground } from '@/components/motion/AmbientBackground'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useLang, type Localized } from '@/i18n/LangProvider'

interface SignupFormValues {
  name: string
  phone: string
  email: string
}
interface LoginFormValues {
  identifier: string
}

const TRUST_BULLETS: { icon: typeof Lock; label: Localized }[] = [
  { icon: Lock, label: { en: 'Privacy first — your calls stay yours', th: 'ความเป็นส่วนตัวมาก่อน — สายของคุณเป็นของคุณ' } },
  { icon: MicOff, label: { en: 'No raw call audio is ever stored', th: 'ไม่มีการเก็บไฟล์เสียงต้นฉบับ' } },
  { icon: Zap, label: { en: 'Real-time detection while a call happens', th: 'ตรวจจับแบบเรียลไทม์ขณะที่สายกำลังโทร' } },
]

// Verification (OTP) is intentionally omitted for this prototype per voiceguard-spec
// §5 — production must re-add it before handling real accounts.
export function SignUpScreen() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const { t } = useLang()

  const signupForm = useForm<SignupFormValues>()
  const loginForm = useForm<LoginFormValues>()

  const signupMutation = useMutation({
    mutationFn: (values: SignupFormValues) => api.auth.signup(values),
    onSuccess: (res) => {
      setSession(res.accessToken, res.user, res.refreshToken)
      navigate('/onboarding')
    },
  })

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => {
      const isEmail = values.identifier.includes('@')
      return api.auth.login(isEmail ? { email: values.identifier } : { phone: values.identifier })
    },
    onSuccess: (res) => {
      setSession(res.accessToken, res.user, res.refreshToken)
      navigate(res.user.consentRecorded ? '/home' : '/onboarding')
    },
  })

  return (
    <div className="on-dark min-h-dvh w-full bg-ink-950 text-white lg:flex">
      {/* Brand / value panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-glow-grad px-6 py-8 lg:w-[45%] lg:px-12 lg:py-12">
        <AmbientBackground variant="band" className="opacity-50 mix-blend-overlay" />
        <div className="relative flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-body-medium font-bold">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" /> VoiceGuard
          </Link>
          <LangToggle />
        </div>
        <div className="relative my-8 hidden flex-col gap-6 lg:flex">
          <h2 className="text-balance font-display text-4xl font-bold leading-tight">
            {t({ en: 'Know if the voice on the line is real.', th: 'รู้ทันว่าเสียงปลายสายจริงหรือไม่' })}
          </h2>
          <ul className="flex flex-col gap-3">
            {TRUST_BULLETS.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-web-body text-white/90">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <b.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {t(b.label)}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative hidden text-small text-white/80 lg:block">
          {t({ en: 'Built for elders and the guardians who look out for them.', th: 'สร้างเพื่อผู้สูงอายุและผู้ดูแลที่ห่วงใย' })}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="flex w-full max-w-[400px] flex-col gap-5">
          <div>
            <h1 className="font-display text-h1 text-white">
              {mode === 'signup' ? t({ en: 'Create your account', th: 'สร้างบัญชีของคุณ' }) : t({ en: 'Log in', th: 'เข้าสู่ระบบ' })}
            </h1>
            <p className="mt-1 text-web-body text-mist-300">
              {mode === 'signup'
                ? t({ en: 'One free account unlocks the full analysis and your history. No verification needed to try it.', th: 'บัญชีฟรีหนึ่งบัญชีปลดล็อกการวิเคราะห์เต็มรูปแบบและประวัติ ไม่ต้องยืนยันตัวตนเพื่อทดลอง' })
                : t({ en: 'Enter your phone or email to log back in.', th: 'กรอกเบอร์โทรหรืออีเมลเพื่อเข้าสู่ระบบ' })}
            </p>
          </div>

          {mode === 'signup' ? (
            <form className="flex w-full flex-col gap-3" onSubmit={signupForm.handleSubmit((v) => signupMutation.mutate(v))}>
              <Field label={t({ en: 'Full name', th: 'ชื่อ-นามสกุล' })} error={signupForm.formState.errors.name}>
                <input
                  {...signupForm.register('name', { required: t({ en: 'Full name is required', th: 'กรุณากรอกชื่อ' }) })}
                  placeholder="Airada J."
                  className="w-full bg-transparent text-body-sm text-white placeholder:text-mist-500 focus:outline-none"
                />
              </Field>
              <Field label={t({ en: 'Phone number', th: 'เบอร์โทรศัพท์' })} error={signupForm.formState.errors.phone}>
                <input
                  {...signupForm.register('phone', { required: t({ en: 'Phone number is required', th: 'กรุณากรอกเบอร์โทร' }) })}
                  placeholder="+66 8x xxx xxxx"
                  className="w-full bg-transparent text-body-sm text-white placeholder:text-mist-500 focus:outline-none"
                />
              </Field>
              <Field label={t({ en: 'Email', th: 'อีเมล' })} error={signupForm.formState.errors.email}>
                <input
                  {...signupForm.register('email', { required: t({ en: 'Email is required', th: 'กรุณากรอกอีเมล' }) })}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-body-sm text-white placeholder:text-mist-500 focus:outline-none"
                />
              </Field>
              <Button type="submit" variant="primary" fullWidth loading={signupMutation.isPending}>
                {t({ en: 'Create account', th: 'สร้างบัญชี' })}
              </Button>
            </form>
          ) : (
            <form className="flex w-full flex-col gap-3" onSubmit={loginForm.handleSubmit((v) => loginMutation.mutate(v))}>
              <Field label={t({ en: 'Phone or email', th: 'เบอร์โทรหรืออีเมล' })} error={loginForm.formState.errors.identifier}>
                <input
                  {...loginForm.register('identifier', { required: t({ en: 'Enter your phone or email', th: 'กรอกเบอร์โทรหรืออีเมล' }) })}
                  placeholder="+66 8x xxx xxxx / you@example.com"
                  className="w-full bg-transparent text-body-sm text-white placeholder:text-mist-500 focus:outline-none"
                />
              </Field>
              {loginMutation.isError && (
                <p className="text-small text-danger-500">{t({ en: 'We couldn’t find that account.', th: 'ไม่พบบัญชีนี้' })}</p>
              )}
              <Button type="submit" variant="primary" fullWidth loading={loginMutation.isPending}>
                {t({ en: 'Log in', th: 'เข้าสู่ระบบ' })}
              </Button>
            </form>
          )}

          <div className="flex w-full items-center gap-3 text-mist-500">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-caption">{t({ en: 'or', th: 'หรือ' })}</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <Button variant="outline-light" fullWidth onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
            {mode === 'signup' ? t({ en: 'Log in to existing account', th: 'เข้าสู่บัญชีที่มีอยู่' }) : t({ en: 'Create a new account', th: 'สร้างบัญชีใหม่' })}
          </Button>

          <Link
            to="/demo/live-test"
            className="text-center text-small font-medium text-mist-300 underline underline-offset-2 transition hover:text-white"
          >
            {t({ en: 'Continue without an account (free voice check)', th: 'ใช้งานต่อโดยไม่มีบัญชี (ตรวจเสียงฟรี)' })}
          </Link>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: { message?: string } }) {
  return (
    <label className="block rounded-input border border-white/15 bg-white/5 px-3.5 py-2.5 transition focus-within:border-coral-500">
      <span className="block text-micro text-mist-500">{label}</span>
      {children}
      {error?.message && <span className="mt-1 block text-tag text-danger-500">{error.message}</span>}
    </label>
  )
}
