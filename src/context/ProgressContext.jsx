import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { subscribeToProgress, setLearned, setBookmark, progressKey } from '../firebase/progress'

/* Per-user learning progress. Subscribes to users/{uid} while signed in and
   exposes learned/bookmark state + toggles. Signed out (or Firebase disabled)
   → empty maps and no-op toggles; the UI gates on `user` before calling. */
const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [learned, setLearnedMap] = useState({})
  const [bookmarks, setBookmarks] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setLearnedMap({}); setBookmarks({}); setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToProgress(user.uid, ({ learned: l, bookmarks: b }) => {
      setLearnedMap(l); setBookmarks(b); setLoading(false)
    })
    return () => unsub()
  }, [user])

  const isLearned    = (c, a) => !!learned[progressKey(c, a)]
  const isBookmarked = (c, a) => !!bookmarks[progressKey(c, a)]

  const toggleLearned = (c, a) => {
    if (!user) return
    const key = progressKey(c, a)
    setLearned(user.uid, key, !learned[key])
  }
  const toggleBookmark = (c, a) => {
    if (!user) return
    const key = progressKey(c, a)
    setBookmark(user.uid, key, !bookmarks[key])
  }

  return (
    <ProgressContext.Provider value={{ learned, bookmarks, loading, isLearned, isBookmarked, toggleLearned, toggleBookmark }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
