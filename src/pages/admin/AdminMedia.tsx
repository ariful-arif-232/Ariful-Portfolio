import { useCallback, useEffect, useRef, useState } from 'react'
import {
  formatBytes,
  listFolder,
  MEDIA_FOLDERS,
  removeObject,
  uploadMedia,
  type MediaFolder,
  type StoredObject,
} from '../../lib/storage'
import { readError } from '../../lib/utils'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorNote,
  Icon,
  SectionLoader,
  useToast,
} from '../../components/ui'
import { cn } from '../../lib/utils'

const VIDEO_FOLDERS: MediaFolder[] = ['videos']

export default function AdminMedia() {
  const [folder, setFolder] = useState<MediaFolder>('projects')
  const [items, setItems] = useState<StoredObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StoredObject | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { notify } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listFolder(folder))
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(false)
    }
  }, [folder])

  useEffect(() => {
    void load()
  }, [load])

  const isVideoFolder = VIDEO_FOLDERS.includes(folder)

  async function upload(files: FileList) {
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file, folder, isVideoFolder ? 'video' : 'image')
      }
      await load()
      notify('Upload complete')
    } catch (err) {
      notify(readError(err), 'error')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      notify('URL copied')
    } catch {
      notify('Could not copy. Select the link and copy it manually.', 'error')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await removeObject(deleteTarget.path)
      await load()
      notify('File deleted')
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
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Media</h1>
          <p className="mt-1 text-[0.9375rem] text-subtle">
            Files stored in Supabase Storage, organised by folder.
          </p>
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={isVideoFolder ? 'video/mp4,video/webm' : 'image/*'}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void upload(e.target.files)
            }}
          />
          <Button size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Icon name="plus" className="h-4 w-4" />
            {busy ? 'Uploading…' : 'Upload to this folder'}
          </Button>
        </div>
      </div>

      <div className="thin-scroll mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {MEDIA_FOLDERS.map((name) => (
          <button
            key={name}
            onClick={() => setFolder(name)}
            aria-pressed={folder === name}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-[0.875rem] transition-colors',
              folder === name
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-surface text-subtle hover:text-ink',
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? <SectionLoader /> : null}
        {error ? <ErrorNote message={error} /> : null}

        {!loading && !items.length ? (
          <EmptyState
            title="This folder is empty"
            description="Upload files here, or they arrive automatically when you upload from a content form."
          />
        ) : null}

        {items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <figure key={item.path} className="card overflow-hidden">
                <div className="aspect-[4/3] bg-muted">
                  {isVideoFolder ? (
                    <video src={item.url} className="h-full w-full object-cover" muted playsInline controls />
                  ) : (
                    <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <figcaption className="p-3">
                  <p className="truncate text-[0.8125rem] font-medium" title={item.name}>
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-subtle">{formatBytes(item.size)}</p>
                  <div className="mt-3 flex gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => void copyUrl(item.url)}>
                      <Icon name="link" className="h-3.5 w-3.5" />
                      Copy URL
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(item)}>
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this file?"
        message="Anything still pointing at this file will show a broken image."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
