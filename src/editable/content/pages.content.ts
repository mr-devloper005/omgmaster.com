import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Local Directory & Reference Library',
      description: 'Discover verified local entries and download considered references in one calm, editorial home.',
      openGraphTitle: 'Local Directory & Reference Library',
      openGraphDescription: 'A curated local directory paired with a serious reference library.',
      keywords: ['local directory', 'reference library', 'directory site', 'reference downloads', 'curated discovery'],
    },
    hero: {
      badge: 'A calmer way to search',
      title: ['Find what you need, then', 'really understand it.'],
      description: `${slot4BrandConfig.siteName} pairs a hand-picked local directory with a growing reference library, so one visit gets you from browsing straight through to actually reading.`,
      primaryCta: { label: 'Browse the directory', href: '/listings' },
      secondaryCta: { label: 'Open the library', href: '/pdf' },
      searchPlaceholder: 'Search entries, references, categories…',
      focusLabel: 'Focus',
      featureCardBadge: 'Latest cover rotation',
      featureCardTitle: 'The latest entry is always visible from the home surface.',
      featureCardDescription: 'Every fresh directory entry or reference lands here first, so the home stays alive without needing a marketing team.',
    },
    intro: {
      badge: 'About the platform',
      title: 'One calm home for local discovery and deep reference.',
      paragraphs: [
        `${slot4BrandConfig.siteName} pairs a curated local directory with a full reference library — the two surfaces feed each other.`,
        'Every entry is quiet, editorial and honest: real hours, real addresses, real filenames.',
        'Search once — jump between a business, an article, a saved shelf and a downloadable reference without leaving the site.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Verified directory entries with hours, contact and location.',
        'Full-file references you can actually download.',
        'Editorial long reads and quiet noticeboard offers.',
        'One search field, one honest list of results.',
      ],
      primaryLink: { label: 'Browse the directory', href: '/listings' },
      secondaryLink: { label: 'Open the library', href: '/pdf' },
    },
    cta: {
      badge: 'Join the platform',
      title: 'Add your entry to the directory or share a reference.',
      description: 'Every submission lands in the same calm system — clean pages, honest metadata, and no ranking games.',
      primaryCta: { label: 'Submit content', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'The newest entries in this section.',
    },
  },
  about: {
    badge: 'Our story',
    title: 'A calmer, clearer way to explore local discovery and reference.',
    description: `${slot4BrandConfig.siteName} treats a local directory and a reference library as one connected surface — not two separate silos.`,
    paragraphs: [
      'Instead of splitting discovery from reading, the platform keeps them side-by-side: browse a business, then open the reference that explains it.',
      'Whether you start with a directory entry, a saved shelf, or a downloadable reference, you can keep discovering without switching sites.',
    ],
    values: [
      {
        title: 'Discovery-first',
        description: 'Clarity, pacing and structure over noisy walls of thumbnails.',
      },
      {
        title: 'Connected surfaces',
        description: 'The directory, the library and the noticeboard talk to each other.',
      },
      {
        title: 'Honest metadata',
        description: 'Real hours, real page counts, real filenames — no marketing sleeves.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'A support page that matches the product, not a generic form.',
    description: 'Tell us what you are trying to publish, fix, or launch. We will route it through the right lane instead of forcing every request into the same bucket.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search entries, references, categories and content across the site.',
    },
    hero: {
      badge: 'Search the archive',
      title: 'Find directory entries, references and stories faster.',
      description: 'Use keywords, categories and content types to reach entries from every section of the site.',
      placeholder: 'Search by keyword, topic, category or title',
    },
    resultsTitle: 'Latest searchable content',
  },
  create: {
    metadata: {
      title: 'Submit content',
      description: 'Submit new entries to the directory, library or noticeboard.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to submit new content.',
      description: 'Use your account to open the workspace and add entries to the directory, library or field notes.',
    },
    hero: {
      badge: 'Contributor workspace',
      title: 'Submit new content for every active section.',
      description: 'Pick the content type, add details, and prepare a clean entry with images, links, summary and body.',
    },
    formTitle: 'Content details',
    submitLabel: 'Submit content',
    successTitle: 'Content submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to your account.',
      badge: 'Member access',
      title: 'Welcome back to the workspace.',
      description: 'Sign in to continue browsing, managing submissions and adding entries from your account.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then sign in.',
      success: 'Signed in. Redirecting…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create your account.',
      badge: 'Site access',
      title: 'Create your account and start submitting.',
      description: 'Create an account to access the contributor workspace, save details, and add entries through the site.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'More field notes',
      fallbackTitle: 'Story details',
    },
    listing: {
      relatedTitle: 'More directory entries',
      fallbackTitle: 'Entry details',
    },
    image: {
      relatedTitle: 'More visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested stories',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
