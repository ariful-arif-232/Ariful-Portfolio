import { useRef, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { contactSchema, fieldErrors } from '../lib/validation'
import { useSite } from '../hooks/useSiteData'
import { readError } from '../lib/utils'
import { Button, ErrorNote, Icon, socialIcon } from '../components/ui'
import { Seo } from '../components/layout/Seo'
import { GridRules, HeaderBackdrop } from '../components/layout/PublicLayout'

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' }

export default function Contact() {
  const { settings, socialLinks } = useSite()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [formError, setFormError] = useState<string | null>(null)

  // Bots submit near-instantly; a human takes at least a few seconds.
  const mountedAt = useRef(Date.now())

  function set(field: keyof typeof EMPTY, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const parsed = contactSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }

    if (Date.now() - mountedAt.current < 2500) {
      setFormError('That was submitted a little too quickly. Give it a moment and try again.')
      return
    }

    setStatus('sending')
    const { error } = await supabase.from('contact_messages').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    })

    if (error) {
      setStatus('idle')
      setFormError(readError(error))
      return
    }

    setStatus('sent')
    setValues(EMPTY)
    mountedAt.current = Date.now()
  }

  const contact = settings.contact

  return (
    <>
      <Seo title="Contact" description="Get in touch about work, collaboration or questions." />

      <section className="relative overflow-hidden">
        <HeaderBackdrop />
        <GridRules />
        <div className="gutter relative py-12 md:py-16">
          <p className="eyebrow flex items-center gap-2 font-medium">
            <span className="h-px w-8 bg-gradient-to-r from-accent to-transparent" aria-hidden="true" />
            Contact
          </p>
          <h1
            className="mt-3 max-w-3xl font-display font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)' }}
          >
            Let us talk about your project
          </h1>
          {contact.form_note ? <p className="prose-body mt-5">{contact.form_note}</p> : null}
        </div>
      </section>

      <section className="section-divider gutter py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            {status === 'sent' ? (
              <div className="rounded-2xl border border-[#c7f0d8] bg-[#ecfdf3] p-6">
                <p className="flex items-center gap-2 font-display text-lg font-semibold text-[#027a48]">
                  <Icon name="check" className="h-5 w-5" />
                  Message sent
                </p>
                <p className="mt-2 text-[0.9375rem] text-[#027a48]">
                  Thanks for reaching out. I will reply to the address you gave.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-5"
                  onClick={() => setStatus('idle')}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                {formError ? <ErrorNote message={formError} /> : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="name">
                      Your name
                    </label>
                    <input
                      id="name"
                      className={`input ${errors.name ? 'input-error' : ''}`}
                      value={values.name}
                      onChange={(e) => set('name', e.target.value)}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name ? (
                      <p id="name-error" className="mt-1.5 text-sm text-[#b42318]">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="field-label" htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      value={values.email}
                      onChange={(e) => set('email', e.target.value)}
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email ? (
                      <p id="email-error" className="mt-1.5 text-sm text-[#b42318]">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    className={`input ${errors.subject ? 'input-error' : ''}`}
                    value={values.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    aria-invalid={Boolean(errors.subject)}
                  />
                  {errors.subject ? (
                    <p className="mt-1.5 text-sm text-[#b42318]">{errors.subject}</p>
                  ) : null}
                </div>

                <div>
                  <label className="field-label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className={`input resize-y ${errors.message ? 'input-error' : ''}`}
                    value={values.message}
                    onChange={(e) => set('message', e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message ? (
                    <p className="mt-1.5 text-sm text-[#b42318]">{errors.message}</p>
                  ) : null}
                </div>

                {/* Honeypot: hidden from people, irresistible to bots */}
                <div aria-hidden="true" className="absolute left-[-9999px] h-0 overflow-hidden">
                  <label htmlFor="website">Leave this empty</label>
                  <input
                    id="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.website}
                    onChange={(e) => set('website', e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-line bg-soft p-5">
              <h2 className="font-display text-[1rem] font-semibold">Other ways to reach me</h2>
              <ul className="mt-4 space-y-3 text-[0.9375rem]">
                {contact.email ? (
                  <li className="flex items-start gap-3">
                    <Icon name="mail" className="mt-0.5 h-4 w-4 text-subtle" />
                    <a href={`mailto:${contact.email}`} className="break-all hover:text-accent">
                      {contact.email}
                    </a>
                  </li>
                ) : null}
                {contact.phone ? (
                  <li className="flex items-start gap-3">
                    <Icon name="phone" className="mt-0.5 h-4 w-4 text-subtle" />
                    <a href={`tel:${contact.phone}`} className="hover:text-accent">
                      {contact.phone}
                    </a>
                  </li>
                ) : null}
                {contact.whatsapp ? (
                  <li className="flex items-start gap-3">
                    <Icon name="whatsapp" className="mt-0.5 h-4 w-4 text-subtle" />
                    <a
                      href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-accent"
                    >
                      WhatsApp
                    </a>
                  </li>
                ) : null}
                {contact.location ? (
                  <li className="flex items-start gap-3">
                    <Icon name="pin" className="mt-0.5 h-4 w-4 text-subtle" />
                    <span className="text-subtle">{contact.location}</span>
                  </li>
                ) : null}
              </ul>
            </div>

            {socialLinks.length ? (
              <div className="rounded-2xl border border-line p-5">
                <h2 className="font-display text-[1rem] font-semibold">Elsewhere</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[0.875rem] text-subtle transition-colors hover:border-[#cdd5e0] hover:text-ink"
                    >
                      <Icon name={socialIcon(s.platform)} className="h-4 w-4" />
                      {s.platform}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  )
}
