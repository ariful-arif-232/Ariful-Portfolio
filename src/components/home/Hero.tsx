import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSite } from '../../hooks/useSiteData'
import { cn, resolveMedia } from '../../lib/utils'
import { Icon, LinkButton, socialIcon } from '../ui'
import { GridRules } from '../layout/PublicLayout'
import type { LabelPosition } from '../../lib/types'

/** Fallback portrait shipped with the repo; replaceable from Admin > Settings. */
const DEFAULT_PORTRAIT = 'media/profile.png'

const LABEL_PLACEMENT: Record<LabelPosition, string> = {
  'top-left': 'left-0 top-[12%] sm:left-2',
  'top-right': 'right-0 top-[6%]',
  'mid-left': 'left-0 top-[46%]',
  'mid-right': 'right-0 top-[40%]',
  'bottom-left': 'left-[4%] bottom-[20%]',
  'bottom-right': 'right-[2%] bottom-[12%]',
}

function useIsNarrow(query = '(max-width: 767px)') {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setNarrow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return narrow
}

export function Hero() {
  const { settings, socialLinks, heroLabels } = useSite()
  const reduceMotion = useReducedMotion()
  const isNarrow = useIsNarrow()
  const hero = settings.hero

  const portrait = resolveMedia(hero.image_url) || resolveMedia(DEFAULT_PORTRAIT)
  const poster = resolveMedia(hero.video_poster_url)
  const videoUrl = resolveMedia(hero.video_url)
  const resumeUrl = resolveMedia(settings.resume.url || settings.about.resume_url)

  // Video is skipped on small screens and under reduced-motion; the poster
  // (or nothing at all) stands in, so weak devices never download it.
  const showVideo = Boolean(hero.video_enabled && videoUrl && !reduceMotion && !isNarrow)
  const showPoster = Boolean(hero.video_enabled && poster && !showVideo)

  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <section className="relative overflow-hidden" aria-label="Introduction">
      {showVideo ? (
        <div className="absolute inset-0" aria-hidden="true">
          <video
            className="h-full w-full object-cover"
            src={videoUrl}
            poster={poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          {/* Keeps type legible no matter how busy the footage is */}
          <div className="absolute inset-0 bg-white/78" />
        </div>
      ) : null}

      {showPoster ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-white/78" />
        </div>
      ) : null}

      <GridRules />

      <div className="gutter relative grid items-center gap-8 pb-14 pt-10 md:pb-20 md:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* ---------------------------- Left column ---------------------------- */}
        <motion.div
          {...fade}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1"
        >
          {hero.availability_active && hero.availability_text ? (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c7f0d8] bg-[#ecfdf3] px-3 py-1.5 text-[0.8125rem] font-medium text-[#027a48]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#12b76a] opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#12b76a]" />
              </span>
              {hero.availability_text}
            </p>
          ) : null}

          {hero.greeting ? <p className="eyebrow">{hero.greeting}</p> : null}

          <h1
            className="mt-2 font-display font-bold leading-[0.94] tracking-[-0.035em]"
            style={{ fontSize: 'clamp(2.75rem, 9vw, 5.25rem)' }}
          >
            {hero.name}
            <span className="text-accent">.</span>
          </h1>

          {hero.title ? (
            <p
              className="mt-4 font-display font-medium text-ink/85"
              style={{ fontSize: 'clamp(1.0625rem, 2.4vw, 1.375rem)' }}
            >
              {hero.title}
            </p>
          ) : null}

          {hero.intro ? <p className="prose-body mt-5">{hero.intro}</p> : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton to="/projects">
              {hero.cta_projects || 'View projects'}
              <Icon name="arrow-right" className="h-4 w-4" />
            </LinkButton>
            <LinkButton to="/contact" variant="secondary">
              {hero.cta_contact || 'Contact me'}
            </LinkButton>
            {resumeUrl ? (
              <LinkButton href={resumeUrl} variant="ghost" external>
                <Icon name="download" className="h-4 w-4" />
                {hero.cta_resume || 'Download resume'}
              </LinkButton>
            ) : null}
          </div>

          {socialLinks.length ? (
            <div className="mt-9 flex items-center gap-3 border-t border-line pt-6">
              <span className="text-sm text-subtle">Find me on</span>
              <div className="flex flex-wrap gap-1.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.platform}
                    className="rounded-lg p-2 text-subtle transition-colors duration-200 hover:bg-soft hover:text-ink"
                  >
                    <Icon name={socialIcon(s.platform)} />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* ---------------------------- Right column --------------------------- */}
        <motion.div
          {...fade}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 lg:order-2"
        >
          <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
            {/* Soft halo grounds the cut-out portrait without a hard image frame */}
            <div
              className="absolute inset-x-[8%] bottom-[6%] top-[10%] rounded-[999px] bg-gradient-to-b from-[#eef2f8] to-transparent blur-2xl"
              aria-hidden="true"
            />

            <img
              src={portrait}
              alt={hero.name ? `${hero.name}, ${hero.title}` : 'Profile portrait'}
              width={668}
              height={720}
              loading="eager"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ fetchpriority: 'high' } as any)}
              // Capped on phones so the name and CTAs are not pushed below the fold
              className="portrait-fade relative mx-auto max-h-[40vh] w-full max-w-[420px] object-contain sm:max-h-[52vh] lg:max-h-none lg:max-w-[500px]"
            />

            {heroLabels.map((label, i) => (
              <motion.span
                key={label.id}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.35 + i * 0.09 }}
                className={cn(
                  'absolute z-10 rounded-lg bg-ink px-3 py-1.5 text-[0.75rem] font-medium text-white shadow-lift sm:text-[0.8125rem]',
                  LABEL_PLACEMENT[label.position] ?? LABEL_PLACEMENT['top-left'],
                )}
              >
                {label.text}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
