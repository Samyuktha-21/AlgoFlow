const bar = {
  display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
  padding: '10px 16px', borderRadius: 12, marginBottom: 16,
  background: 'var(--page-surface)', border: '1px solid var(--page-border)',
  color: 'var(--chrome-text)', fontSize: 14,
}

export default function ScoreBar({ session, best, onEnd }) {
  if (session.mode === 'endless') {
    return (
      <div style={bar}>
        <span>Score <b>{session.score}</b></span>
        <span>Streak <b>{session.streak}</b>🔥</span>
        <span style={{ color: 'var(--chrome-text-muted)' }}>Best {best?.bestScore ?? 0}</span>
        <button type="button" onClick={onEnd}
          style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--page-surface-2)', border: '1px solid var(--page-border)', color: 'var(--chrome-text)', fontWeight: 600, fontSize: 13 }}>
          End run
        </button>
      </div>
    )
  }
  return (
    <div style={bar}>
      <span>Question <b>{Math.min(session.index + 1, session.total)}</b> / {session.total}</span>
      <span style={{ marginLeft: 'auto' }}>Score <b>{session.score}</b></span>
    </div>
  )
}
