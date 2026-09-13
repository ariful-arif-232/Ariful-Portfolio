import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useSite } from '../../hooks/useSiteData'

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
    root.style.setProperty('--outer-bg', settings.theme.outer_bg || '#E9EDF2')
    root.style.setProperty('--accent', settings.theme.accent || '#2563EB')
    root.style.setProperty('--micro-accent', settings.theme.micro_accent || '#FF6B4A')
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
