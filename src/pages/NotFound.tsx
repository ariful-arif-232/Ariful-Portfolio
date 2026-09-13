import { LinkButton, Icon } from '../components/ui'
import { Seo } from '../components/layout/Seo'
import { GridRules } from '../components/layout/PublicLayout'

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <Seo title="Page not found" noIndex />
      <GridRules />
      <div className="gutter relative flex min-h-[60vh] flex-col justify-center py-20">
        <p className="font-display text-[0.9375rem] font-medium text-accent">404</p>
        <h1
          className="mt-3 max-w-2xl font-display font-bold leading-[1.05] tracking-[-0.03em]"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)' }}
        >
          This page does not exist
        </h1>
        <p className="prose-body mt-5">
          The link may be out of date, or the page was moved. These still work:
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton to="/">
            Go home
            <Icon name="arrow-right" className="h-4 w-4" />
          </LinkButton>
          <LinkButton to="/projects" variant="secondary">
            Browse projects
          </LinkButton>
          <LinkButton to="/contact" variant="ghost">
            Contact
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
