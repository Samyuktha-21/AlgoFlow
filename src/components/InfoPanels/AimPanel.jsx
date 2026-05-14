import { Target, List, Lightbulb } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function AimPanel({ metadata }) {
  const { isDark } = useTheme()
  if (!metadata) return null

  const headingColor = isDark ? '#60a5fa' : '#1e40af'
  const bodyColor    = isDark ? '#d1d5db' : '#1f2937'
  const mutedColor   = isDark ? '#9ca3af' : '#4b5563'

  return (
    <div className="space-y-7">

      {/* ── Aim ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-3" style={{ color: headingColor }}>
          <Target size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>Aim</span>
        </div>
        <p className="leading-relaxed" style={{ fontSize: 18, color: bodyColor, lineHeight: 1.8 }}>
          {metadata.aim}
        </p>
      </div>

      {/* ── How it works ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4"
          style={{ color: isDark ? '#34d399' : '#065f46' }}>
          <List size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>How It Works</span>
        </div>
        <ol className="space-y-3">
          {(metadata.howItWorks || []).map((step, i) => (
            <li key={i} className="flex items-start gap-3.5">
              <span
                className="flex-shrink-0 flex items-center justify-center rounded-full font-bold mt-0.5"
                style={{
                  width: 26, height: 26, fontSize: 13,
                  background: isDark ? 'rgba(59,130,246,.2)' : '#dbeafe',
                  color: isDark ? '#60a5fa' : '#1d4ed8',
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Quick summary ── */}
      <div
        className="rounded-xl p-5"
        style={{
          borderLeft: '5px solid #3b82f6',
          background: isDark ? 'rgba(59,130,246,.08)' : 'rgba(219,234,254,.5)',
        }}
      >
        <div className="flex items-center gap-2 mb-2" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
          <Lightbulb size={16} />
          <span className="font-semibold" style={{ fontSize: 15 }}>Quick Summary</span>
        </div>
        <p style={{ fontSize: 16, color: mutedColor, lineHeight: 1.7 }}>
          {metadata.description}
        </p>
      </div>

    </div>
  )
}
