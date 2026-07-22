import { useState } from 'react'
import { Play } from 'lucide-react'
import categories from '../../data/categories.json'

const label = { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--chrome-text-muted)', marginBottom: 8 }

function seg(active) {
  return {
    padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
    background: active ? 'rgba(245,129,31,0.16)' : 'var(--page-surface-2)',
    border: `1px solid ${active ? 'rgba(245,129,31,0.5)' : 'var(--page-border)'}`,
    color: active ? 'var(--chip-orange-text)' : 'var(--chrome-text)', transition: 'all 0.15s',
  }
}
function chip(active) {
  return {
    padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? 'rgba(245,129,31,0.16)' : 'transparent',
    border: `1px solid ${active ? 'rgba(245,129,31,0.5)' : 'var(--page-border)'}`,
    color: active ? 'var(--chip-orange-text)' : 'var(--chrome-text-muted)', transition: 'all 0.15s',
  }
}

export default function GameSetup({ onStart }) {
  const [mode, setMode] = useState('endless')
  const [roundLength, setRoundLength] = useState(10)
  const [selected, setSelected] = useState([]) // empty = all

  const toggle = (id) => setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ color: 'var(--chrome-text)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🎮 Test Yourself</h1>
      <p style={{ color: 'var(--chrome-text-muted)', marginBottom: 24 }}>
        Predict how algorithms behave — next step, complexity, name, and final output. Pick a mode and topics, then go.
      </p>

      <div style={label}>Mode</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['endless', 'Endless streak'], ['rounds', 'Fixed rounds']].map(([m, txt]) => (
          <button key={m} type="button" onClick={() => setMode(m)} style={seg(mode === m)}>{txt}</button>
        ))}
      </div>

      {mode === 'rounds' && (
        <>
          <div style={label}>Questions per round</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[5, 10, 20].map(n => (
              <button key={n} type="button" onClick={() => setRoundLength(n)} style={seg(roundLength === n)}>{n}</button>
            ))}
          </div>
        </>
      )}

      <div style={label}>Topics</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        <button type="button" onClick={() => setSelected([])} style={chip(selected.length === 0)}>All</button>
        {categories.map(c => (
          <button key={c.id} type="button" onClick={() => toggle(c.id)} style={chip(selected.includes(c.id))}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <button type="button" onClick={() => onStart({ mode, categoryIds: selected, roundLength })}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: 'none',
          cursor: 'pointer', background: 'linear-gradient(135deg,#f5811f,#ff5722)', color: '#000', fontWeight: 800, fontSize: 16 }}>
        <Play size={16} /> Start
      </button>
    </div>
  )
}
