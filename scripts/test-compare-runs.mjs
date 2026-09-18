/* Tests for the two-algorithm comparison model, and a corpus report on which
   pairs it can actually serve.

   The alignment axis is the decision the plan said to make before building any
   UI, so this script exists to prove the choice holds against real runs: that
   every offerable pair has at least one usable axis, and that divergence is
   detected where it genuinely exists rather than being asserted by the UI. */
import assert from 'node:assert'
import {
  AXES, axisIndices, availableAxes, buildAlignment, canPair, partnersFor, pairableTypes, isComparableRun,
} from '../src/game/compareRuns.js'
import { classifySteps } from '../src/game/classifyStep.js'
import { runSteps } from '../src/game/runSteps.js'
import { loadAlgorithms, runDefault } from './lib/run-algorithms.mjs'

/* ---------- unit ---------- */

const A = [
  { array: [3, 1, 2], description: 'start', codeLine: 1 },
  { array: [3, 1, 2], comparing: [0, 1], description: 'compare', codeLine: 2 },
  { array: [1, 3, 2], description: 'swap', codeLine: 3 },
  { array: [1, 3, 2], comparing: [1, 2], description: 'compare', codeLine: 2 },
  { array: [1, 2, 3], description: 'swap', codeLine: 3 },
]
const B = [
  { array: [3, 1, 2], description: 'start', codeLine: 1 },
  { array: [2, 1, 3], description: 'different swap', codeLine: 5 },
  { array: [1, 2, 3], description: 'swap', codeLine: 5 },
]

const kA = classifySteps(A), kB = classifySteps(B)

assert.deepEqual(axisIndices(A, 'comparison', kA), [1, 3], 'comparison axis finds both compares')
assert.deepEqual(axisIndices(B, 'comparison', kB), [], 'B never compares')
assert.deepEqual(axisIndices(A, 'mutation', kA), [2, 4], 'mutation axis finds both swaps')

const avail = availableAxes(A, B, kA, kB)
assert.ok(avail.includes('operation'), 'the operation axis is always available')
assert.ok(avail.includes('mutation'), 'both sides write')
assert.ok(!avail.includes('comparison'), 'an axis with no frames on one side is not offered')

const al = buildAlignment(A, B, 'mutation', { kindsA: kA, kindsB: kB })
assert.equal(al.frames.length, 2, 'two writes each')
assert.deepEqual(al.frames[0], { a: 2, b: 1, diverged: true, field: 'array' },
  'first write: [1,3,2] vs [2,1,3] — diverged')
assert.equal(al.divergeAt, 0, 'divergence reported at the first frame where states differ')
assert.equal(al.frames[1].diverged, false, 'both reach [1,2,3] by the second write')

/* Ordinal alignment, and the ragged tail. */
const longer = buildAlignment(A, B, 'operation', { kindsA: kA, kindsB: kB })
assert.equal(longer.frames.length, Math.max(longer.counts.a, longer.counts.b))
assert.ok(longer.counts.a > longer.counts.b, 'A does more work than B on this input')
const tail = longer.frames[longer.frames.length - 1]
assert.equal(tail.b, null, 'the shorter run has a null half once it finishes')
assert.notEqual(tail.a, null, 'the longer run keeps going')

/* Identical runs never diverge. */
assert.equal(buildAlignment(A, A, 'operation').divergeAt, null, 'a run does not diverge from itself')

/* No comparable state means no claimed divergence. */
const noState = [{ description: 'a', codeLine: 1 }, { description: 'b', codeLine: 2 }]
const nal = buildAlignment(noState, noState, 'operation')
assert.ok(nal.frames.every(f => f.field === null && f.diverged === false),
  'nothing to compare is reported as nothing, not as a difference')

/* A field that never moves in either run is not a divergence story: binary
   search and linear search both leave `array` untouched end to end, and the
   real difference between them is how many operations they take. */
const still = [
  { array: [1, 2, 3], description: 'start', codeLine: 1, pointers: [{ index: 0, label: 'i' }] },
  { array: [1, 2, 3], description: 'advance', codeLine: 2, pointers: [{ index: 1, label: 'i' }] },
  { array: [1, 2, 3], description: 'advance', codeLine: 2, pointers: [{ index: 2, label: 'i' }] },
]
const stillAl = buildAlignment(still, still, 'operation')
assert.equal(stillAl.comparedField, 'array')
assert.equal(stillAl.fieldStatic, true, 'a field that never changes is flagged, not reported as agreement')
assert.equal(buildAlignment(A, B, 'mutation', { kindsA: kA, kindsB: kB }).fieldStatic, false,
  'a field that does change is not flagged as static')

/* Degenerate inputs. */
assert.deepEqual(buildAlignment(null, A).frames, [])
assert.deepEqual(buildAlignment([], []).frames, [])

/* Pairing rules. */
const p = (id, type, extra = {}) => ({ algorithmId: id, categoryId: 'c', type, hasSteps: true, ...extra })
assert.equal(canPair(p('bubble', 'sorting'), p('heap', 'sorting')), true)
assert.equal(canPair(p('bubble', 'sorting'), p('bubble', 'sorting')), false, 'not against itself')
assert.equal(canPair(p('bubble', 'sorting'), p('bfs', 'graph')), false, 'different types get different input')
assert.equal(canPair(p('bubble', 'sorting'), p('x', 'sorting', { hasSteps: false })), false)
assert.equal(canPair(p('bubble', 'sorting'), p('astar', 'sorting', { presetInput: true })), false,
  'an algorithm with its own seed would not receive the same input')
