import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, CircleUserRound, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/Button'
import { LangToggle } from '@/components/web/LangToggle'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/i18n/LangProvider'
import { scrollToAnchor } from '@/hooks/useLenis'

/**
 * Sticky translucent-dark navbar with backdrop blur (design.md §5, landing-page
 * §navbar). Wordmark → top; anchor links smooth-scroll to landing sections;
 * TH|EN language toggle; consumer auth CTA. Collapses to a hamburger on mobile.
 */
const ANCHORS: { id: string; label: { en: string; th: string } }[] = [
  { id: 'how-it-works', label: { en: 'How it works', th: 'วิธีการทำงาน' } },
  { id: 'services', label: { en: 'Services', th: 'บริการ' } },
  { id: 'roadmap', label: { en: 'Roadmap', th: 'แผนพัฒนา' } },
]

export function WebNavbar() {
  const { isAuthed, user } = useAuth()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function goToAnchor(id: string) {
    setOpen(false)
    if (location.pathname === '/') scrollToAnchor(id)
    else navigate(`/#${id}`)
  }

  const anchorLinks = ANCHORS.map((a) => (
    <button
      key={a.id}
      type="button"
      onClick={() => goToAnchor(a.id)}
      className="text-web-caption font-medium text-mist-300 transition hover:text-white"
    >
      {t(a.label)}
    </button>
  ))

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors duration-300',
        scrolled
          ? 'border-b border-white/10 bg-ink-950/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-[19px] font-bold tracking-tight text-white">
          <ShieldCheck className="h-5 w-5 text-coral-500" aria-hidden="true" />
          VoiceGuard
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {anchorLinks}
          <span className="h-5 w-px bg-white/10" aria-hidden="true" />
          <LangToggle />
          {isAuthed ? (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  cn('text-web-caption font-medium transition hover:text-white', isActive ? 'text-white' : 'text-mist-300')
                }
              >
                {t({ en: 'Home', th: 'หน้าหลัก' })}
              </NavLink>
              <Link
                to="/profile"
                aria-label={user ? `${user.name} — profile` : 'Profile'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <CircleUserRound className="h-5 w-5" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/signup" className="text-web-caption font-medium text-mist-300 transition hover:text-white">
                {t({ en: 'Log in', th: 'เข้าสู่ระบบ' })}
              </Link>
              <Link to="/demo/live-test">
                <Button variant="primary" className="!min-h-0 h-10 px-5 text-body-sm">
                  {t({ en: 'Try live detection', th: 'ทดลองตรวจจับ' })}
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <LangToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-button text-white"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu sheet */}
      {open && (
        <div className="border-t border-white/10 bg-ink-950/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {ANCHORS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => goToAnchor(a.id)}
                className="text-left text-body-sm font-medium text-mist-300"
              >
                {t(a.label)}
              </button>
            ))}
            <span className="h-px w-full bg-white/10" aria-hidden="true" />
            {isAuthed ? (
              <>
                <NavLink to="/home" onClick={() => setOpen(false)} className="text-body-sm font-medium text-mist-300">
                  {t({ en: 'Home', th: 'หน้าหลัก' })}
                </NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)} className="text-body-sm font-medium text-mist-300">
                  {t({ en: 'Profile', th: 'โปรไฟล์' })}
                </NavLink>
              </>
            ) : (
              <>
                <Link to="/signup" onClick={() => setOpen(false)} className="text-body-sm font-medium text-mist-300">
                  {t({ en: 'Log in', th: 'เข้าสู่ระบบ' })}
                </Link>
                <Link to="/demo/live-test" onClick={() => setOpen(false)}>
                  <Button variant="primary" fullWidth>
                    {t({ en: 'Try live detection', th: 'ทดลองตรวจจับ' })}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
