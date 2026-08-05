import { useEffect, useRef, useState } from 'react'

/*
 * CursorGlow — an ambient orange radial glow that trails the cursor with a
 * slight lag. Homepage-only (mounted in Home.jsx). Sits BEHIND content
 * (z-index 1) so the real system cursor stays visible; this just reads as
 * soft moving light. Skips touch devices and prefers-reduced-motion.
 */
const SIZE = 280

/* Only on devices with a real mouse, and only if motion is allowed. Read once
   at mount rather than flipped from inside the effect — the answer can't
   change without a remount and deciding it up front avoids a second render. */
function glowAllowed() {
  const fine   = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return Boolean(fine && !reduce)
}

export default function CursorGlow() {
  const ref = useRef(null)
  const frame = useRef(0)
  const target = useRef({ x: -9999, y: -9999 })
  const [enabled] = useState(glowAllowed)

  useEffect(() => {
    if (!enabled) return

    const onMove = e => {
      target.current = { x: e.clientX, y: e.clientY }
      if (!frame.current) {
        // throttle DOM writes to one per animation frame (~16ms)
        frame.current = requestAnimationFrame(() => {
          frame.current = 0
          const el = ref.current
          if (el) {
            el.style.left = `${target.current.x}px`
            el.style.top = `${target.current.y}px`
            el.style.opacity = '1'
          }
        })
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: -9999, top: -9999,
        width: SIZE, height: SIZE,
        marginLeft: -SIZE / 2, marginTop: -SIZE / 2,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,129,31,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0,
        transition: 'left 0.15s ease-out, top 0.15s ease-out, opacity 0.3s ease',
      }}
    />
  )
}
