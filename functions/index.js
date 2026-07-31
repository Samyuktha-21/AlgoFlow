/* AlgoFlow server-authoritative XP + verified leaderboard.
 *
 * ALL XP-bearing writes go through these callables (Admin SDK). firestore.rules
 * denies the client from writing any XP field on users/{uid}, so XP can't be
 * forged from the browser/console. Each callable, in ONE transaction:
 *   - is auth-gated (uid + display name/photo come from the verified token),
 *   - stamps "today" server-side in UTC (no replaying other days),
 *   - recomputes the affected counters from prior SERVER state (never trusts
 *     client numbers), recomputes total XP, and
 *   - mirrors the public subset (+ score = total XP) to leaderboard/{uid}.
 * Because the user doc and the board are written together from one computation,
 * they can never diverge — this is what removes the old dual-write clash.
 *
 * Anti-farm caps live in logic.js: 1 daily credit/UTC-day, quiz XP 100/day,
 * new practice solves 30/day. Known limit (documented follow-up): the daily
 * answer and the random practice quiz are not re-verified server-side — that
 * needs the src/game engine ported into functions — so those XP sources are
 * rate-capped self-reports, not proof of correctness.
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const L = require('./logic')

admin.initializeApp()
const db = admin.firestore()
const FieldValue = admin.firestore.FieldValue

/* Mirror the public subset of a user's state (+ score = total XP) to the
   read-only public board. */
function boardWrite(tx, uid, auth, xp, u) {
  tx.set(db.doc(`leaderboard/${uid}`), {
    displayName: auth.token.name || 'Anonymous',
    photoURL: auth.token.picture || '',
    score: xp,
    xp,
    dailyCount: u.dailyCount || 0,
    currentStreak: u.currentStreak || 0,
    longestStreak: u.longestStreak || 0,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
}

function requireAuth(request, msg) {
  if (!request.auth) throw new HttpsError('unauthenticated', msg)
  return request.auth
}

/* Credit today's daily challenge: one per UTC day, streak recomputed server-side. */
exports.recordDailyCompletion = onCall(async (request) => {
  const auth = requireAuth(request, 'Sign in to record your daily challenge.')
  const uid = auth.uid
  const today = L.utcDateStr(new Date())
  const uref = db.doc(`users/${uid}`)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(uref)
    const d = snap.exists ? snap.data() : {}
    const r = L.applyDaily(d, today)
    const u = {
      // derive from the map, not a stored field — legacy docs never wrote solvedCount
      solvedCount: Object.keys(d.solved || {}).length,
      quizXp: d.quizXp || 0,
      dailyCount: r.changed ? r.dailyCount : (d.dailyCount || 0),
      currentStreak: r.changed ? r.currentStreak : (d.currentStreak || 0),
      longestStreak: r.changed ? r.longestStreak : (d.longestStreak || 0),
      lastDailyDate: r.changed ? r.lastDailyDate : (d.lastDailyDate || ''),
    }
    const xp = L.computeXp(u)
    tx.set(uref, {
      dailyCount: u.dailyCount, currentStreak: u.currentStreak,
      longestStreak: u.longestStreak, lastDailyDate: u.lastDailyDate,
      xp, updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
    boardWrite(tx, uid, auth, xp, u)
    return { alreadyDone: !r.changed, xp, currentStreak: u.currentStreak }
  })
})

/* Award quiz XP (+5, capped 100/UTC-day). Correctness is decided client-side;
   the server only rate-caps it (documented limit). */
exports.recordQuizXp = onCall(async (request) => {
  const auth = requireAuth(request, 'Sign in to earn XP.')
  const uid = auth.uid
  const today = L.utcDateStr(new Date())
  const uref = db.doc(`users/${uid}`)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(uref)
    const d = snap.exists ? snap.data() : {}
    const q = L.applyQuizXp(d, today)
    const u = {
      solvedCount: Object.keys(d.solved || {}).length,
      dailyCount: d.dailyCount || 0,
      currentStreak: d.currentStreak || 0,
      longestStreak: d.longestStreak || 0,
      quizXp: q.quizXp,
    }
    const xp = L.computeXp(u)
    tx.set(uref, {
      quizXp: q.quizXp, quizXpToday: q.quizXpToday, quizXpDate: q.quizXpDate,
      xp, updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
    boardWrite(tx, uid, auth, xp, u)
    return { awarded: q.awarded, xp }
  })
})

/* Toggle a practice problem solved (new solves capped 30/UTC-day). */
exports.recordSolved = onCall(async (request) => {
  const auth = requireAuth(request, 'Sign in to track solved problems.')
  const problemId = String((request.data && request.data.problemId) || '')
  const on = !!(request.data && request.data.on)
  if (!problemId || problemId.length > 200) throw new HttpsError('invalid-argument', 'Invalid problemId.')
  const uid = auth.uid
  const today = L.utcDateStr(new Date())
  const uref = db.doc(`users/${uid}`)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(uref)
    const d = snap.exists ? snap.data() : {}
    const s = L.applySolve(d, problemId, on, today)
    const base = {
      dailyCount: d.dailyCount || 0, currentStreak: d.currentStreak || 0,
      longestStreak: d.longestStreak || 0, quizXp: d.quizXp || 0,
    }
    if (!s.changed) {
      const xp = L.computeXp({ ...base, solvedCount: Object.keys(d.solved || {}).length })
      return { changed: false, capped: !!s.capped, xp }
    }
    const u = { ...base, solvedCount: s.solvedCount }
    const xp = L.computeXp(u)
    const patch = {
      solved: { [problemId]: on ? true : FieldValue.delete() },
      solvedCount: s.solvedCount,
      xp, updatedAt: FieldValue.serverTimestamp(),
    }
    if (s.solvedToday != null) { patch.solvedToday = s.solvedToday; patch.solvedDate = s.solvedDate }
    tx.set(uref, patch, { merge: true })
    boardWrite(tx, uid, auth, xp, u)
    return { changed: true, xp, solvedCount: s.solvedCount }
  })
})