assert.equal(canPair(p('bubble', 'sorting'), p('astar', 'sorting', { presetInput: true }), { allowPresetInput: true }), true)

const pool = [p('bubble', 'sorting'), p('heap', 'sorting'), p('bfs', 'graph'), p('dfs', 'graph'), p('lonely', 'dp')]
assert.deepEqual(partnersFor(pool, pool[0]).map(x => x.algorithmId), ['heap'])
assert.deepEqual(pairableTypes(pool).sort(), ['graph', 'sorting'])

console.log('OK compare-runs unit tests')

/* ---------- runSteps input override ---------- */

const algos = await loadAlgorithms()
const bubble = algos.find(a => a.id === 'sorting/bubbleSort')
assert.ok(bubble, 'bubbleSort is on disk')
const asEntry = (e) => ({
  categoryId: e.category, algorithmId: e.algorithm, type: e.meta.type,
  metadata: e.meta, generateSteps: e.gen, hasSteps: !!e.gen,
  presetInput: typeof e.meta.defaultInput === 'string',
})

const defRun = runSteps(asEntry(bubble))
const ovrRun = runSteps(asEntry(bubble), { input: '5, 4, 3, 2, 1', target: '' })
assert.ok(defRun && defRun.length, 'default run still works')
assert.ok(ovrRun && ovrRun.length, 'override run works')
assert.deepEqual(ovrRun[0].array, [5, 4, 3, 2, 1], 'the override input reached the generator')
assert.notEqual(defRun.length, ovrRun.length, 'a different input gives a different run')
assert.deepEqual(runSteps(asEntry(bubble), {}).length, defRun.length,
  'an override with no input string falls back to the default')

console.log('OK runSteps input override')

/* ---------- corpus: which pairs can actually be offered ---------- */

const entries = algos.map(asEntry).map((e, i) => ({ ...e, name: algos[i].meta.name }))
const runnable = []
for (let i = 0; i < entries.length; i++) {
  const r = runDefault(algos[i])
  if (r.steps && r.steps.length) runnable.push({ ...entries[i], steps: r.steps, kinds: classifySteps(r.steps) })
}

/* Runs with nothing to align. Reported by name because it is a finding about
   those generators, not about the comparison model: they narrate without
   moving anything the visualizer can show, for every step of the run. */
const inert = runnable.filter(e => !isComparableRun(e.steps, e.kinds))
console.log(`\ngenerators with no comparable state at all (${inert.length}):`)
for (const e of inert) console.log(`  ${e.categoryId}/${e.algorithmId}  (${e.steps.length} steps, type ${e.type})`)

const comparable = runnable.filter(e => isComparableRun(e.steps, e.kinds))
const types = pairableTypes(comparable)
let pairs = 0, withDiverge = 0, noAxis = 0
const axisTally = new Map()
const perType = new Map()

for (const t of types) {
  const group = comparable.filter(e => e.type === t && !e.presetInput)
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i], b = group[j]
      if (!canPair(a, b)) continue
      pairs++
      const ax = availableAxes(a.steps, b.steps, a.kinds, b.kinds)
      if (!ax.length) { noAxis++; continue }
      for (const x of ax) axisTally.set(x, (axisTally.get(x) || 0) + 1)
      const al = buildAlignment(a.steps, b.steps, ax[0], { kindsA: a.kinds, kindsB: b.kinds })
      assert.ok(al.frames.length > 0, `${a.algorithmId} vs ${b.algorithmId}: an available axis must yield frames`)
      assert.equal(al.frames.length, Math.max(al.counts.a, al.counts.b),
        `${a.algorithmId} vs ${b.algorithmId}: frame count must be the longer side`)
      if (al.divergeAt !== null) withDiverge++
      perType.set(t, (perType.get(t) || 0) + 1)
    }
  }
}

console.log(`\npairable types: ${types.sort().join(', ')}`)
console.log(`offerable pairs: ${pairs}`)
console.log(`pairs with no usable axis: ${noAxis}`)
console.log(`pairs that visibly diverge: ${withDiverge}  (${((withDiverge / pairs) * 100).toFixed(1)}%)`)
console.log('\npairs per type:')
for (const [t, n] of [...perType].sort((a, b) => b[1] - a[1])) console.log(`  ${t.padEnd(16)} ${n}`)
console.log('\naxis availability:')
for (const [x, n] of [...axisTally].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${AXES[x].label.padEnd(18)} ${n} pairs  (${((n / pairs) * 100).toFixed(0)}%)`)
}

/* The model's core promise: once the inert generators are filtered out, every
   pair the picker can offer has at least one axis to play on. */
assert.ok(pairs >= 100, `expected 100+ offerable pairs, got ${pairs}`)
assert.equal(noAxis, 0, `${noAxis} offerable pair(s) have no usable alignment axis`)
assert.ok(inert.length <= 3,
  `${inert.length} generators have no comparable state — was 3; a new one has appeared`)
assert.equal(axisTally.get('operation'), pairs, 'the operation axis must be available for every pair')

console.log('\nOK test-compare-runs')
