import { supabase, MEDIA_BUCKET, RESUME_BUCKET } from './supabase'
import { validateFile, type FileKind } from './validation'

export const MEDIA_FOLDERS = [
  'projects',
  'project-gallery',
  'profile',
  'hero',
  'videos',
  'logos',
  'seo',
] as const

export type MediaFolder = (typeof MEDIA_FOLDERS)[number]

function uniqueName(file: File): string {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin'
  const stem = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'file'
  const stamp = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${stem}-${stamp}${rand}.${ext}`
}

export interface UploadResult {
  url: string
  path: string
  bucket: string
}

/** Uploads to the media bucket under an organised folder and returns a public URL. */
export async function uploadMedia(
  file: File,
  folder: MediaFolder,
  kind: FileKind = 'image',
): Promise<UploadResult> {
  const problem = validateFile(file, kind)
  if (problem) throw new Error(problem)

  const path = `${folder}/${uniqueName(file)}`
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path, bucket: MEDIA_BUCKET }
}

/** Uploads the resume PDF to its own bucket. */
export async function uploadResume(file: File): Promise<UploadResult> {
  const problem = validateFile(file, 'pdf')
  if (problem) throw new Error(problem)

  const path = `resume/${uniqueName(file)}`
  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path, bucket: RESUME_BUCKET }
}

/**
 * Maps a public URL back to its bucket + object path so old files can be
 * removed when they are replaced. Returns null for anything not stored here.
 */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  if (!url) return null
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (!match) return null
  return { bucket: match[1], path: decodeURIComponent(match[2]) }
}

/** Best-effort cleanup of a replaced file. Never throws. */
export async function removeByUrl(url: string | null | undefined): Promise<void> {
  const parsed = url ? parseStorageUrl(url) : null
  if (!parsed) return
  await supabase.storage.from(parsed.bucket).remove([parsed.path])
}

export interface StoredObject {
  name: string
  path: string
  url: string
  size: number
  updatedAt: string | null
  folder: string
}

/** Lists the contents of one media folder for the admin media library. */
export async function listFolder(folder: string): Promise<StoredObject[]> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
  if (error) throw error

  return (data ?? [])
    .filter((item) => item.id !== null)
    .map((item) => {
      const path = `${folder}/${item.name}`
      const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
      return {
        name: item.name,
        path,
        url: pub.publicUrl,
        size: (item.metadata?.size as number) ?? 0,
        updatedAt: item.updated_at ?? null,
        folder,
      }
    })
}

export async function removeObject(path: string): Promise<void> {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path])
  if (error) throw error
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
