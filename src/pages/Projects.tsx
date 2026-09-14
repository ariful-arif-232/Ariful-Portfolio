import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProjects } from '../hooks/useContent'
import { ProjectCard } from '../components/projects/ProjectCard'
import { EmptyState, ErrorNote, Icon, RevealGroup, RevealItem, SectionLoader } from '../components/ui'
import { Seo } from '../components/layout/Seo'
import { GridRules, HeaderBackdrop } from '../components/layout/PublicLayout'
import { cn } from '../lib/utils'

export default function Projects() {
  const { data: projects, loading, error } = useProjects()
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState(() => searchParams.get('category') || 'All')
  const [query, setQuery] = useState('')

  // A "Focus areas" card on the home page links here with ?category=…; keep
  // the filter in sync if that param changes (e.g. back/forward navigation).
  useEffect(() => {
    const fromUrl = searchParams.get('category')
    if (fromUrl && fromUrl !== category) setCategory(fromUrl)
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  function selectCategory(next: string) {
    setCategory(next)
    setSearchParams(next === 'All' ? {} : { category: next }, { replace: true })
  }

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean))
    // The three focus areas lead the row in a fixed order; everything else
    // (academic/hardware categories) follows alphabetically.
    const priority = ['Artificial Intelligence', 'Web', 'Graphics Design']
    const rest = Array.from(set)
      .filter((c) => !priority.includes(c))
      .sort()
    return ['All', ...priority.filter((c) => set.has(c)), ...rest]
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
        <HeaderBackdrop />
        <GridRules />
        <div className="gutter relative py-12 md:py-16">
          <p className="eyebrow flex items-center gap-2 font-medium">
            <span className="h-px w-8 bg-gradient-to-r from-accent to-transparent" aria-hidden="true" />
            Projects
          </p>
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
                onClick={() => selectCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'relative shrink-0 rounded-full border px-4 py-2 text-[0.875rem] transition-colors duration-200',
                  category === c
                    ? 'border-transparent text-white'
                    : 'border-line bg-surface text-subtle hover:border-accent/30 hover:text-ink',
                )}
              >
                {category === c ? (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-accent to-accent-deep shadow-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                ) : null}
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
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((project, i) => (
                <RevealItem
                  key={project.id}
                  className={i === 0 ? 'sm:col-span-2 lg:col-span-1' : undefined}
                >
                  <ProjectCard project={project} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : null}
        </div>
      </section>
    </>
  )
}
