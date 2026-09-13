import { useMemo } from 'react'
import { useSite } from '../../hooks/useSiteData'
import { useEducation, useExperiences, useServices, useSkills } from '../../hooks/useContent'
import { dateRange, paragraphs, resolveMedia } from '../../lib/utils'
import { Badge, contentIcon, EmptyState, Icon, LinkButton, SectionLoader } from '../ui'
import { SectionHeading } from './SectionHeading'
import type { SkillCategory } from '../../lib/types'

const SKILL_ORDER: SkillCategory[] = ['Frontend', 'Backend', 'Database', 'Tools', 'Design', 'Other']

/* ------------------------------ About preview ----------------------------- */

export function AboutPreview() {
  const { settings } = useSite()
  const about = settings.about
  const image = resolveMedia(about.image_url) || resolveMedia('media/profile-square.webp')
  const intro = paragraphs(about.full_bio)[0] || about.short_bio

  if (!intro) return null

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="relative">
          <img
            src={image}
            alt=""
            loading="lazy"
            width={480}
            height={480}
            className="w-full max-w-[320px] rounded-2xl border border-line object-cover lg:max-w-none"
          />
        </div>

        <div>
          <SectionHeading title="About" />
          <p className="prose-body mt-5">{intro}</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
            {about.role ? (
              <div>
                <dt className="text-sm text-subtle">Role</dt>
                <dd className="mt-1 font-medium">{about.role}</dd>
              </div>
            ) : null}
            {about.location ? (
              <div>
                <dt className="text-sm text-subtle">Based in</dt>
                <dd className="mt-1 font-medium">{about.location}</dd>
              </div>
            ) : null}
            {about.experience_years ? (
              <div>
                <dt className="text-sm text-subtle">Experience</dt>
                <dd className="mt-1 font-medium">{about.experience_years} years</dd>
              </div>
            ) : null}
            {settings.hero.availability_text ? (
              <div>
                <dt className="text-sm text-subtle">Status</dt>
                <dd className="mt-1 font-medium">{settings.hero.availability_text}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-8">
            <LinkButton to="/about" variant="secondary" size="sm">
              Read the full story
              <Icon name="arrow-right" className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Skills -------------------------------- */

export function SkillsSection() {
  const { data: skills, loading } = useSkills()

  const grouped = useMemo(() => {
    const map = new Map<string, typeof skills>()
    for (const skill of skills) {
      const list = map.get(skill.category) ?? []
      list.push(skill)
      map.set(skill.category, list)
    }
    return SKILL_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, items: map.get(c)! }))
  }, [skills])

  if (loading) return <SectionLoader />
  if (!skills.length) return null

  return (
    <section id="skills" className="section-divider gutter scroll-mt-20 py-14 md:py-20">
      <SectionHeading title="Skills" lead="The tools I reach for most often, grouped by where they sit in a build." />

      <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
        {grouped.map((group) => (
          <div key={group.category} className="grid gap-4 bg-surface p-5 sm:grid-cols-[160px_1fr] sm:gap-8 sm:p-6">
            <p className="font-display text-[0.9375rem] font-semibold">{group.category}</p>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <li key={skill.id} className="chip gap-2">
                  {skill.icon ? <Icon name={contentIcon(skill.icon)} className="h-3.5 w-3.5" /> : null}
                  {skill.name}
                  {typeof skill.level === 'number' ? (
                    <span className="text-[0.75rem] text-[#98a2b3]">{skill.level}%</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------- Services -------------------------------- */

export function ServicesSection() {
  const { data: services, loading } = useServices()
  if (loading) return <SectionLoader />
  if (!services.length) return null

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <SectionHeading title="What I do" lead="How I usually help, whether that is a whole product or one stubborn part of it." />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <article key={service.id} className="card card-hover p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon name={contentIcon(service.icon)} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-[1.0625rem] font-semibold leading-snug">{service.title}</h3>
            {service.description ? (
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-subtle">{service.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------- Experience ------------------------------- */

export function ExperienceSection() {
  const { data: items, loading } = useExperiences()
  if (loading) return <SectionLoader />
  if (!items.length) return null

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <SectionHeading title="Experience" />

      <ol className="mt-10 space-y-0">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="grid gap-2 border-t border-line py-7 sm:grid-cols-[190px_1fr] sm:gap-10"
            style={index === 0 ? { borderTopWidth: 0, paddingTop: 0 } : undefined}
          >
            <div className="text-sm text-subtle">
              <p>{dateRange(item.start_date, item.end_date, item.currently_working)}</p>
              {item.location ? <p className="mt-1">{item.location}</p> : null}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                {item.logo_url ? (
                  <img
                    src={resolveMedia(item.logo_url)}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 rounded-lg border border-line object-cover"
                  />
                ) : null}
                <h3 className="font-display text-[1.125rem] font-semibold">{item.role}</h3>
                {item.currently_working ? <Badge tone="live">Current</Badge> : null}
              </div>

              <p className="mt-1 text-[0.9375rem] text-subtle">
                {item.company_url ? (
                  <a
                    href={item.company_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 hover:text-ink"
                  >
                    {item.company}
                    <Icon name="external" className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  item.company
                )}
              </p>

              {item.description ? (
                <p className="prose-body mt-3 text-[0.9375rem]">{item.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* -------------------------------- Education ------------------------------- */

export function EducationSection() {
  const { data: items, loading } = useEducation()
  if (loading) return <SectionLoader />
  if (!items.length) return null

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <SectionHeading title="Education" />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="card p-6">
            <div className="flex items-start gap-4">
              {item.logo_url ? (
                <img
                  src={resolveMedia(item.logo_url)}
                  alt=""
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-xl border border-line object-cover"
                />
              ) : (
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft text-subtle">
                  <Icon name="graduation" className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <h3 className="font-display text-[1.0625rem] font-semibold leading-snug">{item.degree}</h3>
                <p className="mt-1 text-[0.9375rem] text-subtle">{item.institution}</p>
                <p className="mt-2 text-sm text-subtle">
                  {[dateRange(item.start_date, item.end_date), item.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            {item.description ? (
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-subtle">{item.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------- Contact CTA ------------------------------ */

export function ContactCta() {
  const { settings } = useSite()

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <div className="rounded-2xl border border-line bg-soft px-6 py-12 text-center sm:px-12">
        <h2
          className="mx-auto max-w-2xl font-display font-semibold tracking-[-0.02em]"
          style={{ fontSize: 'clamp(1.625rem, 3.6vw, 2.5rem)' }}
        >
          Have something you want built?
        </h2>
        <p className="prose-body mx-auto mt-4 text-center">
          {settings.contact.form_note || 'Tell me what you are working on and I will get back to you.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton to="/contact">
            Start a conversation
            <Icon name="arrow-right" className="h-4 w-4" />
          </LinkButton>
          {settings.contact.email ? (
            <LinkButton href={`mailto:${settings.contact.email}`} variant="secondary">
              <Icon name="mail" className="h-4 w-4" />
              {settings.contact.email}
            </LinkButton>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ------------------------- shared empty-state export ----------------------- */

export function NoContent({ label }: { label: string }) {
  return <EmptyState title={`No ${label} yet`} description={`Add ${label} from the admin dashboard.`} />
}
