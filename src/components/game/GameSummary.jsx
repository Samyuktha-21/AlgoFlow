const TYPE_LABELS = {
  nextOp: 'Predict next step',
  complexity: 'Guess the complexity',
  nameAlgorithm: 'Name the algorithm',
  finalOutput: 'Predict final output',
}

const btn = (primary) => ({
  padding: '11px 24px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 15,
  border: primary ? 'none' : '1px solid var(--page-border)',
  background: primary ? 'linear-gradient(135deg,#f5811f,#ff5722)' : 'transparent',
  color: primary ? '#000' : 'var(--chrome-text)',
})

export default function GameSummary({ session, isNewBest, onPlayAgain, onChangeSettings }) {
  const isEndless = session.mode === 'endless'
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--chrome-text)', fontSize: 28, fontWeight: 800 }}>
        {isEndless ? 'Run over' : 'Round complete'}
      </h2>
      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--chip-orange-text)', margin: '12px 0' }}>
        {isEndless ? session.score : `${session.score} / ${session.total}`}
      </div>

      {isEndless && (
        <p style={{ color: 'var(--chrome-text-muted)' }}>
          Best streak this run: <b style={{ color: 'var(--chrome-text)' }}>{session.maxStreak}</b>
          {isNewBest ? ' — New best! 🎉' : ''}
        </p>
      )}

      {!isEndless && Object.keys(session.perType).length > 0 && (
        <div style={{ display: 'grid', gap: 8, margin: '18px 0', textAlign: 'left' }}>
          {Object.entries(session.perType).map(([t, v]) => (
            <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8,
              background: 'var(--page-surface)', border: '1px solid var(--page-border)', color: 'var(--chrome-text)' }}>
              <span>{TYPE_LABELS[t] || t}</span>
              <b>{v.correct}/{v.total}</b>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22 }}>
        <button type="button" onClick={onPlayAgain} style={btn(true)}>Play again</button>
        <button type="button" onClick={onChangeSettings} style={btn(false)}>Change settings</button>
      </div>
    </div>
  )
}
