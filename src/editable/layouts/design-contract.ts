import type { CSSProperties } from 'react'

/*
  Design contract — custom color palette.

  Palette:  warm peach background (#FFEAD8), coral secondary (#E8988A), magenta primary (#9B177E), deep purple foreground (#2A1458).
  Radii:    fully rounded pill buttons (1000px), ultra-rounded 24px bento cards.
  Type:     Inter Tight everywhere; Playwrite US Trad only as one script word inside hero.
  Rhythm:   generous section pad (py-16 → py-24), airy 32/60px horizontal padding.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#FFEAD8',
  '--slot4-page-text': '#150829',
  '--slot4-panel-bg': '#ffffff',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': 'rgba(21,8,41,0.90)',
  '--slot4-soft-muted-text': 'rgba(21,8,41,0.72)',
  '--slot4-accent': '#9B177E',
  '--slot4-accent-fill': '#9B177E',
  '--slot4-accent-ink': '#9B177E',
  '--slot4-accent-soft': '#FFEAD8',
  '--slot4-accent-soft-2': '#E8988A',
  '--slot4-accent-mid': '#B04A8F',
  '--slot4-on-accent': '#ffffff',
  '--slot4-dark-bg': '#2A1458',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#FFEAD8',
  '--slot4-cream': '#FFEAD8',
  '--slot4-warm': '#FFEAD8',
  '--slot4-lavender': '#E8988A',
  '--slot4-gray': '#FFEAD8',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#FFEAD8',
  '--editable-page-text': '#150829',
  '--editable-container': '1440px',
  '--editable-border': 'rgba(232,152,138,0.10)',
  '--editable-nav-bg': '#ffffff',
  '--editable-nav-text': '#150829',
  '--editable-nav-active': '#9B177E',
  '--editable-nav-active-text': '#ffffff',
  '--editable-cta-bg': '#2A1458',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#2A1458',
  '--editable-footer-text': '#ffffff',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent-ink)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/12',
  shadow: 'shadow-[0_1px_2px_rgba(42,20,88,0.04)]',
  shadowStrong: 'shadow-[0_18px_60px_rgba(42,20,88,0.10)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(16,23,29,0.05),rgba(16,23,29,0.72))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-14',
    sectionY: 'py-16 sm:py-20 lg:py-24',
    sectionYLg: 'py-20 sm:py-24 lg:py-28',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    bento: 'grid gap-5 md:grid-cols-2 lg:grid-cols-4',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[260px] shrink-0 snap-start sm:w-[300px]',
  },
  type: {
    eyebrow: 'text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-ink)]',
    heroTitle: 'text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem]',
    sectionTitle: 'text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem] leading-[1.1]',
    subTitle: 'text-xl font-medium tracking-[-0.01em] sm:text-2xl',
    body: 'text-[15px] leading-[1.6] sm:text-base',
    emphasis: 'editable-script',
  },
  surface: {
    card: `rounded-[24px] border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-[24px] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[24px] ${editablePalette.darkBg} ${editablePalette.darkText} ${editablePalette.shadowStrong}`,
    accent: `rounded-[24px] bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]`,
  },
  button: {
    // Pill CTAs everywhere (Fillio signature)
    primary: `btn-pill inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium tracking-[0] text-[var(--slot4-on-accent)] transition duration-300 hover:bg-[#2A1458] active:scale-[0.98]`,
    secondary: `btn-pill inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-transparent px-6 py-3 text-sm font-medium tracking-[0] text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-accent-fill)] hover:bg-[var(--slot4-accent-fill)] hover:text-[var(--slot4-on-accent)] active:scale-[0.98]`,
    accent: `btn-pill inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-medium text-white transition duration-300 hover:bg-[var(--slot4-accent-mid)] active:scale-[0.98]`,
    ghost: `inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)] hover:underline underline-offset-4`,
  },
  badge: {
    pill: 'inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]',
    accentPill: 'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-accent)]',
  },
  media: {
    frame: `relative overflow-hidden rounded-[20px] ${editablePalette.mediaBg}`,
    frameFull: `relative overflow-hidden rounded-[24px] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/3]',
    ratioHero: 'aspect-[5/4]',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1 hover:border-[color:color-mix(in_oklab,var(--slot4-accent)_35%,var(--editable-border))]',
    fade: 'transition duration-300 hover:opacity-80',
    zoom: 'transition duration-700 group-hover:scale-[1.04]',
  },
} as const

export const aiLayoutRules = [
  'Palette lives in editableRootStyle; every downstream component consumes CSS vars, never raw hex.',
  'Section rhythm is py-16 → py-24 (Fillio pad-Y = 40/60/80/100).',
  'Buttons are pills (rounded-full) with an arrow-slide hover.',
  'Cards are 24px bento tiles with hairline #ddd border, no rest shadow.',
  'Keep dynamic post fetching intact; do not mock content arrays.',
  'Use postHref() for all post links so task routes keep working.',
] as const
