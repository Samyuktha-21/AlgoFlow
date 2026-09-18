/* Unit tests for the step classifier plus a real coverage number: what
   percentage of steps across all 124 algorithms classify to something other
   than `unknown`. The coverage half is the point — a classifier that returns
   `unknown` for half the corpus is not a foundation for Items 2 and 3, so the
   number is asserted, not just printed. */
import assert from 'node:assert'
import { classifyTransition, classifySteps, classifyStep, opKindLabel, isInformativeKind, OP_KINDS } from '../src/game/classifyStep.js'
import { loadAlgorithms, runDefault } from './lib/run-algorithms.mjs'

/* ---------- unit: synthetic transitions ---------- */

const t = (prev, step) => classifyTransition(prev, step)

assert.equal(t(null, { array: [1, 2] }), 'init', 'first step is init')
assert.equal(t({ array: [1, 2, 3] }, { array: [3, 2, 1] }), 'swap', 'exchanged pair is a swap')
assert.equal(t({ array: [1, 2, 3] }, { array: [1, 9, 3] }), 'overwrite', 'one cell changed')
assert.equal(t({ array: [1, 2, 3, 4] }, { array: [4, 3, 2, 1] }), 'rearrange', 'four cells moved')
assert.equal(t({ array: [1, 2, 3], comparing: [] }, { array: [1, 2, 3], comparing: [0, 1] }), 'compare')
assert.equal(t({ array: [1, 2, 3], swapping: [] }, { array: [1, 2, 3], swapping: [0, 2] }), 'swap', 'announced swap')
assert.equal(t({ sorted: [] }, { sorted: [3] }), 'mark-sorted')
assert.equal(t({ visited: [0] }, { visited: [0, 1] }), 'visit')
assert.equal(t({ queue: [1] }, { queue: [1, 2] }), 'enqueue')
assert.equal(t({ queue: [1, 2] }, { queue: [2] }), 'dequeue')
assert.equal(t({ stack: [] }, { stack: ['('] }), 'push')
assert.equal(t({ stack: ['('] }, { stack: [] }), 'pop')
assert.equal(t({ distances: { 0: 0, 1: null } }, { distances: { 0: 0, 1: 5 } }), 'relax', 'infinity to finite')
assert.equal(t({ distances: { 0: 0, 1: 9 } }, { distances: { 0: 0, 1: 5 } }), 'relax', 'shorter path')
assert.equal(t({ distances: { 0: 0, 1: 9 }, codeLine: 3 }, { distances: { 0: 0, 1: 9 }, codeLine: 4 }),
  'no-op', 'considering an edge without improving is not a relax')
assert.equal(t({ distances: { 0: 0, 1: 5 }, codeLine: 3 }, { distances: { 0: 0, 1: 8 }, codeLine: 4 }),
  'no-op', 'a distance getting worse is not a relax either')
assert.equal(t({ dp2d: [[0, 0]] }, { dp2d: [[0, 7]] }), 'memo-write')
assert.equal(t({ dp2d: [[0, 7]], cell: { row: 0, col: 0 } }, { dp2d: [[0, 7]], cell: { row: 0, col: 1 } }), 'memo-read')
assert.equal(t({ treeEdges: [] }, { treeEdges: [{ from: 0, to: 1 }] }), 'tree-link')
assert.equal(
  t({ nodes: [{ id: 0, next: 1 }, { id: 1, next: null }] }, { nodes: [{ id: 0, next: null }, { id: 1, next: 0 }] }),
  'relink')
assert.equal(t({ board: [[0, 0]] }, { board: [[2, 0]] }), 'place')
assert.equal(t({ board: [[1, 0]] }, { board: [[0, 0]] }), 'backtrack')
assert.equal(t({ backtracking: false, board: [[1]] }, { backtracking: true, board: [[1]] }), 'backtrack')
assert.equal(t({ eliminated: [] }, { eliminated: [0, 1] }), 'narrow-range')
assert.equal(t({ found: -1 }, { found: 5 }), 'found')
assert.equal(
  t({ pointers: [{ index: 0, label: 'lo' }] }, { pointers: [{ index: 1, label: 'lo' }] }),
  'advance-pointer')
assert.equal(t({ result: [] }, { result: [3] }), 'emit')
assert.equal(t({ highlight: [0] }, { highlight: [1] }), 'inspect')
assert.equal(t({ codeLine: 1, description: 'a' }, { codeLine: 2, description: 'b' }), 'no-op')
assert.equal(t({ codeLine: 1, description: 'a' }, { codeLine: 1, description: 'a' }), 'no-op',
  'a step identical to its predecessor is a no-op, not an unclassified case')
assert.equal(t({}, null), 'unknown', 'null step never throws')

/* The secondary array and the caption strings carry real computed state:
   KMP has nowhere else to put its LPS table, so it renders it into
   `array2Label`. A caption that changes is a value being written. */
assert.equal(t({ array2: ['A', 'B'] }, { array2: ['A', 'C'] }), 'overwrite')
assert.equal(t({ array2Label: 'LPS [0, 1, 0, 0]' }, { array2Label: 'LPS [0, 1, 0, 1]' }), 'overwrite')
assert.equal(t({ stack2: [] }, { stack2: [1] }), 'push')

