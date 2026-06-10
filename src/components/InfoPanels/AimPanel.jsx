import { Target, List, Lightbulb, HelpCircle, Zap, Clock } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useBeginner } from '../../context/BeginnerContext'
import { getBeginnerData } from '../../data/beginnerData'

function SimpleCard({ icon, title, children, color }) {
  return (
    <div style={{
      padding: '14px 18px', borderRadius: 12, marginBottom: 12,
      background: `${color}0f`, border: `1px solid ${color}28`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>{title}</span>
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.72, margin: 0, color: 'var(--color-text-secondary)' }}>
        {children}
      </p>
    </div>
  )
}

export default function AimPanel({ metadata, isLight }) {
  const { isDark } = useTheme()
  const { beginner } = useBeginner()
  if (!metadata) return null

  const bd = getBeginnerData(metadata.id)

  /* Use page-theme darkness for contrast; fall back to system dark mode */
  const onDark = isLight !== undefined ? !isLight : isDark
  const headingColor = onDark ? '#60a5fa' : '#1e40af'
  const bodyColor    = onDark ? '#f1f5f9' : '#0f172a'
  const mutedColor   = onDark ? '#94a3b8' : '#475569'

  /* ── BEGINNER MODE ── */
  if (beginner && bd) {
    return (
      <div className="space-y-5">
        {/* Big analogy card */}
        <div style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(52,211,153,0.08)',
          border: '2px solid rgba(52,211,153,0.3)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{bd.emoji}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
            Think of it like this:
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: bodyColor, margin: 0 }}>
            {bd.analogy}
          </p>
        </div>

        {/* What / Why / When */}
        <SimpleCard icon="🤔" title="What does it do?" color="#60a5fa">
          {bd.what}
        </SimpleCard>
        <SimpleCard icon="💡" title="Why is it useful?" color="#fbbf24">
          {bd.why}
        </SimpleCard>
        <SimpleCard icon="⏰" title="When do we use it?" color="#a78bfa">
          {bd.when}
        </SimpleCard>
      </div>
    )
  }

  /* ── BEGINNER MODE — no specific data, simplified fallback ── */
  if (beginner && !bd) {
    return (
      <div className="space-y-5">
        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.25)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
            What does it do?
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: bodyColor, margin: 0 }}>
            {metadata.description}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3" style={{ color: headingColor }}>
            <List size={17} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Step by step:</span>
          </div>
          <ol className="space-y-2.5">
            {(metadata.howItWorks || []).map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center rounded-full font-bold"
                  style={{ width: 24, height: 24, fontSize: 12, marginTop: 2,
                    background: 'rgba(59,130,246,.2)', color: onDark ? '#60a5fa' : '#1d4ed8' }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 16, color: bodyColor, lineHeight: 1.7 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    )
  }

  /* ── TECHNICAL MODE (default) ── */
  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-2.5 mb-3" style={{ color: headingColor }}>
          <Target size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>Aim</span>
        </div>
        <p className="leading-relaxed" style={{ fontSize: 18, color: bodyColor, lineHeight: 1.8 }}>
          {metadata.aim}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2.5 mb-4"
          style={{ color: onDark ? '#34d399' : '#065f46' }}>
          <List size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>How It Works</span>
        </div>
        <ol className="space-y-3">
          {(metadata.howItWorks || []).map((step, i) => (
            <li key={i} className="flex items-start gap-3.5">
              <span className="flex-shrink-0 flex items-center justify-center rounded-full font-bold mt-0.5"
                style={{ width: 26, height: 26, fontSize: 13,
                  background: onDark ? 'rgba(59,130,246,.2)' : '#dbeafe',
                  color: onDark ? '#60a5fa' : '#1d4ed8' }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl p-5"
        style={{ borderLeft: '5px solid #3b82f6',
          background: onDark ? 'rgba(59,130,246,.08)' : 'rgba(219,234,254,.5)' }}>
        <div className="flex items-center gap-2 mb-2" style={{ color: onDark ? '#60a5fa' : '#1d4ed8' }}>
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
