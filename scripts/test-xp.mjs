import assert from 'node:assert'
import { computeXp, levelForXp, xpToNext, dateStr, nextStreak, addCappedQuizXp } from '../src/utils/xp.js'

// computeXp
assert.strictEqual(computeXp({ solvedCount: 2, dailyCount: 3, quizXp: 25 }), 115) // 30+60+25
assert.strictEqual(computeXp({}), 0)

// levels
assert.strictEqual(levelForXp(0), 1)
assert.strictEqual(levelForXp(115), 2)
assert.strictEqual(levelForXp(250), 3)
assert.deepStrictEqual(xpToNext(115), { inLevel: 15, needed: 100, pct: 15 })

// dateStr — local components, tz-stable
assert.strictEqual(dateStr(new Date(2026, 6, 23)), '2026-07-23')
assert.strictEqual(dateStr(new Date(2026, 0, 5)), '2026-01-05')

// nextStreak
assert.deepStrictEqual(nextStreak('2026-07-23', '2026-07-23', 3, 5), { currentStreak: 3, longestStreak: 5, alreadyDone: true })
assert.deepStrictEqual(nextStreak('2026-07-22', '2026-07-23', 3, 5), { currentStreak: 4, longestStreak: 5, alreadyDone: false })
assert.deepStrictEqual(nextStreak('2026-07-22', '2026-07-23', 5, 5), { currentStreak: 6, longestStreak: 6, alreadyDone: false })
assert.deepStrictEqual(nextStreak('2026-07-20', '2026-07-23', 9, 9), { currentStreak: 1, longestStreak: 9, alreadyDone: false })
assert.deepStrictEqual(nextStreak('', '2026-07-23', 0, 0), { currentStreak: 1, longestStreak: 1, alreadyDone: false })

// addCappedQuizXp
assert.deepStrictEqual(addCappedQuizXp(0, 0, '', '2026-07-23'), { quizXp: 5, quizXpToday: 5, quizXpDate: '2026-07-23', awarded: 5 })
assert.deepStrictEqual(addCappedQuizXp(300, 100, '2026-07-22', '2026-07-23'), { quizXp: 305, quizXpToday: 5, quizXpDate: '2026-07-23', awarded: 5 }) // rollover resets counter
assert.deepStrictEqual(addCappedQuizXp(100, 100, '2026-07-23', '2026-07-23'), { quizXp: 100, quizXpToday: 100, quizXpDate: '2026-07-23', awarded: 0 }) // at cap
assert.deepStrictEqual(addCappedQuizXp(100, 98, '2026-07-23', '2026-07-23'), { quizXp: 102, quizXpToday: 100, quizXpDate: '2026-07-23', awarded: 2 }) // partial at edge

console.log('OK test-xp')
