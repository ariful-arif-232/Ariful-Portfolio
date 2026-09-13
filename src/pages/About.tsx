import { useSite } from '../hooks/useSiteData'
import { paragraphs, resolveMedia } from '../lib/utils'
import { Icon, LinkButton } from '../components/ui'
import { EducationSection, ExperienceSection, ContactCta } from '../components/home/Sections'
import { Seo } from '../components/layout/Seo'
import { GridRules, HeaderBackdrop } from '../components/layout/PublicLayout'

export default function About() {
  const { settings } = useSite()
  const about = settings.about
  const body = paragraphs(about.full_bio)
  const image = resolveMedia(about.image_url) || resolveMedia('media/profile-square.webp')
  const resumeUrl = resolveMedia(settings.resume.url || about.resume_url)

  return (
    <>
      <Seo
        title="About"
        description={about.short_bio || settings.seo.meta_description}
      />

      <section className="relative overflow-hidden">
        <HeaderBackdrop />
        <GridRules />
        <div className="gutter relative py-12 md:py-16">
          <p className="eyebrow flex items-center gap-2 font-medium">
            <span className="h-px w-8 bg-gradient-to-r from-accent to-transparent" aria-hidden="true" />
            About
          </p>
          <h1
            className="mt-3 max-w-3xl font-display font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)' }}
          >
            {about.short_bio || `A bit about ${settings.hero.name || 'me'}`}
          </h1>
        </div>
      </section>

      <section className="section-divider gutter py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          <div>
            {body.length ? (
              body.map((para, i) => (
                <p key={i} className="prose-body mb-5 last:mb-0">
                  {para}
                </p>
              ))
            ) : (
              <p className="prose-body">This section is managed from the admin dashboard.</p>
            )}

            {resumeUrl ? (
              <div className="mt-8">
                <LinkButton href={resumeUrl} external>
                  <Icon name="download" className="h-4 w-4" />
                  Download resume
                </LinkButton>
              </div>
            ) : null}
          </div>

          <aside>
            <img
              src={image}
              alt={about.role ? `${settings.hero.name}, ${about.role}` : 'Portrait'}
              loading="lazy"
              width={480}
              height={480}
              className="w-full max-w-[300px] rounded-2xl border border-line object-cover lg:max-w-none"
            />

            <dl className="mt-6 space-y-4 rounded-2xl border border-line bg-soft p-5">
              {about.role ? (
                <div className="flex items-start gap-3">
                  <Icon name="briefcase" className="mt-0.5 h-4 w-4 text-subtle" />
                  <div>
                    <dt className="text-sm text-subtle">Current role</dt>
                    <dd className="font-medium">{about.role}</dd>
                  </div>
                </div>
              ) : null}
              {about.location ? (
                <div className="flex items-start gap-3">
                  <Icon name="pin" className="mt-0.5 h-4 w-4 text-subtle" />
                  <div>
                    <dt className="text-sm text-subtle">Location</dt>
                    <dd className="font-medium">{about.location}</dd>
                  </div>
                </div>
              ) : null}
              {about.experience_years ? (
                <div className="flex items-start gap-3">
                  <Icon name="calendar" className="mt-0.5 h-4 w-4 text-subtle" />
                  <div>
                    <dt className="text-sm text-subtle">Experience</dt>
                    <dd className="font-medium">{about.experience_years} years</dd>
                  </div>
                </div>
              ) : null}
              {settings.hero.availability_active && settings.hero.availability_text ? (
                <div className="flex items-start gap-3">
                  <Icon name="spark" className="mt-0.5 h-4 w-4 text-subtle" />
                  <div>
                    <dt className="text-sm text-subtle">Availability</dt>
                    <dd className="font-medium">{settings.hero.availability_text}</dd>
                  </div>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </section>

      <ExperienceSection />
      <EducationSection />
      <ContactCta />
    </>
  )
}
