import { Globe, CheckCircle2, ArrowRight } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useBeginner } from '../../context/BeginnerContext'
import { getBeginnerData } from '../../data/beginnerData'

/* Company card — richer display for beginner data */
function CompanyCard({ company, logo, use, onDark }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12,
      background: onDark ? 'rgba(31,41,55,.5)' : '#f9fafb',
      border: onDark ? '1px solid rgba(75,85,99,.4)' : '1px solid #e5e7eb',
      marginBottom: 10,
    }}>
      <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{logo}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700,
          color: onDark ? '#f9fafb' : '#111827', marginBottom: 3 }}>
          {company}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.65,
          color: onDark ? '#d1d5db' : '#374151' }}>
          {use}
        </div>
      </div>
    </div>
  )
}

export default function ApplicationsPanel({ metadata, isLight }) {
  const { isDark } = useTheme()
  const { beginner } = useBeginner()
  const apps = metadata?.applications
  if (!apps) return null

  const bd = getBeginnerData(metadata?.id)

  /* Use page-theme darkness for contrast; fall back to system dark mode */
  const onDark = isLight !== undefined ? !isLight : isDark
  const bodyColor  = onDark ? '#f1f5f9' : '#0f172a'
  const mutedColor = onDark ? '#94a3b8' : '#475569'
  const purpleHead = onDark ? '#a78bfa' : '#6d28d9'
  const greenHead  = onDark ? '#34d399' : '#065f46'
  const orangeHead = onDark ? '#fb923c' : '#c2410c'
  const blueHead   = onDark ? '#60a5fa' : '#1d4ed8'

  /* Resolve alternatives — handle both string[] and {name,reason}[] formats */
  const rawAlts = bd?.alternatives || apps.alternatives || []
  const alternatives = rawAlts.map(a =>
    typeof a === 'string' ? { name: a, reason: '' } : a
  )

  /* Resolve real-world list — prefer beginner companies, fall back to realWorld strings */
  const hasCompanies = bd?.companies?.length > 0
  const hasEveryday  = bd?.everyday?.length > 0

  return (
    <div className="space-y-8">

      {/* ── Real Companies / Real-World Applications ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: purpleHead }}>
          <Globe size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>
            {hasCompanies ? '🏢 Used by Real Companies' : 'Real-World Applications'}
          </span>
        </div>

        {hasCompanies ? (
          bd.companies.map((c, i) => (
            <CompanyCard key={i} {...c} onDark={onDark} />
          ))
        ) : (
          <ul className="space-y-3">
            {(apps.realWorld || []).map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full mt-1"
                  style={{ width: 8, height: 8, background: isDark ? '#a78bfa' : '#7c3aed', marginTop: 7 }} />
                <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Everyday Examples (beginner mode only) ── */}
      {beginner && hasEveryday && (
        <div>
          <div className="flex items-center gap-2.5 mb-4" style={{ color: greenHead }}>
            <span style={{ fontSize: 18 }}>🌍</span>
            <span className="font-semibold" style={{ fontSize: 22 }}>Everyday Examples</span>
          </div>
          <ul className="space-y-3">
            {bd.everyday.map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: onDark ? 'rgba(52,211,153,.07)' : 'rgba(16,185,129,.07)',
                  border: `1px solid ${onDark ? 'rgba(52,211,153,.2)' : 'rgba(16,185,129,.2)'}` }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 16, color: bodyColor, lineHeight: 1.7 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── When to Use ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4" style={{ color: blueHead }}>
          <CheckCircle2 size={18} strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: 22 }}>When to Use</span>
        </div>
        <ul className="space-y-3">
          {(bd?.whenToUse || apps.whenToUse || []).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="flex-shrink-0"
                style={{ color: isDark ? '#34d399' : '#059669', marginTop: 3 }} />
              <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Alternatives ── */}
      {alternatives.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 mb-4" style={{ color: orangeHead }}>
            <ArrowRight size={18} strokeWidth={2} />
            <span className="font-semibold" style={{ fontSize: 22 }}>Alternatives</span>
          </div>
          <ul className="space-y-3">
            {alternatives.map((alt, i) => (
              <li key={i} className="flex items-start gap-3">
                <ArrowRight size={15} className="flex-shrink-0"
                  style={{ color: isDark ? '#fb923c' : '#ea580c', marginTop: 4 }} />
                <span style={{ fontSize: 17, color: bodyColor, lineHeight: 1.75 }}>
                  <strong>{alt.name}</strong>
                  {alt.reason && (
                    <span style={{ color: mutedColor }}> — {alt.reason}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}
