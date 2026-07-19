import { useEffect, useRef, useState } from 'react'
import { subscribeToStats } from '../../firebase/stats'
import { firebaseEnabled } from '../../firebase/config'

const DISPLAY = "'General Sans', 'Inter', sans-serif"
const MONO = "'IBM Plex Mono', monospace"

/* Which counters appear on the hero, in order. All keys in stats/site:
   visits · logins · algoViews · learners · vizRuns · learningMinutes · interviewViews */
const SHOWN = [
  { key: 'visits',          label: 'site visits' },
  { key: 'learners',        label: 'learners' },
  { key: 'vizRuns',         label: 'visualizations run' },
  { key: 'learningMinutes', label: 'learning minutes' },
]

/* Animates from the previous value to the new one (and from 0 on mount).
   `delay` staggers the initial count-up so the numbers cascade in. */
function useCountUp(target, duration = 1600, delay = 0) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(null)

  useEffect(() => {
    const firstRun = prevRef.current === null
    const from = firstRun ? 0 : prevRef.current
    if (from === target) { setDisplay(target); return }
    prevRef.current = target

    let raf
    let start = null
    const wait = firstRun ? delay : 0
    const dur = firstRun ? duration : 600
    const tick = now => {
      if (start === null) start = now + wait
      const t = Math.min(Math.max((now - start) / dur, 0), 1)
      const eased = 1 - Math.pow(1 - t, 4)
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, delay])

  return display
}

function LiveNumber({ value, label, delay }) {
  const shown = useCountUp(value, 1600, delay)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{
        fontFamily: MONO, fontWeight: 700, lineHeight: 1,
        fontSize: 'clamp(1.9rem, 4vw, 3rem)',
        color: '#4ade80',
        textShadow: '0 0 24px rgba(74,222,128,0.35)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {shown.toLocaleString()}
      </span>
      <span style={{
        fontFamily: DISPLAY, fontSize: '0.75rem', color: '#8a8a8a',
        textTransform: 'uppercase', letterSpacing: '0.14em',
      }}>
        {label}
      </span>
    </div>
  )
}

export default function LiveStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => subscribeToStats(setStats), [])

  if (!firebaseEnabled || !stats) return null

  return (
    <div style={{
      position: 'relative', zIndex: 1, width: '100%',
      borderTop: '1px solid rgba(74,222,128,0.14)',
      borderBottom: '1px solid rgba(74,222,128,0.14)',
      background: 'linear-gradient(180deg, rgba(74,222,128,0.06) 0%, rgba(74,222,128,0.02) 55%, transparent 100%)',
      animation: 'af-live-enter 0.7s ease-out both',
    }}>
      <style>{`
        @keyframes af-live-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
          50%      { opacity: 0.6; box-shadow: 0 0 0 5px rgba(74,222,128,0); }
        }
        @keyframes af-live-enter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .af-live-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.2rem 1.5rem 2.4rem;
        }
        @media (max-width: 720px) {
          .af-live-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem 1rem; padding: 1.8rem 1rem 2rem; }
        }
      `}</style>

      {/* centered LIVE badge overlapping the top border */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        background: '#0d0d0d', border: '1px solid rgba(74,222,128,0.25)',
        borderRadius: 999, padding: '0.3rem 0.8rem',
      }}>
        <span aria-hidden="true" style={{
          width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
          animation: 'af-live-pulse 2s ease-in-out infinite',
        }} />
        <span style={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Live right now
        </span>
      </div>

      <div className="af-live-grid">
        {SHOWN.map((m, i) => (
          <LiveNumber key={m.key} value={stats[m.key] ?? 0} label={m.label} delay={i * 180} />
        ))}
      </div>
    </div>
  )
}
