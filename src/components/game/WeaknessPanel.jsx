import { Target } from 'lucide-react'
import { weaknessRows, totalAnswered, MIN_SAMPLES } from '../../game/weakness'

/*
 * "You miss swaps 60% of the time" — Item 3's panel.
 *
 * Shows nothing until there are enough answers for a rate to mean something.
 * A learner who has answered three questions does not have a weakness; they
 * have three data points, and a panel confidently telling them otherwise
 * would be worse than no panel.
 */

const bar = (missRate) => ({
  height: 6, borderRadius: 999, background: 'var(--page-surface-2)',
  border: '1px solid var(--page-border)', overflow: 'hidden', marginTop: 5,
  '--w': `${Math.round(missRate * 100)}%`,
})

export default function WeaknessPanel({ weakness, limit = 5, compact }) {
  const answered = totalAnswered(weakness)
  const rows = weaknessRows(weakness).slice(0, limit)

  if (!rows.length) {
    if (compact) return null
    return (
      <div style={{
        background: 'var(--page-surface)', border: '1px solid var(--page-border)',
        borderRadius: 14, padding: '1rem 1.25rem', color: 'var(--chrome-text-muted)', fontSize: 14, lineHeight: 1.6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Target size={16} style={{ color: 'var(--chrome-text)' }} />
          <strong style={{ color: 'var(--chrome-text)' }}>Weak spots</strong>
        </div>
        {answered === 0
          ? <>Answer some “what happens next?” questions in Test Yourself and this will show which kinds of step you miss most.</>
          : <>{answered} answered so far. Each kind of step needs {MIN_SAMPLES} answers before a rate means anything.</>}
      </div>
    )
  }

  const worst = rows[0]

  return (
    <div style={{
      background: 'var(--page-surface)', border: '1px solid var(--page-border)',
      borderRadius: 14, padding: '1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Target size={16} style={{ color: 'var(--chrome-text)' }} />
        <strong style={{ color: 'var(--chrome-text)' }}>Weak spots</strong>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--chrome-text-muted)' }}>
          {answered} answered
        </span>
      </div>

      {worst.missRate > 0 && (
        <p style={{ color: 'var(--chrome-text-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
          You miss <strong style={{ color: 'var(--chrome-text)' }}>{worst.label}</strong> steps{' '}
          {Math.round(worst.missRate * 100)}% of the time. Test Yourself now leans toward these.
        </p>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map(r => (
          <div key={r.key}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--chrome-text)', fontWeight: 600, textTransform: 'capitalize' }}>{r.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--chrome-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {r.correct}/{r.total} right
              </span>
              <span style={{
                fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                color: r.missRate >= 0.5 ? 'var(--chip-red-text)' : 'var(--chrome-text-muted)',
                minWidth: 40, textAlign: 'right',
              }}>
                {Math.round(r.missRate * 100)}%
              </span>
            </div>
            <div style={bar(r.missRate)}>
              <div style={{
                height: '100%', width: `${Math.round(r.missRate * 100)}%`,
                background: r.missRate >= 0.5
                  ? 'linear-gradient(90deg,#ef4444,#f97316)'
                  : 'linear-gradient(90deg,#f5811f,#fbbf24)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
