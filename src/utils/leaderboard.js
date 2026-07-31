/* Pure leaderboard scoring + ranking. The public board score is a user's TOTAL
   XP (daily + quiz + practice), computed server-side by the Cloud Functions and
   mirrored to leaderboard/{uid}. This util keeps the SAME formula as
   src/utils/xp.computeXp so any client-side score render matches the server.
   XP fields are server-authoritative (rules deny client XP writes), so the
   board can safely include quiz/practice XP. No side effects → node-testable. */
import { computeXp } from './xp.js'

export function leaderboardScore({ solvedCount = 0, dailyCount = 0, quizXp = 0 } = {}) {
  return computeXp({ solvedCount, dailyCount, quizXp })
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
