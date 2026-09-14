import { Link } from 'react-router-dom'
import { useSite } from '../../hooks/useSiteData'
import { Icon, socialIcon } from '../ui'

export function Footer() {
  const { settings, socialLinks } = useSite()
  const year = new Date().getFullYear()
  const name = settings.general.site_name || settings.hero.name || 'Portfolio'

  return (
    <footer className="section-divider gutter py-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="max-w-sm">
          <p className="flex items-center gap-2 font-display text-lg font-semibold">
            {name}
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          </p>
          {settings.about.short_bio ? (
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-subtle">
              {settings.about.short_bio}
            </p>
          ) : null}
          {socialLinks.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.platform}
                  className="rounded-xl border border-line p-2.5 text-subtle transition-colors duration-200 hover:border-accent/30 hover:bg-accent-soft hover:text-accent"
                >
                  <Icon name={socialIcon(s.platform)} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:gap-16">
          <nav aria-label="Footer">
            <p className="mb-3 text-sm font-medium text-ink">Pages</p>
            <ul className="space-y-2 text-[0.9375rem] text-subtle">
              <li><Link to="/" className="hover:text-ink">Home</Link></li>
              <li><Link to="/about" className="hover:text-ink">About</Link></li>
              <li><Link to="/projects" className="hover:text-ink">Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-ink">Contact</Link></li>
            </ul>
          </nav>

          <div>
            <p className="mb-3 text-sm font-medium text-ink">Get in touch</p>
            <ul className="space-y-2 text-[0.9375rem] text-subtle">
              {settings.contact.email ? (
                <li>
                  <a href={`mailto:${settings.contact.email}`} className="break-all hover:text-ink">
                    {settings.contact.email}
                  </a>
                </li>
              ) : null}
              {settings.contact.phone ? (
                <li>
                  <a href={`tel:${settings.contact.phone}`} className="hover:text-ink">
                    {settings.contact.phone}
                  </a>
                </li>
              ) : null}
              {settings.contact.location ? <li>{settings.contact.location}</li> : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {name}. All rights reserved.</p>
        {settings.general.footer_text ? <p>{settings.general.footer_text}</p> : null}
      </div>
    </footer>
  )
}
