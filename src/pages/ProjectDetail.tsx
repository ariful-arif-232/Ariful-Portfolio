import { Link, useParams } from 'react-router-dom'
import { useProject } from '../hooks/useContent'
import { Badge, BrowserFrame, EmptyState, Icon, LinkButton, Reveal, RevealGroup, RevealItem, SectionLoader } from '../components/ui'
import { ProjectCard } from '../components/projects/ProjectCard'
import { Seo } from '../components/layout/Seo'
import { dateRange, paragraphs, resolveMedia } from '../lib/utils'

const STATUS_LABEL = {
  completed: 'Completed',
  'in-progress': 'In progress',
  planned: 'Planned',
  archived: 'Archived',
} as const

function Block({ title, body }: { title: string; body: string | null }) {
  if (!body) return null
  return (
    <div className="border-t border-line py-7 first:border-t-0 first:pt-0">
      <h2 className="font-display text-[1.25rem] font-semibold">{title}</h2>
      {paragraphs(body).map((p, i) => (
        <p key={i} className="prose-body mt-3">
          {p}
        </p>
      ))}
    </div>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data, loading } = useProject(slug)
  const { project, images, related } = data

  if (loading) return <SectionLoader />

  if (!project) {
    return (
      <section className="gutter py-20">
        <Seo title="Project not found" noIndex />
        <EmptyState
          title="That project is not here"
          description="It may have been unpublished or the link is out of date."
          action={
            <LinkButton to="/projects" variant="secondary" size="sm">
              Back to projects
            </LinkButton>
          }
        />
      </section>
    )
  }

  const heroImage = resolveMedia(project.hero_image_url || project.thumbnail_url)
  const timeline = dateRange(
    project.start_date,
    project.completion_date,
    project.status === 'in-progress',
  )

  return (
    <>
      <Seo
        title={project.title}
        description={project.short_description || undefined}
        image={project.hero_image_url || project.thumbnail_url || undefined}
        type="article"
      />

      <article>
        <header className="gutter py-10 md:py-14">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-[0.875rem] text-subtle hover:text-ink"
          >
            <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
            All projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="accent">{project.category}</Badge>
            <Badge tone={project.status === 'completed' ? 'live' : 'warn'}>
              {STATUS_LABEL[project.status]}
            </Badge>
            {project.featured ? <Badge>Featured</Badge> : null}
          </div>

          <h1
            className="mt-4 max-w-4xl font-display font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 3.5rem)' }}
          >
            {project.title}
          </h1>

          {project.short_description ? (
            <p className="prose-body mt-5">{project.short_description}</p>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            {project.live_url ? (
              <LinkButton href={project.live_url} external>
                <Icon name="external" className="h-4 w-4" />
                Live demo
              </LinkButton>
            ) : null}
            {project.github_url ? (
              <LinkButton href={project.github_url} variant="secondary" external>
                <Icon name="github" className="h-4 w-4" />
                View code
              </LinkButton>
            ) : null}
          </div>
        </header>

        {heroImage ? (
          <Reveal className="gutter">
            <BrowserFrame className="shadow-lift">
              <img
                src={heroImage}
                alt={`${project.title} cover`}
                loading="eager"
                className="w-full object-cover"
              />
            </BrowserFrame>
          </Reveal>
        ) : null}

        <div className="gutter grid gap-10 py-12 md:py-16 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          <div>
            <Block title="Overview" body={project.full_description} />

            {project.key_features.length ? (
              <div className="border-t border-line py-7">
                <h2 className="font-display text-[1.25rem] font-semibold">Key features</h2>
                <ul className="mt-4 space-y-2.5">
                  {project.key_features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-[0.9375rem] leading-relaxed text-subtle">
                      <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Block title="Challenges" body={project.challenges} />
            <Block title="Solutions" body={project.solutions} />
            <Block title="What I learned" body={project.lessons_learned} />

            {images.length ? (
              <div className="border-t border-line py-7">
                <h2 className="font-display text-[1.25rem] font-semibold">Gallery</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {images.map((image) => (
                    <figure key={image.id} className="group overflow-hidden rounded-xl border border-line">
                      <img
                        src={resolveMedia(image.image_url)}
                        alt={image.caption || `${project.title} screenshot`}
                        loading="lazy"
                        className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      {image.caption ? (
                        <figcaption className="border-t border-line bg-soft px-3 py-2 text-sm text-subtle">
                          {image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-soft p-5">
              <h2 className="font-display text-[1rem] font-semibold">Project details</h2>

              <dl className="mt-4 space-y-4 text-[0.9375rem]">
                {timeline ? (
                  <div>
                    <dt className="text-sm text-subtle">Timeline</dt>
                    <dd className="mt-0.5 font-medium">{timeline}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-sm text-subtle">Status</dt>
                  <dd className="mt-0.5 font-medium">{STATUS_LABEL[project.status]}</dd>
                </div>
                <div>
                  <dt className="text-sm text-subtle">Category</dt>
                  <dd className="mt-0.5 font-medium">{project.category}</dd>
                </div>
                {project.technologies.length ? (
                  <div>
                    <dt className="text-sm text-subtle">Built with</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="rounded-md border border-line bg-surface px-2 py-1 text-[0.75rem] text-subtle">
                          {tech}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="section-divider gutter py-12 md:py-16">
            <Reveal>
              <h2 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em]">Related projects</h2>
            </Reveal>
            <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <RevealItem key={item.id}>
                  <ProjectCard project={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        ) : null}
      </article>
    </>
  )
}
