/* Pure leaderboard scoring + ranking for Phase 4c. The Cloud Function and the
   client render use the SAME score formula so ranks are consistent. The score
   is built only from server-verified daily signals (completions + longest
   streak) — quiz/practice XP is client-written and NOT trusted for the public
   board. No side effects, so it's node-testable. See the 4c design spec. */

export function leaderboardScore({ dailyCount = 0, longestStreak = 0 } = {}) {
  return dailyCount * 20 + longestStreak * 10
}

/* Sort entries into ranked order and annotate each with a `rank`. Standard
   competition ranking: equal scores share a rank and the following rank skips
   (1,1,3,...). Ties break by longestStreak, then dailyCount, so the order is
   stable and deterministic. Input is not mutated. */
export function rankEntries(entries = []) {
  const sorted = [...entries].sort((a, b) =>
    (b.score || 0) - (a.score || 0) ||
    (b.longestStreak || 0) - (a.longestStreak || 0) ||
    (b.dailyCount || 0) - (a.dailyCount || 0)
  )
  let lastScore = null
  let lastRank = 0
  return sorted.map((e, i) => {
    const rank = e.score === lastScore ? lastRank : i + 1
    lastScore = e.score
    lastRank = rank
    return { ...e, rank }
  })
}
