'use client'

import { Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Directory onboarding', body: 'Add entries, verify hours and location, and get your listing live.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth, and operational setup.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape it around you.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Story submissions', body: 'Pitch essays, columns and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations and campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting and workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights and visual partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support or visual feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Collection submissions', body: 'Suggest resources, shelves and links worth a place in the library.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects and reference programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves or collections?' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
      <main className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-8 sm:py-24 lg:px-14">
        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <EditableReveal index={0}>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{pagesContent.contact.eyebrow}</span>
              <h1 className="editable-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{pagesContent.contact.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.contact.description}</p>
            </EditableReveal>
            <div className="mt-8 space-y-4">
              {lanes.map((lane, i) => (
                <EditableReveal key={lane.title} index={i + 1}>
                  <div className="rounded-[24px] border border-[var(--editable-border)] bg-white p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <lane.icon className="h-5 w-5" />
                    </span>
                    <h2 className="editable-display mt-4 text-xl font-medium tracking-[-0.01em]">{lane.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{lane.body}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>

          <EditableReveal index={2}>
            <div className="rounded-[24px] border border-[var(--editable-border)] bg-white p-8 shadow-[0_18px_60px_rgba(42,20,88,0.08)] lg:p-10">
              <h2 className="editable-display text-2xl font-medium tracking-[-0.02em]">{pagesContent.contact.formTitle}</h2>
              <EditableContactLeadForm />
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
