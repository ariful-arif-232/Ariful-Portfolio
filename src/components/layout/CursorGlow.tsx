import { useEffect, type RefObject } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

/**
 * A soft accent-colored spotlight that trails the cursor across the shell.
 * Tracked relative to `containerRef` (not the viewport) so it scrolls with
 * the page and stays clipped to the shell's rounded edges. Mouse-only and
 * skipped entirely under reduced motion, so it never fights touch scrolling.
 */
export function CursorGlow({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const opacity = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 30, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 200, damping: 30, mass: 0.5 })
  const so = useSpring(opacity, { stiffness: 120, damping: 24 })

  const background = useMotionTemplate`radial-gradient(560px circle at ${sx}px ${sy}px, rgb(var(--accent-rgb) / 0.14), rgb(var(--teal-accent-rgb) / 0.06) 40%, transparent 70%)`

  useEffect(() => {
    const el = containerRef.current
    if (reduceMotion || !el || !window.matchMedia('(pointer: fine)').matches) return

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect()
      x.set(e.clientX - rect.left)
      y.set(e.clientY - rect.top)
      opacity.set(1)
    }
    function onLeave() {
      opacity.set(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduceMotion, containerRef, x, y, opacity])

  if (reduceMotion) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
      style={{ background, opacity: so }}
    />
  )
}
