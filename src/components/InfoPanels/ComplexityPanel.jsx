import { Clock, Database, CheckCircle2, XCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

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

function CaseRow({ label, value, desc, caseKey, isDark }) {
  const c = isDark ? CASE_COLORS_DARK[caseKey] : CASE_COLORS[caseKey]
  return (
    <div className="rounded-xl p-4 border" style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <span className="font-semibold" style={{ fontSize: 17, color: c.label }}>
          {label}:
        </span>
        <code className="font-mono font-bold rounded px-2 py-0.5"
          style={{ fontSize: 20, color: c.value, background: isDark ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.8)' }}>
          {value}
        </code>
      </div>
      {desc && (
        <p style={{ fontSize: 15, color: isDark ? '#9ca3af' : '#6b7280', lineHeight: 1.6 }}>
          {desc}
        </p>
      )}
    </div>
  )
}

export default function ComplexityPanel({ metadata }) {
  const { isDark } = useTheme()
  const c = metadata?.complexity
  if (!c) return null

  const headingOrange = isDark ? '#fb923c' : '#c2410c'
  const headingBlue   = isDark ? '#60a5fa' : '#1d4ed8'
  const bodyColor     = isDark ? '#d1d5db' : '#1f2937'
  const mutedColor    = isDark ? '#9ca3af' : '#4b5563'
  const cardBg        = isDark ? 'rgba(31,41,55,.6)' : '#ffffff'
  const cardBorder    = isDark ? 'rgba(75,85,99,.5)' : '#e5e7eb'

  return (
    <div className="space-y-7">

      {/* ── Time Complexity ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: headingOrange }}>
          <Clock size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>Time Complexity</span>
        </div>
        <div className="space-y-3">
          <CaseRow label="Best Case"    value={c.time.best}    desc={c.time.bestCase}    caseKey="best"    isDark={isDark} />
          <CaseRow label="Average Case" value={c.time.average} desc={c.time.averageCase} caseKey="average" isDark={isDark} />
          <CaseRow label="Worst Case"   value={c.time.worst}   desc={c.time.worstCase}   caseKey="worst"   isDark={isDark} />
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
                ? (isDark ? '#34d399' : '#059669')
                : (isDark ? '#fbbf24' : '#d97706'),
              background: isDark ? 'rgba(0,0,0,.3)' : 'rgba(243,244,246,.8)',
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
                  ? (isDark ? '#34d399' : '#059669')
                  : (isDark ? '#f87171' : '#dc2626'),
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
