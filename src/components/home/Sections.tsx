import { useMemo, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useSite } from '../../hooks/useSiteData'
import { useEducation, useExperiences, useServices, useSkills } from '../../hooks/useContent'
import { dateRange, paragraphs, resolveMedia } from '../../lib/utils'
import {
  Badge,
  contentIcon,
  EmptyState,
  Icon,
  LinkButton,
  Reveal,
  RevealGroup,
  RevealItem,
  SectionLoader,
  TiltCard,
} from '../ui'
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
        <Reveal className="relative mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-none">
          <div
            className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/10 via-transparent to-teal/10"
            aria-hidden="true"
          />
          <TiltCard max={5}>
            <img
              src={image}
              alt=""
              loading="lazy"
              width={480}
              height={480}
              className="w-full rounded-2xl border border-line object-cover shadow-lift"
            />
          </TiltCard>
          {about.experience_years ? (
            <div className="absolute -bottom-5 -right-3 flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-4 py-3 text-center shadow-lift sm:-right-6">
              <span className="font-display text-2xl font-bold leading-none text-accent">
                {about.experience_years}+
              </span>
              <span className="mt-1 text-[0.6875rem] font-medium uppercase tracking-wide text-subtle">
                Years exp.
              </span>
            </div>
          ) : null}
        </Reveal>

        <Reveal delay={0.08}>
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
        </Reveal>
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
      <Reveal>
        <SectionHeading title="Skills" lead="The tools I reach for most often, grouped by where they sit in a build." />
      </Reveal>

      {skills.length > 4 ? (
        <div
          className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          aria-hidden="true"
        >
          <div className="flex w-max gap-2.5 motion-safe:animate-marquee">
            {[...skills, ...skills].map((skill, i) => (
              <span key={i} className="chip shrink-0 gap-2 text-subtle/80">
                {skill.icon ? <Icon name={contentIcon(skill.icon)} className="h-3.5 w-3.5" /> : null}
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map((group) => (
          <RevealItem key={group.category} className="card card-hover p-5 sm:p-6">
            <p className="flex items-center gap-2 font-display text-[0.9375rem] font-semibold">
              <span className="h-2 w-2 rounded-full bg-gradient-to-br from-accent to-teal" aria-hidden="true" />
              {group.category}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <li
                  key={skill.id}
                  className="chip gap-2 transition-colors duration-200 hover:border-accent/30 hover:bg-accent-soft hover:text-ink"
                >
                  {skill.icon ? <Icon name={contentIcon(skill.icon)} className="h-3.5 w-3.5" /> : null}
                  {skill.name}
                  {typeof skill.level === 'number' ? (
                    <span className="text-[0.75rem] text-[#98a2b3]">{skill.level}%</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
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
      <Reveal>
        <SectionHeading title="What I do" lead="How I usually help, whether that is a whole product or one stubborn part of it." />
      </Reveal>

      <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <RevealItem key={service.id}>
            <TiltCard max={6} className="h-full">
              <article className="card card-hover group relative h-full overflow-hidden p-5">
                <div
                  className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft to-teal-soft text-accent shadow-sm">
                  <Icon name={contentIcon(service.icon)} className="h-5 w-5" />
                </span>
                <h3 className="relative mt-4 font-display text-[1.0625rem] font-semibold leading-snug">
                  {service.title}
                </h3>
                {service.description ? (
                  <p className="relative mt-2 text-[0.9375rem] leading-relaxed text-subtle">{service.description}</p>
                ) : null}
              </article>
            </TiltCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

/* ------------------------------- Experience ------------------------------- */

export function ExperienceSection() {
  const { data: items, loading } = useExperiences()
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.85', 'end 0.4'] })
  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  if (loading) return <SectionLoader />
  if (!items.length) return null

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <Reveal>
        <SectionHeading title="Experience" />
      </Reveal>

      <RevealGroup className="relative mt-10" stagger={0.1}>
        {/* Base rail plus a scroll-linked gradient fill — the timeline "progresses" as you read it */}
        <span
          className="pointer-events-none absolute bottom-0 left-[7px] top-2 w-px bg-line sm:left-[203px]"
          aria-hidden="true"
        />
        <motion.span
          className="pointer-events-none absolute left-[7px] top-2 w-px origin-top bg-gradient-to-b from-accent to-teal sm:left-[203px]"
          style={{ height: fillHeight }}
          aria-hidden="true"
        />
        <ol ref={listRef} className="space-y-10">
          {items.map((item) => (
            <RevealItem key={item.id} as="li" className="relative grid gap-2 pl-7 sm:grid-cols-[190px_1fr] sm:gap-10 sm:pl-0">
              <span
                className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-accent shadow-glow sm:left-[196px]"
                aria-hidden="true"
              />

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
            </RevealItem>
          ))}
        </ol>
      </RevealGroup>
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
      <Reveal>
        <SectionHeading title="Education" />
      </Reveal>

      <RevealGroup className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <RevealItem key={item.id} as="article" className="card card-hover p-6">
            <div className="flex items-start gap-4">
              {item.logo_url ? (
                <img
                  src={resolveMedia(item.logo_url)}
                  alt=""
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-xl border border-line object-cover"
                />
              ) : (
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-soft to-accent-soft text-teal">
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
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

/* ------------------------------- Contact CTA ------------------------------ */

export function ContactCta() {
  const { settings } = useSite()
  const reduceMotion = useReducedMotion()

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center sm:px-12 sm:py-20">
        {/* Dark, single-focus closer — deliberately the boldest moment on the page */}
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.08] invert" aria-hidden="true" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/40 blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 translate-x-1/4 translate-y-1/4 rounded-full bg-teal/30 blur-[100px]"
          aria-hidden="true"
        />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute right-[8%] top-[14%] hidden h-14 w-14 rounded-2xl border border-white/15 sm:block"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[16%] left-[10%] hidden h-8 w-8 rounded-full border border-dashed border-ember/40 sm:block"
        />

        <p className="relative text-sm font-medium text-white/50">Let's build something</p>
        <h2
          className="relative mx-auto mt-3 max-w-2xl font-display font-bold tracking-[-0.03em] text-white"
          style={{ fontSize: 'clamp(2rem, 4.8vw, 3.25rem)' }}
        >
          Have an idea worth{' '}
          <span className="bg-gradient-to-r from-accent via-teal to-ember bg-clip-text text-transparent">
            building
          </span>
          ?
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-center text-[1.0625rem] leading-[1.75] text-white/65">
          {settings.contact.form_note || 'Tell me what you are working on and I will get back to you.'}
        </p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-3">
          <LinkButton to="/contact">
            Start a conversation
            <Icon name="arrow-right" className="h-4 w-4" />
          </LinkButton>
          {settings.contact.email ? (
            <LinkButton href={`mailto:${settings.contact.email}`} variant="invert">
              <Icon name="mail" className="h-4 w-4" />
              {settings.contact.email}
            </LinkButton>
          ) : null}
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------- shared empty-state export ----------------------- */

export function NoContent({ label }: { label: string }) {
  return <EmptyState title={`No ${label} yet`} description={`Add ${label} from the admin dashboard.`} />
}
