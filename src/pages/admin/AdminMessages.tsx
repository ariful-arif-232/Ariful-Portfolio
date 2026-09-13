import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDateTime, readError } from '../../lib/utils'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorNote,
  Icon,
  SectionLoader,
  useToast,
} from '../../components/ui'
import type { ContactMessage } from '../../lib/types'

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { notify } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(readError(err))
    setMessages((data ?? []) as ContactMessage[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function setRead(message: ContactMessage, read: boolean) {
    const { error: err } = await supabase
      .from('contact_messages')
      .update({ read })
      .eq('id', message.id)
    if (err) {
      notify(readError(err), 'error')
      return
    }
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read } : m)))
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const { error: err } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', deleteTarget.id)
    if (err) {
      notify(readError(err), 'error')
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      notify('Message deleted')
    }
    setDeleteTarget(null)
  }

  function toggleOpen(message: ContactMessage) {
    const next = openId === message.id ? null : message.id
    setOpenId(next)
    // Opening a message marks it read, which is what you would expect.
    if (next && !message.read) void setRead(message, true)
  }

  const visible = filter === 'unread' ? messages.filter((m) => !m.read) : messages
  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Messages</h1>
          <p className="mt-1 text-[0.9375rem] text-subtle">
            {unreadCount ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
        </div>
      </div>

      <div className="mt-7">
        {loading ? <SectionLoader /> : null}
        {error ? <ErrorNote message={error} /> : null}

        {!loading && !visible.length ? (
          <EmptyState
            title={filter === 'unread' ? 'Nothing unread' : 'No messages yet'}
            description="Submissions from the contact form arrive here."
          />
        ) : null}

        {visible.length ? (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {visible.map((message) => (
              <li key={message.id}>
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    onClick={() => toggleOpen(message)}
                    className="min-w-[160px] flex-1 text-left"
                    aria-expanded={openId === message.id}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={message.read ? 'font-medium' : 'font-semibold'}>
                        {message.subject}
                      </span>
                      {!message.read ? <Badge tone="accent">New</Badge> : null}
                    </span>
                    <span className="mt-0.5 block text-[0.875rem] text-subtle">
                      {message.name} · {message.email} · {formatDateTime(message.created_at)}
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void setRead(message, !message.read)}
                    >
                      <Icon name={message.read ? 'message' : 'check'} className="h-4 w-4" />
                      {message.read ? 'Mark unread' : 'Mark read'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(message)}>
                      <Icon name="trash" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {openId === message.id ? (
                  <div className="border-t border-line bg-soft px-4 py-4">
                    <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink">
                      {message.message}
                    </p>
                    <a
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-accent hover:underline"
                    >
                      <Icon name="mail" className="h-4 w-4" />
                      Reply by email
                    </a>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this message?"
        message="It will be permanently removed from your inbox."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
