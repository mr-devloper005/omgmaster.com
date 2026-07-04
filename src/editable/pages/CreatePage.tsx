'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowUpRight,
}

const fieldClass = 'rounded-[14px] border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]
  const displayLabel = (key: TaskKey, fallback: string) => TASK_DISPLAY[key] || fallback

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle(''); setCategory(''); setSummary(''); setUrl(''); setImage(''); setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] px-5 py-16 text-[var(--slot4-page-text)] sm:px-8 lg:px-14">
          <section className="mx-auto grid max-w-[var(--editable-container)] gap-8 rounded-[24px] border border-[var(--editable-border)] bg-white p-8 shadow-[0_18px_60px_rgba(42,20,88,0.08)] md:grid-cols-[0.9fr_1.1fr] md:p-12">
            <div className="flex h-full min-h-64 items-center justify-center rounded-[20px] bg-[var(--slot4-dark-bg)] text-white">
              <Lock className="h-20 w-20 opacity-80" />
            </div>
            <div className="self-center">
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{pagesContent.create.locked.badge}</span>
              <h1 className="editable-display mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2A1458]">
                  Sign in <ArrowUpRight className="btn-arrow h-4 w-4" />
                </Link>
                <Link href="/signup" className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]">
                  Create account
                </Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
          <div className="grid gap-8 rounded-[24px] border border-[var(--editable-border)] bg-white p-6 shadow-[0_18px_60px_rgba(42,20,88,0.08)] lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
            <aside>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{pagesContent.create.hero.badge}</span>
              <h1 className="editable-display mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{pagesContent.create.hero.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`rounded-[16px] border p-4 text-left transition duration-300 ${
                        active
                          ? 'border-transparent bg-[var(--slot4-accent-fill)] text-white'
                          : 'border-[var(--editable-border)] bg-white text-[var(--slot4-page-text)] hover:-translate-y-0.5 hover:border-[var(--slot4-accent)]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="editable-display mt-3 block text-sm font-medium tracking-[-0.01em]">{displayLabel(item.key, item.label)}</span>
                      <span className={`mt-1 block text-xs ${active ? 'text-white/70' : 'text-[var(--slot4-muted-text)]'}`}>{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="rounded-[20px] border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Create {displayLabel(task, activeTask?.label || 'entry').toLowerCase()}</span>
                  <h2 className="editable-display mt-2 text-2xl font-medium tracking-[-0.02em] sm:text-3xl">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="rounded-full border border-[var(--editable-border)] bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">{session.name}</span>
              </div>

              <div className="mt-6 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Entry title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes or description" required />
              </div>

              {created ? (
                <div className="mt-5 rounded-[16px] border border-[var(--slot4-accent)] bg-[var(--slot4-accent-soft)] p-4 text-[var(--slot4-accent)]">
                  <p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className="btn-pill mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 text-sm font-medium text-white transition hover:bg-[#2A1458]">
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
