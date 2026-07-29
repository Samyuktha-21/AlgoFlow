import assert from 'node:assert'
import { leaderboardScore, rankEntries } from '../src/utils/leaderboard.js'

// score = dailyCount*20 + longestStreak*10
assert.strictEqual(leaderboardScore({ dailyCount: 5, longestStreak: 3 }), 130)
assert.strictEqual(leaderboardScore({ dailyCount: 0, longestStreak: 0 }), 0)
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
