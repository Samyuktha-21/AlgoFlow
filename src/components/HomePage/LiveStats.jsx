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

/* Animates from the previous value to the new one (and from 0 on mount) */
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    if (from === target) { setDisplay(target); return }
    prevRef.current = target

    let raf
    const start = performance.now()
    const tick = now => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

function LiveNumber({ value, label }) {
  const shown = useCountUp(value)
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
      <span style={{ fontFamily: MONO, fontSize: '0.95rem', fontWeight: 700, color: '#4ade80' }}>
        {shown.toLocaleString()}
      </span>
      <span style={{ fontFamily: DISPLAY, fontSize: '0.72rem', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
      display: 'inline-flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
      marginBottom: '2rem', padding: '0.6rem 1.1rem', borderRadius: 8,
      border: '1px solid rgba(74,222,128,0.18)', background: 'rgba(74,222,128,0.05)',
    }}>
      <style>{`
        @keyframes af-live-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
          50%      { opacity: 0.6; box-shadow: 0 0 0 5px rgba(74,222,128,0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span aria-hidden="true" style={{
          width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
          animation: 'af-live-pulse 2s ease-in-out infinite',
        }} />
        <span style={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Live
        </span>
      </div>

      {SHOWN.map((m, i) => (
        <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {i > 0 && <span style={{ width: 1, height: '1.1rem', background: 'rgba(255,255,255,0.1)' }} />}
          <LiveNumber value={stats[m.key] ?? 0} label={m.label} />
        </div>
      ))}
    </div>
  )
}
