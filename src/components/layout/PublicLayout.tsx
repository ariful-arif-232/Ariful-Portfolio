import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { CursorGlow } from './CursorGlow'
import { Icon } from '../ui'
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

/** Fades/lifts each route's content in and out on navigation. */
function RouteTransition() {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <Outlet />

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

/** Floating scroll-to-top button, its ring tracing overall scroll progress. */
function ScrollTopButton() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  const pathLength = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Scroll to top"
          className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-lift backdrop-blur-md transition-colors hover:border-accent/40 hover:text-accent sm:bottom-8 sm:right-8"
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2.5" />
            {reduceMotion ? null : (
              <motion.circle
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke="url(#scroll-top-gradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            )}
            <defs>
              <linearGradient id="scroll-top-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgb(var(--accent-rgb))" />
                <stop offset="100%" stopColor="rgb(var(--teal-accent-rgb))" />
              </linearGradient>
            </defs>
          </svg>
          <Icon name="arrow-up" className="h-4 w-4" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  )
}

export function PublicLayout() {
  useRouteScroll()
  const { settings } = useSite()
  const shellRef = useRef<HTMLDivElement>(null)

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
      <div ref={shellRef} className="shell relative overflow-hidden">
        <CursorGlow containerRef={shellRef} />
        <Navbar />
        <main id="main">
          <RouteTransition />
        </main>
        <Footer />
      </div>
      <ScrollTopButton />
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
