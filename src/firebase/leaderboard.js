import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { app, db, firebaseEnabled } from './config'

/* Client entry points for the server-authoritative XP system. All XP-bearing
   writes go through these Cloud Functions (the client can't write XP fields —
   see firestore.rules), so the profile number and the public board number are
   the same server-computed value. Reads are a realtime top-N board subscription. */

let _functions = null
function fns() {
  if (!_functions && app) _functions = getFunctions(app)
  return _functions
}

/* Fire-and-forget callable: resolves to the function result, or null when
   Firebase is disabled or the call fails (UI stays live via the users/{uid}
   snapshot, which updates once the server write lands). */
async function callFn(name, payload = {}) {
  if (!firebaseEnabled || !app) return null
  try {
    const res = await httpsCallable(fns(), name)(payload)
    return res.data
  } catch (e) {
    console.warn(`${name} failed:`, e.message)
    return null
  }
}

/* Credit today's daily challenge (server dedupes to 1/UTC-day + advances streak). */
export function recordDailyCompletion() { return callFn('recordDailyCompletion') }

/* Award quiz XP (+5, server-capped 100/UTC-day). */
export function recordQuizXp() { return callFn('recordQuizXp') }

/* Toggle a practice problem solved (server-capped 30 new solves/UTC-day). */
export function recordSolved(problemId, on) { return callFn('recordSolved', { problemId, on }) }

/* Realtime top-N board, ordered by score (= total XP) desc. cb receives an
   array of { uid, displayName, photoURL, score, xp, dailyCount, currentStreak,
   longestStreak }. */
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
