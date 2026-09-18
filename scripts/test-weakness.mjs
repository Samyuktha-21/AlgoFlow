/* Tests for the step-granularity weakness map (Item 3), including the
   constraint the plan is strictest about: the daily challenge must never feed
   it, because /daily is deterministically seeded so every visitor gets the
   same question and personalising it would make leaderboard scores
   incomparable. That one is checked against the source, not just the model —
   a unit test cannot catch someone wiring recordWeakness into Daily.jsx. */
import assert from 'node:assert'
import fs from 'node:fs'
import {
  emptyWeakness, recordAnswer, weaknessRows, weakKinds, totalAnswered,
  chooseByWeakness, mergeWeakness, MIN_SAMPLES, WEAK_RATE,
} from '../src/game/weakness.js'
import { generateNextOp } from '../src/game/challenges/nextOp.js'
import { classifySteps, OP_KINDS, isInformativeKind } from '../src/game/classifyStep.js'
import { loadAlgorithms, runDefault } from './lib/run-algorithms.mjs'

/* ---------- recording ---------- */

let m = emptyWeakness()
assert.equal(totalAnswered(m), 0)

m = recordAnswer(m, { opKind: 'swap', algorithmType: 'sorting', wasCorrect: false })
assert.deepEqual(m.byKind.swap, { c: 0, t: 1 })
assert.deepEqual(m.byType.sorting, { c: 0, t: 1 })
m = recordAnswer(m, { opKind: 'swap', algorithmType: 'sorting', wasCorrect: true })
assert.deepEqual(m.byKind.swap, { c: 1, t: 2 })
assert.equal(totalAnswered(m), 2)

/* Recording does not mutate the map it was given. */
const before = emptyWeakness()
const after = recordAnswer(before, { opKind: 'visit', wasCorrect: true })
assert.deepEqual(before, emptyWeakness(), 'recordAnswer is pure')
assert.ok(after.byKind.visit)

/* Uninformative kinds are dropped — a learner cannot be weak at "nothing
   changed", and counting those would dilute every real signal. */
for (const k of ['no-op', 'init', 'unknown', 'inspect']) {
  const n = recordAnswer(emptyWeakness(), { opKind: k, wasCorrect: false })
  assert.equal(totalAnswered(n), 0, `${k} must not be recorded`)
}
assert.equal(totalAnswered(recordAnswer(emptyWeakness(), { wasCorrect: false })), 0, 'no opKind, no record')

/* ---------- rows and thresholds ---------- */

let s = emptyWeakness()
for (let i = 0; i < 10; i++) s = recordAnswer(s, { opKind: 'swap', wasCorrect: i < 3 })       // 30%
for (let i = 0; i < 10; i++) s = recordAnswer(s, { opKind: 'visit', wasCorrect: true })        // 100%
for (let i = 0; i < 2; i++)  s = recordAnswer(s, { opKind: 'relax', wasCorrect: false })       // 0%, 2 samples

const rows = weaknessRows(s)
assert.equal(rows[0].key, 'swap', 'worst-first ordering')
assert.ok(Math.abs(rows[0].missRate - 0.7) < 1e-9)
assert.ok(rows.every(r => r.total >= MIN_SAMPLES), 'thin samples are not shown')
assert.ok(!rows.some(r => r.key === 'relax'),
  'two answers is not a weakness — it is two answers')
assert.ok(rows.every(r => r.label && r.label !== r.key || r.key === r.label),
  'rows carry a human label')

const weak = weakKinds(s)
assert.ok(weak.has('swap'), '30% correct is weak')
assert.ok(!weak.has('visit'), '100% correct is not weak')
assert.ok(!weak.has('relax'), 'not enough samples to call it weak')
assert.ok(WEAK_RATE > 0 && WEAK_RATE < 1)

/* ---------- selection bias ---------- */

const cand = (opKind) => ({ opKind, type: 'nextOp' })
const trials = 4000
let seed = 7
const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)

const counts = { swap: 0, visit: 0 }
for (let i = 0; i < trials; i++) counts[chooseByWeakness([cand('swap'), cand('visit')], s, rng).opKind]++
assert.ok(counts.swap > counts.visit * 2,
  `weak kinds should be favoured (swap ${counts.swap} vs visit ${counts.visit})`)
/* ...but never to the exclusion of everything else, or practice narrows to a
   single operation and the map stops learning about the rest. */
