import assert from 'node:assert'
import { describeStep } from '../src/game/describeStep.js'
/* buildNextOpOptions used to live in describeStep.js and is gone — it was the
   F2 defect (distractors taken from index 0, identical at every freeze point).
   Its replacement and the tests for it are in scripts/test-mutants.mjs. */
import { buildMutantOptions } from '../src/game/mutants/index.js'

const steps = [
  { type: 'compare', comparing: [0, 1], array: [8, 3, 5] },
  { type: 'swap',    swapping: [0, 1],  array: [8, 3, 5] },
  { type: 'sorted',  sorted: [2],       array: [3, 8, 5] },
]
assert.strictEqual(describeStep(steps[0]), 'Compare 8 and 3')
assert.strictEqual(describeStep(steps[1]), 'Swap 8 and 3')
assert.ok(describeStep(steps[2]).startsWith('Mark'))
// untyped steps fall back to their description (what real generators emit)
assert.strictEqual(describeStep({ description: 'Processing index 2, value=5' }), 'Processing index 2, value=5')
assert.strictEqual(describeStep({ current: 3 }), null, 'no type + no description → null')

const opts = buildMutantOptions(steps, 0) // next is swap
assert.ok(opts && opts.correct === 'Swap 8 and 3')
assert.ok(opts.distractors.length >= 2)
assert.ok(!opts.distractors.some(d => d.label === opts.correct))

console.log('OK test-describe-step')
