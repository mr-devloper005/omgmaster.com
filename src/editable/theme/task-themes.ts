import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Fillio-aligned task themes.

  Every task shares one visual language (deep forest green on white, sage
  secondaries, Inter Tight sans, ultra-rounded 24px cards, pill buttons).
  Only kicker + note copy varies per task, so each surface keeps a light voice.
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const FONT = "'Inter Tight', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: FONT,
  fontBody: FONT,
  bg: '#FFEAD8',
  surface: '#ffffff',
  raised: '#FFEAD8',
  text: '#150829',
  muted: 'rgba(21,8,41,0.88)',
  line: 'rgba(21,8,41,0.12)',
  accent: '#9B177E',
  accentSoft: '#FFEAD8',
  onAccent: '#ffffff',
  glow: 'rgba(155,23,126,0.10)',
  radius: '20px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: {
    ...base,
    kicker: 'Field notes',
    note: 'Long-form reads, guides and stories worth your time.',
  },
  listing: {
    ...base,
    kicker: 'Local Directory',
    note: 'Trusted, verified spots and businesses close to you.',
  },
  classified: {
    ...base,
    kicker: 'Noticeboard',
    note: 'Fresh offers, deals and time-sensitive posts.',
  },
  image: {
    ...base,
    kicker: 'Visual feed',
    note: 'A calm gallery of standout images and moments.',
  },
  sbm: {
    ...base,
    kicker: 'Saved shelves',
    note: 'Curated links, tools and resources worth returning to.',
  },
  pdf: {
    ...base,
    kicker: 'Reference Library',
    note: 'Downloadable guides, reports and reference material.',
  },
  profile: {
    ...base,
    kicker: 'People',
    note: 'Discover creators, teams and profiles across the site.',
  },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
