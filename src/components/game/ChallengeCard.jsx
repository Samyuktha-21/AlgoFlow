import { Suspense, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { VISUALIZER_MAP } from '../Visualizer/visualizerMap'

const MONO = "'IBM Plex Mono', monospace"

function Spinner() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 220 }}>
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function VizFrozen({ render }) {
  const Viz = VISUALIZER_MAP[render.algorithmType] || VISUALIZER_MAP.array
  return (
    <Suspense fallback={<Spinner />}>
      <Viz step={render.step} themeId={render.themeId} metadata={render.metadata} />
    </Suspense>
  )
}

function VizAnimated({ render }) {
  const [i, setI] = useState(0)
  // increment forever; modulo keeps the index valid even when `render` changes
  useEffect(() => {
    const id = setInterval(() => setI(v => v + 1), 500)
    return () => clearInterval(id)
  }, [render])
  const Viz = VISUALIZER_MAP[render.algorithmType] || VISUALIZER_MAP.array
  const step = render.steps[i % render.steps.length]
  return (
    <Suspense fallback={<Spinner />}>
      <Viz step={step} themeId={render.themeId} metadata={render.metadata} />
    </Suspense>
  )
}

function optionStyle(state) {
  const base = {
    display: 'flex', alignItems: 'center', gap: 8,
    textAlign: 'left', padding: '12px 14px', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: state === 'idle' ? 'pointer' : 'default',
    background: 'var(--page-surface-2)', border: '1px solid var(--page-border)',
    color: 'var(--chrome-text)', transition: 'all 0.15s', width: '100%',
  }
  if (state === 'correct') return { ...base, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.55)', color: 'var(--chip-green-text)' }
  if (state === 'wrong')   return { ...base, background: 'rgba(239,68,68,0.12)',  border: '1px solid rgba(239,68,68,0.55)',  color: 'var(--chip-red-text)' }
  return base
}

const frame = {
  background: 'rgba(0,0,0,0.28)', borderRadius: 12, overflow: 'hidden',
  border: '1px solid var(--page-border)', marginBottom: 4,
}

export default function ChallengeCard({ challenge, answered, selectedIndex, onSelect, onNext }) {
  const { prompt, options, renderMode, render, explanation } = challenge
  const chosenCorrect = answered && options[selectedIndex]?.isCorrect

  return (
    <div style={{ background: 'var(--page-surface)', border: '1px solid var(--page-border)', borderRadius: 16, padding: '1.25rem 1.5rem' }}>
      {renderMode === 'frozen'   && <div style={frame}><VizFrozen render={render} /></div>}
      {renderMode === 'animated' && <div style={frame}><VizAnimated render={render} /></div>}
      {renderMode === 'input'    && (
        <div style={{ background: 'var(--page-surface-2)', border: '1px solid var(--page-border)', borderRadius: 10, padding: '10px 14px', marginBottom: 4, color: 'var(--chrome-text-muted)', fontSize: 14 }}>
          Input: <span style={{ fontFamily: MONO, color: 'var(--chrome-text)' }}>{render.inputText}</span>
        </div>
      )}

      <h3 style={{ color: 'var(--chrome-text)', fontSize: 18, fontWeight: 700, margin: '1rem 0' }}>{prompt}</h3>

      <div style={{ display: 'grid', gap: 10 }}>
        {options.map((o, i) => {
          const state = !answered ? 'idle' : o.isCorrect ? 'correct' : i === selectedIndex ? 'wrong' : 'idle'
          return (
            <button key={i} type="button" disabled={answered} aria-pressed={selectedIndex === i}
              onClick={() => onSelect(i)} style={optionStyle(state)}>
              {answered && o.isCorrect && <Check size={16} />}
              {answered && !o.isCorrect && i === selectedIndex && <X size={16} />}
              {o.label}
            </button>
          )
        })}
      </div>

      {answered && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: chosenCorrect ? 'var(--chip-green-text)' : 'var(--chip-red-text)', fontWeight: 700, marginBottom: 6 }}>
            {chosenCorrect ? '✓ Correct!' : '✗ Not quite'}
          </div>
          <p style={{ color: 'var(--chrome-text-muted)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{explanation}</p>
          {onNext && (
            <button type="button" onClick={onNext}
              style={{ marginTop: 14, padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#f5811f,#ff5722)', color: '#000', fontWeight: 700, fontSize: 14 }}>
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
