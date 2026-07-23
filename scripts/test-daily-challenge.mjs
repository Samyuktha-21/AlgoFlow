import assert from 'node:assert'
import { dailySeed, mulberry32 } from '../src/game/dailyRng.js'

// seed is stable per date and differs across dates
assert.strictEqual(dailySeed('2026-07-23'), dailySeed('2026-07-23'))
assert.notStrictEqual(dailySeed('2026-07-23'), dailySeed('2026-07-24'))

// mulberry32 is deterministic: same seed → same sequence
const a = mulberry32(12345), b = mulberry32(12345)
const seqA = [a(), a(), a()], seqB = [b(), b(), b()]
assert.deepStrictEqual(seqA, seqB)
// values are in [0,1)
for (const v of seqA) assert.ok(v >= 0 && v < 1, `in range: ${v}`)
// different seed → different sequence
const c = mulberry32(999)
assert.notDeepStrictEqual([c(), c(), c()], seqA)

console.log('OK test-daily-challenge')
