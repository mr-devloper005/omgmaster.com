import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* Editorial hero card — one large bento-tile with a photo, accent kicker,
   large tight sans headline, pill CTA. */
export function EditorialFeatureCard({ post, href, label = 'Featured read' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group block min-w-0 overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className="relative">
        <div className="aspect-[16/10] w-full overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-7 sm:p-9">
        <span className={dc.type.eyebrow}>{label}</span>
        <h3 className="editable-display text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[2.5rem]">{post.title}</h3>
        <p className={`${pal.mutedText} max-w-2xl text-[15px] leading-7`}>{getEditableExcerpt(post, 190)}</p>
        <span className="btn-pill mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-medium text-white">
          Read story <ArrowUpRight className="btn-arrow h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/* Rail card — used inside horizontal scroll rails */
export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className="aspect-[5/4] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <span className={dc.type.eyebrow}>{getEditableCategory(post)}</span>
          <span className={`${pal.softMutedText} text-[11px]`}>· No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3 className={`editable-display mt-3 line-clamp-2 text-xl font-medium leading-snug tracking-[-0.02em] ${pal.panelText}`}>{post.title}</h3>
        <p className={`mt-3 line-clamp-3 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 130)}</p>
        <span className="btn-pill mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">
          Open <ArrowUpRight className="btn-arrow h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/* Compact index card — small numbered tile for stack layouts */
export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group block min-w-0 ${dc.surface.soft} p-6 ${dc.motion.lift}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-xs font-medium text-[var(--slot4-accent)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className={dc.type.eyebrow}>{getEditableCategory(post)}</p>
          <h3 className={`editable-display mt-2 line-clamp-2 text-lg font-medium leading-snug tracking-[-0.02em] ${pal.panelText}`}>{post.title}</h3>
          <p className={`mt-2 line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 105)}</p>
        </div>
      </div>
    </Link>
  )
}

/* Article list card — wide horizontal card used in archive lists */
export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group grid min-w-0 gap-6 overflow-hidden ${dc.surface.card} p-5 ${dc.motion.lift} sm:grid-cols-[260px_minmax(0,1fr)]`}>
      <div className="aspect-[16/12] overflow-hidden rounded-[16px] bg-[var(--slot4-media-bg)] sm:aspect-auto sm:min-h-[200px]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="min-w-0 py-2 sm:py-4 sm:pr-6">
        <div className="flex items-center gap-2">
          <span className={dc.type.eyebrow}>Read {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className={`editable-display mt-3 line-clamp-2 text-2xl font-medium leading-tight tracking-[-0.02em] ${pal.panelText} sm:text-[1.75rem]`}>{post.title}</h2>
        <p className={`mt-4 line-clamp-3 text-[15px] leading-7 ${pal.mutedText}`}>{getEditableExcerpt(post, 200)}</p>
        <span className="btn-pill mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-accent)]">
          Open article <ArrowUpRight className="btn-arrow h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
