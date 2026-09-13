import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadMedia, removeByUrl } from '../../lib/storage'
import { ResourceAdmin } from '../../components/admin/ResourceAdmin'
import type { FieldDef, FieldValues } from '../../components/admin/fields'
import { readError, resolveMedia, slugify } from '../../lib/utils'
import { Badge, Button, Icon, Spinner, useToast } from '../../components/ui'
import type { Project, ProjectImage } from '../../lib/types'

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'slug',
    label: 'Slug',
    type: 'text',
    help: 'The URL segment. Leave blank to generate it from the title.',
  },
  { name: 'category', label: 'Category', type: 'text', help: 'Used for the filter buttons.' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: ['completed', 'in-progress', 'planned', 'archived'],
  },
  { name: 'short_description', label: 'Short description', type: 'textarea', full: true },
  { name: 'full_description', label: 'Full description', type: 'longtext', full: true },
  { name: 'thumbnail_url', label: 'Thumbnail', type: 'image', folder: 'projects' },
  { name: 'hero_image_url', label: 'Hero image', type: 'image', folder: 'projects' },
  { name: 'github_url', label: 'GitHub URL', type: 'text' },
  { name: 'live_url', label: 'Live demo URL', type: 'text' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'completion_date', label: 'Completion date', type: 'date' },
  {
    name: 'technologies',
    label: 'Technologies',
    type: 'tags',
    full: true,
    placeholder: 'One per line',
  },
  {
    name: 'key_features',
    label: 'Key features',
    type: 'tags',
    full: true,
    placeholder: 'One per line',
  },
  { name: 'challenges', label: 'Challenges', type: 'textarea', full: true },
  { name: 'solutions', label: 'Solutions', type: 'textarea', full: true },
  { name: 'lessons_learned', label: 'What I learned', type: 'textarea', full: true },
  { name: 'published', label: 'Published', type: 'boolean' },
  { name: 'featured', label: 'Featured on the homepage', type: 'boolean' },
]

/** Gallery images live in their own table, so they get their own editor. */
function GalleryEditor({ project }: { project: Project | null }) {
  const [images, setImages] = useState<ProjectImage[]>([])
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { notify } = useToast()

  const load = useCallback(async () => {
    if (!project) return
    const { data } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true })
    setImages((data ?? []) as ProjectImage[])
  }, [project])

  useEffect(() => {
    void load()
  }, [load])

  if (!project) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-soft px-4 py-5 text-[0.875rem] text-subtle">
        Save the project first, then reopen it to add gallery images.
      </div>
    )
  }

  async function addFiles(files: FileList) {
    if (!project) return
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        const result = await uploadMedia(file, 'project-gallery', 'image')
        const { error } = await supabase.from('project_images').insert({
          project_id: project.id,
          image_url: result.url,
          display_order: images.length + 1,
        })
        if (error) throw error
      }
      await load()
      notify('Gallery updated')
    } catch (err) {
      notify(readError(err), 'error')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function updateCaption(id: string, caption: string) {
    await supabase.from('project_images').update({ caption }).eq('id', id)
  }

  async function removeImage(image: ProjectImage) {
    try {
      const { error } = await supabase.from('project_images').delete().eq('id', image.id)
      if (error) throw error
      await removeByUrl(image.image_url)
      await load()
      notify('Image removed')
    } catch (err) {
      notify(readError(err), 'error')
    }
  }

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-[0.9375rem] font-semibold">Gallery</h3>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files)
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Spinner label="Uploading" /> : 'Add images'}
        </Button>
      </div>

      {images.length ? (
        <ul className="mt-4 space-y-3">
          {images.map((image) => (
            <li key={image.id} className="flex items-center gap-3">
              <img
                src={resolveMedia(image.image_url)}
                alt=""
                className="h-14 w-20 shrink-0 rounded-lg border border-line object-cover"
              />
              <input
                defaultValue={image.caption ?? ''}
                placeholder="Caption (optional)"
                onBlur={(e) => void updateCaption(image.id, e.target.value)}
                className="input flex-1 py-2 text-[0.8125rem]"
              />
              <Button variant="danger" size="sm" onClick={() => void removeImage(image)}>
                <Icon name="trash" className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[0.875rem] text-subtle">No gallery images yet.</p>
      )}
    </div>
  )
}

export default function AdminProjects() {
  return (
    <ResourceAdmin<Project & { [key: string]: unknown }>
      title="Projects"
      description="Create, publish, feature and reorder your work."
      table="projects"
      singular="Project"
      fields={FIELDS}
      requiredFields={['title']}
      transform={(values: FieldValues) => {
        // A blank slug is generated from the title so the URL is never broken.
        const slug = String(values.slug ?? '').trim()
        return { ...values, slug: slug ? slugify(slug) : slugify(String(values.title ?? '')) }
      }}
      primary={(row) => row.title}
      secondary={(row) => `/projects/${row.slug}`}
      badges={(row) => (
        <>
          {row.featured ? <Badge tone="accent">Featured</Badge> : null}
          <Badge tone={row.published ? 'live' : 'neutral'}>
            {row.published ? 'Published' : 'Draft'}
          </Badge>
        </>
      )}
      renderExtra={(row) => <GalleryEditor project={row} />}
    />
  )
}
