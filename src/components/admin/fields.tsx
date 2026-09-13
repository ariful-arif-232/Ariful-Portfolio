import { useRef, useState } from 'react'
import { removeByUrl, uploadMedia, uploadResume, type MediaFolder } from '../../lib/storage'
import { readError, resolveMedia } from '../../lib/utils'
import { Button, Icon, Spinner } from '../ui'
import type { FileKind } from '../../lib/validation'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'longtext'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'tags'
  | 'image'
  | 'video'
  | 'pdf'
  | 'color'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  help?: string
  required?: boolean
  options?: string[]
  folder?: MediaFolder
  placeholder?: string
  /** Renders the field across both columns of the form grid. */
  full?: boolean
}

export type FieldValues = Record<string, unknown>

/* ------------------------------ media field ------------------------------ */

const KIND_BY_TYPE: Record<'image' | 'video' | 'pdf', FileKind> = {
  image: 'image',
  video: 'video',
  pdf: 'pdf',
}

function MediaField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string
  onChange: (next: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const kind = KIND_BY_TYPE[field.type as 'image' | 'video' | 'pdf']
  const accept =
    kind === 'image' ? 'image/*' : kind === 'video' ? 'video/mp4,video/webm' : 'application/pdf'

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    const previous = value
    try {
      const result =
        kind === 'pdf'
          ? await uploadResume(file)
          : await uploadMedia(file, field.folder ?? 'projects', kind)
      onChange(result.url)
      // Replacing a file should not leave the old one behind in the bucket.
      if (previous && previous !== result.url) await removeByUrl(previous)
    } catch (err) {
      setError(readError(err))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    const previous = value
    onChange('')
    await removeByUrl(previous)
  }

  return (
    <div>
      <label className="field-label">{field.label}</label>

      {value ? (
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-line bg-soft p-3">
          {field.type === 'image' ? (
            <img
              src={resolveMedia(value)}
              alt=""
              className="h-16 w-16 rounded-lg border border-line object-cover"
            />
          ) : field.type === 'video' ? (
            <video src={resolveMedia(value)} className="h-16 w-24 rounded-lg object-cover" muted playsInline controls />
          ) : (
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-lg border border-line bg-white text-subtle">
              <Icon name="download" className="h-5 w-5" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <a
              href={resolveMedia(value)}
              target="_blank"
              rel="noreferrer noopener"
              className="block break-all text-[0.8125rem] text-accent hover:underline"
            >
              {value.split('/').pop()}
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] text-[#b42318] hover:underline"
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Spinner label="Uploading" /> : value ? 'Replace file' : 'Upload file'}
        </Button>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste a URL"
          className="input flex-1 min-w-[180px] py-2 text-[0.8125rem]"
        />
      </div>

      {field.help ? <p className="mt-1.5 text-[0.8125rem] text-subtle">{field.help}</p> : null}
      {error ? <p className="mt-1.5 text-[0.8125rem] text-[#b42318]">{error}</p> : null}
    </div>
  )
}

/* ------------------------------ field switch ----------------------------- */

export function Field({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldDef
  value: unknown
  onChange: (next: unknown) => void
  error?: string
}) {
  const id = `field-${field.name}`

  if (field.type === 'image' || field.type === 'video' || field.type === 'pdf') {
    return <MediaField field={field} value={(value as string) ?? ''} onChange={onChange} />
  }

  if (field.type === 'boolean') {
    return (
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-line text-accent focus:ring-accent"
        />
        <span>
          <span className="block text-sm font-medium text-ink">{field.label}</span>
          {field.help ? <span className="mt-0.5 block text-[0.8125rem] text-subtle">{field.help}</span> : null}
        </span>
      </label>
    )
  }

  const common = {
    id,
    'aria-invalid': Boolean(error),
    className: `input ${error ? 'input-error' : ''}`,
  }

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {field.label}
        {field.required ? <span className="text-[#b42318]"> *</span> : null}
      </label>

      {field.type === 'select' ? (
        <select {...common} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' || field.type === 'longtext' ? (
        <textarea
          {...common}
          className={`${common.className} resize-y`}
          rows={field.type === 'longtext' ? 9 : 4}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'tags' ? (
        <textarea
          {...common}
          className={`${common.className} resize-y`}
          rows={3}
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          placeholder={field.placeholder ?? 'One per line'}
          onChange={(e) =>
            onChange(
              e.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
        />
      ) : field.type === 'color' ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(value as string) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-white p-1"
            aria-label={field.label}
          />
          <input
            {...common}
            className={`${common.className} flex-1`}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <input
          {...common}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value === null || value === undefined ? '' : String(value)}
          placeholder={field.placeholder}
          onChange={(e) =>
            onChange(
              field.type === 'number'
                ? e.target.value === ''
                  ? null
                  : Number(e.target.value)
                : e.target.value,
            )
          }
        />
      )}

      {field.help ? <p className="mt-1.5 text-[0.8125rem] text-subtle">{field.help}</p> : null}
      {error ? <p className="mt-1.5 text-[0.8125rem] text-[#b42318]">{error}</p> : null}
    </div>
  )
}

/** Builds an empty value object from a field list. */
export function emptyValues(fields: FieldDef[], extra: FieldValues = {}): FieldValues {
  const out: FieldValues = {}
  for (const field of fields) {
    if (field.type === 'boolean') out[field.name] = false
    else if (field.type === 'tags') out[field.name] = []
    else if (field.type === 'number') out[field.name] = null
    else if (field.type === 'select') out[field.name] = field.options?.[0] ?? ''
    else out[field.name] = ''
  }
  return { ...out, ...extra }
}
