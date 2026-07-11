'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-md">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container)] items-center gap-6 px-5 sm:px-8 lg:px-14">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <img src="/favicon.png?v=20260704" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
          <span className="editable-display max-w-[220px] truncate text-lg font-medium tracking-[-0.02em] text-[var(--slot4-page-text)]">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <form action="/search" className="hidden sm:flex flex-1 items-center gap-2 rounded-full border border-[var(--editable-border)] bg-gray-100 px-4 py-2">
          <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
          <input
            type="text"
            name="q"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {session ? (
            <>
              <Link
                href="/create"
                                className="btn-pill hidden items-center gap-1.5 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2A1458] sm:inline-flex"
              >
                Submit <ArrowUpRight className="btn-arrow h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                                className="btn-pill hidden items-center gap-1.5 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2A1458] sm:inline-flex"
              >
                Get started <ArrowUpRight className="btn-arrow h-3.5 w-3.5" />
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-5 py-5 lg:hidden">
          <div className="grid gap-1">
            {[{ label: 'Home', href: '/' }, ...(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }])].map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-panel-bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button
                type="button"
                onClick={() => { logout(); setOpen(false) }}
                className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-[var(--slot4-muted-text)] transition hover:bg-[var(--slot4-panel-bg)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
