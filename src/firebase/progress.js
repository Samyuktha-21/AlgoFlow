import {
  doc, onSnapshot, updateDoc, setDoc, deleteField, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseEnabled } from './config'
import { progressKey } from '../utils/progressStats'

export { progressKey }

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
export function setSolved(uid, problemId, on) { return setField(uid, 'solved', problemId, on) }

/* Direct field update for engagement counters (xp/streak/daily). */
export async function updateEngagement(uid, fields) {
  if (!firebaseEnabled || !db || !uid) return
  const ref = doc(db, 'users', uid)
  try {
    await updateDoc(ref, fields)
  } catch {
    try { await setDoc(ref, fields, { merge: true }) } catch (e) { console.warn('Engagement write failed:', e.message) }
  }
}
