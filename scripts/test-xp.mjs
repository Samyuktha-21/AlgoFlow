import assert from 'node:assert'
import { computeXp, levelForXp, xpToNext, dateStr, utcDateStr } from '../src/utils/xp.js'

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

// utcDateStr — UTC components, matches the server's notion of "today"
assert.strictEqual(utcDateStr(new Date(Date.UTC(2026, 6, 31, 23, 59))), '2026-07-31')
assert.strictEqual(utcDateStr(new Date(Date.UTC(2026, 0, 5, 0, 0))), '2026-01-05')

// (streak + quiz-cap math now lives server-side; see scripts/test-functions-logic.mjs)

console.log('OK test-xp')
