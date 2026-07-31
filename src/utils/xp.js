/* Pure XP display math. totalXp = solvedCount*15 + dailyCount*20 + quizXp —
   the SAME formula the server computes (functions/logic.js), so the number a
   user sees matches the server-authoritative XP. Streak + quiz-cap math now
   lives server-side only (functions/logic.js) to keep one source of truth. */

export function computeXp({ solvedCount = 0, dailyCount = 0, quizXp = 0 } = {}) {
  return solvedCount * 15 + dailyCount * 20 + quizXp
}

export function levelForXp(xp) {
  return Math.floor((xp || 0) / 100) + 1
}

export function xpToNext(xp) {
  const inLevel = (xp || 0) % 100
  return { inLevel, needed: 100, pct: inLevel }
}

/* Local-date 'YYYY-MM-DD' (device timezone). Default arg is the only place a
   clock is read; callers in tests pass an explicit Date. */
export function dateStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/* UTC-date 'YYYY-MM-DD'. The Cloud Functions stamp "today" in UTC, so the
   client MUST use this (not dateStr) for the daily challenge + done-check,
   otherwise the local day and the server day disagree near midnight. */
export function utcDateStr(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}
