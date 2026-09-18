/* Tests for the buggy-variant distractors, and a corpus-wide measurement of
   the F2 defect they replace.

   F2 was that distractors did not depend on where the question froze: the old
   builder walked from index 0 and took the first three labels, so every
   question on a given algorithm had the same three wrong answers, all of them
   setup steps. The assertions below pin both halves of the fix — the slate
   varies with `i`, and it is drawn from around `i` rather than from the top of
   the run — and the report at the end quantifies it across all 124. */
import assert from 'node:assert'
import { buildMutantDistractors, buildMutantOptions, MISCONCEPTIONS } from '../src/game/mutants/index.js'
import { classifySteps } from '../src/game/classifyStep.js'
import { generateNextOp } from '../src/game/challenges/nextOp.js'
import { loadAlgorithms, runDefault } from './lib/run-algorithms.mjs'

/* ---------- unit ---------- */

const mk = (n) => Array.from({ length: n }, (_, k) => ({
  array: [k, k + 1], description: `step ${k}`, codeLine: k,
}))

const run = mk(12)

const d0 = buildMutantDistractors(run, 2)
assert.equal(d0.length, 3, 'three distractors on a long enough run')
assert.ok(d0.every(d => d.label && d.misconception && d.rule), 'each carries label, misconception, rule')
assert.ok(!d0.some(d => d.label === 'step 3'), 'the correct answer is never offered as a distractor')

/* The core of F2: a different freeze point must give a different slate. */
const dA = buildMutantDistractors(run, 2).map(d => d.label)
const dB = buildMutantDistractors(run, 8).map(d => d.label)
assert.notDeepEqual(dA, dB, 'distractors must depend on where the question froze')

/* ...and must not be dragged from the start of the run. */
assert.ok(!dB.includes('step 0'), 'a question frozen at 8 does not offer the opening step')
assert.ok(!dB.includes('step 1'), 'nor the one after it')

/* Every distractor is a real step from this run — never synthesised prose,
   which is what would give the wrong answer away by its style. */
const realLabels = new Set(run.map(s => s.description))
for (const d of [...d0, ...buildMutantDistractors(run, 8)]) {
  assert.ok(realLabels.has(d.label), `${d.label} must be a real step from the run`)
}

/* Named rules fire where their misconception applies. */
const sortRun = [
  { array: [3, 2, 1], comparing: [0, 1], description: 'compare 3 and 2', codeLine: 1 },
  { array: [3, 2, 1], swapping: [0, 1], description: 'swap 3 and 2', codeLine: 2 },
  { array: [2, 3, 1], description: 'after swap', codeLine: 3 },
  { array: [2, 3, 1], comparing: [1, 2], description: 'compare 3 and 1', codeLine: 1 },
  { array: [2, 1, 3], description: 'after second swap', codeLine: 3 },
  { array: [2, 1, 3], sorted: [2], description: 'lock index 2', codeLine: 4 },
  { array: [2, 1, 3], sorted: [2], comparing: [0, 1], description: 'compare 2 and 1', codeLine: 1 },
]
const sortKinds = classifySteps(sortRun)
const sd = buildMutantDistractors(sortRun, 0, { kinds: sortKinds })
assert.ok(sd.some(d => d.rule === 'no-advance'), 'offers "you never advanced"')
assert.ok(sd.some(d => d.rule === 'off-by-one'), 'offers "your loop ran one too far"')
assert.ok(sd.some(d => d.rule === 'premature-lock'),
  'offers the later mark-sorted step as a premature lock')

/* A mutant whose label matches the correct answer is discarded, not shown. */
const dupes = [
  { array: [1], description: 'same', codeLine: 1 },
  { array: [1], description: 'same', codeLine: 2 },
  { array: [1], description: 'same', codeLine: 3 },
  { array: [1], description: 'different', codeLine: 4 },
  { array: [1], description: 'another', codeLine: 5 },
]
const dd = buildMutantDistractors(dupes, 0)
assert.ok(!dd.some(d => d.label === 'same'), 'a duplicate of the correct answer is dropped')

/* Degenerate inputs return empty rather than throwing. */
assert.deepEqual(buildMutantDistractors(null, 0), [])
assert.deepEqual(buildMutantDistractors([{ description: 'a' }], 0), [], 'no i+1 means no question')
assert.equal(buildMutantOptions(mk(2), 0), null, 'too short to fill a slate')
assert.ok(buildMutantOptions(mk(12), 4), 'a real run fills a slate')