/* An array diff outranks a highlight move: the step did the write. */
assert.equal(
  t({ array: [1, 2], highlight: [0] }, { array: [1, 9], highlight: [1] }),
  'overwrite', 'array change wins over highlight change')

/* A relaxation that also grows `visited` is still a relaxation. */
assert.equal(
  t({ distances: { 1: null }, visited: [0] }, { distances: { 1: 3 }, visited: [0, 1] }),
  'relax', 'relax outranks visit')

/* classifySteps / classifyStep agree and stay index-aligned. */
const run = [{ array: [3, 1] }, { array: [1, 3] }, { array: [1, 3], sorted: [1] }]
assert.deepEqual(classifySteps(run), ['init', 'swap', 'mark-sorted'])
assert.equal(classifyStep(run, 1), 'swap')
assert.equal(classifyStep(run, 99), 'unknown', 'out of range is unknown, not a throw')
assert.deepEqual(classifySteps(null), [], 'non-array input is empty, not a throw')

/* Every kind the classifier can return is declared, and has a label. */
for (const k of OP_KINDS) assert.ok(opKindLabel(k) && opKindLabel(k) !== undefined, `label for ${k}`)
assert.equal(isInformativeKind('swap'), true)
assert.equal(isInformativeKind('no-op'), false)

console.log('OK classify-step unit tests')

/* ---------- coverage: every algorithm on disk ---------- */

const algos = await loadAlgorithms()
const tally = new Map()
const byAlgo = []
let totalSteps = 0, unknownSteps = 0, ran = 0

for (const e of algos) {
  if (!e.gen) continue
  const r = runDefault(e)
  if (!r.steps || !r.steps.length) continue
  ran++
  const kinds = classifySteps(r.steps)
  assert.equal(kinds.length, r.steps.length, `${e.id}: kinds must align with steps`)
  let unk = 0
  for (const k of kinds) {
    assert.ok(OP_KINDS.includes(k), `${e.id}: undeclared kind ${k}`)
    tally.set(k, (tally.get(k) || 0) + 1)
    if (k === 'unknown') unk++
  }
  totalSteps += kinds.length
  unknownSteps += unk
  byAlgo.push({ id: e.id, type: e.meta.type, steps: kinds.length, unknown: unk, noop: kinds.filter(k => k === "no-op").length })
}

const classified = totalSteps - unknownSteps
const pct = (n) => ((n / totalSteps) * 100).toFixed(1)
const informative = [...tally].filter(([k]) => isInformativeKind(k)).reduce((s, [, v]) => s + v, 0)

console.log(`\nalgorithms run: ${ran}   steps: ${totalSteps}`)
console.log(`classified (not 'unknown'): ${classified}  (${pct(classified)}%)`)
console.log(`informative (not init/no-op/inspect/unknown): ${informative}  (${pct(informative)}%)`)
console.log('\nop kind distribution:')
for (const [k, v] of [...tally].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(16)} ${String(v).padStart(5)}  ${pct(v).padStart(5)}%`)
}

const worst = byAlgo.filter(a => a.unknown > 0).sort((a, b) => (b.unknown / b.steps) - (a.unknown / a.steps))
if (worst.length) {
  console.log(`\nalgorithms with any unclassified step (${worst.length}):`)
  for (const a of worst.slice(0, 15)) {
    console.log(`  ${a.id.padEnd(40)} ${a.unknown}/${a.steps}`)
  }
  if (worst.length > 15) console.log(`  … and ${worst.length - 15} more`)
} else {
  console.log('\nno algorithm has an unclassified step.')
}

/* The `no-op` share is not a classifier failure — it is a finding about the
   corpus. These generators advance their narration without moving anything
   the visualizer can render ("Relax 0→2: 0+1=1 vs dist[2]=∞" leaves every
   field untouched, then the *next* step writes the distance). The learner
   sees a still picture and a new sentence. Worth knowing per-generator,
   because those steps make poor challenge questions. */
const narration = byAlgo.filter(a => a.noop / a.steps >= 0.35).sort((a, b) => (b.noop / b.steps) - (a.noop / a.steps))
console.log(`\nnarration-only steps (state unchanged): ${tally.get('no-op') || 0}  (${pct(tally.get('no-op') || 0)}%)`)
if (narration.length) {
  console.log(`generators that are >=35% narration (${narration.length}) — poor question material:`)
  for (const a of narration.slice(0, 12)) {
    console.log(`  ${a.id.padEnd(40)} ${a.noop}/${a.steps}  ${((a.noop / a.steps) * 100).toFixed(0)}%`)
  }
  if (narration.length > 12) console.log(`  … and ${narration.length - 12} more`)
}

/* Gates. These are floors, not targets — raise them when the classifier
   improves so a regression cannot slip back under. `unknown` is currently 0,
   so the first floor only catches a regression; the informative floor is the
   one that carries weight, since Items 2 and 3 can only use those steps. */
assert.ok(ran >= 120, `expected to run 120+ algorithms, ran ${ran}`)
assert.ok(classified / totalSteps >= 0.99,
  `classification coverage ${pct(classified)}% is below the 99% floor`)
assert.ok(informative / totalSteps >= 0.68,
  `informative coverage ${pct(informative)}% is below the 68% floor`)

console.log('\nOK test-classify-step')
