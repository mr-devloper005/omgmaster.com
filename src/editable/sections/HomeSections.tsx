import Link from 'next/link'
import {
  ArrowUpRight, BookOpen, Building2, ChevronRight, Compass, FileText, Layers, MapPin,
  Search, ShieldCheck, Sparkles, Star,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}

function taskDisplay(task: TaskKey) {
  return TASK_DISPLAY[task] || (SITE_CONFIG.tasks.find((t) => t.key === task)?.label ?? task)
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary || ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-14'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

/* -------------------------------- HERO -------------------------------- */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const featured = pool[0]
  const heroImage = featured ? getEditablePostImage(featured) : ''
  const brand = SITE_CONFIG.name

  const chips = [
    { label: 'Curated directory', icon: MapPin },
    { label: 'Verified references', icon: ShieldCheck },
    { label: 'Fresh weekly', icon: Sparkles },
  ]

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-page-bg)]">
      <div className={`${container} pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24`}>
        <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <EditableReveal index={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]">
                <Sparkles className="h-3.5 w-3.5" /> {pagesContent.home.hero.badge || 'Discover the platform'}
              </span>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className="editable-display mt-6 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem]">
                Find what you need, then <span className="editable-script">really understand it</span>.
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--slot4-muted-text)]">
                {pagesContent.home.hero.description}
              </p>
            </EditableReveal>
            <EditableReveal index={3}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={primaryRoute} className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2A1458]">
                  Browse {taskDisplay(primaryTask).toLowerCase()} <ArrowUpRight className="btn-arrow h-4 w-4" />
                </Link>
                <Link href="/search" className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
                  Search {brand} <Search className="h-4 w-4" />
                </Link>
              </div>
            </EditableReveal>
            <EditableReveal index={4}>
              <div className="mt-10 flex flex-wrap gap-2.5">
                {chips.map(({ label, icon: Icon }) => (
                  <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-xs font-medium text-[var(--slot4-muted-text)]">
                    <Icon className="h-3.5 w-3.5 text-[var(--slot4-accent-ink)]" /> {label}
                  </span>
                ))}
              </div>
            </EditableReveal>
          </div>

          {/* Hero visual — real latest post as the product visual */}
          <EditableReveal index={2} className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
              {heroImage ? (
                <img src={heroImage} alt={featured?.title || brand} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--slot4-muted-text)]">
                  <Compass className="h-16 w-16" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(42,20,88,0.65))] p-6">
                {featured ? (
                  <>
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">Latest on {brand}</span>
                    <p className="mt-2 line-clamp-2 text-lg font-medium text-white">{featured.title}</p>
                  </>
                ) : null}
              </div>
            </div>
            {/* Floating tag chips — Fillio hero pattern */}
            <span className="absolute -left-3 top-6 hidden rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--slot4-accent-ink)] shadow-[0_18px_40px_rgba(42,20,88,0.14)] sm:inline-flex">
              <Star className="mr-1.5 h-3.5 w-3.5 fill-[var(--slot4-accent-ink)] text-[var(--slot4-accent-ink)]" /> Trusted picks
            </span>
            <span className="absolute -right-2 bottom-24 hidden rounded-full bg-[var(--slot4-accent-soft)] px-4 py-2 text-xs font-medium text-[var(--slot4-accent)] shadow-[0_18px_40px_rgba(42,20,88,0.14)] sm:inline-flex">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Full references
            </span>
            <span className="absolute -bottom-3 left-10 hidden rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--slot4-page-text)] shadow-[0_18px_40px_rgba(42,20,88,0.14)] sm:inline-flex">
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-[var(--slot4-accent-ink)]" /> Near you
            </span>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- KICKER + BENTO --------------------------- */
