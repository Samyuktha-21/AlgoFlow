import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { subscribeToProgress, setLearned, setBookmark, setSolved, updateEngagement, progressKey } from '../firebase/progress'
import { computeXp, levelForXp, dateStr, nextStreak, addCappedQuizXp } from '../utils/xp'

/* Per-user progress + engagement. One users/{uid} subscription feeds learned/
   bookmarks (Phase 3b) and xp/streak/daily/solved (Phase 4a). Signed out (or
   Firebase disabled) → empty state and no-op actions; the UI gates on `user`. */
const ProgressContext = createContext(null)
const EMPTY = { learned: {}, bookmarks: {}, solved: {}, dailyCount: 0, currentStreak: 0, longestStreak: 0, lastDailyDate: '', quizXp: 0, quizXpDate: '', quizXpToday: 0 }

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setData(EMPTY); setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToProgress(user.uid, (d) => { setData(d); setLoading(false) })
    return () => unsub()
  }, [user])

  const { learned, bookmarks, solved, dailyCount, currentStreak, longestStreak, lastDailyDate, quizXp, quizXpDate, quizXpToday } = data
  const solvedCount = Object.keys(solved).length
  const xp = computeXp({ solvedCount, dailyCount, quizXp })
  const level = levelForXp(xp)
  const dailyDoneToday = !!lastDailyDate && lastDailyDate === dateStr()

  const isLearned    = (c, a) => !!learned[progressKey(c, a)]
  const isBookmarked = (c, a) => !!bookmarks[progressKey(c, a)]
  const isSolved     = (id) => !!solved[id]

  const toggleLearned  = (c, a) => { if (!user) return; setLearned(user.uid, progressKey(c, a), !learned[progressKey(c, a)]) }
  const toggleBookmark = (c, a) => { if (!user) return; setBookmark(user.uid, progressKey(c, a), !bookmarks[progressKey(c, a)]) }
  const toggleSolved   = (id) => { if (!user) return; setSolved(user.uid, id, !solved[id]) }

  const completeDaily = () => {
    if (!user) return
    const today = dateStr()
    const res = nextStreak(lastDailyDate, today, currentStreak, longestStreak)
    if (res.alreadyDone) return
    updateEngagement(user.uid, { dailyCount: dailyCount + 1, currentStreak: res.currentStreak, longestStreak: res.longestStreak, lastDailyDate: today })
  }

  const awardQuizXp = () => {
    if (!user) return
    const res = addCappedQuizXp(quizXp, quizXpToday, quizXpDate, dateStr())
    if (res.awarded <= 0) return
    updateEngagement(user.uid, { quizXp: res.quizXp, quizXpToday: res.quizXpToday, quizXpDate: res.quizXpDate })
  }

  return (
    <ProgressContext.Provider value={{
      learned, bookmarks, solved, loading,
      isLearned, isBookmarked, isSolved,
      toggleLearned, toggleBookmark, toggleSolved,
      xp, level, currentStreak, longestStreak, solvedCount, dailyDoneToday,
      completeDaily, awardQuizXp,
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
