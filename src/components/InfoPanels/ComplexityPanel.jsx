import { useState } from 'react'
import { Clock, Database, CheckCircle2, XCircle, Info } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useBeginner } from '../../context/BeginnerContext'

/* Big-O plain-English tooltips */
const BIG_O_TOOLTIPS = {
  'O(1)':        { label: '⚡ Instant', text: 'No matter how big the input, it always takes the same time. Like looking up a word in a dictionary when you already know the exact page.' },
  'O(log n)':    { label: '🚀 Very Fast', text: 'Double the input = just 1 extra step. Like finding a name in a phone book by always opening to the middle.' },
  'O(n)':        { label: '🚶 Linear', text: 'Double the input = double the time. Like reading every page of a book to find one sentence.' },
  'O(n log n)':  { label: '✅ Fast', text: 'The fastest possible for comparison-based sorting. Most real-world sorting algorithms aim for this.' },
  'O(n²)':       { label: '🐢 Slow for large data', text: 'Double the input = 4× the time. With 100 items: 10,000 operations. With 1,000 items: 1,000,000 operations.' },
  'O(n³)':       { label: '🐌 Very Slow', text: 'Triple the input = 27× the time. Only practical for very small inputs (n < 100).' },
  'O(2ⁿ)':       { label: '💀 Exponential', text: 'Gets impossibly slow very quickly. n=30 means over 1 billion operations.' },
  'O(n²·2ⁿ)':    { label: '💀 Exponential', text: 'Impractical for n > 20. This is "exact" algorithm territory — used when correctness matters more than speed.' },
  'O(√n)':       { label: '🚀 Fast', text: 'Faster than linear. Square root of 10,000 is just 100 steps.' },
  'O(V + E)':    { label: '✅ Linear (Graph)', text: 'Visits every vertex and edge exactly once. Optimal for graph traversal.' },
  'O(V²)':       { label: '🐢 Slow (Graph)', text: 'For dense graphs. Use priority queue to achieve O((V+E) log V) instead.' },
  'O((V+E) log V)': { label: '✅ Fast (Graph)', text: 'The practical target for graph algorithms. Achieved with a min-heap priority queue.' },
}

function getTooltipData(bigO) {
  if (!bigO) return null
  const key = bigO.trim()
  return BIG_O_TOOLTIPS[key] || null
}

