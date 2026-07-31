/* Pure XP / streak / cap math for the AlgoFlow Cloud Functions. No firebase-admin
   here so it stays node-testable (scripts/test-functions-logic.mjs). These mirror
   src/utils/xp.js + src/utils/leaderboard.js — the client formulas MUST match so
   the number a user sees equals the server-authoritative number on the board.

   The server owns "today" (UTC) so a client can't replay other days, and every
   XP field is derived here from prior server state — never trusted from input. */

function utcDateStr(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function prevDateStr(str) {
  const [y, m, dd] = str.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, dd))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return utcDateStr(dt)
}

/* total XP = solved·15 + daily·20 + quizXp (keep in sync with src/utils/xp.js) */
function computeXp({ solvedCount = 0, dailyCount = 0, quizXp = 0 } = {}) {
  return solvedCount * 15 + dailyCount * 20 + quizXp
}

/* Public leaderboard score == total XP (per product decision). */
function boardScore(state) {
  return computeXp(state)
}

/* One daily credit per UTC day; streak recomputed from server-owned lastDailyDate. */
function applyDaily(d, today) {
  if (d.lastDailyDate === today) return { changed: false }
  const consecutive = d.lastDailyDate === prevDateStr(today)
  const currentStreak = consecutive ? (d.currentStreak || 0) + 1 : 1
  const longestStreak = Math.max(d.longestStreak || 0, currentStreak)
  const dailyCount = (d.dailyCount || 0) + 1
  return { changed: true, dailyCount, currentStreak, longestStreak, lastDailyDate: today }
}

/* Quiz XP: award `amount`, capped to `cap` per UTC day (counter resets on new day). */
function applyQuizXp(d, today, amount = 5, cap = 100) {
  const todayCount = d.quizXpDate === today ? (d.quizXpToday || 0) : 0
  const awarded = Math.max(0, Math.min(amount, cap - todayCount))
  return { awarded, quizXp: (d.quizXp || 0) + awarded, quizXpToday: todayCount + awarded, quizXpDate: today }
}

/* Practice solved toggle. Maintains the solved map + count. NEW solves are
   capped per UTC day to bound self-reported farming; un-solving is always
   allowed and does not refund the day counter. */
function applySolve(d, problemId, on, today, cap = 30) {
  const solved = { ...(d.solved || {}) }
  const has = !!solved[problemId]
  if (on && !has) {
    const addedToday = d.solvedDate === today ? (d.solvedToday || 0) : 0
    if (addedToday >= cap) return { changed: false, capped: true }
    solved[problemId] = true
    return { changed: true, solved, solvedCount: Object.keys(solved).length, solvedToday: addedToday + 1, solvedDate: today }
  }
  if (!on && has) {
    delete solved[problemId]
    return { changed: true, solved, solvedCount: Object.keys(solved).length }
  }
  return { changed: false }
}

module.exports = { utcDateStr, prevDateStr, computeXp, boardScore, applyDaily, applyQuizXp, applySolve }
