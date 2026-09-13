import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSite } from '../../hooks/useSiteData'
import { cn, resolveMedia } from '../../lib/utils'
import { Icon, socialIcon } from '../ui'

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Skills', to: '/#skills' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar() {
  const { settings, socialLinks } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const resumeUrl = resolveMedia(settings.resume.url || settings.about.resume_url)
  const siteName = settings.general.site_name || settings.hero.name || 'Portfolio'

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/' && !hash
    if (to.startsWith('/#')) return pathname === '/' && hash === to.slice(1)
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300 ease-out',
        scrolled ? 'bg-white/85 backdrop-blur-md shadow-[0_1px_0_0_#E8EBEF]' : 'bg-transparent',
      )}
    >
      <nav
        aria-label="Main"
        className="gutter mx-auto flex h-[72px] max-w-shell items-center justify-between gap-6"
      >
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-display text-[1.0625rem] font-semibold tracking-tight"
        >
          {settings.general.logo_url ? (
            <img
              src={resolveMedia(settings.general.logo_url)}
              alt=""
              className="h-8 w-8 rounded-lg object-cover"
              width={32}
              height={32}
            />
          ) : null}
          <span>{siteName}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={cn(
                  'text-[0.9375rem] transition-colors duration-200 hover:text-ink',
                  isActive(link.to) ? 'text-ink font-medium' : 'text-subtle',
                )}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {socialLinks.slice(0, 2).map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={s.platform}
              className="rounded-lg p-2 text-subtle transition-colors duration-200 hover:bg-soft hover:text-ink"
            >
              <Icon name={socialIcon(s.platform)} />
            </a>
          ))}
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-[0.875rem] font-medium text-ink transition-colors duration-200 hover:bg-soft"
            >
              Resume
              <Icon name="download" className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        <button
          className="rounded-lg p-2 text-ink transition-colors hover:bg-soft md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <Icon name={open ? 'close' : 'menu'} className="h-5 w-5" />
        </button>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-white md:hidden">
          <ul className="gutter flex flex-col py-2">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={cn(
                    'block border-b border-line py-3.5 text-[1.0625rem]',
                    isActive(link.to) ? 'font-medium text-ink' : 'text-subtle',
                  )}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="gutter flex flex-wrap items-center gap-3 pb-5">
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-[0.9375rem] font-medium"
              >
                Resume
                <Icon name="download" className="h-4 w-4" />
              </a>
            ) : null}
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.platform}
                className="rounded-lg border border-line p-2.5 text-subtle"
              >
                <Icon name={socialIcon(s.platform)} />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
