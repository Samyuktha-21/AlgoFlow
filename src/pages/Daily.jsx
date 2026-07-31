import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Flame } from 'lucide-react'
import Seo from '../components/Seo'
import ChallengeCard from '../components/game/ChallengeCard'
import { buildPool, allNames } from '../game/pool'
import { makeDailyChallenge } from '../game/dailyChallenge'
import { utcDateStr } from '../utils/xp'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'

/* Quiz of the day: a deterministic challenge for today. A correct answer (when
   signed in) completes the daily → +20 XP and advances the streak. Signed-out
   users can attempt it but nothing is recorded. See the Phase 4a design spec. */
export default function Daily() {
  const { user, signInWithGoogle } = useAuth()
  const { dailyDoneToday, currentStreak, xp, completeDaily } = useProgress()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    let live = true
    ;(async () => {
      const pool = buildPool([])
      const ch = await makeDailyChallenge(utcDateStr(), pool, allNames(pool))
      if (live) { setChallenge(ch); setLoading(false) }
    })()
    return () => { live = false }
  }, [])

  const onSelect = (i) => {
    if (answered) return
    setSelectedIndex(i)
    setAnswered(true)
    if (challenge?.options[i]?.isCorrect && user && !dailyDoneToday) {
      completeDaily()   // one server call updates profile XP + public board together
    }
  }
  const retry = () => { setAnswered(false); setSelectedIndex(-1) }

  const correct = answered && challenge?.options[selectedIndex]?.isCorrect

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo title="Daily Challenge" description="Solve today's algorithm quiz challenge, earn XP, and keep your streak going on AlgoFlow." />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 16, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Daily Challenge</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Flame size={24} style={{ color: '#fb923c' }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--chrome-text)', margin: 0 }}>Daily Challenge</h1>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 18px' }}>
          One quiz question a day — same for everyone. {user ? `🔥 ${currentStreak}-day streak · ${xp} XP` : ''}
        </p>

        {!user && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(245,129,31,0.1)', border: '1px solid rgba(245,129,31,0.3)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--chrome-text)' }}>Sign in to earn XP and keep your streak.</span>
            <button type="button" onClick={signInWithGoogle} style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#f5811f', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              Sign in
            </button>
          </div>
        )}

        {dailyDoneToday ? (
          <DonePanel currentStreak={currentStreak} />
        ) : loading || !challenge ? (
          <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
            <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ChallengeCard challenge={challenge} answered={answered} selectedIndex={selectedIndex} onSelect={onSelect} />
            {answered && !correct && (
              <button type="button" onClick={retry}
                style={{ marginTop: 14, padding: '10px 22px', borderRadius: 10, border: '1px solid var(--page-border)', cursor: 'pointer', background: 'var(--page-surface-2)', color: 'var(--chrome-text)', fontWeight: 700, fontSize: 14 }}>
                Try again
              </button>
            )}
            {correct && <div style={{ marginTop: 14 }}><DonePanel currentStreak={currentStreak} justEarned={!!user} /></div>}
          </>
        )}
      </div>
    </div>
  )
}

function DonePanel({ currentStreak, justEarned }) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--page-surface)', border: '1px solid rgba(52,211,153,0.4)' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--chip-green-text)', marginBottom: 6 }}>✓ Daily complete!</div>
      <p style={{ fontSize: 14, color: 'var(--chrome-text-muted)', margin: 0 }}>
        {justEarned ? '+20 XP · ' : ''}🔥 {currentStreak}-day streak. Come back tomorrow for the next one.
      </p>
    </div>
  )
}
