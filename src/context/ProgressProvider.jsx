import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { subscribeToProgress, setLearned, setBookmark, progressKey } from '../firebase/progress'
import { recordDailyCompletion, recordQuizXp, recordSolved } from '../firebase/leaderboard'
import { computeXp, levelForXp, utcDateStr } from '../utils/xp'
import { ProgressContext } from './ProgressContext'

/* Per-user progress + engagement. One users/{uid} subscription feeds learned/
   bookmarks (client-writable) and the server-authoritative XP state (solved/
   daily/streak/quiz). XP-earning actions call Cloud Functions — the client
   never writes XP fields (firestore.rules enforces this) — and the resulting
   server write flows back through this same subscription. Signed out (or
   Firebase disabled) → empty state and no-op actions; the UI gates on `user`. */
const EMPTY = { learned: {}, bookmarks: {}, solved: {}, dailyCount: 0, currentStreak: 0, longestStreak: 0, lastDailyDate: '', quizXp: 0, quizXpDate: '', quizXpToday: 0 }

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  /* The snapshot carries the uid it belongs to, so switching accounts (or
     signing out) falls back to EMPTY by derivation rather than by an extra
     state write from inside the subscription effect. */
  const [snapshot, setSnapshot] = useState({ uid: null, data: EMPTY })

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToProgress(user.uid, (d) => setSnapshot({ uid: user.uid, data: d }))
    return () => unsub()
  }, [user])

  const fresh   = !!user && snapshot.uid === user.uid
  const data    = fresh ? snapshot.data : EMPTY
  const loading = !!user && !fresh

  const { learned, bookmarks, solved, dailyCount, currentStreak, longestStreak, lastDailyDate, quizXp } = data
  const solvedCount = Object.keys(solved).length
  const xp = computeXp({ solvedCount, dailyCount, quizXp })
  const level = levelForXp(xp)
  /* Server stamps completions in UTC, so the done-check must use UTC too. */
  const dailyDoneToday = !!lastDailyDate && lastDailyDate === utcDateStr()

  const isLearned    = (c, a) => !!learned[progressKey(c, a)]
  const isBookmarked = (c, a) => !!bookmarks[progressKey(c, a)]
  const isSolved     = (id) => !!solved[id]

  const toggleLearned  = (c, a) => { if (!user) return; setLearned(user.uid, progressKey(c, a), !learned[progressKey(c, a)]) }
  const toggleBookmark = (c, a) => { if (!user) return; setBookmark(user.uid, progressKey(c, a), !bookmarks[progressKey(c, a)]) }

  /* XP actions → Cloud Functions. Return the promise so callers can react to
     the result (e.g. a server-side daily-cap), but the UI updates itself when
     the server write arrives over the subscription. */
  const toggleSolved  = (id) => { if (!user) return Promise.resolve(null); return recordSolved(id, !solved[id]) }
  const completeDaily = () => { if (!user) return Promise.resolve(null); return recordDailyCompletion() }
  const awardQuizXp   = () => { if (!user) return Promise.resolve(null); return recordQuizXp() }

  return (
    <ProgressContext.Provider value={{
      learned, bookmarks, solved, loading,
      isLearned, isBookmarked, isSolved,
      toggleLearned, toggleBookmark, toggleSolved,
      xp, level, currentStreak, longestStreak, solvedCount, dailyCount, dailyDoneToday,
      completeDaily, awardQuizXp,
    }}>
      {children}
    </ProgressContext.Provider>
  )
}
