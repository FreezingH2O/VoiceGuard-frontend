import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/i18n/LangProvider'

export type LegalBlock = string | { list: string[] }

export interface LegalSection {
  id: string
  heading: string
  blocks: LegalBlock[]
}

interface LegalDocScreenProps {
  title: string
  /** e.g. "Last updated 9 July 2026" — already localized by the caller. */
  updated: string
  intro: string
  sections: LegalSection[]
}

/**
 * Long-form legal/policy layout on the dark web canvas (design.md §1/§3): a
 * lead block, a sticky in-page table of contents on desktop, and a readable
 * ~68ch prose column. Shared by Privacy and Terms so the two read as one system.
 */
export function LegalDocScreen({ title, updated, intro, sections }: LegalDocScreenProps) {
  const { t } = useLang()
  const { isAuthed } = useAuth()
  const [active, setActive] = useState(sections[0]?.id)

  return (
    <div className="mx-auto w-full max-w-content px-6 pb-24 pt-12 sm:px-8">
      <Reveal>
        <Link
          to={isAuthed ? '/profile' : '/'}
          className="inline-flex items-center gap-1.5 text-web-caption font-medium text-mist-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isAuthed ? t({ en: 'Back to account', th: 'กลับไปที่บัญชี' }) : t({ en: 'Back to home', th: 'กลับหน้าแรก' })}
        </Link>
        <h1 className="mt-6 text-balance font-display text-web-display text-white">{title}</h1>
        <p className="mt-3 font-mono text-web-caption uppercase tracking-wide text-mist-500">{updated}</p>
        <p className="mt-6 max-w-[68ch] text-pretty text-web-sub text-mist-300">{intro}</p>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        {/* Sticky table of contents — desktop only */}
        <nav aria-label={t({ en: 'On this page', th: 'ในหน้านี้' })} className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-1 border-l border-white/10 pl-4">
            <p className="mb-2 font-mono text-tag uppercase tracking-wide text-mist-500">
              {t({ en: 'On this page', th: 'ในหน้านี้' })}
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                className={
                  'rounded-md px-2 py-1.5 text-web-caption transition ' +
                  (active === s.id ? 'text-white' : 'text-mist-300 hover:text-white')
                }
              >
                {s.heading}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections render statically (no scroll-gating) — long-form legal text
            must never be hidden behind a reveal that a print/headless render
            or a paused tab won't fire. */}
        <div className="flex max-w-[68ch] flex-col gap-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-display text-web-section text-white">{s.heading}</h2>
              <div className="mt-4 flex flex-col gap-4">
                {s.blocks.map((block, i) =>
                  typeof block === 'string' ? (
                    <p key={i} className="text-pretty text-web-body text-mist-300">
                      {block}
                    </p>
                  ) : (
                    <ul key={i} className="flex flex-col gap-2.5">
                      {block.list.map((item, j) => (
                        <li key={j} className="flex gap-3 text-web-body text-mist-300">
                          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
                          <span className="text-pretty">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
