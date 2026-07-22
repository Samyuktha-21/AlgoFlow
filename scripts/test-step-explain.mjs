import assert from 'node:assert'
import { getWhyText, deriveResult } from '../src/utils/stepExplain.js'

// compare step yields a "why" string
const why = getWhyText({ type: 'compare', comparing: [0, 1], array: [5, 3] }, 'sorting')
assert.ok(typeof why === 'string' && why.length > 0, 'compare why text')

// sorted result
const res = deriveResult({ array: [1, 2, 3], sorted: [0, 1, 2] })
assert.strictEqual(res, '1 → 2 → 3')

// no-op step returns null
assert.strictEqual(getWhyText(null, 'sorting'), null)
assert.strictEqual(deriveResult(null), null)

console.log('OK test-step-explain')
