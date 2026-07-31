import assert from 'node:assert'
import logic from '../functions/logic.js'
const { utcDateStr, prevDateStr, computeXp, boardScore, applyDaily, applyQuizXp, applySolve } = logic

/* ── date helpers (UTC, so the server owns "today") ── */
assert.strictEqual(utcDateStr(new Date(Date.UTC(2026, 6, 31, 23, 59))), '2026-07-31')
assert.strictEqual(prevDateStr('2026-08-01'), '2026-07-31')
assert.strictEqual(prevDateStr('2026-01-01'), '2025-12-31')

/* ── total-XP formula (mirrors src/utils/xp.js) ── */
assert.strictEqual(computeXp({ solvedCount: 2, dailyCount: 3, quizXp: 25 }), 115) // 30+60+25
assert.strictEqual(computeXp({}), 0)
assert.strictEqual(boardScore({ solvedCount: 1, dailyCount: 1, quizXp: 5 }), 40)  // score = total XP

/* ── daily completion: one credit/day, streak recomputed server-side ── */
assert.deepStrictEqual(
  applyDaily({ lastDailyDate: '2026-07-31', dailyCount: 4, currentStreak: 2, longestStreak: 9 }, '2026-07-31'),
  { changed: false })
assert.deepStrictEqual(
  applyDaily({ lastDailyDate: '2026-07-30', dailyCount: 4, currentStreak: 2, longestStreak: 9 }, '2026-07-31'),
  { changed: true, dailyCount: 5, currentStreak: 3, longestStreak: 9, lastDailyDate: '2026-07-31' })
assert.deepStrictEqual( // gap → streak resets to 1
  applyDaily({ lastDailyDate: '2026-07-20', dailyCount: 4, currentStreak: 9, longestStreak: 9 }, '2026-07-31'),
  { changed: true, dailyCount: 5, currentStreak: 1, longestStreak: 9, lastDailyDate: '2026-07-31' })

/* ── quiz XP: +5, capped 100/day, resets on new day ── */
assert.deepStrictEqual(applyQuizXp({}, '2026-07-31'),
  { awarded: 5, quizXp: 5, quizXpToday: 5, quizXpDate: '2026-07-31' })
assert.deepStrictEqual(applyQuizXp({ quizXp: 300, quizXpToday: 100, quizXpDate: '2026-07-30' }, '2026-07-31'),
  { awarded: 5, quizXp: 305, quizXpToday: 5, quizXpDate: '2026-07-31' }) // new day resets counter
assert.deepStrictEqual(applyQuizXp({ quizXp: 100, quizXpToday: 100, quizXpDate: '2026-07-31' }, '2026-07-31'),
  { awarded: 0, quizXp: 100, quizXpToday: 100, quizXpDate: '2026-07-31' }) // at cap → nothing

/* ── practice solved: maintain map + count, cap additions/day, unsolve allowed ── */
const s1 = applySolve({}, 'arrays__twoSum', true, '2026-07-31')
assert.strictEqual(s1.changed, true)
assert.strictEqual(s1.solvedCount, 1)
assert.strictEqual(s1.solved['arrays__twoSum'], true)
assert.strictEqual(s1.solvedToday, 1)

// re-solving an already-solved problem is a no-op (no double count, no cap burn)
assert.deepStrictEqual(applySolve({ solved: { x: true }, solvedCount: 1 }, 'x', true, '2026-07-31'), { changed: false })

// unsolve removes it
const u = applySolve({ solved: { x: true }, solvedCount: 1 }, 'x', false, '2026-07-31')
assert.strictEqual(u.changed, true)
assert.strictEqual(u.solvedCount, 0)

// per-day add cap blocks further NEW solves
const capped = applySolve({ solved: {}, solvedToday: 30, solvedDate: '2026-07-31' }, 'new', true, '2026-07-31', 30)
assert.deepStrictEqual(capped, { changed: false, capped: true })

console.log('OK test-functions-logic')
