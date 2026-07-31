import assert from 'node:assert'
import { resolveHighlightLine } from '../src/utils/highlightLine.js'

/* No active step line → no highlight. */
assert.strictEqual(resolveHighlightLine(null, 'java', null), null)
assert.strictEqual(resolveHighlightLine(0, 'python', {}), null)
assert.strictEqual(resolveHighlightLine(undefined, 'c', { c: { '3': 4 } }), null)

/* Java is the canonical source of a step's codeLine → identity, map ignored. */
assert.strictEqual(resolveHighlightLine(7, 'java', null), 7)
assert.strictEqual(resolveHighlightLine(7, 'java', { java: { '7': 99 } }), 7)

/* A mapped language remaps the Java line → that language's own line. */
const lineMap = { c: { '7': 8, '3': 4 }, python: { '7': 6 } }
assert.strictEqual(resolveHighlightLine(7, 'c', lineMap), 8)
assert.strictEqual(resolveHighlightLine(3, 'c', lineMap), 4)
assert.strictEqual(resolveHighlightLine(7, 'python', lineMap), 6)

/* Language is mapped but this specific line is absent → null.
   Better to show NO highlight than a wrong one. */
assert.strictEqual(resolveHighlightLine(3, 'python', lineMap), null)

/* Language not mapped at all → null (safe fallback, never a wrong line). */
assert.strictEqual(resolveHighlightLine(7, 'cpp', lineMap), null)
assert.strictEqual(resolveHighlightLine(7, 'javascript', null), null)

console.log('OK test-highlight-line')
