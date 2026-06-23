import { useState, useEffect, useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

/*
 * HeroAlgoCycle — a single frame that cycles through 4 REAL running algorithms:
 *   Bubble Sort → Breadth-First Search → Binary Search → Linked List.
 * Active/comparing elements use the orange accent; completed elements go green.
 * BFS (the node/graph one, echoing the logo) gets extra screen time.
 */

const ACCENT = '#f5811f'
const GREEN = '#4ade80'
const IDLE = '#2a2a2a'
const IDLE_BORDER = 'rgba(255,255,255,0.1)'
const MONO = "'IBM Plex Mono', monospace"

/* ── frame generators ─────────────────────────────────────────── */
function sortFrames() {
  const a = [5, 2, 8, 1, 7, 3, 6, 4]
  const n = a.length
  const sorted = new Set()
  const frames = []
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      frames.push({ arr: [...a], active: [j, j + 1], sorted: new Set(sorted) })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        frames.push({ arr: [...a], active: [j, j + 1], sorted: new Set(sorted) })
      }
    }
    sorted.add(n - 1 - i)
  }
  sorted.add(0)
  frames.push({ arr: [...a], active: [], sorted: new Set(sorted) })
  return frames
}

const GNODES = [
  { x: 50, y: 16 }, { x: 20, y: 42 }, { x: 80, y: 42 },
  { x: 35, y: 76 }, { x: 65, y: 76 }, { x: 50, y: 50 },
]
const GEDGES = [[0, 1], [0, 2], [0, 5], [1, 3], [2, 4], [5, 3], [5, 4]]
const GADJ = GNODES.map((_, i) => GEDGES.filter(e => e.includes(i)).map(e => (e[0] === i ? e[1] : e[0])))

function graphFrames() {
  const visited = []
  const seen = new Set([0])
  const q = [0]
  const frames = [{ visited: [], active: 0 }]
  while (q.length) {
    const n = q.shift()
    visited.push(n)
    frames.push({ visited: [...visited], active: n })
    for (const m of GADJ[n]) if (!seen.has(m)) { seen.add(m); q.push(m) }
  }
  frames.push({ visited: [...visited], active: null })
  return frames
}

function searchFrames() {
  const arr = [3, 9, 14, 21, 27, 33, 42, 55, 68]
  const target = 42
  let lo = 0, hi = arr.length - 1
  const frames = []
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const found = arr[mid] === target
    frames.push({ arr, lo, hi, mid, found })
    if (found) break
    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1
  }
  return frames
}

function listFrames() {
  const vals = [7, 3, 9, 5]
  const frames = []
  for (let i = 0; i < vals.length; i++) frames.push({ vals, active: i, done: vals.map((_, k) => k < i), appended: false })
  frames.push({ vals, active: null, done: vals.map(() => true), appended: true })
  return frames
}

/* ── renderers ────────────────────────────────────────────────── */
function SortViz({ f }) {
  const max = Math.max(...f.arr)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, height: '100%' }}>
      {f.arr.map((v, i) => {
        const done = f.sorted.has(i)
        const active = f.active.includes(i)
        const color = done ? GREEN : active ? ACCENT : IDLE
        return (
          <div key={i} style={{
            width: 26, height: `${(v / max) * 100}%`,
            background: color, border: `1px solid ${active ? ACCENT : done ? GREEN : IDLE_BORDER}`,
            borderRadius: '4px 4px 2px 2px',
            boxShadow: active ? '0 0 12px rgba(245,129,31,0.5)' : 'none',
            transition: 'height 0.25s ease, background 0.2s ease, box-shadow 0.2s ease',
          }} />
        )
      })}
    </div>
  )
}

