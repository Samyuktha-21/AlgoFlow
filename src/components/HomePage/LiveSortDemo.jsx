import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/*
 * LiveSortDemo — a REAL bubble sort running continuously inside a terminal frame.
 * Generates actual sort steps, plays through them ~600ms/step, then reshuffles
 * and loops forever. This is the homepage's signature element.
 */

const N = 10
const STEP_MS = 600
const C = {
  bg:        '#0b0e18',
  surface:   '#0f1420',
  border:    'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
  amber:     '#f59e0b',
  text1:     '#f8fafc',
  text2:     '#94a3b8',
  text3:     '#475569',
  unsorted:  '#1e293b',
  unsortedB: '#334155',
  swap:      '#ef4444',
  sorted:    '#10b981',
}
const MONO = "'JetBrains Mono', monospace"

function randomArray() {
  return Array.from({ length: N }, () => Math.floor(Math.random() * 78) + 8)
}

function buildSteps(start) {
  const a = [...start]
  const n = a.length
  const steps = []
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      const v1 = a[j], v2 = a[j + 1]
      const swapped = v1 > v2
      if (swapped) { a[j] = v2; a[j + 1] = v1 }
      steps.push({
        arr: [...a],
        compare: [j, j + 1],
        swapped,
        sortedFrom: n - i,
        msg: swapped
          ? `comparing a[${j}]=${v1} with a[${j + 1}]=${v2} — swap`
          : `comparing a[${j}]=${v1} with a[${j + 1}]=${v2} — ok`,
      })
    }
  }
  steps.push({ arr: [...a], compare: null, swapped: false, sortedFrom: 0, done: true, msg: 'array sorted ✓' })
  return steps
}

const MAX_BAR = 120

export default function LiveSortDemo() {
  const reduce = useReducedMotion()
  const [firstArr] = useState(() => randomArray())
  const initial = useRef(firstArr)
  const [step, setStep] = useState(() => ({ arr: firstArr, compare: null, swapped: false, sortedFrom: N, msg: 'initializing…' }))
  const [log, setLog] = useState([])
  const [progress, setProgress] = useState(0)

  const stepsRef = useRef([])
  const idxRef = useRef(0)

  useEffect(() => {
    if (reduce) {
      const sorted = [...initial.current].sort((a, b) => a - b)
      setStep({ arr: sorted, compare: null, swapped: false, sortedFrom: 0, done: true, msg: 'array sorted ✓' })
      setProgress(100)
      return
    }

    stepsRef.current = buildSteps(initial.current)
    idxRef.current = 0
    let timer

    const tick = () => {
      const steps = stepsRef.current
      const i = idxRef.current
      if (i >= steps.length) {
        // finished — pause, then regenerate a fresh array and restart
        timer = setTimeout(() => {
          initial.current = randomArray()
          stepsRef.current = buildSteps(initial.current)
          idxRef.current = 0
          setLog([])
          setProgress(0)
          timer = setTimeout(tick, STEP_MS)
        }, 1400)
        return
      }
      const s = steps[i]
      setStep(s)
      setLog(prev => [...prev, s.msg].slice(-4))
      setProgress(Math.round((i / (steps.length - 1)) * 100))
      idxRef.current += 1
      timer = setTimeout(tick, STEP_MS)
    }
    timer = setTimeout(tick, STEP_MS)
    return () => clearTimeout(timer)
  }, [reduce])

  const { arr, compare, swapped, sortedFrom, done, msg } = step
  const maxVal = Math.max(...arr)

  return (
    <div style={{
      width: '100%', maxWidth: 480,
      background: C.bg,
      border: `1px solid ${C.borderMid}`,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    }}>
      {/* titlebar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0.6rem 1rem',
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ margin: '0 auto', fontFamily: MONO, fontSize: '0.72rem', color: C.text3 }}>
          algoflow — bubble_sort.exe
        </span>
      </div>

      {/* body */}
      <div style={{ padding: '1.25rem', background: C.bg }}>
        {/* bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 140 }}>
          {arr.map((v, i) => {
            const isCompare = compare && compare.includes(i)
            const isSorted = done || i >= sortedFrom
            let fill = C.unsorted, border = C.unsortedB, glow = 'none'
            if (isSorted) { fill = C.sorted; border = C.sorted }
            if (isCompare) {
              if (swapped) { fill = C.swap; border = C.swap; glow = '0 0 12px rgba(239,68,68,0.6)' }
              else { fill = C.amber; border = C.amber; glow = '0 0 14px rgba(245,158,11,0.65)' }
            }
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: MONO, fontSize: '0.65rem', color: isCompare ? C.text1 : C.text2 }}>{v}</span>
                <div style={{
                  width: '100%',
                  height: `${(v / maxVal) * MAX_BAR}px`,
                  background: fill,
                  border: `1px solid ${border}`,
                  borderRadius: 3,
                  boxShadow: glow,
                  transition: 'height 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                }} />
              </div>
            )
          })}
        </div>

        {/* status line */}
        <div style={{
          marginTop: '1rem', paddingTop: '0.75rem',
          borderTop: `1px solid ${C.border}`,
          fontFamily: MONO, fontSize: '0.78rem', color: C.text2,
        }}>
          <span style={{ color: C.amber }}>›</span> {msg}
        </div>

        {/* execution log */}
        <div style={{ height: 80, overflow: 'hidden', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {log.map((line, i) => {
            const opacities = log.length >= 4 ? [0.15, 0.35, 0.6, 1] : [0.35, 0.6, 1].slice(-log.length)
            return (
              <div key={`${i}-${line}`} style={{
                fontFamily: MONO, fontSize: '0.72rem', color: C.text2,
                opacity: opacities[i] ?? 1, lineHeight: 1.7, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                <span style={{ color: C.text3 }}>$</span> {line}
              </div>
            )
          })}
        </div>
      </div>

      {/* progress bar */}
      <div style={{ height: 2, background: C.border }}>
        <div style={{ height: '100%', width: `${progress}%`, background: C.amber, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  )
}
