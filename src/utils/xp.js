/* Pure XP + streak math for the Phase 4a engagement loop. No React, no
   Firestore, no ambient clock in the logic — dates are passed in as
   'YYYY-MM-DD' strings so everything is deterministic and unit-testable.
   totalXp = solvedCount*15 + dailyCount*20 + quizXp. See the 4a design spec. */

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

function prevDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - 1)
  return dateStr(dt)
}

export function nextStreak(lastDailyDate, todayStr, currentStreak, longestStreak) {
  if (lastDailyDate === todayStr) {
    return { currentStreak: currentStreak || 0, longestStreak: longestStreak || 0, alreadyDone: true }
  }
  const consecutive = lastDailyDate === prevDate(todayStr)
  const cur = consecutive ? (currentStreak || 0) + 1 : 1
  return { currentStreak: cur, longestStreak: Math.max(longestStreak || 0, cur), alreadyDone: false }
}

export function addCappedQuizXp(quizXp, quizXpToday, quizXpDate, todayStr, amount = 5, cap = 100) {
  const todayCount = quizXpDate === todayStr ? (quizXpToday || 0) : 0
  const awarded = Math.max(0, Math.min(amount, cap - todayCount))
  return { quizXp: (quizXp || 0) + awarded, quizXpToday: todayCount + awarded, quizXpDate: todayStr, awarded }
}
