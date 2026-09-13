import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(200),
  subject: z.string().trim().min(2, 'Add a subject').max(200, 'Subject is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Message needs at least 10 characters')
    .max(5000, 'Message is too long'),
  // Honeypot: real people never fill this in because it is hidden.
  website: z.string().max(0, 'Submission blocked'),
})

export type ContactInput = z.infer<typeof contactSchema>

export const projectSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only'),
  short_description: z.string().max(400, 'Keep the summary under 400 characters').optional(),
})

export const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

/** Turns a ZodError into a field -> message map the forms can render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !out[key]) out[key] = issue.message
  }
  return out
}

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
]
const VIDEO_TYPES = ['video/mp4', 'video/webm']

export const FILE_RULES = {
  image: { types: IMAGE_TYPES, maxBytes: 8 * 1024 * 1024, label: 'JPG, PNG, WebP, GIF or SVG up to 8MB' },
  video: { types: VIDEO_TYPES, maxBytes: 50 * 1024 * 1024, label: 'MP4 or WebM up to 50MB' },
  pdf: { types: ['application/pdf'], maxBytes: 10 * 1024 * 1024, label: 'PDF up to 10MB' },
} as const

export type FileKind = keyof typeof FILE_RULES

/** Returns an error string, or null when the file is acceptable. */
export function validateFile(file: File, kind: FileKind): string | null {
  const rule = FILE_RULES[kind]
  if (!(rule.types as readonly string[]).includes(file.type)) {
    return `Unsupported file type. Accepted: ${rule.label}.`
  }
  if (file.size > rule.maxBytes) {
    return `File is too large. Accepted: ${rule.label}.`
  }
  return null
}