function GraphViz({ f }) {
  return (
    <svg viewBox="0 0 100 92" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      {GEDGES.map(([a, b], i) => {
        const lit = f.visited.includes(a) && f.visited.includes(b)
        return <line key={i} x1={GNODES[a].x} y1={GNODES[a].y} x2={GNODES[b].x} y2={GNODES[b].y}
          stroke={lit ? ACCENT : '#2a2a2a'} strokeWidth="2"
          style={{ transition: 'stroke 0.3s', filter: lit ? 'drop-shadow(0 0 2px rgba(245,129,31,0.6))' : 'none' }} />
      })}
      {GNODES.map((n, i) => {
        const visited = f.visited.includes(i)
        const active = f.active === i
        const fill = active ? ACCENT : visited ? GREEN : IDLE
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="9" fill={fill}
              stroke={active ? ACCENT : visited ? GREEN : IDLE_BORDER} strokeWidth="1.5"
              style={{ transition: 'all 0.3s', filter: active ? 'drop-shadow(0 0 6px rgba(245,129,31,0.7))' : 'none' }} />
            <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontSize="8" fontWeight="bold"
              fill={active || visited ? '#0a0a0a' : '#94a3b8'}>{i}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SearchViz({ f }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {f.arr.map((v, i) => {
          const inRange = i >= f.lo && i <= f.hi
          const isMid = i === f.mid
          const color = isMid ? (f.found ? GREEN : ACCENT) : IDLE
          return (
            <div key={i} style={{
              width: 30, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: color, border: `1px solid ${isMid ? (f.found ? GREEN : ACCENT) : IDLE_BORDER}`,
              borderRadius: 4, fontSize: 12, fontWeight: 700, fontFamily: MONO,
              color: isMid ? '#0a0a0a' : inRange ? '#e2e8f0' : '#52525b',
              opacity: inRange || isMid ? 1 : 0.4,
              boxShadow: isMid && !f.found ? '0 0 12px rgba(245,129,31,0.5)' : 'none',
              transition: 'all 0.25s ease',
            }}>{v}</div>
          )
        })}
      </div>
      <div style={{ fontFamily: MONO, fontSize: '0.72rem', color: f.found ? GREEN : ACCENT }}>
        {f.found ? 'target 42 found ✓' : `mid = ${f.mid}`}
      </div>
    </div>
  )
}

function ListViz({ f }) {
  const nodes = f.vals
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, height: '100%', flexWrap: 'wrap' }}>
      {nodes.map((v, i) => {
        const active = f.active === i
        const done = f.done[i]
        const color = active ? ACCENT : done ? GREEN : IDLE
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: color, border: `2px solid ${active ? ACCENT : done ? GREEN : IDLE_BORDER}`,
              fontSize: 13, fontWeight: 700, color: active || done ? '#0a0a0a' : '#94a3b8',
              boxShadow: active ? '0 0 12px rgba(245,129,31,0.5)' : 'none',
              transition: 'all 0.25s ease',
            }}>{v}</div>
            <span style={{ color: f.done[i] && (f.done[i + 1] || f.appended) ? GREEN : '#3f3f46', fontSize: 14, padding: '0 6px', transition: 'color 0.25s' }}>→</span>
          </div>
        )
      })}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: f.appended ? GREEN : 'transparent',
        border: `2px dashed ${f.appended ? GREEN : 'rgba(255,255,255,0.15)'}`,
        fontSize: 13, fontWeight: 700, color: f.appended ? '#0a0a0a' : '#52525b',
        transition: 'all 0.3s ease',
      }}>{f.appended ? '1' : '+'}</div>
    </div>
  )
}

/* ── phases ──────────────────────────────────────────────────── */
const PHASES = [
  { name: 'Bubble Sort',           type: 'sort',   build: sortFrames,   stepMs: 280, hold: 650 },
  { name: 'Breadth-First Search',  type: 'graph',  build: graphFrames,  stepMs: 620, hold: 1300 }, // longer — echoes the logo
  { name: 'Binary Search',         type: 'search', build: searchFrames, stepMs: 560, hold: 800 },
  { name: 'Linked List',           type: 'list',   build: listFrames,   stepMs: 480, hold: 750 },
]

export default function HeroAlgoCycle() {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const frames = useMemo(() => PHASES[phase].build(), [phase])

  useEffect(() => {
    if (reduce) { setStep(frames.length - 1); return }
    const ph = PHASES[phase]
    let i = 0
    let timer
    setStep(0); setVisible(true)
    const tick = () => {
      if (i < frames.length - 1) {
        i += 1; setStep(i); timer = setTimeout(tick, ph.stepMs)
      } else {
        timer = setTimeout(() => {
          setVisible(false)
          timer = setTimeout(() => setPhase(p => (p + 1) % PHASES.length), 320)
        }, ph.hold)
      }
    }
    timer = setTimeout(tick, ph.stepMs)
    return () => clearTimeout(timer)
  }, [phase, reduce, frames])

  const ph = PHASES[phase]
  const f = frames[Math.min(step, frames.length - 1)]

  return (
    <div
      className="hero2-frame"
      style={{
        background: '#161616', border: '1px solid rgba(245,129,31,0.15)', borderRadius: 12,
        padding: '1.5rem', boxShadow: '0 0 40px rgba(245,129,31,0.08)', position: 'relative',
        width: '100%', height: 420,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: '0.72rem', color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: reduce ? 'none' : 'hero-pulse 1.8s ease-in-out infinite' }} />
        › {ph.name}
      </div>

      {/* visualization — fixed-height stage; each algo centers within it, never resizes the frame */}
      <div style={{
        height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
      }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {ph.type === 'sort'   && <SortViz f={f} />}
          {ph.type === 'graph'  && <GraphViz f={f} />}
          {ph.type === 'search' && <SearchViz f={f} />}
          {ph.type === 'list'   && <ListViz f={f} />}
        </div>
      </div>

      {/* dot indicators — clickable; jump to that algorithm */}
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
        {PHASES.map((p, i) => (
          <button
            key={p.name}
            type="button"
            aria-label={`Show ${p.name}`}
            onClick={() => setPhase(i)}
            className={`hero-dot ${i === phase ? 'active' : ''}`}
            style={{ width: i === phase ? 18 : 7, height: 7, borderRadius: 4 }}
          />
        ))}
      </div>
    </div>
  )
}
