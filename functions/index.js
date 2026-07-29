/* AlgoFlow verified leaderboard (Phase 4c).
 *
 * The public `leaderboard/{uid}` collection is READ-ONLY to clients (see
 * firestore.rules); the only writer is this Admin-SDK function, so the ranked
 * score cannot be forged from the browser. `recordDailyCompletion` is the sole
 * path that credits a daily:
 *   - auth-gated (uid + display name/photo come from the verified token, never
 *     from client input),
 *   - the date is stamped SERVER-side (UTC) so a client can't replay other days,
 *   - the streak is recomputed from the server-owned `lastDailyDate`, and the
 *     whole thing runs in a transaction so it's idempotent (one credit/day).
 *
 * Known v1 limit: this does not re-derive today's challenge to verify the
 * submitted ANSWER (that needs the src/game engine ported into functions). It
 * caps to one credit/day, which defeats bulk score inflation; answer-level
 * verification is a documented follow-up.
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

function utcDateStr(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function prevDateStr(str) {
  const [y, m, dd] = str.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, dd))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return utcDateStr(dt)
}

// Same formula as src/utils/leaderboard.js — keep the two in sync.
function leaderboardScore(dailyCount, longestStreak) {
  return dailyCount * 20 + longestStreak * 10
}

exports.recordDailyCompletion = onCall(async (request) => {
  const auth = request.auth
  if (!auth) throw new HttpsError('unauthenticated', 'Sign in to record your daily challenge.')

  const uid = auth.uid
  const today = utcDateStr()
  const ref = db.doc(`leaderboard/${uid}`)

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const d = snap.exists ? snap.data() : {}

    if (d.lastDailyDate === today) {
      return { alreadyDone: true, score: d.score || 0, currentStreak: d.currentStreak || 0 }
    }

    const consecutive = d.lastDailyDate === prevDateStr(today)
    const currentStreak = consecutive ? (d.currentStreak || 0) + 1 : 1
    const longestStreak = Math.max(d.longestStreak || 0, currentStreak)
    const dailyCount = (d.dailyCount || 0) + 1
    const score = leaderboardScore(dailyCount, longestStreak)

    tx.set(ref, {
      displayName: auth.token.name || 'Anonymous',
      photoURL: auth.token.picture || '',
      dailyCount,
      currentStreak,
      longestStreak,
      lastDailyDate: today,
      score,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    return { alreadyDone: false, score, currentStreak }
  })
})
