import assert from 'node:assert'
import { describeStep, buildNextOpOptions } from '../src/game/describeStep.js'

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

const opts = buildNextOpOptions(steps, 0) // next is swap
assert.ok(opts && opts.correct === 'Swap 8 and 3')
assert.ok(opts.distractors.length >= 2 && !opts.distractors.includes(opts.correct))

console.log('OK test-describe-step')
