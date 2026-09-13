import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useQuery } from '../../hooks/useSiteData'
import { formatDateTime } from '../../lib/utils'
import { Badge, EmptyState, Icon, SectionLoader, type IconName } from '../../components/ui'
import type { ContactMessage, Project } from '../../lib/types'

interface Stats {
  projects: number
  published: number
  featured: number
  skills: number
  unread: number
  recent: Project[]
  messages: ContactMessage[]
}

const EMPTY_STATS: Stats = {
  projects: 0,
  published: 0,
  featured: 0,
  skills: 0,
  unread: 0,
  recent: [],
  messages: [],
}

function StatCard({
  label,
  value,
  icon,
  to,
}: {
  label: string
  value: number
  icon: IconName
  to: string
}) {
  return (
    <Link to={to} className="card card-hover block p-5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-soft text-subtle">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <p className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em]">{value}</p>
      <p className="mt-1 text-[0.875rem] text-subtle">{label}</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const { data, loading } = useQuery<Stats>(
    'admin-dashboard',
    async () => {
      const count = { count: 'exact' as const, head: true }

      const [projects, published, featured, skills, unread, recent, messages] = await Promise.all([
        supabase.from('projects').select('id', count),
        supabase.from('projects').select('id', count).eq('published', true),
        supabase.from('projects').select('id', count).eq('featured', true),
        supabase.from('skills').select('id', count),
        supabase.from('contact_messages').select('id', count).eq('read', false),
        supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4),
      ])

      return {
        projects: projects.count ?? 0,
        published: published.count ?? 0,
        featured: featured.count ?? 0,
        skills: skills.count ?? 0,
        unread: unread.count ?? 0,
        recent: (recent.data ?? []) as Project[],
        messages: (messages.data ?? []) as ContactMessage[],
      }
    },
    EMPTY_STATS,
  )

  if (loading) return <SectionLoader />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Dashboard</h1>
      <p className="mt-1 text-[0.9375rem] text-subtle">
        Everything on the public site is managed from here.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total projects" value={data.projects} icon="layout" to="/admin/projects" />
        <StatCard label="Published" value={data.published} icon="eye" to="/admin/projects" />
        <StatCard label="Featured" value={data.featured} icon="spark" to="/admin/projects" />
        <StatCard label="Skills" value={data.skills} icon="code" to="/admin/skills" />
        <StatCard label="Unread messages" value={data.unread} icon="message" to="/admin/messages" />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[1.0625rem] font-semibold">Recently updated projects</h2>
            <Link to="/admin/projects" className="text-[0.875rem] text-accent hover:underline">
              Manage
            </Link>
          </div>

          {data.recent.length ? (
            <ul className="mt-4 divide-y divide-line">
              {data.recent.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.title}</p>
                    <p className="text-[0.8125rem] text-subtle">
                      Updated {formatDateTime(project.updated_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {project.featured ? <Badge tone="accent">Featured</Badge> : null}
                    <Badge tone={project.published ? 'live' : 'neutral'}>
                      {project.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState title="No projects yet" description="Add your first project to get started." />
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[1.0625rem] font-semibold">Latest messages</h2>
            <Link to="/admin/messages" className="text-[0.875rem] text-accent hover:underline">
              Open inbox
            </Link>
          </div>

          {data.messages.length ? (
            <ul className="mt-4 divide-y divide-line">
              {data.messages.map((message) => (
                <li key={message.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{message.subject}</p>
                    <p className="truncate text-[0.8125rem] text-subtle">
                      {message.name} · {formatDateTime(message.created_at)}
                    </p>
                  </div>
                  {!message.read ? <Badge tone="accent">New</Badge> : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState title="Inbox is empty" description="Messages from the contact form land here." />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
