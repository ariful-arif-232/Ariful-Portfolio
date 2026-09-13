import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { readError } from '../lib/utils'
import { useQuery } from './useSiteData'
import type {
  Education,
  Experience,
  Project,
  ProjectImage,
  Service,
  Skill,
} from '../lib/types'

/* ------------------------------ public reads ----------------------------- */

export function useProjects(options?: { featuredOnly?: boolean; limit?: number }) {
  const featured = options?.featuredOnly ? 'featured' : 'all'
  const limit = options?.limit ?? 0
  return useQuery<Project[]>(
    `projects:${featured}:${limit}`,
    async () => {
      let q = supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (options?.featuredOnly) q = q.eq('featured', true)
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Project[]
    },
    [],
  )
}

export function useProject(slug: string | undefined) {
  return useQuery<{ project: Project | null; images: ProjectImage[]; related: Project[] }>(
    `project:${slug ?? ''}`,
    async () => {
      if (!slug) return { project: null, images: [], related: [] }

      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle()
      if (error) throw error
      if (!project) return { project: null, images: [], related: [] }

      const typed = project as Project
      const [imagesRes, relatedRes] = await Promise.all([
        supabase
          .from('project_images')
          .select('*')
          .eq('project_id', typed.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .eq('category', typed.category)
          .neq('id', typed.id)
          .order('display_order', { ascending: true })
          .limit(3),
      ])

      return {
        project: typed,
        images: (imagesRes.data ?? []) as ProjectImage[],
        related: (relatedRes.data ?? []) as Project[],
      }
    },
    { project: null, images: [], related: [] },
  )
}

export function useSkills() {
  return useQuery<Skill[]>(
    'skills',
    async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as Skill[]
    },
    [],
  )
}

export function useExperiences() {
  return useQuery<Experience[]>(
    'experiences',
    async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as Experience[]
    },
    [],
  )
}

export function useEducation() {
  return useQuery<Education[]>(
    'education',
    async () => {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as Education[]
    },
    [],
  )
}

export function useServices() {
  return useQuery<Service[]>(
    'services',
    async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as Service[]
    },
    [],
  )
}

/* ------------------------------ admin CRUD ------------------------------- */

export interface CrudState<T> {
  rows: T[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  create: (values: Partial<T>) => Promise<T>
  update: (id: string, values: Partial<T>) => Promise<T>
  remove: (id: string) => Promise<void>
  move: (id: string, direction: -1 | 1) => Promise<void>
}

interface Orderable {
  id: string
  display_order?: number
}

/**
 * Generic table CRUD used by every admin resource screen. Reordering writes
 * display_order for the swapped pair so the public site order is real.
 */
export function useCrud<T extends Orderable>(
  table: string,
  orderColumn = 'display_order',
): CrudState<T> {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .order(orderColumn, { ascending: true })
    if (err) setError(readError(err))
    setRows((data ?? []) as T[])
    setLoading(false)
  }, [table, orderColumn])

  useEffect(() => {
    void reload()
  }, [reload])

  const create = useCallback(
    async (values: Partial<T>) => {
      const nextOrder = rows.length
        ? Math.max(...rows.map((r) => r.display_order ?? 0)) + 1
        : 1
      const payload = { display_order: nextOrder, ...values }
      const { data, error: err } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single()
      if (err) throw err
      await reload()
      return data as T
    },
    [table, rows, reload],
  )

  const update = useCallback(
    async (id: string, values: Partial<T>) => {
      const { data, error: err } = await supabase
        .from(table)
        .update(values as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      await reload()
      return data as T
    },
    [table, reload],
  )

  const remove = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from(table).delete().eq('id', id)
      if (err) throw err
      await reload()
    },
    [table, reload],
  )

  const move = useCallback(
    async (id: string, direction: -1 | 1) => {
      const index = rows.findIndex((r) => r.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= rows.length) return

      const a = rows[index]
      const b = rows[target]
      const orderA = a.display_order ?? index
      const orderB = b.display_order ?? target

      // Swap the two rows' positions. Equal values would leave order ambiguous,
      // so nudge by one when they collide.
      const [nextA, nextB] = orderA === orderB ? [orderB + direction, orderA] : [orderB, orderA]

      await Promise.all([
        supabase.from(table).update({ display_order: nextA }).eq('id', a.id),
        supabase.from(table).update({ display_order: nextB }).eq('id', b.id),
      ])
      await reload()
    },
    [rows, table, reload],
  )

  return { rows, loading, error, reload, create, update, remove, move }
}