export function EditableBentoFeatures({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const featured = pool.slice(0, 4)

  const features = [
    { title: 'Curated local directory', body: 'Verified spots, hand-picked and grouped so browsing feels considered — never a blind wall of results.', icon: Building2 },
    { title: 'Full reference library', body: 'Downloadable guides and long-form references you can actually open, read and cite.', icon: FileText },
    { title: 'Editorial storytelling', body: 'Long-form pieces set in generous type, quiet color and calm pacing.', icon: BookOpen },
    { title: 'Search that respects you', body: 'One search field, one clean list of results — no ranking games, no noise.', icon: Search },
  ]

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-16 sm:py-20 lg:py-24`}>
        <EditableReveal index={0} className="max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]">About the platform</span>
          <h2 className="editable-display mt-4 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem]">
            One calm home for local <span className="editable-script">discovery</span> and deep reference.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--slot4-muted-text)]">
            {SITE_CONFIG.name} pairs a curated business directory with a serious reference library, so a single visit can move from &ldquo;where do I go?&rdquo; to &ldquo;what do I read to understand it?&rdquo; without switching sites.
          </p>
        </EditableReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <EditableReveal key={f.title} index={i}>
              <div className="flex h-full flex-col gap-5 rounded-[24px] border border-[var(--editable-border)] bg-white p-7 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="editable-display text-xl font-medium leading-tight tracking-[-0.01em]">{f.title}</h3>
                <p className="text-sm leading-6 text-[var(--slot4-muted-text)]">{f.body}</p>
              </div>
            </EditableReveal>
          ))}
        </div>

        {featured.length ? (
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.6fr_1fr_1fr]">
            {featured.slice(0, 3).map((post, i) => (
              <EditableReveal key={post.id || post.slug} index={i}>
                <Link href={postHref('article', post)} className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--editable-border)] bg-white transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]">
                  <div className={`overflow-hidden bg-[var(--slot4-panel-bg)] ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                    <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]">{categoryOf(post) || 'Featured'}</span>
                    <h3 className={`editable-display font-medium leading-snug tracking-[-0.02em] ${i === 0 ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>{post.title}</h3>
                    <p className="line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 140)}</p>
                    <span className="btn-pill mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">
                      Open <ArrowUpRight className="btn-arrow h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </EditableReveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/* --------------------------- STATS / TRUST BAND ------------------------- */
export function EditableStatsBand({ posts, timeSections }: HomeSectionProps) {
  const total = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)]).length
  const categories = new Set<string>()
  for (const p of posts) { const c = categoryOf(p); if (c) categories.add(c) }
  const stats = [
    { value: `${Math.max(total, 24)}+`, label: 'Entries in the directory' },
    { value: `${Math.max(categories.size, 8)}`, label: 'Curated categories' },
    { value: '100%', label: 'References free to read' },
  ]
  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${container} py-16 sm:py-20`}>
        <EditableReveal index={0}>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]">Performance</span>
          <h2 className="editable-display mt-3 text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-4xl">
            Numbers behind the calm.
          </h2>
        </EditableReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {stats.map((s, i) => (
            <EditableReveal key={s.label} index={i}>
              <div className="rounded-[24px] border border-[var(--editable-border)] bg-white p-8 transition hover:-translate-y-1">
                <p className="editable-display text-5xl font-medium tracking-[-0.03em] text-[var(--slot4-accent)] sm:text-6xl">{s.value}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{s.label}</p>
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- LATEST FEEDS ------------------------------ */
function CompactCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-[var(--editable-border)] bg-white transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-panel-bg)]">
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
        {category ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent-ink)]">{category}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="editable-display line-clamp-2 text-lg font-medium leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 110)}</p>
        <span className="btn-pill mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">
          Open <ArrowUpRight className="btn-arrow h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'New in the last 7 days' },
  browse: { eyebrow: 'Trending now', title: 'Popular this month' },
  index: { eyebrow: 'Evergreen', title: 'From the archive' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])
  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, sectionIdx) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={sectionIdx % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-panel-bg)]'}>
            <div className={`${container} py-16 sm:py-20`}>
              <EditableReveal index={0}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]">{copy.eyebrow}</span>
                    <h2 className="editable-display mt-3 text-3xl font-medium tracking-[-0.02em] sm:text-4xl">{copy.title}</h2>
                  </div>
                  <Link href={section.href || primaryRoute} className="btn-pill inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
                    See all <ArrowUpRight className="btn-arrow h-4 w-4" />
                  </Link>
                </div>
              </EditableReveal>
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i}>
                    <CompactCard post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ---------------------------- PROCESS STEPS ----------------------------- */
