import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { app, db, firebaseEnabled } from './config'

/* Client side of the Phase 4c verified leaderboard. Writes go through the
   `recordDailyCompletion` Cloud Function (the public `leaderboard` collection
   is read-only to clients); reads are a realtime top-N subscription. */

let _functions = null
function fns() {
  if (!_functions && app) _functions = getFunctions(app)
  return _functions
}

/* Credit today's daily challenge on the server. Fire-and-forget from the UI's
   perspective — resolves to the function result ({ alreadyDone, score,
   currentStreak }) or null if Firebase is disabled or the call fails. */
export async function recordDailyCompletion() {
  if (!firebaseEnabled || !app) return null
  try {
    const call = httpsCallable(fns(), 'recordDailyCompletion')
    const res = await call({})
    return res.data
  } catch (e) {
    console.warn('recordDailyCompletion failed:', e.message)
    return null
  }
}

/* Realtime top-N board, ordered by score desc. cb receives an array of
   { uid, displayName, photoURL, score, dailyCount, currentStreak, longestStreak }. */
export function subscribeToLeaderboard(topN, cb) {
  if (!firebaseEnabled || !db) { cb([]); return () => {} }
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(topN))
    return onSnapshot(
      q,
      snap => cb(snap.docs.map(d => ({ uid: d.id, ...d.data() }))),
      e => { console.warn('Leaderboard subscription failed:', e.message); cb([]) },
    )
  } catch (e) {
    console.warn('Leaderboard subscription failed:', e.message)
    cb([])
    return () => {}
  }
}
