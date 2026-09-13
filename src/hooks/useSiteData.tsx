import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { SETTINGS_DEFAULTS, type HeroLabel, type SettingsMap, type SocialLink } from '../lib/types'

/* ----------------------------- generic query ----------------------------- */

export interface QueryState<T> {
  data: T
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Small data-fetching hook. `key` is a stable string that identifies the
 * query; changing it re-runs the fetch.
 */
export function useQuery<T>(key: string, fetcher: () => Promise<T>, initial: T): QueryState<T> {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // The fetcher is redefined on every render by callers; `key` is the real
  // dependency, so the lint rule is intentionally relaxed here.
  const run = useCallback(fetcher, [key, nonce]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    run()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load content.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [run])

  return { data, loading, error, refetch: () => setNonce((n) => n + 1) }
}

/* ------------------------------ site context ----------------------------- */

interface SiteData {
  settings: SettingsMap
  socialLinks: SocialLink[]
  heroLabels: HeroLabel[]
  loading: boolean
  refresh: () => void
}

const SiteContext = createContext<SiteData | undefined>(undefined)

function mergeSettings(rows: Array<{ key: string; value: Record<string, unknown> }>): SettingsMap {
  const merged = structuredClone(SETTINGS_DEFAULTS) as unknown as Record<
    string,
    Record<string, unknown>
  >
  for (const row of rows) {
    if (merged[row.key]) Object.assign(merged[row.key], row.value ?? {})
    else merged[row.key] = row.value ?? {}
  }
  return merged as unknown as SettingsMap
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsMap>(SETTINGS_DEFAULTS)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [heroLabels, setHeroLabels] = useState<HeroLabel[]>([])
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase
        .from('social_links')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('hero_labels')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true }),
    ])
      .then(([settingsRes, socialRes, labelRes]) => {
        if (!active) return
        if (settingsRes.data) setSettings(mergeSettings(settingsRes.data as never))
        if (socialRes.data) setSocialLinks(socialRes.data as SocialLink[])
        if (labelRes.data) setHeroLabels(labelRes.data as HeroLabel[])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [nonce])

  const value = useMemo<SiteData>(
    () => ({
      settings,
      socialLinks,
      heroLabels,
      loading,
      refresh: () => setNonce((n) => n + 1),
    }),
    [settings, socialLinks, heroLabels, loading],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite(): SiteData {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used inside <SiteDataProvider>')
  return ctx
}
