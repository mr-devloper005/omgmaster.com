import Link from 'next/link'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'

export function EditableArticleArchive({ posts, pagination, category = 'all', basePath = '/article' }: { posts: SitePost[]; pagination: SiteFeedPagination; category?: string; basePath?: string }) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) => `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-14 sm:pt-16 lg:pt-20`}>
        <div className="rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] p-8 text-white sm:p-10 lg:p-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">{voice.eyebrow}</span>
          <h1 className="editable-display mt-5 max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
            {voice.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">{voice.description}</p>
          <form action={basePath} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <select name="category" defaultValue={category || 'all'} className="min-w-0 flex-1 rounded-full border border-white/20 bg-white px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none">
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <button className="btn-pill rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--slot4-accent-mid)]">Filter</button>
          </form>
        </div>
      </section>

      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        {posts.length ? (
          <div className="grid gap-5">
            {posts.map((post, index) => <ArticleListCard key={post.id} post={post} href={postHref('article', post, basePath)} index={index + (page - 1) * pagination.limit} />)}
          </div>
        ) : (
          <div className={`${dc.surface.soft} p-10 text-center`}>
            <h2 className="editable-display text-3xl font-medium tracking-[-0.02em]">No stories found</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">Try another category or return to the full archive.</p>
          </div>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? <Link href={pageHref(page - 1)} className="rounded-full border border-[var(--editable-border)] bg-white px-5 py-2.5 text-sm font-medium">Previous</Link> : null}
          <span className="rounded-full bg-[var(--slot4-dark-bg)] px-5 py-2.5 text-sm font-medium text-white">Page {page} of {pagination.totalPages || 1}</span>
          {pagination.hasNextPage ? <Link href={pageHref(page + 1)} className="rounded-full border border-[var(--editable-border)] bg-white px-5 py-2.5 text-sm font-medium">Next</Link> : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-12 sm:pt-14 lg:pt-16`}>
        <div className="grid gap-6 rounded-[24px] border border-[var(--editable-border)] bg-white p-8 shadow-[0_18px_60px_rgba(42,20,88,0.08)] lg:grid-cols-[minmax(0,1fr)_320px] lg:p-10">
          <div className="min-w-0">
            <Link href="/article" className="btn-pill inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] px-4 py-2 text-sm font-medium text-[var(--slot4-page-text)]">
              <ChevronLeft className="h-4 w-4" /> Field notes
            </Link>
            <span className="mt-8 block text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{voice.eyebrow}</span>
            <h1 className="editable-display mt-4 max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
              {post?.title || pagesContent.detailPages.article.fallbackTitle}
            </h1>
          </div>
          <aside className="min-w-0 rounded-[20px] bg-[var(--slot4-dark-bg)] p-6 text-white">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-soft)]">Reading note</span>
            <p className="mt-4 text-sm leading-7 text-white/75">{voice.secondaryNote}</p>
            <Link href="/contact" className="btn-pill mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[var(--slot4-page-text)]">
              Contact <ArrowUpRight className="btn-arrow h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
      <section className="mx-auto w-full max-w-4xl px-5 pb-16 pt-6 sm:px-8 lg:px-14 lg:pb-24">
        <div className="rounded-[24px] border border-[var(--editable-border)] bg-white p-8 shadow-[0_18px_60px_rgba(42,20,88,0.08)] sm:p-10">
          <p className="text-[15px] leading-8 text-[var(--slot4-muted-text)]">{post?.summary || `Story detail content for ${slug} will render through the editable detail page.`}</p>
        </div>
      </section>
    </main>
  )
}
