import { Link } from 'react-router-dom'
import { resolveMedia } from '../../lib/utils'
import { Badge, Icon, TiltCard } from '../ui'
import type { Project } from '../../lib/types'

const STATUS_TONE = {
  completed: 'live',
  'in-progress': 'warn',
  planned: 'neutral',
  archived: 'neutral',
} as const

const STATUS_LABEL = {
  completed: 'Completed',
  'in-progress': 'In progress',
  planned: 'Planned',
  archived: 'Archived',
} as const

export function ProjectCard({ project }: { project: Project }) {
  const thumb = resolveMedia(project.thumbnail_url || project.hero_image_url)

  return (
    <TiltCard max={5} className="h-full">
      <article className="card card-hover group flex h-full flex-col overflow-hidden">
        {/* Quiet browser-window chrome — frames every screenshot like a real tab */}
        <div className="flex items-center gap-2 border-b border-line bg-soft px-3.5 py-2" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-ember/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-teal/60" />
          <span className="ml-1 h-3 w-full max-w-[140px] rounded-full bg-line/70" />
        </div>

        <Link
          to={`/projects/${project.slug}`}
          className="relative block aspect-[16/10] overflow-hidden bg-muted"
          aria-label={`Open ${project.title}`}
        >
          {thumb ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            // No image yet: a quiet typographic placeholder beats a broken frame
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f1f5f9] to-[#e6ebf2] font-display text-3xl font-semibold text-[#c3cbd7]">
              {project.title.charAt(0).toUpperCase()}
            </span>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{project.category}</Badge>
            <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
          </div>

          <h3 className="mt-3 font-display text-[1.125rem] font-semibold leading-snug">
            <Link to={`/projects/${project.slug}`} className="hover:text-accent">
              {project.title}
            </Link>
          </h3>

          {project.short_description ? (
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-subtle">{project.short_description}</p>
          ) : null}

          {project.technologies.length ? (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 5).map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-line bg-soft px-2 py-1 text-[0.75rem] text-subtle transition-colors duration-200 group-hover:border-accent/20 group-hover:bg-accent-soft group-hover:text-ink"
                >
                  {tech}
                </li>
              ))}
              {project.technologies.length > 5 ? (
                <li className="rounded-md px-2 py-1 text-[0.75rem] text-[#98a2b3]">
                  +{project.technologies.length - 5}
                </li>
              ) : null}
            </ul>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Link
              to={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.875rem] font-medium text-accent transition-colors hover:bg-accent-soft"
            >
              Details
              <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>

            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.875rem] text-subtle transition-colors hover:bg-soft hover:text-ink"
              >
                <Icon name="github" className="h-4 w-4" />
                Code
              </a>
            ) : null}

            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.875rem] text-subtle transition-colors hover:bg-soft hover:text-ink"
              >
                <Icon name="external" className="h-4 w-4" />
                Live demo
              </a>
            ) : null}
          </div>
        </div>
      </article>
    </TiltCard>
  )
}
