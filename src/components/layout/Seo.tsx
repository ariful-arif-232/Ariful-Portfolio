import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useSite } from '../../hooks/useSiteData'
import { resolveMedia } from '../../lib/utils'

interface SeoProps {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

/**
 * Canonical URLs are built from the live origin so the same build works on a
 * GitHub Pages project URL, a custom domain, or localhost.
 */
export function Seo({ title, description, image, type = 'website', noIndex }: SeoProps) {
  const { settings } = useSite()
  const { pathname } = useLocation()

  const siteTitle = settings.seo.site_title || settings.general.site_name || 'Portfolio'
  const fullTitle = title ? `${title} — ${settings.general.site_name || siteTitle}` : siteTitle
  const desc = description || settings.seo.meta_description
  const ogImage = resolveMedia(image || settings.seo.og_image_url)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const base = import.meta.env.BASE_URL || '/'
  const canonical = `${origin}${base.replace(/\/$/, '')}${pathname}`.replace(/([^:]\/)\/+/g, '$1')

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{fullTitle}</title>
      {desc ? <meta name="description" content={desc} /> : null}
      {settings.seo.keywords ? <meta name="keywords" content={settings.seo.keywords} /> : null}
      <link rel="canonical" href={canonical} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
      {settings.general.favicon_url ? (
        <link rel="icon" href={resolveMedia(settings.general.favicon_url)} />
      ) : null}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {desc ? <meta property="og:description" content={desc} /> : null}
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={settings.general.site_name || siteTitle} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      {desc ? <meta name="twitter:description" content={desc} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
    </Helmet>
  )
}
