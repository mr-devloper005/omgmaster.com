import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'Field notes',
    headline: 'Long-form pieces set in a quieter editorial rhythm.',
    description: 'Considered reads, guides, and explainers — laid out with generous whitespace and a calm reading cadence.',
    filterLabel: 'Choose story topic',
    secondaryNote: 'Reading surfaces need space, hierarchy, and fewer distractions.',
    chips: ['Editorial pacing', 'Topic filters', 'Long-read friendly'],
  },
  classified: {
    eyebrow: 'Noticeboard',
    headline: 'Fast-moving offers, deals and time-sensitive posts.',
    description: 'A practical noticeboard that keeps price, condition and location up front so acting on an offer is easy.',
    filterLabel: 'Filter noticeboard category',
    secondaryNote: 'Prioritize urgency, short summaries, and direct browsing.',
    chips: ['Fast scan', 'Fresh offers', 'Action cues'],
  },
  sbm: {
    eyebrow: 'Saved shelves',
    headline: 'Curated collections of links worth returning to.',
    description: 'Grouped bookmarks — tools, references, playbooks and long links — that behave like a shelf, not a stream.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated resources need grouping and calm metadata.',
    chips: ['Collections', 'Resources', 'Reference flow'],
  },
  profile: {
    eyebrow: 'People and profiles',
    headline: 'Profiles with identity, trust, and reputation cues.',
    description: 'A directory-first view of creators, teams and brands — where people can be found before content pushes them down the page.',
    filterLabel: 'Filter profile category',
    secondaryNote: 'Make identity and credibility visible before the grid begins.',
    chips: ['Identity first', 'Trust cues', 'Creator/business cards'],
  },
  pdf: {
    eyebrow: 'Reference Library',
    headline: 'A quiet reference library of downloadable references.',
    description: 'Every entry is a full reference — real filenames, real page counts, real download links. No previews-only, no marketing sleeves.',
    filterLabel: 'Filter reference type',
    secondaryNote: 'Reference surfaces need archive cues, file context, and clear browsing.',
    chips: ['Full references', 'Editor-reviewed', 'Free to open'],
  },
  listing: {
    eyebrow: 'Local Directory',
    headline: 'A curated local directory built for discovery.',
    description: 'Verified entries with hours, address, contact and a trust panel — no drive-by rankings, no paid placements.',
    filterLabel: 'Filter directory category',
    secondaryNote: 'Prioritize comparison, location, and direct action paths.',
    chips: ['Verified entries', 'Compare', 'Local discovery'],
  },
  image: {
    eyebrow: 'Visual feed',
    headline: 'Image posts with a gallery-first browsing experience.',
    description: 'A calm visual feed — images lead the surface, metadata follows.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let images carry the page before long text does.',
    chips: ['Gallery', 'Visual-first', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
