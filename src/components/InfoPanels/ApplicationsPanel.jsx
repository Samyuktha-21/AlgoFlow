import { Globe, CheckCircle2, ArrowRight, Zap } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ApplicationsPanel({ metadata }) {
  const { isDark } = useTheme()
  const apps = metadata?.applications
  if (!apps) return null

  const bodyColor  = isDark ? '#d1d5db' : '#1f2937'
  const mutedColor = isDark ? '#9ca3af' : '#4b5563'

  const purpleHead = isDark ? '#a78bfa' : '#6d28d9'
  const greenHead  = isDark ? '#34d399' : '#065f46'
  const orangeHead = isDark ? '#fb923c' : '#c2410c'

  return (
    <div className="space-y-8">

      {/* ── Real-World Applications ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: purpleHead }}>
          <Globe size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>Real-World Applications</span>
        </div>
        <ul className="space-y-3">
          {(apps.realWorld || []).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full mt-1"
                style={{ width: 8, height: 8, background: isDark ? '#a78bfa' : '#7c3aed', marginTop: 7 }} />
              <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── When to Use ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: greenHead }}>
          <Zap size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>When to Use</span>
        </div>
        <ul className="space-y-3">
          {(apps.whenToUse || []).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="flex-shrink-0"
                style={{ color: isDark ? '#34d399' : '#059669', marginTop: 2 }} />
              <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Use Alternatives When ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: orangeHead }}>
          <ArrowRight size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>Use Alternatives When</span>
        </div>
        <ul className="space-y-3">
          {(apps.alternatives || []).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <ArrowRight size={16} className="flex-shrink-0"
                style={{ color: isDark ? '#fb923c' : '#ea580c', marginTop: 3 }} />
              <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
