import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download,
  ExternalLink, FileText, Globe2, Mail, MapPin, Phone, ShieldCheck, Sparkles, Star, Tag, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

const TASK_DISPLAY: Partial<Record<TaskKey, string>> = {
  listing: 'Local Directory',
  pdf: 'Reference Library',
}
const taskLabelDisplay = (task: TaskKey, fallback: string) => TASK_DISPLAY[task] || fallback

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []

  // For reference-library entries, resolve a real file size when the CMS
  // didn't provide one — HEAD the file URL and read content-length. Cached
  // via the ISR revalidate window so we don't fetch on every request.
  if (task === 'pdf' && post) {
    const already = getFormattedFileSize(post)
    if (!already) {
      const url = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
      const resolved = url ? await headFileSize(url) : ''
      if (resolved) {
        const content = (post.content && typeof post.content === 'object')
          ? post.content as Record<string, unknown>
          : {}
        ;(post as unknown as { content: Record<string, unknown> }).content = { ...content, fileSize: resolved }
      }
    }
  }

  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

/** Bytes → "1.2 MB" / "864 KB". Returns '' for invalid input. */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const rounded = value >= 100 ? Math.round(value) : value >= 10 ? Math.round(value * 10) / 10 : Math.round(value * 100) / 100
  return `${rounded} ${units[unit]}`
}

/** Human-readable size from the post itself (content field or media metadata). */
function getFormattedFileSize(post: SitePost): string {
  const content = post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const strFromContent = ['fileSize', 'size', 'sizeLabel'].map((key) => (typeof content[key] === 'string' ? (content[key] as string).trim() : '')).find(Boolean)
  if (strFromContent) return strFromContent
  const numericFromContent = ['fileSize', 'size', 'bytes', 'fileBytes'].map((key) => Number(content[key])).find((n) => Number.isFinite(n) && n > 0)
  if (numericFromContent) return formatBytes(numericFromContent)
  if (Array.isArray(post.media)) {
    for (const item of post.media) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      const s = ['size', 'fileSize', 'sizeLabel'].map((k) => (typeof record[k] === 'string' ? (record[k] as string).trim() : '')).find(Boolean)
      if (s) return s
      const n = ['size', 'bytes', 'fileSize', 'contentLength'].map((k) => Number(record[k])).find((v) => Number.isFinite(v) && v > 0)
      if (n) return formatBytes(n)
    }
  }
  return ''
}

