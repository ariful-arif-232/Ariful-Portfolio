import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from 'framer-motion'
import { cn } from '../../lib/utils'

/* --------------------------------- Reveal -------------------------------- */

const REVEAL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

/** Fades and lifts children into view once as they cross the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'article'
}) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    const El = Tag
    return <El className={className}>{children}</El>
  }
  const MotionTag = motion[Tag]
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={REVEAL_VARIANTS}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Container that staggers its `RevealItem` children into view as a group.
 * The container owns the single viewport trigger; items inherit it.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ staggerChildren: stagger }}
    >
      {children}
    </motion.div>
  )
}

/** A single staggered item — use inside `RevealGroup`, one per card/row. */
export function RevealItem({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
}) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    const El = Tag
    return <El className={className}>{children}</El>
  }
  const MotionTag = motion[Tag]
  return (
    <MotionTag className={className} variants={REVEAL_VARIANTS}>
      {children}
    </MotionTag>
  )
}

/* --------------------------------- Tilt ---------------------------------- */

/**
 * Wraps children in a subtle mouse-driven 3D tilt, the kind of quiet depth
 * cue used on premium product/portfolio sites. No-ops for touch input and
 * under reduced-motion, so it never fights a tap or a scroll.
 */
export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const reduceMotion = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const springX = useSpring(px, { stiffness: 260, damping: 24 })
  const springY = useSpring(py, { stiffness: 260, damping: 24 })
  const rotateX = useTransform(springY, [0, 1], [max, -max])
  const rotateY = useTransform(springX, [0, 1], [-max, max])

  if (reduceMotion) return <div className={className}>{children}</div>

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }
  function onLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------ Browser frame ----------------------------- */

/** A quiet browser-window chrome for presenting screenshots — on-brand for a dev portfolio. */
export function BrowserFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-line bg-surface', className)}>
      <div className="flex items-center gap-3 border-b border-line bg-soft px-3.5 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-ember/70" />
          <span className="h-2 w-2 rounded-full bg-accent/70" />
          <span className="h-2 w-2 rounded-full bg-teal/70" />
        </div>
        <div className="h-4 flex-1 rounded-full bg-line/60" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}

/* -------------------------------- Magnetic -------------------------------- */

/**
 * Pulls the wrapped element a few pixels toward the cursor as it approaches,
 * the "magnetic button" cue common to premium product sites. Mouse-only,
 * no-ops under reduced motion.
 */
function useMagnetic(strength = 0.35) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 })

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    if (reduceMotion || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }
  function onPointerLeave() {
    x.set(0)
    y.set(0)
  }

  return { style: { x: sx, y: sy }, onPointerMove, onPointerLeave }
}

/* -------------------------------- Button -------------------------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'invert'
type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  primary: 'btn-glow text-white border border-transparent',
  secondary: 'bg-surface text-ink border border-line hover:border-accent/40 hover:bg-accent-soft/60',
  ghost: 'bg-transparent text-subtle border border-transparent hover:text-ink hover:bg-soft',
  danger: 'bg-white text-[#b42318] border border-[#fecdca] hover:bg-[#fef3f2]',
  // For buttons placed on dark sections (e.g. the closing contact CTA)
  invert: 'bg-white/10 text-white border border-white/15 backdrop-blur-sm hover:bg-white/15 hover:border-white/30',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[0.8125rem] gap-1.5',
  md: 'px-5 py-3 text-[0.9375rem] gap-2',
}

const BUTTON_BASE =
  'group inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ' +
  '[&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg:last-child]:translate-x-0.5 ' +
  'disabled:cursor-not-allowed disabled:opacity-55'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return <button className={cn(BUTTON_BASE, VARIANTS[variant], SIZES[size], className)} {...props} />
}

interface LinkButtonProps {
  to?: string
  href?: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  external?: boolean
  download?: boolean
  ariaLabel?: string
}

export function LinkButton({
  to,
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  external,
  download,
  ariaLabel,
}: LinkButtonProps) {
  const classes = cn(BUTTON_BASE, VARIANTS[variant], SIZES[size], className)
  // Only the primary CTA gets the magnetic pull — enough to feel intentional
  // without turning every link on the page into a moving target.
  const magnetic = useMagnetic(0.3)
  const magnetProps = variant === 'primary' ? magnetic : undefined

  if (to) {
    return (
      <motion.div className="inline-block" style={magnetProps?.style}>
        <Link
          to={to}
          className={classes}
          aria-label={ariaLabel}
          onPointerMove={magnetProps?.onPointerMove}
          onPointerLeave={magnetProps?.onPointerLeave}
        >
          {children}
        </Link>
      </motion.div>
    )
  }
  return (
    <motion.div className="inline-block" style={magnetProps?.style}>
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        download={download}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
        onPointerMove={magnetProps?.onPointerMove}
        onPointerLeave={magnetProps?.onPointerLeave}
      >
        {children}
      </a>
    </motion.div>
  )
}

/* ------------------------------ Status bits ------------------------------ */

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-subtle">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent"
      />
      <span className="text-sm">{label}</span>
    </span>
  )
}

