import { useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { Button, Icon, Spinner, type IconName } from '../ui'
import { Seo } from '../layout/Seo'

const NAV: Array<{ to: string; label: string; icon: IconName; end?: boolean }> = [
  { to: '/admin', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/admin/projects', label: 'Projects', icon: 'layout' },
  { to: '/admin/skills', label: 'Skills', icon: 'code' },
  { to: '/admin/experience', label: 'Experience', icon: 'briefcase' },
  { to: '/admin/education', label: 'Education', icon: 'graduation' },
  { to: '/admin/services', label: 'Services', icon: 'spark' },
  { to: '/admin/social-links', label: 'Social links', icon: 'link' },
  { to: '/admin/messages', label: 'Messages', icon: 'message' },
  { to: '/admin/media', label: 'Media', icon: 'image' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
]

/**
 * Guards every admin route. The database enforces the same rule through RLS,
 * so hiding the UI is a convenience, not the security boundary.
 */
export function RequireAdmin() {
  const { session, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking your session" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-md rounded-2xl border border-line bg-surface p-7 text-center">
          <h1 className="font-display text-xl font-semibold">This account is not an admin</h1>
          <p className="mt-2 text-[0.9375rem] text-subtle">
            You are signed in, but your profile role is not set to admin, so the dashboard stays
            locked. Set the role in the database, then reload.
          </p>
          <SignOutButton className="mt-5" />
        </div>
      </div>
    )
  }

  return <Outlet />
}

function SignOutButton({ className }: { className?: string }) {
  const { signOut } = useAuth()
  return (
    <Button variant="secondary" size="sm" className={className} onClick={() => void signOut()}>
      <Icon name="logout" className="h-4 w-4" />
      Sign out
    </Button>
  )
}

export function AdminLayout() {
  const { profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">
      <Seo title="Admin" noIndex />

      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
        {/* Mobile bar */}
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <p className="font-display font-semibold">Dashboard</p>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="rounded-lg p-2 hover:bg-soft"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>

        <aside
          className={cn(
            'shrink-0 border-line bg-white lg:block lg:w-60 lg:border-r',
            menuOpen ? 'block border-b' : 'hidden',
          )}
        >
          <div className="hidden px-5 py-5 lg:block">
            <p className="font-display text-lg font-semibold">Dashboard</p>
            {profile?.email ? (
              <p className="mt-0.5 truncate text-[0.8125rem] text-subtle">{profile.email}</p>
            ) : null}
          </div>

          <nav aria-label="Admin" className="px-3 py-3 lg:py-0">
            <ul className="space-y-0.5">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] transition-colors duration-200',
                        isActive ? 'bg-ink text-white' : 'text-subtle hover:bg-soft hover:text-ink',
                      )
                    }
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-line px-1 pt-4 pb-4">
              <NavLink
                to="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] text-subtle hover:bg-soft hover:text-ink"
              >
                <Icon name="external" className="h-4 w-4" />
                View site
              </NavLink>
              <SignOutButton className="w-full justify-start" />
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
