import {
  doc, onSnapshot, updateDoc, setDoc, deleteField, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseEnabled } from './config'
import { progressKey } from '../utils/progressStats'

export { progressKey }

/* NOTE: learned/bookmarks are still written directly by the client (allowed by
   firestore.rules). Every XP-bearing field (solved, dailyCount, streaks,
   quizXp*, xp) is now server-authoritative and written ONLY by Cloud Functions
   — see src/firebase/leaderboard.js (recordDailyCompletion/recordQuizXp/
   recordSolved). The old client XP writers were removed so rules can lock XP. */

/* Real-time subscription to the signed-in user's progress maps.
   cb receives { learned, bookmarks } (each defaulting to {}). */
export function subscribeToProgress(uid, cb) {
  if (!firebaseEnabled || !db || !uid) return () => {}
  try {
    return onSnapshot(
      doc(db, 'users', uid),
      snap => {
        const d = snap.exists() ? snap.data() : {}
        cb({
          learned: d.learned || {},
          bookmarks: d.bookmarks || {},
          solved: d.solved || {},
          dailyCount: d.dailyCount || 0,
          currentStreak: d.currentStreak || 0,
          longestStreak: d.longestStreak || 0,
          lastDailyDate: d.lastDailyDate || '',
          quizXp: d.quizXp || 0,
          quizXpDate: d.quizXpDate || '',
          quizXpToday: d.quizXpToday || 0,
        })
      },
      e => console.warn('Progress subscription failed:', e.message),
    )
  } catch (e) {
    console.warn('Progress subscription failed:', e.message)
    return () => {}
  }
}

/* Set or clear one nested map field, e.g. learned["graphs__bfs"].
   updateDoc uses the dotted path; if the user doc doesn't exist yet we
   fall back to a merge create. */
async function setField(uid, field, key, on) {
  if (!firebaseEnabled || !db || !uid) return
  const ref = doc(db, 'users', uid)
  const value = on ? serverTimestamp() : deleteField()
  try {
    await updateDoc(ref, { [`${field}.${key}`]: value })
  } catch {
    try {
      await setDoc(ref, { [field]: { [key]: value } }, { merge: true })
    } catch (e2) {
      console.warn('Progress write failed:', e2.message)
    }
  }
}

export function setLearned(uid, key, on)  { return setField(uid, 'learned', key, on) }
export function setBookmark(uid, key, on) { return setField(uid, 'bookmarks', key, on) }