export function EditableProcessSteps() {
  const steps = [
    { n: '01', title: 'Search or scroll', body: 'Land on the home, or drop straight into search — both surface the same premium catalogue.' },
    { n: '02', title: 'Open a record', body: 'Every entry has its own quiet page: quick facts, sanitized body, related picks, and one honest CTA.' },
    { n: '03', title: 'Download or contact', body: 'Grab the full reference, tap through to a business, or save a resource for later.' },
  ]
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-16 sm:py-20`}>
        <EditableReveal index={0} className="max-w-xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]">How it works</span>
          <h2 className="editable-display mt-3 text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-4xl">Three quiet steps.</h2>
        </EditableReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <EditableReveal key={s.n} index={i}>
              <div className="flex h-full flex-col rounded-[24px] border border-[var(--editable-border)] bg-white p-7 transition hover:-translate-y-1 hover:border-[var(--slot4-accent)]">
                <span className="editable-display text-5xl font-medium tracking-[-0.03em] text-[var(--slot4-accent-soft)]">{s.n}</span>
                <h3 className="editable-display mt-4 text-xl font-medium tracking-[-0.01em]">{s.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{s.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">
                  Step <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- STORY RAIL (categories) ------------------- */
export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled)
  if (!categories.length) return null

  const icon: Record<string, typeof FileText> = {
    article: BookOpen, listing: Building2, classified: Layers, image: Compass, sbm: Layers, pdf: FileText, profile: Building2,
  }
  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${container} py-16 sm:py-20`}>
        <EditableReveal index={0}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]">Core sections</span>
              <h2 className="editable-display mt-3 text-3xl font-medium tracking-[-0.02em] sm:text-4xl">Browse by section.</h2>
            </div>
            <Link href={primaryRoute} className="btn-pill inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
              See all <ArrowUpRight className="btn-arrow h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((task, i) => {
            const Icon = icon[task.key] || FileText
            const label = TASK_DISPLAY[task.key as TaskKey] || task.label
            return (
              <EditableReveal key={task.key} index={i}>
                <Link
                  href={task.route}
                  className="group flex h-full flex-col items-center gap-3 rounded-[24px] border border-[var(--editable-border)] bg-white px-4 py-7 text-center transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)] transition group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="editable-display text-sm font-medium tracking-[-0.01em] text-[var(--slot4-page-text)]">{label}</span>
                </Link>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- CTA band ------------------------------ */
export function EditableHomeCta() {
  return (
    <section id="get-app" className="scroll-mt-24 bg-[var(--slot4-accent)] text-white">
      <div className={`flex flex-col items-center gap-7 py-20 text-center sm:py-24 ${container}`}>
        <EditableReveal index={0}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/85">
            <Sparkles className="h-3.5 w-3.5" /> Join the platform
          </span>
        </EditableReveal>
        <EditableReveal index={1}>
          <h2 className="editable-display max-w-3xl text-balance text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-5xl">
            Add your entry to the <span className="editable-script text-[var(--slot4-accent-soft)]">directory</span> or share a reference.
          </h2>
        </EditableReveal>
        <EditableReveal index={2}>
          <p className="max-w-xl text-base text-white/85 sm:text-lg">
            Every submission lands in the same calm system — clean pages, honest metadata, and no ranking games.
          </p>
        </EditableReveal>
        <EditableReveal index={3}>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/create" className="btn-pill inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--slot4-accent)] transition hover:bg-[var(--slot4-accent-soft)]">
              Submit content <ArrowUpRight className="btn-arrow h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-pill inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Contact us
            </Link>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

/* Legacy exports kept — HomePage referenced these names */
export const EditableMagazineSplit = EditableBentoFeatures
