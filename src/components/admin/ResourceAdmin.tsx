import { useMemo, useState, type ReactNode } from 'react'
import { useCrud } from '../../hooks/useContent'
import { readError } from '../../lib/utils'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorNote,
  Icon,
  Modal,
  SectionLoader,
  useToast,
} from '../ui'
import { Field, emptyValues, type FieldDef, type FieldValues } from './fields'

export interface ResourceRow {
  id: string
  display_order?: number
  active?: boolean
  [key: string]: unknown
}

interface ResourceAdminProps<T extends ResourceRow> {
  title: string
  description?: string
  table: string
  fields: FieldDef[]
  /** Renders the main label for a row in the list. */
  primary: (row: T) => ReactNode
  /** Renders the supporting line under the label. */
  secondary?: (row: T) => ReactNode
  /** Extra badges shown against a row. */
  badges?: (row: T) => ReactNode
  singular: string
  /** Fields required before save, mapped to a friendly message. */
  requiredFields?: string[]
  /** Hook to adjust values immediately before they hit the database. */
  transform?: (values: FieldValues, isNew: boolean) => FieldValues
  /** Extra controls rendered inside the edit dialog, below the fields. */
  renderExtra?: (row: T | null) => ReactNode
}

export function ResourceAdmin<T extends ResourceRow>({
  title,
  description,
  table,
  fields,
  primary,
  secondary,
  badges,
  singular,
  requiredFields = [],
  transform,
  renderExtra,
}: ResourceAdminProps<T>) {
  const crud = useCrud<T>(table)
  const { notify } = useToast()

  const [editing, setEditing] = useState<T | null>(null)
  const [creating, setCreating] = useState(false)
  const [values, setValues] = useState<FieldValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)

  const open = creating || editing !== null
  const hasActiveFlag = useMemo(() => fields.some((f) => f.name === 'active'), [fields])

  function startCreate() {
    setValues(emptyValues(fields, { active: true }))
    setErrors({})
    setCreating(true)
    setEditing(null)
  }

  function startEdit(row: T) {
    const next: FieldValues = {}
    for (const field of fields) {
      const raw = row[field.name]
      if (field.type === 'tags') next[field.name] = Array.isArray(raw) ? raw : []
      else if (field.type === 'boolean') next[field.name] = Boolean(raw)
      else next[field.name] = raw ?? ''
    }
    setValues(next)
    setErrors({})
    setEditing(row)
    setCreating(false)
  }

  function close() {
    setCreating(false)
    setEditing(null)
    setErrors({})
  }

  async function save() {
    const found: Record<string, string> = {}
    for (const name of requiredFields) {
      const value = values[name]
      if (value === null || value === undefined || String(value).trim() === '') {
        const label = fields.find((f) => f.name === name)?.label ?? name
        found[name] = `${label} is required`
      }
    }
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }

    setSaving(true)
    try {
      const payload = transform ? transform({ ...values }, creating) : values
      // Empty date strings must become NULL or Postgres rejects them.
      const cleaned: FieldValues = {}
      for (const field of fields) {
        const value = payload[field.name]
        cleaned[field.name] =
          (field.type === 'date' || field.type === 'number') && value === '' ? null : value
      }

      if (creating) {
        await crud.create(cleaned as Partial<T>)
        notify(`${singular} created`)
      } else if (editing) {
        await crud.update(editing.id, cleaned as Partial<T>)
        notify(`${singular} updated`)
      }
      close()
    } catch (err) {
      notify(readError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(row: T) {
    try {
      await crud.update(row.id, { active: !row.active } as Partial<T>)
      notify(row.active ? `${singular} hidden` : `${singular} visible`)
    } catch (err) {
      notify(readError(err), 'error')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await crud.remove(deleteTarget.id)
      notify(`${singular} deleted`)
    } catch (err) {
      notify(readError(err), 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
          {description ? <p className="mt-1 text-[0.9375rem] text-subtle">{description}</p> : null}
        </div>
        <Button size="sm" onClick={startCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Add {singular.toLowerCase()}
        </Button>
      </div>

      <div className="mt-7">
        {crud.loading ? <SectionLoader /> : null}
        {crud.error ? <ErrorNote message={crud.error} /> : null}

        {!crud.loading && !crud.rows.length ? (
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            description={`Add your first ${singular.toLowerCase()} and it appears on the site straight away.`}
            action={
              <Button size="sm" onClick={startCreate}>
                Add {singular.toLowerCase()}
              </Button>
            }
          />
        ) : null}

        {crud.rows.length ? (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {crud.rows.map((row, index) => (
              <li key={row.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="flex shrink-0 flex-col">
                  <button
                    onClick={() => void crud.move(row.id, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="rounded p-0.5 text-subtle hover:bg-soft hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow-up" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => void crud.move(row.id, 1)}
                    disabled={index === crud.rows.length - 1}
                    aria-label="Move down"
                    className="rounded p-0.5 text-subtle hover:bg-soft hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow-down" className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="min-w-[160px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{primary(row)}</p>
                    {badges?.(row)}
                    {hasActiveFlag && !row.active ? <Badge>Hidden</Badge> : null}
                  </div>
                  {secondary ? (
                    <p className="mt-0.5 text-[0.875rem] text-subtle">{secondary(row)}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {hasActiveFlag ? (
                    <Button variant="ghost" size="sm" onClick={() => void toggleActive(row)}>
                      <Icon name="eye" className="h-4 w-4" />
                      {row.active ? 'Hide' : 'Show'}
                    </Button>
                  ) : null}
                  <Button variant="secondary" size="sm" onClick={() => startEdit(row)}>
                    <Icon name="edit" className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
                    <Icon name="trash" className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={close}
        wide
        title={creating ? `Add ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.full ? 'sm:col-span-2' : undefined}>
              <Field
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={(next) => {
                  setValues((v) => ({ ...v, [field.name]: next }))
                  if (errors[field.name]) setErrors((e) => ({ ...e, [field.name]: '' }))
                }}
              />
            </div>
          ))}
        </div>

        {renderExtra ? <div className="mt-6">{renderExtra(editing)}</div> : null}

        <div className="mt-7 flex justify-end gap-2 border-t border-line pt-5">
          <Button variant="secondary" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : creating ? `Create ${singular.toLowerCase()}` : 'Save changes'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete this ${singular.toLowerCase()}?`}
        message="This removes it from the site immediately and cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
