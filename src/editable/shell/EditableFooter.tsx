'use client'

import Link from 'next/link'
import { ArrowUpRight, Github, Twitter, Linkedin } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { getTaskTheme } from '@/editable/theme/task-themes'

const TASK_DISPLAY: Partial<Record<string, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const description = globalContent.footer?.description || SITE_CONFIG.description

  return (
    <footer className="relative overflow-hidden bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      {/* Top CTA strip — mirrors Fillio's banner-before-footer */}
      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-start gap-6 px-5 py-14 sm:px-8 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <h2 className="editable-display max-w-2xl text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            Ready to explore the <span className="editable-script">directory</span> and open the library?
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/search" className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-6 py-3 text-sm font-medium text-[var(--slot4-accent)] transition hover:bg-white">
              Start browsing <ArrowUpRight className="btn-arrow h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-pill inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Contact us <ArrowUpRight className="btn-arrow h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            
              <img src="/favicon.png?v=20260704" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
            
            <span className="editable-display text-xl font-medium tracking-[-0.02em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">{description}</p>
          
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">Discover</h3>
          <div className="mt-5 grid gap-3">
            {taskLinks.map((task) => {
              const label = TASK_DISPLAY[task.key] || getTaskTheme(task.key).kicker
              return (
                <Link
                  key={task.key}
                  href={task.route}
                  className="inline-flex items-center gap-1.5 text-sm text-white/85 transition hover:text-white"
                >
                  {label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">Resources</h3>
          <div className="mt-5 grid gap-3">
            <Link href="/search" className="text-sm text-white/85 transition hover:text-white">Search</Link>
            <Link href="/about" className="text-sm text-white/85 transition hover:text-white">About</Link>
            <Link href="/contact" className="text-sm text-white/85 transition hover:text-white">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">Account</h3>
          <div className="mt-5 grid gap-3">
            {session ? (
              <>
                <Link href="/create" className="text-sm text-white/85 transition hover:text-white">Submit content</Link>
                <button type="button" onClick={logout} className="text-left text-sm text-white/85 transition hover:text-white">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/85 transition hover:text-white">Sign in</Link>
                <Link href="/signup" className="text-sm text-white/85 transition hover:text-white">Create account</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Giant faded brand mark — Fillio uses one at the bottom of the footer */}
      <div className="pointer-events-none select-none px-5 pb-4 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[var(--editable-container)] overflow-hidden">
          <p className="editable-display truncate text-[18vw] font-medium leading-none tracking-[-0.05em] text-white/5">
            {SITE_CONFIG.name}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:px-8 lg:px-14">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <span>Built for calm discovery and premium references.</span>
        </div>
      </div>
    </footer>
  )
}
