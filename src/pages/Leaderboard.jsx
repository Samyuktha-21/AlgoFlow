import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Trophy, Flame } from 'lucide-react'
import Seo from '../components/Seo'
import { subscribeToLeaderboard } from '../firebase/leaderboard'
import { rankEntries } from '../utils/leaderboard'
import { useAuth } from '../context/AuthContext'

/* Public leaderboard. Ranks players by total XP (daily + quiz + practice),
   computed server-side and mirrored to leaderboard/{uid} by the Cloud
   Functions. Anyone can view; the board is function-written only, so scores
   can't be forged from the client. */
const MEDAL = { 1: '#facc15', 2: '#cbd5e1', 3: '#d8a06a' }

export default function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)

  useEffect(() => {
    const unsub = subscribeToLeaderboard(50, (list) => setRows(rankEntries(list)))
    return () => unsub()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo title="Leaderboard" description="See who's on top of the AlgoFlow daily-challenge leaderboard — ranked by verified streaks and daily completions." />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 16, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Leaderboard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Trophy size={24} style={{ color: '#facc15' }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--chrome-text)', margin: 0 }}>Leaderboard</h1>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 18px' }}>
          Ranked by total XP — daily challenges, quizzes, and solved problems, computed server-side.
          {' '}<Link to="/daily" style={{ color: '#f5811f', fontWeight: 600, textDecoration: 'none' }}>Play today's →</Link>
        </p>

        {rows === null ? (
          <div className="flex items-center justify-center" style={{ minHeight: 220 }}>
            <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 14, borderRadius: 12, background: 'var(--page-surface)', border: '1px solid var(--page-border)' }}>
            No one's on the board yet. Complete a <Link to="/daily" style={{ color: '#f5811f', fontWeight: 600 }}>daily challenge</Link> to be the first!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rows.map((e) => {
              const isMe = user && e.uid === user.uid
              return (
                <div key={e.uid} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12,
                  background: isMe ? 'rgba(245,129,31,0.1)' : 'var(--page-surface)',
                  border: `1px solid ${isMe ? 'rgba(245,129,31,0.4)' : 'var(--page-border)'}`,
                }}>
                  <span style={{
                    width: 26, textAlign: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0,
                    color: MEDAL[e.rank] || 'var(--chrome-text-muted)',
                  }}>{e.rank}</span>
                  {e.photoURL
                    ? <img src={e.photoURL} alt="" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--page-border)', flexShrink: 0 }} />
                    : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--page-surface-2)', border: '1px solid var(--page-border)', flexShrink: 0 }} />}
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--chrome-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.displayName || 'Anonymous'}{isMe ? ' (you)' : ''}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--chrome-text-muted)', flexShrink: 0 }}>
                    <Flame size={13} style={{ color: '#fb923c' }} /> {e.longestStreak || 0}
                  </span>
                  <span style={{ width: 64, textAlign: 'right', fontSize: 14, fontWeight: 800, color: 'var(--chrome-text)', flexShrink: 0 }}>
                    {e.score || 0}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
