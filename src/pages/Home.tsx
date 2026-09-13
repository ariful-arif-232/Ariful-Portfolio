import { Link } from 'react-router-dom'
import { Hero } from '../components/home/Hero'
import { SectionHeading } from '../components/home/SectionHeading'
import {
  AboutPreview,
  ContactCta,
  EducationSection,
  ExperienceSection,
  ServicesSection,
  SkillsSection,
} from '../components/home/Sections'
import { ProjectCard } from '../components/projects/ProjectCard'
import { useProjects } from '../hooks/useContent'
import { Icon, Reveal, RevealGroup, RevealItem, SectionLoader } from '../components/ui'
import { Seo } from '../components/layout/Seo'

function FeaturedProjects() {
  const featured = useProjects({ featuredOnly: true, limit: 3 })
  const recent = useProjects({ limit: 3 })

  // Nothing pinned as featured yet? Show the most recent work instead of
  // leaving a hole in the page.
  const usingFallback = !featured.loading && featured.data.length === 0
  const items = usingFallback ? recent.data : featured.data
  const loading = featured.loading || (usingFallback && recent.loading)

  if (loading) return <SectionLoader />
  if (!items.length) return null

  return (
    <section className="section-divider gutter py-14 md:py-20">
      <Reveal>
        <SectionHeading
          title={usingFallback ? 'Recent work' : 'Featured work'}
          lead="A few things I have built recently, with the reasoning behind them."
          action={
            <Link
              to="/projects"
              className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink hover:text-accent"
            >
              All projects
              <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          }
        />
      </Reveal>

      <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((project, i) => (
          <RevealItem key={project.id} className={i === 0 ? 'sm:col-span-2 lg:col-span-1' : undefined}>
            <ProjectCard project={project} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <AboutPreview />
      <SkillsSection />
      <FeaturedProjects />
      <ServicesSection />
      <ExperienceSection />
      <EducationSection />
      <ContactCta />
    </>
  )
}
