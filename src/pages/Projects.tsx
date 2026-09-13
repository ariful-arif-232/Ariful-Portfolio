import { useMemo, useState } from 'react'
import { useProjects } from '../hooks/useContent'
import { ProjectCard } from '../components/projects/ProjectCard'
import { EmptyState, ErrorNote, Icon, SectionLoader } from '../components/ui'
import { Seo } from '../components/layout/Seo'
import { GridRules } from '../components/layout/PublicLayout'
import { cn } from '../lib/utils'

export default function Projects() {
  const { data: projects, loading, error } = useProjects()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [projects])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (!needle) return true
      return (
        p.title.toLowerCase().includes(needle) ||
        (p.short_description ?? '').toLowerCase().includes(needle) ||
        p.technologies.some((t) => t.toLowerCase().includes(needle))
      )
    })
  }, [projects, category, query])

  return (
    <>
      <Seo title="Projects" description="Selected work, side projects and research." />

      <section className="relative overflow-hidden">
        <GridRules />
        <div className="gutter relative py-12 md:py-16">
          <p className="eyebrow">Projects</p>
          <h1
            className="mt-3 max-w-3xl font-display font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)' }}
          >
            Things I have designed, built and shipped
          </h1>
          <p className="prose-body mt-5">
            Each one includes what it does, what got in the way and what I would do differently.
          </p>
        </div>
      </section>

      <section className="section-divider gutter py-10 md:py-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="thin-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Filter projects by category"
          >
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-[0.875rem] transition-colors duration-200',
                  category === c
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-surface text-subtle hover:border-[#cdd5e0] hover:text-ink',
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative lg:w-72">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            />
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or tech"
              className="input pl-10"
            />
          </div>
        </div>

        <div className="mt-8">
          {loading ? <SectionLoader /> : null}
          {error ? <ErrorNote message={error} /> : null}

          {!loading && !error && visible.length === 0 ? (
            <EmptyState
              title="Nothing matches that"
              description={
                projects.length
                  ? 'Try a different category or clear the search.'
                  : 'Projects added from the admin dashboard will appear here.'
              }
            />
          ) : null}

          {visible.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
