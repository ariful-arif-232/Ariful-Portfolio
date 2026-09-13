export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/**
 * Resolves a stored media reference to something the browser can load.
 * Absolute URLs (Supabase Storage, external CDNs) pass through untouched.
 * Repo-relative paths are prefixed with the Vite base so they keep working
 * when the site is served from a GitHub Pages subdirectory.
 */
export function resolveMedia(value: string | null | undefined): string {
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('mailto:')) {
    return value
  }
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** "2024-03-01" -> "Mar 2024". Invalid or empty input returns ''. */
export function formatMonthYear(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function formatDateTime(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Renders a date range for timeline entries. */
export function dateRange(
  start: string | null,
  end: string | null,
  ongoing?: boolean,
): string {
  const from = formatMonthYear(start)
  const to = ongoing ? 'Present' : formatMonthYear(end)
  if (from && to) return `${from} — ${to}`
  return from || to || ''
}

/** Splits a text blob into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * "#4169E1" -> "65 105 225" so Tailwind's `rgb(var(--x) / <alpha-value>)`
 * color tokens can apply opacity modifiers (e.g. `bg-accent/15`) to a
 * CSS-variable-driven color. Falls back to the given default on bad input.
 */
export function hexToRgbTriple(hex: string | null | undefined, fallback: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim())
  if (!match) return fallback
  const int = parseInt(match[1], 16)
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`
}

export function readError(error: unknown): string {
  if (!error) return 'Something went wrong.'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  const maybe = error as { message?: string }
  return maybe.message || 'Something went wrong.'
}