function BigOBadge({ value, isDark }) {
  const [open, setOpen] = useState(false)
  const tip = getTooltipData(value)

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, position: 'relative' }}>
      <code style={{
        fontFamily: 'Fira Code, monospace', fontWeight: 700, fontSize: 20,
        padding: '2px 8px', borderRadius: 6,
        color: value?.includes('n²') || value?.includes('2ⁿ')
          ? (isDark ? '#f87171' : '#dc2626')
          : value === 'O(1)' || value?.includes('log n') && !value?.includes('n log')
            ? (isDark ? '#34d399' : '#059669')
            : isDark ? '#fbbf24' : '#d97706',
        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(243,244,246,0.8)',
      }}>
        {value}
      </code>
      {tip && (
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: isDark ? '#64748b' : '#94a3b8',
            display: 'inline-flex',
          }}
          title="What does this mean?"
        >
          <Info size={14} />
        </button>
      )}
      {/* Tooltip popover */}
      {open && tip && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 50,
            minWidth: 240, maxWidth: 300,
            background: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`,
            borderRadius: 10, padding: '12px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 6 }}>
            {tip.label}
          </div>
          <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.6 }}>
            {tip.text}
          </div>
        </div>
      )}
    </span>
  )
}

/* Color for each complexity case */
const CASE_COLORS = {
  best:    { label: '#10b981', value: '#059669', bg: 'rgba(16,185,129,.08)',  border: 'rgba(16,185,129,.25)'  },
  average: { label: '#f59e0b', value: '#d97706', bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.25)'  },
  worst:   { label: '#ef4444', value: '#dc2626', bg: 'rgba(239,68,68,.08)',   border: 'rgba(239,68,68,.25)'   },
}

/* Dark-mode variants */
const CASE_COLORS_DARK = {
  best:    { label: '#34d399', value: '#4ade80', bg: 'rgba(52,211,153,.1)',  border: 'rgba(52,211,153,.3)'  },
  average: { label: '#fbbf24', value: '#fcd34d', bg: 'rgba(251,191,36,.1)',  border: 'rgba(251,191,36,.3)'  },
  worst:   { label: '#f87171', value: '#fc8181', bg: 'rgba(248,113,113,.1)', border: 'rgba(248,113,113,.3)' },
}

function CaseRow({ label, value, desc, caseKey, isDark, showTooltip }) {
  const c = isDark ? CASE_COLORS_DARK[caseKey] : CASE_COLORS[caseKey]
  return (
    <div className="rounded-xl p-4 border" style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <span className="font-semibold" style={{ fontSize: 17, color: c.label }}>
          {label}:
        </span>
        {showTooltip
          ? <BigOBadge value={value} isDark={isDark} />
          : <code className="font-mono font-bold rounded px-2 py-0.5"
              style={{ fontSize: 20, color: c.value, background: isDark ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.8)' }}>
              {value}
            </code>
        }
      </div>
      {desc && (
        <p style={{ fontSize: 15, color: isDark ? '#9ca3af' : '#6b7280', lineHeight: 1.6 }}>
          {desc}
        </p>
      )}
    </div>
  )
}

/* Speed label from Big-O notation */
function speedRating(bigO) {
  if (!bigO) return { label: '?', color: '#94a3b8', emoji: '❓' }
  const s = bigO.toLowerCase().replace(/\s/g, '')
  if (s === 'o(1)') return { label: 'Instant', color: '#34d399', emoji: '⚡' }
  if (s.includes('loglogn')) return { label: 'Very Fast', color: '#4ade80', emoji: '🚀' }
  if (s.includes('logn') && !s.includes('nlogn')) return { label: 'Very Fast', color: '#4ade80', emoji: '🚀' }
  if (s.includes('nlogn')) return { label: 'Fast', color: '#a3e635', emoji: '✅' }
  if (s === 'o(n)') return { label: 'Linear', color: '#fbbf24', emoji: '🚶' }
  if (s.includes('n²') || s.includes('n^2') || s.includes('ve')) return { label: 'Slow for large data', color: '#fb923c', emoji: '🐢' }
  if (s.includes('n³') || s.includes('n^3') || s.includes('2^n')) return { label: 'Very Slow', color: '#f87171', emoji: '🐌' }
  return { label: 'Varies', color: '#94a3b8', emoji: '📊' }
}

export default function ComplexityPanel({ metadata, isLight }) {
  const { isDark } = useTheme()
  const { beginner } = useBeginner()
  const showTooltip = beginner
  const c = metadata?.complexity
  if (!c) return null

  /* Use page-theme darkness for contrast; fall back to system dark mode */
  const onDark = isLight !== undefined ? !isLight : isDark
  const headingOrange = onDark ? '#fb923c' : '#c2410c'
  const headingBlue   = onDark ? '#60a5fa' : '#1d4ed8'
  const bodyColor     = onDark ? '#f1f5f9' : '#0f172a'
  const mutedColor    = onDark ? '#94a3b8' : '#475569'
  const cardBg        = onDark ? 'rgba(31,41,55,.6)' : 'rgba(255,255,255,0.8)'
  const cardBorder    = onDark ? 'rgba(75,85,99,.5)' : '#e5e7eb'

  /* Beginner speed summary */
  const bestSpeed  = speedRating(c.time?.best)
  const worstSpeed = speedRating(c.time?.worst)

  return (
    <div className="space-y-7">

      {/* ── Beginner speed overview ── */}
      {beginner && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          padding: '16px', borderRadius: 14,
          background: onDark ? 'rgba(31,41,55,.5)' : '#f8fafc',
          border: onDark ? '1px solid rgba(75,85,99,.4)' : '1px solid #e5e7eb',
          marginBottom: 4,
        }}>
          <div className="text-center">
            <div style={{ fontSize: 28 }}>{bestSpeed.emoji}</div>
            <div style={{ fontSize: 12, color: onDark ? '#9ca3af' : '#6b7280', marginTop: 2 }}>Best case</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: bestSpeed.color }}>{bestSpeed.label}</div>
            <code style={{ fontSize: 13, color: onDark ? '#d1d5db' : '#374151' }}>{c.time.best}</code>
          </div>
          <div className="text-center">
            <div style={{ fontSize: 28 }}>{worstSpeed.emoji}</div>
            <div style={{ fontSize: 12, color: onDark ? '#9ca3af' : '#6b7280', marginTop: 2 }}>Worst case</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: worstSpeed.color }}>{worstSpeed.label}</div>
            <code style={{ fontSize: 13, color: onDark ? '#d1d5db' : '#374151' }}>{c.time.worst}</code>
          </div>
        </div>
      )}

      {/* ── Time Complexity ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: headingOrange }}>
          <Clock size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>Time Complexity</span>
        </div>
        <div className="space-y-3">
          <CaseRow label="Best Case"    value={c.time.best}    desc={c.time.bestCase}    caseKey="best"    isDark={onDark} showTooltip={showTooltip} />
          <CaseRow label="Average Case" value={c.time.average} desc={c.time.averageCase} caseKey="average" isDark={onDark} showTooltip={showTooltip} />
          <CaseRow label="Worst Case"   value={c.time.worst}   desc={c.time.worstCase}   caseKey="worst"   isDark={onDark} showTooltip={showTooltip} />
        </div>
      </div>

      {/* ── Space Complexity ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-3" style={{ color: headingBlue }}>
          <Database size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>Space Complexity</span>
        </div>
        <div className="rounded-xl border p-4 flex items-start gap-4"
          style={{ background: cardBg, borderColor: cardBorder }}>
          <code className="font-mono font-bold flex-shrink-0 rounded px-2 py-0.5"
            style={{
              fontSize: 20,
              color: (c.space === 'O(1)' || c.space === 'O(log n)')
                ? (onDark ? '#34d399' : '#059669')
                : (onDark ? '#fbbf24' : '#d97706'),
              background: onDark ? 'rgba(0,0,0,.3)' : 'rgba(243,244,246,.8)',
            }}>
            {c.space}
          </code>
          <p style={{ fontSize: 17, color: bodyColor, lineHeight: 1.7 }}>
            {c.spaceDescription}
          </p>
        </div>
      </div>

      {/* ── Properties ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Stable',   value: c.stable,   desc: 'Preserves relative order of equal elements' },
          { label: 'Adaptive', value: c.adaptive, desc: 'Faster on nearly-sorted input' },
        ].map(prop => (
          <div key={prop.label} className="rounded-xl border p-4"
            style={{ background: cardBg, borderColor: cardBorder }}>
            <div className="font-semibold mb-1" style={{ fontSize: 15, color: mutedColor }}>
              {prop.label}
            </div>
            <div className="flex items-center gap-1.5 font-semibold mb-1"
              style={{
                fontSize: 17,
                color: prop.value
                  ? (onDark ? '#34d399' : '#059669')
                  : (onDark ? '#f87171' : '#dc2626'),
              }}>
              {prop.value ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {prop.value ? 'Yes' : 'No'}
            </div>
            <p style={{ fontSize: 13, color: mutedColor, lineHeight: 1.5 }}>{prop.desc}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
