import { Globe, CheckCircle2, ArrowRight } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useBeginner } from '../../context/BeginnerContext'
import { getBeginnerData } from '../../data/beginnerData'

/* Company card — richer display for beginner data */
function CompanyCard({ company, logo, use, isDark }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12,
      background: isDark ? 'rgba(31,41,55,.5)' : '#f9fafb',
      border: isDark ? '1px solid rgba(75,85,99,.4)' : '1px solid #e5e7eb',
      marginBottom: 10,
    }}>
      <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{logo}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700,
          color: isDark ? '#f9fafb' : '#111827', marginBottom: 3 }}>
          {company}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.65,
          color: isDark ? '#d1d5db' : '#374151' }}>
          {use}
        </div>
      </div>
    </div>
  )
}

export default function ApplicationsPanel({ metadata }) {
  const { isDark } = useTheme()
  const { beginner } = useBeginner()
  const apps = metadata?.applications
  if (!apps) return null

  const bd = getBeginnerData(metadata?.id)

  const bodyColor  = isDark ? '#d1d5db' : '#1f2937'
  const mutedColor = isDark ? '#9ca3af' : '#4b5563'
  const purpleHead = isDark ? '#a78bfa' : '#6d28d9'
  const greenHead  = isDark ? '#34d399' : '#065f46'
  const orangeHead = isDark ? '#fb923c' : '#c2410c'
  const blueHead   = isDark ? '#60a5fa' : '#1d4ed8'

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
            <CompanyCard key={i} {...c} isDark={isDark} />
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
                style={{ background: isDark ? 'rgba(52,211,153,.07)' : 'rgba(16,185,129,.07)',
                  border: `1px solid ${isDark ? 'rgba(52,211,153,.2)' : 'rgba(16,185,129,.2)'}` }}>
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
