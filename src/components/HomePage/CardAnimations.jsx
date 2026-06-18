/* Conceptual mini-animations — shows what each algorithm category DOES */
import { useState, useEffect } from 'react'

/* ── 1. FUNDAMENTALS (compass) — pointer sliding over array ── */
export function CompassAnimation() {
  const [pos, setPos] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPos(p => (p + 1) % 6), 550)
    return () => clearInterval(t)
  }, [])
  const vals = [3, 7, 1, 9, 4, 6]
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-end justify-center pb-4"
      style={{ background: 'linear-gradient(180deg,#0c1445,#1e3a5f)' }}>
      <div className="flex gap-1.5 items-end">
        {vals.map((v, i) => (
          <div key={i} className="relative flex flex-col items-center gap-1">
            {i === pos && (
              <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 'bold', lineHeight: 1 }}>↑</span>
            )}
            <div style={{
              width: 18, height: v * 5,
              background: i === pos ? '#fbbf24' : 'rgba(96,165,250,0.4)',
              borderRadius: 3,
              transition: 'background 0.25s',
              boxShadow: i === pos ? '0 0 10px rgba(251,191,36,0.7)' : 'none',
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 2. SORTING (water) — bars bubble-sorting ── */
export function WaterAnimation() {
  const initial = [5, 2, 8, 1, 6, 3]
  const [arr, setArr] = useState(initial)
  const [hi, setHi] = useState([])

  useEffect(() => {
    const a = [...initial]
    const steps = []
    for (let x = 0; x < a.length - 1; x++) {
      for (let y = 0; y < a.length - x - 1; y++) {
        steps.push({ arr: [...a], hi: [y, y + 1] })
        if (a[y] > a[y + 1]) { [a[y], a[y + 1]] = [a[y + 1], a[y]]; steps.push({ arr: [...a], hi: [y, y + 1] }) }
      }
    }
    steps.push({ arr: [...a], hi: [] })
    let i = 0
    const t = setInterval(() => {
      if (i >= steps.length) i = 0
      setArr(steps[i].arr)
      setHi(steps[i].hi)
      i++
    }, 320)
    return () => clearInterval(t)
  }, [])

  const sorted = arr.every((v, i, a) => i === 0 || v >= a[i - 1])
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-end justify-center pb-4"
      style={{ background: 'linear-gradient(180deg,#1a0500,#2d0a00)' }}>
      <div className="flex gap-1.5 items-end">
        {arr.map((v, i) => (
          <div key={i} style={{
            width: 16, height: v * 8,
            background: sorted ? '#4ade80' : hi.includes(i) ? '#f87171' : 'rgba(249,115,22,0.55)',
            borderRadius: '3px 3px 0 0',
            transition: 'height 0.28s ease, background 0.18s',
            boxShadow: hi.includes(i) ? '0 0 8px rgba(248,113,113,0.8)' : sorted ? '0 0 6px rgba(74,222,128,0.5)' : 'none',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ── 3. SEARCHING (light) — spotlight scanning array ── */
export function LightAnimation() {
  const arr = [7, 2, 9, 1, 4, 6]
  const target = 4
  const [pos, setPos] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPos(p => (p + 1) % arr.length), 550)
    return () => clearInterval(t)
  }, [])
  const found = arr[pos] === target
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex flex-col items-center justify-center gap-2"
      style={{ background: 'linear-gradient(180deg,#06091a,#0a0f1e)' }}>
      <div className="absolute top-0" style={{
        left: `${(pos / arr.length) * 100 + 100 / arr.length / 2}%`,
        transform: 'translateX(-50%)',
        width: 28, height: '55%',
        background: found
          ? 'linear-gradient(180deg,rgba(74,222,128,0.45) 0%,rgba(74,222,128,0.05) 100%)'
          : 'linear-gradient(180deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.02) 100%)',
        filter: 'blur(6px)',
        transition: 'left 0.25s ease',
      }} />
      <div className="flex gap-1.5">
        {arr.map((v, i) => (
          <div key={i} style={{
            width: 24, height: 28,
            background: i === pos ? (found ? '#4ade80' : '#fbbf24') : '#1e293b',
            border: `2px solid ${i === pos ? (found ? '#22c55e' : '#f59e0b') : '#334155'}`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 'bold',
            color: i === pos ? '#0f172a' : '#94a3b8',
            transition: 'all 0.25s',
            boxShadow: i === pos ? `0 0 12px ${found ? 'rgba(74,222,128,0.7)' : 'rgba(251,191,36,0.6)'}` : 'none',
          }}>{v}</div>
        ))}
      </div>
      <span style={{ fontSize: 9, color: 'rgba(251,191,36,0.6)', fontFamily: 'monospace' }}>target = {target}</span>
    </div>
  )
}

/* ── 4. ARRAY & STRING (puzzle) — sliding window ── */
export function PuzzleAnimation() {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6]
  const W = 3
  const [start, setStart] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStart(s => (s + 1) % (arr.length - W + 1)), 650)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex flex-col items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg,#2d1060,#1a0533)' }}>
      <div className="flex gap-1.5">
        {arr.map((v, i) => {
          const inWindow = i >= start && i < start + W
          return (
            <div key={i} style={{
              width: 20, height: 26,
              background: inWindow ? '#818cf8' : '#1e293b',
              border: `2px solid ${inWindow ? '#6366f1' : '#334155'}`,
              borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 'bold',
              color: inWindow ? '#fff' : '#94a3b8',
              transition: 'all 0.35s ease',
              boxShadow: inWindow ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
            }}>{v}</div>
          )
        })}
      </div>
      <span style={{ fontSize: 9, color: 'rgba(129,140,248,0.6)', fontFamily: 'monospace' }}>window [{start}..{start + W - 1}]</span>
    </div>
  )
}

/* ── 5. LINKED LIST (chain) — nodes traversing ── */
export function ChainAnimation() {
  const nodes = [1, 2, 3, 4]
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % nodes.length), 580)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#3b0a25,#4a1030)' }}>
      <div className="flex items-center gap-1">
        {nodes.map((v, i) => (
          <div key={i} className="flex items-center">
            <div style={{
              width: 30, height: 30,
              background: i === active ? '#f472b6' : '#1e293b',
              border: `2px solid ${i <= active ? '#ec4899' : '#475569'}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 'bold',
              color: i === active ? '#fff' : '#94a3b8',
              transition: 'all 0.3s',
              boxShadow: i === active ? '0 0 14px rgba(236,72,153,0.7)' : 'none',
            }}>{v}</div>
            {i < nodes.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 14, height: 2, background: i < active ? '#ec4899' : '#334155', transition: 'background 0.3s' }} />
                <span style={{ color: i < active ? '#ec4899' : '#334155', fontSize: 9, transition: 'color 0.3s' }}>▶</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 6. STACK & QUEUE (books) — push/pop animation ── */
export function BooksAnimation() {
  const [stack, setStack] = useState([1, 2, 3])
  useEffect(() => {
    const t = setInterval(() => {
      setStack(s => s.length >= 5 ? [1] : [...s, s.length + 1])
    }, 700)
    const t2 = setInterval(() => {
      setStack(s => s.length > 1 ? s.slice(0, -1) : s)
    }, 1400)
    return () => { clearInterval(t); clearInterval(t2) }
  }, [])
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e']
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-end justify-center pb-5"
      style={{ background: 'linear-gradient(180deg,#1e3a5f,#1b4881)' }}>
      <div className="flex flex-col-reverse gap-1 items-center">
        {stack.map((v, i) => (
          <div key={i} style={{
            width: 52, height: 14,
            background: i === stack.length - 1 ? COLORS[v % COLORS.length] : 'rgba(59,130,246,0.3)',
            border: `1px solid ${i === stack.length - 1 ? COLORS[v % COLORS.length] : 'rgba(96,165,250,0.3)'}`,
            borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: '#e2e8f0',
            fontFamily: 'monospace',
            transition: 'all 0.35s',
            boxShadow: i === stack.length - 1 ? `0 0 10px ${COLORS[v % COLORS.length]}88` : 'none',
          }}>{i === stack.length - 1 ? '← TOP' : v}</div>
        ))}
      </div>
    </div>
  )
}

/* ── 7. HASHING (cabinet) — key → hash → bucket ── */
export function CabinetAnimation() {
  const [filled, setFilled] = useState(1)
  const [flash, setFlash] = useState(-1)
  useEffect(() => {
    const t = setInterval(() => {
      setFilled(f => {
        const next = (f % 5) + 1
        setFlash(next - 1)
        setTimeout(() => setFlash(-1), 280)
        return next
      })
    }, 800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center gap-3"
      style={{ background: 'linear-gradient(180deg,#064e3b,#065f46)' }}>
      <div style={{ padding: '3px 7px', background: '#1e293b', borderRadius: 5, fontSize: 10, color: '#4ade80', fontFamily: 'monospace' }}>key</div>
      <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 'bold' }}>→ h(x) →</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{
            width: 30, height: 11,
            background: i < filled ? (i === flash ? '#fbbf24' : '#4ade80') : '#1e293b',
            border: `1px solid ${i < filled ? (i === flash ? '#fbbf24' : '#22c55e') : '#334155'}`,
            borderRadius: 2,
            transition: 'all 0.25s',
            boxShadow: i === flash ? '0 0 10px rgba(251,191,36,0.8)' : i < filled ? '0 0 4px rgba(74,222,128,0.4)' : 'none',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ── 8. TREES (forest) — BFS traversal on tree ── */
export function ForestAnimation() {
  const [visited, setVisited] = useState([])
  const bfsOrder = [0, 1, 2, 3, 4]
  useEffect(() => {
    let i = 0
    setVisited([])
    const t = setInterval(() => {
      if (i < bfsOrder.length) { setVisited(v => [...v, bfsOrder[i]]); i++ }
      else { i = 0; setVisited([]) }
    }, 550)
    return () => clearInterval(t)
  }, [])
  const nodes = [{ cx: 50, cy: 10 }, { cx: 22, cy: 32 }, { cx: 78, cy: 32 }, { cx: 9, cy: 56 }, { cx: 36, cy: 56 }]
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(180deg,#166534,#14532d)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
        <line x1="50" y1="14" x2="23" y2="29" stroke="#475569" strokeWidth="1.2" />
        <line x1="50" y1="14" x2="77" y2="29" stroke="#475569" strokeWidth="1.2" />
        <line x1="23" y1="36" x2="11" y2="53" stroke="#475569" strokeWidth="1.2" />
        <line x1="23" y1="36" x2="35" y2="53" stroke="#475569" strokeWidth="1.2" />
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r="8"
              fill={visited.includes(i) ? '#4ade80' : '#1e293b'}
              stroke={visited.includes(i) ? '#22c55e' : '#475569'}
              strokeWidth="1.5"
              style={{ transition: 'fill 0.3s, stroke 0.3s', filter: visited.includes(i) ? 'drop-shadow(0 0 4px #4ade80)' : 'none' }} />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle" fontSize="7" fill={visited.includes(i) ? '#0f172a' : '#94a3b8'} fontWeight="bold">{i}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── 9. HEAPS (mountain) — max heap with root pulsing ── */
export function MountainAnimation() {
  const [heap, setHeap] = useState([90, 70, 80, 40, 50, 60])
  const [extracting, setExtracting] = useState(false)
  useEffect(() => {
    const t = setInterval(() => {
      setExtracting(true)
      setTimeout(() => {
        setHeap(h => {
          const n = [...h.slice(1)]
          n.push(Math.floor(Math.random() * 30) + 60)
          return n.sort((a, b) => b - a)
        })
        setExtracting(false)
      }, 500)
    }, 1300)
    return () => clearInterval(t)
  }, [])
  const positions = [{ x: 50, y: 10, top: true }, { x: 25, y: 32 }, { x: 75, y: 32 }, { x: 12, y: 55 }, { x: 38, y: 55 }, { x: 63, y: 55 }]
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(180deg,#1c0a00,#2d1000)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 72" preserveAspectRatio="xMidYMid meet">
        <line x1="50" y1="15" x2="26" y2="29" stroke="#475569" strokeWidth="1.2" />
        <line x1="50" y1="15" x2="74" y2="29" stroke="#475569" strokeWidth="1.2" />
        <line x1="26" y1="37" x2="13" y2="52" stroke="#475569" strokeWidth="1.2" />
        <line x1="26" y1="37" x2="39" y2="52" stroke="#475569" strokeWidth="1.2" />
        <line x1="74" y1="37" x2="62" y2="52" stroke="#475569" strokeWidth="1.2" />
        {positions.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.top ? 11 : 9}
              fill={n.top ? (extracting ? '#f87171' : '#fbbf24') : '#1e293b'}
              stroke={n.top ? '#f59e0b' : '#475569'} strokeWidth="1.5"
              style={{ filter: n.top ? `drop-shadow(0 0 6px ${extracting ? '#f87171' : '#fbbf24'})` : 'none', transition: 'all 0.4s' }} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={n.top ? '8' : '7'} fontWeight="bold"
              fill={n.top ? '#0f172a' : '#94a3b8'}>{heap[i]}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── 10. GRAPHS (network) — BFS on graph nodes ── */
export function NetworkAnimation() {
  const nodes = [{ x: 50, y: 28 }, { x: 16, y: 52 }, { x: 84, y: 52 }, { x: 32, y: 76 }, { x: 68, y: 76 }]
  const edgeList = [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]]
  const bfsOrder = [0, 1, 2, 3, 4]
  const [visited, setVisited] = useState([])
  const [activeEdges, setActiveEdges] = useState([])
  useEffect(() => {
    let i = 0; setVisited([]); setActiveEdges([])
    const t = setInterval(() => {
      if (i < bfsOrder.length) {
        const n = bfsOrder[i]
        setVisited(v => { const nv = [...v, n]; setActiveEdges(edgeList.filter(([a, b]) => nv.includes(a) && nv.includes(b))); return nv })
        i++
      } else { i = 0; setVisited([]); setActiveEdges([]) }
    }, 620)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'radial-gradient(ellipse at 40% 40%,#1e3a5f,#0f172a)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {edgeList.map(([a, b], i) => {
          const lit = activeEdges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
          return (
            <line key={i}
              x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
              stroke={lit ? '#818cf8' : '#334155'} strokeWidth="2"
              style={{ transition: 'stroke 0.35s', filter: lit ? 'drop-shadow(0 0 3px #818cf8)' : 'none' }} />
          )
        })}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="10"
              fill={visited.includes(i) ? '#818cf8' : '#1e293b'}
              stroke={visited.includes(i) ? '#6366f1' : '#475569'} strokeWidth="2"
              style={{ transition: 'all 0.35s', filter: visited.includes(i) ? 'drop-shadow(0 0 6px #818cf8)' : 'none' }} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="8" fill={visited.includes(i) ? '#fff' : '#94a3b8'} fontWeight="bold">{i}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── 11. GREEDY (target) — pick locally best at each step ── */
export function TargetAnimation() {
  const choices = [{ v: 3, label: '$3' }, { v: 8, label: '$8' }, { v: 5, label: '$5' }]
  const [chosen, setChosen] = useState(null)
  useEffect(() => {
    const t = setInterval(() => {
      setChosen(null)
      setTimeout(() => setChosen(1), 600)
    }, 1400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-end justify-center pb-5 gap-3"
      style={{ background: 'linear-gradient(135deg,#020617,#050d1e)' }}>
      {choices.map((c, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          {chosen === i && <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 'bold' }}>✓</span>}
          <div style={{
            width: 28, height: c.v * 7,
            background: chosen === i ? '#fbbf24' : 'rgba(99,102,241,0.3)',
            border: `2px solid ${chosen === i ? '#f59e0b' : '#334155'}`,
            borderRadius: '3px 3px 0 0',
            transition: 'all 0.35s',
            boxShadow: chosen === i ? '0 0 14px rgba(251,191,36,0.8)' : 'none',
          }} />
          <span style={{ fontSize: 9, color: chosen === i ? '#fbbf24' : '#94a3b8', transition: 'color 0.3s' }}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── 12. DYNAMIC PROGRAMMING (blocks) — DP table filling ── */
export function BlocksAnimation() {
  const SIZE = 4
  const TOTAL = SIZE * SIZE
  const [filled, setFilled] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFilled(f => f >= TOTAL ? 0 : f + 1), 180)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg,#0a1628,#0f2044)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE},1fr)`, gap: 3 }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} style={{
            width: 14, height: 14,
            background: i < filled
              ? `hsl(${220 + (i / TOTAL) * 60},80%,${40 + (i / TOTAL) * 25}%)`
              : '#1e293b',
            borderRadius: 2,
            border: `1px solid ${i < filled ? '#6366f1' : '#334155'}`,
            transition: 'all 0.18s',
            boxShadow: i === filled - 1 ? '0 0 8px rgba(99,102,241,0.9)' : 'none',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ── 13. BACKTRACKING (maze) — explore + backtrack ── */
export function MazeAnimation() {
  const positions = {
    0: { x: 50, y: 10 }, 1: { x: 25, y: 32 }, 2: { x: 75, y: 32 },
    3: { x: 12, y: 56 }, 4: { x: 38, y: 56 }, 5: { x: 62, y: 56 }, 6: { x: 88, y: 56 },
  }
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]
  const steps = [
    [0],[0,1],[0,1,3],[0,1],[0,1,4],[0,1],[0],
    [0,2],[0,2,5],[0,2],[0,2,6],[0,2],[0],
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % steps.length), 520)
    return () => clearInterval(t)
  }, [])
  const path = steps[idx]
  const backtracking = path.length < (steps[Math.max(0, idx - 1)] || path).length
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(135deg,#020c04,#041208)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
        {edges.map(([a, b], i) => (
          <line key={i}
            x1={positions[a].x} y1={positions[a].y} x2={positions[b].x} y2={positions[b].y}
            stroke={path.includes(a) && path.includes(b) ? '#c084fc' : '#1e293b'} strokeWidth="1.5"
            style={{ transition: 'stroke 0.25s' }} />
        ))}
        {Object.entries(positions).map(([id, pos]) => (
          <circle key={id} cx={pos.x} cy={pos.y} r="8"
            fill={path.includes(+id) ? (backtracking ? '#f87171' : '#c084fc') : '#0f172a'}
            stroke={path.includes(+id) ? '#a855f7' : '#334155'} strokeWidth="1.5"
            style={{ transition: 'all 0.25s', filter: path.includes(+id) ? 'drop-shadow(0 0 5px #c084fc)' : 'none' }} />
        ))}
      </svg>
    </div>
  )
}

/* ── 14. ADVANCED (circuit) — TSP route optimizing ── */
export function CircuitAnimation() {
  const cities = [{ x: 50, y: 14 }, { x: 84, y: 44 }, { x: 64, y: 79 }, { x: 16, y: 60 }]
  const routes = [[0,1,2,3],[0,1,3,2],[0,2,1,3],[0,3,1,2],[0,2,3,1]]
  const costs = [100, 85, 92, 78, 95]
  const [ri, setRi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setRi(i => (i + 1) % routes.length), 900)
    return () => clearInterval(t)
  }, [])
  const route = routes[ri]
  const cost = costs[ri]
  const best = Math.min(...costs)
  const isBest = cost === best
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'radial-gradient(circle,#0f1629,#030712)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {route.map((c, i) => {
          const next = route[(i + 1) % route.length]
          return (
            <line key={i}
              x1={cities[c].x} y1={cities[c].y} x2={cities[next].x} y2={cities[next].y}
              stroke={isBest ? '#4ade80' : '#60a5fa'} strokeWidth="1.5"
              style={{ transition: 'all 0.4s', filter: isBest ? 'drop-shadow(0 0 3px #4ade80)' : 'none' }} />
          )
        })}
        {cities.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="8" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
            <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize="7" fill="#94a3b8">{i}</text>
          </g>
        ))}
        <text x="50" y="96" textAnchor="middle" fontSize="8"
          fill={isBest ? '#4ade80' : '#fbbf24'}
          style={{ transition: 'fill 0.3s' }}>
          cost: {cost}{isBest ? ' ✓ best' : ''}
        </text>
      </svg>
    </div>
  )
}

/* Map themeId → animation component */
export const CARD_ANIMATIONS = {
  compass:  CompassAnimation,
  water:    WaterAnimation,
  light:    LightAnimation,
  puzzle:   PuzzleAnimation,
  chain:    ChainAnimation,
  books:    BooksAnimation,
  cabinet:  CabinetAnimation,
  forest:   ForestAnimation,
  mountain: MountainAnimation,
  network:  NetworkAnimation,
  target:   TargetAnimation,
  blocks:   BlocksAnimation,
  maze:     MazeAnimation,
  circuit:  CircuitAnimation,
}
