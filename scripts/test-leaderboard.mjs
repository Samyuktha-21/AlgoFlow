import assert from 'node:assert'
import { leaderboardScore, rankEntries } from '../src/utils/leaderboard.js'

// score = total XP = solved*15 + daily*20 + quizXp (matches src/utils/xp computeXp)
assert.strictEqual(leaderboardScore({ solvedCount: 2, dailyCount: 3, quizXp: 25 }), 115)
assert.strictEqual(leaderboardScore({ dailyCount: 5 }), 100)
assert.strictEqual(leaderboardScore({}), 0)
assert.strictEqual(leaderboardScore(), 0)

// rankEntries: sort by score desc, dense-rank, ties share a rank
const ranked = rankEntries([
  { uid: 'a', score: 100, longestStreak: 5 },
  { uid: 'b', score: 300, longestStreak: 9 },
  { uid: 'c', score: 300, longestStreak: 9 },
  { uid: 'd', score: 50,  longestStreak: 2 },
])
assert.deepStrictEqual(ranked.map(e => e.uid), ['b', 'c', 'a', 'd'])
assert.deepStrictEqual(ranked.map(e => e.rank), [1, 1, 3, 4]) // standard competition ranking (ties → same rank, next skips)

// empty input → empty output
assert.deepStrictEqual(rankEntries([]), [])
assert.deepStrictEqual(rankEntries(), [])

// tie-break by longestStreak when scores equal (higher streak first)
const tie = rankEntries([
  { uid: 'x', score: 200, longestStreak: 3 },
  { uid: 'y', score: 200, longestStreak: 8 },
])
assert.deepStrictEqual(tie.map(e => e.uid), ['y', 'x'])

console.log('OK test-leaderboard')
