import { useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import categories from '../../data/categories.json'
import registry from '../../data/algorithmRegistry.json'
import { practiceProblems } from '../../data/practiceProblems'
import { filterProblems } from '../../utils/practiceFilter'

const DIFF = {
  easy:   { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  medium: { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  hard:   { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
}
const SELECT_STYLE = {
  background: 'var(--page-surface)', border: '1px solid var(--page-border)',
  borderRadius: 10, padding: '0.55rem 0.8rem', color: 'var(--chrome-text)',
  fontSize: '0.85rem', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 0,
}
const MONO = "'IBM Plex Mono', monospace"

export default function PracticeProblemList({ topic, algo, onTopicChange, onAlgoChange, activeId, onSelectProblem }) {
  const algoOptions = useMemo(
    () => topic === 'all' ? [] : (registry[topic] || []).map(a => ({ id: a.id, name: a.name })),
    [topic],
  )
  const problems = useMemo(() => filterProblems(practiceProblems, topic, algo), [topic, algo])
  const active = useMemo(() => problems.find(p => p.id === activeId) || null, [problems, activeId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10 }}>
        <select value={topic} onChange={e => onTopicChange(e.target.value)} style={SELECT_STYLE} aria-label="Topic">
          <option value="all">All Topics</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={algo} onChange={e => onAlgoChange(e.target.value)} disabled={topic === 'all'}
          style={{ ...SELECT_STYLE, opacity: topic === 'all' ? 0.5 : 1 }} aria-label="Algorithm">
          <option value="all">All Algorithms</option>
          {algoOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Problem list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
        {problems.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
            No curated problems here yet — try the topic level or browse all.
          </div>
        ) : problems.map(p => {
          const dc = DIFF[p.difficulty] || DIFF.medium
          const isActive = p.id === activeId
          return (
            <div key={p.id} onClick={() => onSelectProblem(p)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 0.9rem',
              background: isActive ? 'var(--page-surface-2)' : 'var(--page-surface)',
              border: `1px solid ${isActive ? 'rgba(245,129,31,0.4)' : 'var(--page-border)'}`,
              borderRadius: 12, cursor: 'pointer',
            }}>
              <span style={{
                background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
                borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700,
                textTransform: 'capitalize', flexShrink: 0,
              }}>{p.difficulty}</span>
              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: 'var(--chrome-text)' }}>{p.title}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--chrome-text-muted)', flexShrink: 0 }}>{p.source}</span>
              <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                title={`Open on ${p.source}`} style={{ color: '#fdba74', display: 'inline-flex', flexShrink: 0 }}>
                <ExternalLink size={14} />
              </a>
            </div>
          )
        })}
      </div>

      {/* Active problem: prompt + example cases (self-check target) */}
      {active && (
        <div style={{ padding: '1rem 1.1rem', borderRadius: 14, background: 'var(--page-surface)', border: '1px solid rgba(245,129,31,0.28)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#f5811f' }}>NOW SOLVING</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--chrome-text)' }}>{active.title}</span>
            <a href={active.url} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#fdba74', textDecoration: 'none' }}>
              Open on {active.source} <ExternalLink size={12} />
            </a>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--chrome-text-muted)', lineHeight: 1.55, margin: '0 0 10px' }}>{active.prompt}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {active.examples.map((ex, i) => (
              <div key={i} style={{
                fontFamily: MONO, fontSize: '0.78rem', color: 'var(--chrome-text)',
                background: 'var(--page-surface-2)', border: '1px solid var(--page-border)', borderRadius: 8, padding: '6px 10px',
              }}>
                <span style={{ color: '#64748b' }}>in:</span> {ex.input}{'   '}<span style={{ color: '#64748b' }}>→</span> {ex.output}
                {ex.note && <div style={{ color: '#64748b', marginTop: 2 }}>{ex.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
