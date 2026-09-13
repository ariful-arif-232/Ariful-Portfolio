import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useSite } from '../../hooks/useSiteData'
import { hexToRgbTriple } from '../../lib/utils'

/** Scrolls to top on navigation, or to the anchor when a hash is present. */
function useRouteScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
}

export function PublicLayout() {
  useRouteScroll()
  const { settings } = useSite()

  // Theme colours are editable from Admin > Settings > Theme.
  useEffect(() => {
    const root = document.documentElement
    const theme = settings.theme
    const accent = theme.accent || '#4169E1'
    const accentDeep = theme.secondary_accent || '#2746B8'
    const microAccent = theme.micro_accent || '#FF715B'

    root.style.setProperty('--outer-bg', theme.outer_bg || '#E9EDF2')
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-deep', accentDeep)
    root.style.setProperty('--micro-accent', microAccent)
    root.style.setProperty('--surface-bg', theme.surface_bg || '#FFFFFF')
    root.style.setProperty('--soft-bg', theme.soft_bg || '#F8FAFC')

    // Tailwind's rgb(var(--x) / <alpha-value>) tokens need components, not hex
    root.style.setProperty('--accent-rgb', hexToRgbTriple(accent, '65 105 225'))
    root.style.setProperty('--accent-deep-rgb', hexToRgbTriple(accentDeep, '39 70 184'))
    root.style.setProperty('--micro-accent-rgb', hexToRgbTriple(microAccent, '255 113 91'))
  }, [settings.theme])

  return (
    <div className="min-h-screen px-0 py-0 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="shell overflow-hidden">
        <Navbar />
        <main id="main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

/**
 * Decorative vertical rules. Percentages rather than fixed pixels so the
 * rhythm survives every breakpoint without overflowing.
 */
export function GridRules({ at = [18, 42, 66, 84] }: { at?: number[] }) {
  return (
    <div className="grid-rules" aria-hidden="true">
      {at.map((left) => (
        <span key={left} style={{ left: `${left}%` }} />
      ))}
    </div>
  )
}

/** Faint dot-grid + brand glow used behind page-header bands. Decorative only. */
export function HeaderBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="absolute inset-0 bg-dot-grid opacity-[0.3]" />
      <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-[90px]" />
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white via-white/50 to-transparent" />
    </div>
  )
}