export function SectionLoader() {
  return (
    <div className="flex justify-center py-14">
      <Spinner />
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-soft px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {description ? <p className="mx-auto mt-1.5 max-w-sm text-sm text-subtle">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-xl border border-[#fecdca] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">
      {message}
    </p>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'live' | 'warn'
}) {
  const tones = {
    neutral: 'bg-soft text-subtle border-line',
    accent: 'bg-accent-soft text-accent border-[#d5e2ff]',
    live: 'bg-[#ecfdf3] text-[#027a48] border-[#c7f0d8]',
    warn: 'bg-[#fff6ed] text-[#b93815] border-[#ffdcc2]',
  } as const
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

/* --------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/25 p-3 sm:p-6">
      <div
        aria-hidden="true"
        className="fixed inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative my-4 w-full rounded-2xl border border-line bg-surface shadow-shell',
          wide ? 'max-w-3xl' : 'max-w-xl',
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-subtle transition-colors hover:bg-soft hover:text-ink"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="thin-scroll max-h-[72vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-relaxed text-subtle">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Keep it
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

/* --------------------------------- Toast --------------------------------- */

interface ToastMessage {
  id: number
  text: string
  tone: 'success' | 'error'
}

const ToastContext = createContext<{
  notify: (text: string, tone?: 'success' | 'error') => void
} | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMessage[]>([])

  const notify = useCallback((text: string, tone: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, text, tone }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lift',
              t.tone === 'success'
                ? 'border-[#c7f0d8] bg-white text-[#027a48]'
                : 'border-[#fecdca] bg-white text-[#b42318]',
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/* --------------------------------- Icons --------------------------------- */

export type IconName =
  | 'arrow-right' | 'arrow-up' | 'arrow-down' | 'external' | 'github' | 'linkedin'
  | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'whatsapp' | 'mail' | 'link'
  | 'download' | 'close' | 'menu' | 'check' | 'plus' | 'edit' | 'trash' | 'search'
  | 'code' | 'layout' | 'database' | 'settings' | 'image' | 'message' | 'grid'
  | 'briefcase' | 'graduation' | 'spark' | 'logout' | 'eye' | 'pin' | 'phone' | 'calendar'

const PATHS: Record<IconName, string> = {
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-up': 'M12 19V5M6 11l6-6 6 6',
  'arrow-down': 'M12 5v14M6 13l6 6 6-6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  github:
    'M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  linkedin: 'M6 9v10M6 5.5v.01M11 19v-5.5a2.5 2.5 0 0 1 5 0V19M11 9v10',
  facebook: 'M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3h2v9h3v-9h2.5l.5-3H12V6.8c0-.5.3-.8.8-.8H15z',
  instagram:
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM16 11.4a4 4 0 1 1-7.9 1.2A4 4 0 0 1 16 11.4zM17.5 6.5v.01',
  twitter: 'M4 4l7.5 9.8L4.5 20M20 4l-7.4 8.1M9.5 4H4l10.5 16H20L9.5 4z',
  youtube:
    'M21 8.2a2.8 2.8 0 0 0-2-2C17.3 5.8 12 5.8 12 5.8s-5.3 0-7 .4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.7 12a29 29 0 0 0 .3 3.8 2.8 2.8 0 0 0 2 2c1.7.4 7 .4 7 .4s5.3 0 7-.4a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .3-3.8 29 29 0 0 0-.3-3.8zM10.2 15V9l5 3-5 3z',
  whatsapp:
    'M3 21l1.6-4.4A8.4 8.4 0 1 1 8 20.2L3 21zM9 9.5c0 4 3 6 5.5 6.2.6 0 1.2-.4 1.4-1l.2-.8-2-1-.8.9a4.7 4.7 0 0 1-2-2l.9-.8-1-2h-.8c-.7.2-1.2.8-1.2 1.5z',
  mail: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3.5 7.5l8.5 6 8.5-6',
  link: 'M10 13a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 4.3l-1.7 1.7M14 11a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 19.7l1.7-1.7',
  download: 'M12 3v12M7 11l5 5 5-5M4 19h16',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  check: 'M4 12.5l5 5L20 6.5',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 6.5l3 3',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3',
  code: 'M8 6l-5 6 5 6M16 6l5 6-5 6M13 4l-2 16',
  layout: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM3 9h18M9 21V9',
  database:
    'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a1.7 1.7 0 0 0-1.6-1H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3 8.6a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 3V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z',
  image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  message: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  briefcase:
    'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zM9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18',
  graduation: 'M12 4L2 9l10 5 10-5-10-5zM6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5',
  spark: 'M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  pin: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  phone:
    'M21 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 3.3 2H6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 9.7a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  calendar: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 11h18M8 3v4M16 3v4',
}

export function Icon({
  name,
  className = 'h-[1.125em] w-[1.125em]',
  strokeWidth = 1.75,
}: {
  name: IconName
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

/** Maps a social platform name to its icon, falling back to a generic link. */
export function socialIcon(platform: string): IconName {
  const key = platform.toLowerCase()
  if (key.includes('github')) return 'github'
  if (key.includes('linkedin')) return 'linkedin'
  if (key.includes('facebook')) return 'facebook'
  if (key.includes('instagram')) return 'instagram'
  if (key.includes('twitter') || key === 'x') return 'twitter'
  if (key.includes('youtube')) return 'youtube'
  if (key.includes('whatsapp')) return 'whatsapp'
  if (key.includes('mail') || key.includes('email')) return 'mail'
  return 'link'
}

/** Maps a stored service/skill icon name to an icon, with a safe default. */
export function contentIcon(name: string | null | undefined): IconName {
  const key = (name ?? '').toLowerCase()
  if (key in PATHS) return key as IconName
  return 'spark'
}
