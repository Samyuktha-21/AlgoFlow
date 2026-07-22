import assert from 'node:assert'
import { createSession, scoreAnswer, applicableTypes } from '../src/game/session.js'

let s = createSession({ mode: 'endless' })
s = scoreAnswer(s, true)   // +10, streak 1
assert.strictEqual(s.score, 10)
assert.strictEqual(s.streak, 1)
s = scoreAnswer(s, true)   // +10 + 2*1 = 12 → 22, streak 2
assert.strictEqual(s.score, 22)
assert.strictEqual(s.streak, 2)
s = scoreAnswer(s, false)  // streak resets, score stays
assert.strictEqual(s.score, 22)
assert.strictEqual(s.streak, 0)
assert.strictEqual(s.maxStreak, 2, 'maxStreak captured before reset')

let r = createSession({ mode: 'rounds', roundLength: 2 })
r = scoreAnswer(r, true)
assert.strictEqual(r.over, false)
r = scoreAnswer(r, false)
assert.strictEqual(r.over, true)
assert.strictEqual(r.score, 1)

assert.deepStrictEqual(applicableTypes({ hasSteps: false }), ['complexity'])
assert.ok(applicableTypes({ hasSteps: true }).includes('nextOp'))

console.log('OK test-session')
