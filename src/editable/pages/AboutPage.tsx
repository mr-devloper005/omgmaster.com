import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
          <EditableReveal index={0}>
            <article className="rounded-[24px] border border-[var(--editable-border)] bg-white p-8 lg:p-12">
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{pagesContent.about.badge}</span>
              <h1 className="editable-display mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">
                About <span className="editable-script">{SITE_CONFIG.name}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
              <div className="mt-8 space-y-4 text-[15px] leading-8 text-[var(--slot4-muted-text)]">
                {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
          </EditableReveal>
          <aside className="space-y-4">
            {pagesContent.about.values.map((value, i) => (
              <EditableReveal key={value.title} index={i + 1}>
                <div className="rounded-[24px] border border-[var(--editable-border)] bg-white p-7 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]">
                  <h2 className="editable-display text-xl font-medium tracking-[-0.01em]">{value.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                </div>
              </EditableReveal>
            ))}
          </aside>
        </section>
      </main>
    </EditableSiteShell>
  )
}