assert.ok(counts.visit > trials * 0.05,
  `a mastered kind must still appear sometimes (got ${counts.visit}/${trials})`)

assert.equal(chooseByWeakness([], s), null, 'no candidates is null, not a throw')
assert.equal(chooseByWeakness([cand('swap')], s).opKind, 'swap', 'a single candidate is returned as-is')
assert.ok(chooseByWeakness([cand('swap'), cand('visit')], null), 'an empty map still picks something')

/* ---------- merge ---------- */

const merged = mergeWeakness(
  { byKind: { swap: { c: 1, t: 2 } }, byType: {} },
  { byKind: { swap: { c: 2, t: 3 }, visit: { c: 1, t: 1 } }, byType: {} })
assert.deepEqual(merged.byKind.swap, { c: 3, t: 5 }, 'local counts add to server counts')
assert.deepEqual(merged.byKind.visit, { c: 1, t: 1 }, 'a kind on one side survives')
assert.deepEqual(mergeWeakness(null, null), emptyWeakness(), 'merging nothing is empty, not a throw')

console.log('OK weakness unit tests')

/* ---------- the /daily constraint, checked against the source ---------- */

const daily = fs.readFileSync('src/pages/Daily.jsx', 'utf8')
assert.ok(!/recordWeakness|weakness/i.test(daily),
  'Daily.jsx must not touch the weakness map: /daily is seeded so every visitor '
  + 'gets the same question, and personalising it would make leaderboard scores incomparable')

const dailyChallenge = fs.readFileSync('src/game/dailyChallenge.js', 'utf8')
assert.ok(!/weakness|chooseByWeakness/i.test(dailyChallenge),
  'the daily challenge builder must not consult the weakness map')

const play = fs.readFileSync('src/pages/TestYourself.jsx', 'utf8')
assert.ok(/recordWeakness\(/.test(play), 'Test Yourself must record weakness')
assert.ok(/chooseByWeakness\(/.test(play), 'Test Yourself must bias selection')

console.log('OK /daily is untouched by the weakness map')

/* ---------- corpus: are the op kinds a map can actually be built on? ---------- */

const algos = await loadAlgorithms()
let asked = 0
const kindTally = new Map()
let s2 = 0
const rng2 = () => ((s2 = (s2 * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)

for (const e of algos) {
  if (!e.gen) continue
  const r = runDefault(e)
  if (!r.steps || r.steps.length < 3) continue
  const entry = { ...e, name: e.meta.name, type: e.meta.type, themeId: 'circuit', metadata: e.meta }
  /* Several draws per algorithm, so the report reflects what a learner would
     actually be asked rather than one arbitrary freeze point each. */
  for (let d = 0; d < 8; d++) {
    const ch = generateNextOp(entry, r.steps, rng2)
    if (!ch) continue
    asked++
    assert.ok(ch.opKind, `${e.id}: every nextOp challenge must carry an opKind`)
    assert.ok(OP_KINDS.includes(ch.opKind), `${e.id}: ${ch.opKind} is not a declared kind`)
    kindTally.set(ch.opKind, (kindTally.get(ch.opKind) || 0) + 1)
  }
}

const informativeAsked = [...kindTally].filter(([k]) => isInformativeKind(k)).reduce((a, [, v]) => a + v, 0)
console.log(`\nquestions drawn: ${asked}   distinct op kinds asked about: ${kindTally.size}`)
console.log(`questions about a real operation: ${informativeAsked}  (${((informativeAsked / asked) * 100).toFixed(1)}%)`)
console.log('\nwhat learners actually get asked:')
for (const [k, v] of [...kindTally].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(18)} ${String(v).padStart(5)}  ${((v / asked) * 100).toFixed(1)}%`)
}

/* A weakness map is only worth having if questions spread across kinds. One
   kind at 90% would mean the panel can only ever say one thing. */
const top = Math.max(...kindTally.values())
assert.ok(kindTally.size >= 8, `only ${kindTally.size} distinct op kinds are ever asked about`)
assert.ok(top / asked <= 0.45, `one op kind is ${((top / asked) * 100).toFixed(0)}% of all questions`)
assert.ok(informativeAsked / asked >= 0.90,
  `only ${((informativeAsked / asked) * 100).toFixed(1)}% of questions are about a real operation`)

console.log('\nOK test-weakness')