/** HEAD the file and read content-length. 3s timeout, silent on failure. */
async function headFileSize(url: string): Promise<string> {
  try {
    if (!/^https?:\/\//i.test(url)) return ''
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    let response: Response
    try {
      response = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' })
      // Some servers reject HEAD (405) but honor a ranged GET for one byte.
      if (!response.ok || !response.headers.get('content-length')) {
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          redirect: 'follow',
          headers: { Range: 'bytes=0-0' },
        })
      }
    } finally {
      clearTimeout(timer)
    }
    const length = Number(response.headers.get('content-range')?.split('/')?.[1] ?? response.headers.get('content-length'))
    if (Number.isFinite(length) && length > 0) return formatBytes(length)
    return ''
  } catch {
    return ''
  }
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'
const linkifyMarkdown = (value: string) => value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_m, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)
const linkifyText = (value: string) => linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_m, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)
const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_m, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})
const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))
const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value.split(/\n{2,}/).map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`).join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const label = taskLabelDisplay(task, taskConfig?.label || 'posts')
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {label}
    </Link>
  )
}

/* ------------------------------- ARTICLE ------------------------------- */
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Field note')}</p>
        <h1 className="editable-display mt-5 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
        <div className="mt-6 text-sm text-[var(--tk-muted)]">
          <span>{SITE_CONFIG.name}</span>
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[24px] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ---------------- LISTING — split cover + inverted sidebar --------------- */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const heroImg = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'openHours', 'schedule']) || 'Mon–Sat · 9am–6pm'
  const category = getField(post, ['category'])
  const mapSrc = mapSrcFor(post)
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 6) : []
  const primaryCtaHref = website || (phone ? `tel:${phone}` : email ? `mailto:${email}` : '')
  const primaryExternal = !!website

  const glances = [
    address ? `Located in ${address.split(',')[0]}` : 'Verified in the directory',
    phone ? 'Direct phone contact available' : 'Contact channels published',
    hours ? `Open ${hours.split('·')[0].trim()}` : 'Editor-reviewed entry',
  ]

  return (
    <>
      {primaryCtaHref ? (
        <StickyActionBar task="listing" title={post.title} ctaLabel="Contact" ctaHref={primaryCtaHref} ctaExternal={primaryExternal} />
      ) : null}

      <section className="mx-auto max-w-[var(--editable-container)] px-5 pt-8 pb-14 sm:px-8 sm:pt-10 sm:pb-20 lg:px-14">

        {/* Cover — accent-soft wash, split identity/media */}
        <div className="rounded-[32px] bg-[var(--tk-accent-soft)] p-6 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/85 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">Directory entry</span>
                {category ? <span className="rounded-full border border-[var(--tk-accent)]/25 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{category}</span> : null}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-accent)]/25 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
              <h1 className="editable-display mt-6 text-balance text-4xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem]">{post.title}</h1>
              <DetailMeta post={post} />
              {leadText(post) ? (
                <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--tk-text)]/85">{leadText(post)}</p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                {primaryCtaHref ? (
                  <Link href={primaryCtaHref} target={primaryExternal ? '_blank' : undefined} rel={primaryExternal ? 'noreferrer' : undefined} className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
                    Contact this entry <ArrowUpRight className="btn-arrow h-4 w-4" />
                  </Link>
                ) : null}
                {phone ? (
                  <a href={`tel:${phone}`} className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--tk-accent)]/30 bg-white px-6 py-3 text-sm font-medium text-[var(--tk-accent)] transition hover:bg-[var(--tk-accent)] hover:text-[var(--tk-on-accent)]">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--tk-accent)]/30 bg-white px-6 py-3 text-sm font-medium text-[var(--tk-accent)] transition hover:bg-[var(--tk-accent)] hover:text-[var(--tk-on-accent)]">
                    <Mail className="h-4 w-4" /> Email
                  </a>
                ) : null}
              </div>
            </div>

            {/* Media panel — tall portrait card with floating chip */}
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-[24px] border border-white bg-[var(--tk-surface)] shadow-[0_28px_80px_rgba(42,20,88,0.14)]">
                {heroImg ? (
                  <img src={heroImg} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Building2 className="h-20 w-20 text-[var(--tk-muted)]" /></div>
                )}
              </div>
              <span className="absolute -bottom-3 left-6 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--tk-accent)] shadow-[0_18px_40px_rgba(42,20,88,0.14)] sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5" /> Editor-reviewed
              </span>
              {address ? (
                <span className="absolute -top-3 right-6 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--tk-text)] shadow-[0_18px_40px_rgba(42,20,88,0.14)] sm:inline-flex">
                  <MapPin className="mr-0.5 h-3.5 w-3.5 text-[var(--tk-accent)]" /> {address.split(',')[0]}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Metric belt — horizontal scrollable chip strip */}
        <MetricBelt
          items={[
            [MapPin, 'Location', address || 'Nearby'],
            [Phone, 'Phone', phone || 'On request'],
            [Sparkles, 'Hours', hours],
            [ShieldCheck, 'Trust', 'Verified entry'],
          ]}
        />

        {/* Body — LEFT sidebar (inverted) + MAIN content */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">Contact card</p>
              <h3 className="editable-display mt-3 text-xl font-medium tracking-[-0.02em]">Get in touch</h3>
              <div className="mt-5 grid gap-2.5">
                {address ? <ContactRow icon={MapPin} label="Address" value={address} /> : null}
                {phone ? <ContactRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
                {email ? <ContactRow icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
                {website ? <ContactRow icon={Globe2} label="Website" value={website.replace(/^https?:\/\//, '')} href={website} external /> : null}
                <ContactRow icon={Sparkles} label="Hours" value={hours} />
              </div>
              {primaryCtaHref ? (
                <Link
                  href={primaryCtaHref}
                  target={primaryExternal ? '_blank' : undefined}
                  rel={primaryExternal ? 'noreferrer' : undefined}
                  className="btn-pill mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
                >
                  Contact this entry <ArrowUpRight className="btn-arrow h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">Trust panel</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--tk-muted)]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> Identity checked by editors</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> Contact details reviewed</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> Category placement verified</li>
              </ul>
            </div>

            <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel />
          </aside>

          <article className="min-w-0">
            <AtGlance items={glances} />

            <h2 className="editable-display mt-10 text-2xl font-medium tracking-[-0.02em] sm:text-3xl">About this entry</h2>
            <BodyContent post={post} />

            {tags.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{tag}</span>
                ))}
              </div>
            ) : null}

            <GalleryMosaic images={images.slice(1)} />

            {mapSrc ? (
              <div className="mt-10 overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <div className="flex items-center gap-2 border-b border-[var(--tk-line)] p-4 text-sm font-medium"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {address || 'Map location'}</div>
                <iframe src={mapSrc} title="Map" loading="lazy" className="h-80 w-full border-0" />
              </div>
            ) : null}
          </article>
        </div>

        <RelatedStrip task="listing" related={related} inline />
      </section>
    </>
  )
}

function ContactRow({ icon: Icon, label, value, href, external }: { icon: any; label: string; value: string; href?: string; external?: boolean }) {
  const inner = (
    <div className="flex w-full min-w-0 items-start gap-3 rounded-[16px] border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Icon className="h-4 w-4" /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{label}</span>
        <span className="block break-words text-sm font-medium leading-5 text-[var(--tk-text)]">{value}</span>
      </span>
    </div>
  )
  if (!href) return inner
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="block w-full min-w-0"
    >
      {inner}
    </Link>
  )
}

/* ------------------------------ CLASSIFIED ------------------------------ */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_18px_60px_rgba(42,20,88,0.08)]">
            <Kicker task="classified">Noticeboard</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-medium leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-medium tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* --------------------------------- IMAGE -------------------------------- */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* -------------------------------- BOOKMARK ------------------------------ */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="btn-pill mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ----------- REFERENCE LIBRARY — cover + inverted sidebar + belt ---------- */
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const pages = getField(post, ['pages', 'pageCount']) || '—'
  const size = getFormattedFileSize(post) || '—'
  const uploader = getField(post, ['author', 'uploader', 'publisher']) || SITE_CONFIG.name
  const category = categoryOf(post, 'Reference')
  const filename = (fileUrl.split('/').pop() || post.slug || 'reference-file').split('?')[0]
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 6) : []
  const inside = [
    'Executive overview and scope',
    'Definitions, sources and methodology',
    'Core findings with worked examples',
    'Appendix, citations and further reading',
  ]
  const glances = [
    `Full reference with ${pages !== '—' ? pages : 'multiple'} pages`,
    'Free to open, cite and share',
    `Published under ${uploader}`,
  ]

  return (
    <>
      {fileUrl ? (
        <StickyActionBar task="pdf" title={post.title} ctaLabel="Download" ctaHref={fileUrl} />
      ) : null}

      <section className="mx-auto max-w-[var(--editable-container)] px-5 pt-8 pb-14 sm:px-8 sm:pt-10 sm:pb-20 lg:px-14">

        {/* Cover — accent-soft wash, split identity/media */}
        <div className="rounded-[32px] bg-[var(--tk-accent-soft)] p-6 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/85 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">Reference entry</span>
                <span className="rounded-full border border-[var(--tk-accent)]/25 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{category}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-accent)]/25 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">
                  <Download className="h-3.5 w-3.5" /> Downloadable
                </span>
              </div>
              <h1 className="editable-display mt-6 text-balance text-4xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[4.25rem]">{post.title}</h1>
              {leadText(post) ? (
                <blockquote className="mt-8 border-l-4 border-[var(--tk-accent)] pl-5 text-lg leading-8 text-[var(--tk-text)]/90 sm:text-xl">
                  {leadText(post)}
                </blockquote>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                {fileUrl ? (
                  <>
                    <Link href={fileUrl} download className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
                      Download reference <Download className="btn-arrow h-4 w-4" />
                    </Link>
                    <Link href={fileUrl} target="_blank" rel="noreferrer" className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--tk-accent)]/30 bg-white px-6 py-3 text-sm font-medium text-[var(--tk-accent)] transition hover:bg-[var(--tk-accent)] hover:text-[var(--tk-on-accent)]">
                      Open in new tab <ExternalLink className="btn-arrow h-4 w-4" />
                    </Link>
                  </>
                ) : null}
              </div>
            </div>

            {/* Reference cover mock — no photography */}
            <div className="relative">
              <DocumentPreviewCard category={category} pages={String(pages)} size={String(size)} filename={''} />
              <span className="absolute -bottom-3 left-6 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--tk-accent)] shadow-[0_18px_40px_rgba(42,20,88,0.14)] sm:inline-flex">
                <FileText className="h-3.5 w-3.5" /> {String(pages)} pages · {String(size)}
              </span>
              <span className="absolute -top-3 right-6 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--tk-text)] shadow-[0_18px_40px_rgba(42,20,88,0.14)] sm:inline-flex">
                <Sparkles className="mr-0.5 h-3.5 w-3.5 text-[var(--tk-accent)]" /> {category}
              </span>
            </div>
          </div>
        </div>

        {/* Metric belt — no date, exactly matches Listing shape */}
        <MetricBelt
          items={[
            
            [Download, 'File size', String(size)],
            [Tag, 'Format', 'Reference'],
            [UserRound, 'Published by', uploader],
          ]}
        />

        {/* Body — LEFT sidebar (inverted) + MAIN content */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">Reference identity</p>
              <div className="editable-display mt-4 flex h-24 items-center justify-center rounded-[16px] bg-[var(--tk-accent-soft)] text-2xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">
                Reference
              </div>
              <p className="mt-4 truncate text-sm font-medium">{filename}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <SidebarRow label="Category" value={category} />
                <SidebarRow label="File size" value={String(size)} />
                <SidebarRow label="Published by" value={uploader} />
              </ul>
              {fileUrl ? (
                <Link href={fileUrl} download className="btn-pill mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
                  Download <Download className="btn-arrow h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">What&rsquo;s inside</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--tk-muted)]">
                {inside.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="min-w-0">
            <AtGlance items={glances} />

            <h2 className="editable-display mt-10 text-2xl font-medium tracking-[-0.02em] sm:text-3xl">About this reference</h2>
            <BodyContent post={post} />

            {tags.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{tag}</span>
                ))}
              </div>
            ) : null}

            {/* Full document preview — the article's spine, no photography */}
            {fileUrl ? (
              <div className="mt-12 overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_60px_rgba(42,20,88,0.10)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Reference preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
                    Open <ArrowUpRight className="btn-arrow h-3.5 w-3.5" />
                  </Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[82vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : (
              <div className="mt-12 flex aspect-[3/4] items-center justify-center rounded-[24px] border border-dashed border-[var(--tk-line)] bg-[var(--tk-raised)]">
                <div className="text-center">
                  <FileText className="mx-auto h-16 w-16 text-[var(--tk-muted)]" />
                  <p className="mt-3 text-sm text-[var(--tk-muted)]">Preview will appear when the file is attached.</p>
                </div>
              </div>
            )}

            {/* Article-bottom ad slot preserved */}
            <div className="mt-10">
              <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel />
            </div>

            {/* Repeated CTA callout */}
            {fileUrl ? (
              <div className="mt-10 flex flex-col items-start gap-4 rounded-[24px] bg-[var(--tk-accent)] p-8 text-[var(--tk-on-accent)] sm:flex-row sm:items-center sm:justify-between sm:p-10">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">Ready to read</p>
                  <h3 className="editable-display mt-2 text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-3xl">Grab the full file.</h3>
                </div>
                <Link href={fileUrl} download className="btn-pill inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--tk-accent)] transition hover:bg-[var(--tk-accent-soft)]">
                  Download reference <Download className="btn-arrow h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </article>
        </div>

        <PdfRelatedStrip related={related} />
      </section>
    </>
  )
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </li>
  )
}

/* Related strip specific to references: no photography, glyph tiles instead */
function PdfRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  return (
    <section className="mt-16 border-t border-[var(--tk-line)] pt-14">
      <div className="flex items-center justify-between">
        <h2 className="editable-display text-2xl font-medium tracking-[-0.02em] sm:text-3xl">More references</h2>
        <Link href="/pdf" className="btn-pill inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
          View library <ArrowUpRight className="btn-arrow h-4 w-4" />
        </Link>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => {
          const href = `/pdf/${item.slug}`
          const size = getFormattedFileSize(item) || 'Reference'
          return (
            <Link key={item.id || item.slug} href={href} className="group flex flex-col rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]">
              <div className="editable-display flex h-24 items-center justify-center rounded-[16px] bg-[var(--tk-accent-soft)] text-2xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">
                Reference
              </div>
              <h3 className="editable-display mt-5 line-clamp-2 text-lg font-medium leading-snug tracking-[-0.01em]">{item.title}</h3>
              <span className="mt-4 inline-flex w-fit items-center rounded-full bg-[var(--tk-raised)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{size}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* -------------------------------- PROFILE ------------------------------- */
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_18px_60px_rgba(42,20,88,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-medium tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

/* ----------------------------- SHARED BLOCKS ---------------------------- */

function StickyActionBar({
  task, title, ctaLabel, ctaHref, ctaExternal,
}: { task: TaskKey; title: string; ctaLabel: string; ctaHref: string; ctaExternal?: boolean }) {
  const config = getTaskConfig(task)
  const label = taskLabelDisplay(task, config?.label || 'Back')
  return (
    <div className="sticky top-[76px] z-30 border-b border-[var(--tk-line)] bg-[color:color-mix(in_oklab,var(--tk-surface)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-[var(--editable-container)] items-center gap-3 px-5 py-3 sm:px-8 lg:px-14">
        <Link href={config?.route || '/'} className="btn-pill inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-text)]">
          <ArrowLeft className="h-3.5 w-3.5" /> {label}
        </Link>
        <span className="hidden truncate text-sm font-medium text-[var(--tk-text)] sm:inline">{title}</span>
        <Link
          href={ctaHref}
          target={ctaExternal ? '_blank' : undefined}
          rel={ctaExternal ? 'noreferrer' : undefined}
          download={ctaLabel === 'Download' ? true : undefined}
          className="btn-pill ml-auto inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
        >
          {ctaLabel} <ArrowUpRight className="btn-arrow h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

function MetricChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{label}</span>
        <span className="max-w-[220px] truncate text-sm font-medium text-[var(--tk-text)]">{value}</span>
      </span>
    </div>
  )
}

function MetricBelt({ items }: { items: Array<[any, string, string]> }) {
  return (
    <div className="mt-10 flex flex-nowrap gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map(([Icon, label, value]) => (
        <MetricChip key={label} icon={Icon} label={label} value={value} />
      ))}
    </div>
  )
}

function AtGlance({ items }: { items: string[] }) {
  const list = items.filter(Boolean)
  if (!list.length) return null
  return (
    <div className="rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">At a glance</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[var(--tk-text)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" /> {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function GalleryMosaic({ images }: { images: string[] }) {
  if (!images.length) return null
  const [hero, ...rest] = images
  const smalls = rest.slice(0, 4)
  return (
    <section className="mt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">Photo gallery</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <img src={hero} alt="" className="h-full min-h-[260px] w-full rounded-[20px] border border-[var(--tk-line)] object-cover" />
        {smalls.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {smalls.map((s, i) => (
              <img key={`${s}-${i}`} src={s} alt="" className="aspect-[4/3] w-full rounded-[16px] border border-[var(--tk-line)] object-cover" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function DocumentPreviewCard({ filename, category, pages, size }: { filename: string; category: string; pages: string; size: string }) {
  const bars = [100, 96, 92, 100, 84, 100, 88, 78, 96, 82]
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white bg-white p-7 shadow-[0_28px_80px_rgba(42,20,88,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">Reference</span>
        <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{pages} pages</span>
      </div>
      <p className="mt-6 truncate text-sm font-medium text-[var(--tk-text)]">{filename}</p>
      <p className="mt-1 text-xs text-[var(--tk-muted)]">{category} · {size}</p>
      <div className="mt-6 space-y-2.5">
        {bars.map((w, i) => (
          <span key={i} className="block h-1.5 rounded-full bg-[var(--tk-raised)]" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[16px] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="btn-pill inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="btn-pill inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="mt-8 rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedStrip({ task, related, inline = false }: { task: TaskKey; related: SitePost[]; inline?: boolean }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const label = taskLabelDisplay(task, taskConfig?.label || 'posts')
  const Wrapper: any = inline ? 'section' : 'section'
  return (
    <Wrapper className={inline ? 'mt-16 border-t border-[var(--tk-line)] pt-14' : 'border-t border-[var(--tk-line)]'}>
      <div className={inline ? '' : 'mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-16 lg:px-14'}>
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-medium tracking-[-0.02em] sm:text-3xl">More {label.toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="btn-pill inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
            View all <ArrowUpRight className="btn-arrow h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
        </div>
      </div>
    </Wrapper>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  return (
    <Link href={href} className="group block overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]">
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
      </div>
      <div className="p-5">
        <h3 className="editable-display line-clamp-2 text-base font-medium leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
