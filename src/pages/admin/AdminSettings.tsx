import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSite } from '../../hooks/useSiteData'
import { readError } from '../../lib/utils'
import { Button, Icon, useToast } from '../../components/ui'
import { Field, type FieldDef, type FieldValues } from '../../components/admin/fields'
import { ResourceAdmin } from '../../components/admin/ResourceAdmin'
import { cn } from '../../lib/utils'
import type { HeroLabel, SettingsKey } from '../../lib/types'

interface Group {
  key: SettingsKey | 'hero-labels'
  label: string
  description: string
  fields?: FieldDef[]
}

const GROUPS: Group[] = [
  {
    key: 'general',
    label: 'General',
    description: 'Site name, logo, favicon and footer.',
    fields: [
      { name: 'site_name', label: 'Site name', type: 'text' },
      { name: 'logo_url', label: 'Logo', type: 'image', folder: 'logos' },
      { name: 'favicon_url', label: 'Favicon', type: 'image', folder: 'logos' },
      { name: 'footer_text', label: 'Footer text', type: 'textarea', full: true },
    ],
  },
  {
    key: 'hero',
    label: 'Hero',
    description: 'Everything in the top section of the homepage.',
    fields: [
      { name: 'greeting', label: 'Greeting', type: 'text' },
      { name: 'name', label: 'Your name', type: 'text' },
      { name: 'title', label: 'Professional title', type: 'text', full: true },
      { name: 'intro', label: 'Intro paragraph', type: 'textarea', full: true },
      { name: 'availability_text', label: 'Availability text', type: 'text' },
      { name: 'availability_active', label: 'Show availability badge', type: 'boolean' },
      { name: 'cta_projects', label: 'Projects button label', type: 'text' },
      { name: 'cta_contact', label: 'Contact button label', type: 'text' },
      { name: 'cta_resume', label: 'Resume button label', type: 'text' },
      {
        name: 'image_url',
        label: 'Hero portrait',
        type: 'image',
        folder: 'hero',
        full: true,
        help: 'A PNG with a transparent background works best. Leave blank to use the bundled portrait.',
      },
      {
        name: 'video_url',
        label: 'Background video',
        type: 'video',
        folder: 'videos',
        full: true,
        help: 'Optional. Muted, looping and hidden on phones and under reduced-motion settings.',
      },
      { name: 'video_poster_url', label: 'Video poster image', type: 'image', folder: 'videos', full: true },
      { name: 'video_enabled', label: 'Enable background video', type: 'boolean', full: true },
    ],
  },
  { key: 'hero-labels', label: 'Hero labels', description: 'The floating tags around your portrait.' },
  {
    key: 'about',
    label: 'About',
    description: 'Bio, role, location and the About page.',
    fields: [
      { name: 'short_bio', label: 'Short bio', type: 'textarea', full: true },
      { name: 'full_bio', label: 'Full bio', type: 'longtext', full: true, help: 'Separate paragraphs with a blank line.' },
      { name: 'role', label: 'Current role', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'experience_years', label: 'Years of experience', type: 'text' },
      { name: 'image_url', label: 'About image', type: 'image', folder: 'profile' },
    ],
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'How people reach you.',
    fields: [
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp number', type: 'text', help: 'Digits only, including country code.' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'form_note', label: 'Note above the form', type: 'textarea', full: true },
    ],
  },
  {
    key: 'resume',
    label: 'Resume',
    description: 'The PDF behind every resume button.',
    fields: [
      { name: 'url', label: 'Resume PDF', type: 'pdf', full: true },
      { name: 'filename', label: 'Display name', type: 'text', full: true },
    ],
  },
  {
    key: 'seo',
    label: 'SEO',
    description: 'Titles, description and social preview image.',
    fields: [
      { name: 'site_title', label: 'Default page title', type: 'text', full: true },
      { name: 'meta_description', label: 'Meta description', type: 'textarea', full: true },
      { name: 'keywords', label: 'Keywords', type: 'text', full: true, help: 'Comma separated.' },
      { name: 'og_image_url', label: 'Open Graph image', type: 'image', folder: 'seo', full: true },
    ],
  },
  {
    key: 'theme',
    label: 'Theme',
    description: 'Accent and background colours.',
    fields: [
      { name: 'outer_bg', label: 'Outer background', type: 'color' },
      { name: 'accent', label: 'Primary accent', type: 'color' },
      { name: 'micro_accent', label: 'Micro accent', type: 'color' },
    ],
  },
]

const LABEL_FIELDS: FieldDef[] = [
  { name: 'text', label: 'Label text', type: 'text', required: true },
  {
    name: 'position',
    label: 'Position',
    type: 'select',
    options: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
  },
  { name: 'active', label: 'Show on the site', type: 'boolean', full: true },
]

function GroupForm({ group }: { group: Group }) {
  const { settings, refresh } = useSite()
  const { notify } = useToast()
  const [values, setValues] = useState<FieldValues>({})
  const [saving, setSaving] = useState(false)

  const stored = settings[group.key as SettingsKey] as unknown as FieldValues

  useEffect(() => {
    setValues({ ...(stored ?? {}) })
    // Reload the form when the tab or the underlying settings change.
  }, [group.key, stored])

  async function save() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: group.key, value: values }, { onConflict: 'key' })
      if (error) throw error
      refresh()
      notify('Settings saved')
    } catch (err) {
      notify(readError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {group.fields?.map((field) => (
          <div key={field.name} className={field.full ? 'sm:col-span-2' : undefined}>
            <Field
              field={field}
              value={values[field.name]}
              onChange={(next) => setValues((v) => ({ ...v, [field.name]: next }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-line pt-5">
        <Button size="sm" onClick={() => void save()} disabled={saving}>
          <Icon name="check" className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const [active, setActive] = useState<Group>(GROUPS[0])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Settings</h1>
      <p className="mt-1 text-[0.9375rem] text-subtle">
        Text, images and colours across the public site.
      </p>

      <div className="thin-scroll mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {GROUPS.map((group) => (
          <button
            key={group.key}
            onClick={() => setActive(group)}
            aria-pressed={active.key === group.key}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-[0.875rem] transition-colors',
              active.key === group.key
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-surface text-subtle hover:text-ink',
            )}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="mb-5 text-[0.9375rem] text-subtle">{active.description}</p>

        {active.key === 'hero-labels' ? (
          <ResourceAdmin<HeroLabel & { [key: string]: unknown }>
            title="Hero labels"
            table="hero_labels"
            singular="Label"
            fields={LABEL_FIELDS}
            requiredFields={['text']}
            primary={(row) => row.text}
            secondary={(row) => row.position}
          />
        ) : (
          <GroupForm group={active} />
        )}
      </div>
    </div>
  )
}
