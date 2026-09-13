import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { readError } from '../../lib/utils'
import { Button, ErrorNote, Icon, Spinner } from '../../components/ui'
import { Seo } from '../../components/layout/Seo'

export default function AdminLogin() {
  const { session, isAdmin, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading" />
      </div>
    )
  }

  if (session && isAdmin) {
    return <Navigate to={location.state?.from || '/admin'} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email.trim(), password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(readError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <Seo title="Admin sign in" noIndex />

      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-shell">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
            <Icon name="settings" className="h-4 w-4" />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold">Sign in</h1>
            <p className="text-[0.8125rem] text-subtle">Manage your portfolio content</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          {error ? <ErrorNote message={error} /> : null}

          <div>
            <label className="field-label" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {session && !isAdmin ? (
          <p className="mt-5 rounded-xl border border-[#ffdcc2] bg-[#fff6ed] px-4 py-3 text-[0.8125rem] text-[#b93815]">
            You are signed in, but this account does not have the admin role yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}