/* Every rule has copy. */
for (const d of [...d0, ...sd]) {
  assert.equal(d.misconception, MISCONCEPTIONS[d.rule], `copy for rule ${d.rule}`)
}

console.log('OK mutants unit tests')

/* ---------- corpus: every algorithm, every freeze point ---------- */

const algos = await loadAlgorithms()
const ruleTally = new Map()
let ran = 0, questions = 0, full = 0
let variedAlgos = 0, checkedAlgos = 0
let fromOpening = 0

/* deterministic rng so the report is reproducible */
let seed = 12345
const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)

for (const e of algos) {
  if (!e.gen) continue
  const r = runDefault(e)
  if (!r.steps || r.steps.length < 3) continue
  ran++
  const kinds = classifySteps(r.steps)
  const slates = []

  for (let i = 0; i < r.steps.length - 1; i++) {
    const opts = buildMutantOptions(r.steps, i, { kinds })
    if (!opts) continue
    questions++
    if (opts.distractors.length === 3) full++
    assert.ok(!opts.distractors.some(d => d.label === opts.correct),
      `${e.id}@${i}: correct answer leaked into the distractors`)
    assert.equal(new Set(opts.distractors.map(d => d.label)).size, opts.distractors.length,
      `${e.id}@${i}: duplicate distractors`)
    for (const d of opts.distractors) ruleTally.set(d.rule, (ruleTally.get(d.rule) || 0) + 1)
    slates.push(opts.distractors.map(d => d.label).join('|'))

    /* The F2 tell: a question frozen late in the run offering the very first
       step of the run as a wrong answer. Legitimate only when the run is so
       repetitive that the fallback has nowhere else to go. */
    if (i > 5 && opts.distractors.some(d => d.label === r.steps[0].description)) fromOpening++
  }

  if (slates.length >= 3) {
    checkedAlgos++
    if (new Set(slates).size > 1) variedAlgos++
  }

  /* The generated challenge is well-formed and carries its op kind. */
  const ch = generateNextOp({ ...e, name: e.meta.name, type: e.meta.type, themeId: 'circuit', metadata: e.meta }, r.steps, rng)
  if (ch) {
    assert.equal(ch.options.filter(o => o.isCorrect).length, 1, `${e.id}: exactly one correct option`)
    assert.ok(ch.options.length >= 3, `${e.id}: at least three options`)
    assert.ok(typeof ch.opKind === 'string' && ch.opKind, `${e.id}: challenge carries an opKind`)
    assert.ok(ch.options.filter(o => !o.isCorrect).every(o => o.misconception),
      `${e.id}: every wrong option names a misconception`)
  }
}

const pctQ = (n) => ((n / questions) * 100).toFixed(1)
console.log(`\nalgorithms: ${ran}   questions buildable: ${questions}`)
console.log(`questions with a full slate of 3: ${full}  (${pctQ(full)}%)`)
console.log(`algorithms whose slate varies with the freeze point: ${variedAlgos}/${checkedAlgos}`)
console.log(`late questions still offering the opening step: ${fromOpening}  (${pctQ(fromOpening)}%)`)
console.log('\ndistractor rule distribution:')
const totalD = [...ruleTally.values()].reduce((a, b) => a + b, 0)
for (const [k, v] of [...ruleTally].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(20)} ${String(v).padStart(6)}  ${((v / totalD) * 100).toFixed(1)}%`)
}

/* Gates. The first is the F2 fix stated as a property; the second keeps the
   named rules carrying the load rather than quietly degrading to the
   proximity fallback. */
assert.ok(variedAlgos === checkedAlgos,
  `${checkedAlgos - variedAlgos} algorithm(s) still hand out the same slate at every freeze point`)
assert.ok(fromOpening / questions <= 0.02,
  `${pctQ(fromOpening)}% of late questions still offer the opening step (F2's signature)`)
assert.ok((ruleTally.get('nearby-step') || 0) / totalD <= 0.25,
  'more than a quarter of distractors fell through to the proximity fallback')
assert.ok(full / questions >= 0.90, `only ${pctQ(full)}% of questions get a full slate of 3`)

console.log('\nOK test-mutants')
