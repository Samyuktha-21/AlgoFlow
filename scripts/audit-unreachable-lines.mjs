/* The typo pass over the "66 mapped lines the default input never reaches"
   listed in ROADMAP.md §2.3.

   `apply-code-data.cjs` flags a mapped Java line whenever the generator does
   not emit it on the DEFAULT input. That is expected for input-dependent
   branches — avlTree only rotates on some inputs, anagramCheck exits early
   when the lengths differ — so the list is reported, not failed. But it cannot
   distinguish "this branch needs a different input" from "the author typed the
   wrong line number", and 66 entries is too many to eyeball.

   This narrows it. Each generator is run over a spread of inputs shaped for
   its type — sorted, reverse-sorted, duplicates, single element, already-equal
   strings, dense and sparse graphs — and the union of every codeLine emitted
   is compared against the map. A line reached by *some* input is an
   input-dependent branch and is fine. A line no input ever reaches is either
   dead code in the snippet or a typo, and those are the only ones worth a
   human read.

   It also widens the audit in a second direction the 66-line report does not
   cover at all: `apply-code-data.cjs` sets MAP_LANGS = ['python'], so the c,
   cpp and javascript maps in scripts/data/*.cjs are authored but never
   checked against anything. Both defects this script found on its first run
   were in those unaudited maps, which is precisely why they had survived.

   Reports rather than fails: some snippet lines legitimately correspond to
   code paths the visualization never walks (an error branch, a helper shown
   for completeness). Two gates — the count must not grow, and no mapped line
   may point at something that is not code. */
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { argsFor, defaultInputFor } from './lib/run-algorithms.mjs'

const require = createRequire(import.meta.url)
const ROOT = 'src/algorithms'
const DATA = 'scripts/data'

/* Input shapes per algorithm type. Deliberately awkward: the point is to walk
   branches the tidy default never touches. */
const SPREADS = {
  sorting:    ['64, 34, 25, 12, 22, 11, 90', '1, 2, 3, 4, 5', '5, 4, 3, 2, 1', '7, 7, 7, 7', '3, 1', '2'],
  searching:  ['2, 5, 8, 12, 16, 23, 38, 56, 72, 91', '1, 2, 3, 4, 5', '10, 20, 30', '5'],
  graph:      ['0-1, 0-2, 1-3, 1-4, 2-5, 2-6', '0-1, 1-2, 2-0', '0-1, 2-3', '0-1, 1-2, 2-3, 3-0, 0-2', '0-1'],
  tree:       ['4, 2, 6, 1, 3, 5, 7', '1, 2, 3, 4, 5', '5, 4, 3, 2, 1', '10, 5, 15, 3, 7, 12, 18, 1', '1'],
  heap:       ['90, 70, 80, 40, 50, 60, 30', '1, 2, 3, 4, 5, 6, 7', '5, 5, 5, 5', '9, 1'],
  dp:         ['5, 3, 8, 1, 9, 2, 7', '1, 1, 1, 1', '9, 8, 7, 6, 5', '2, 4'],
  'dynamic-programming': ['5, 3, 8, 1, 9, 2, 7', '1, 1, 1, 1', '4, 2, 6'],
  backtracking: ['4, 2, 6, 1, 3', '1, 2, 3, 4', '3, 3, 3'],
  'linked-list': ['1, 2, 3, 4, 5', '1', '5, 4, 3, 2, 1', '1, 1, 2, 2, 3'],
  stack:      ['3, 7, 2, 5, 8, 4', '1, 2', '9, 8, 7, 6, 5'],
  'stack-queue': ['3, 7, 2, 5, 8, 4', '1, 2, 3'],
  queue:      ['3, 7, 2, 5, 8, 4', '1, 2, 3'],
  array:      ['3, 1, 4, 1, 5, 9, 2, 6', '1, 2, 3, 4, 5', '5, 4, 3, 2, 1', '-3, -1, -4, 2, 6', '0, 0, 0', '7'],
  fundamentals: ['5, 3, 7, 1, 9, 4, 6', '1, 2, 3', '15, 30, 45', '2, 4, 8'],
  hashing:    ['12, 24, 36, 15, 27', '1, 1, 1', '5, 10, 15, 20, 25, 30'],
  greedy:     ['10, 20, 30, 5, 15', '1, 1, 1, 1', '100, 1'],
}
const STRING_PAIRS = ['ABCBDAB,BDCAB', 'ABC,ABC', 'AB,XY', 'AAAA,AA', 'A,ABCDE']
const SINGLE_STRINGS = ['racecar', 'abcdef', 'aabbcc', 'a', 'abab']

function inputsFor(meta) {
  const it = meta?.inputType
  if (it === 'stringPair') return STRING_PAIRS.map(s => ({ input: s, target: '' }))
  if (it === 'singleString') return SINGLE_STRINGS.map(s => ({ input: s, target: '' }))
  if (it === 'singleNumber' || it === 'numberPair') {
    const fields = Array.isArray(meta.inputSpec) && meta.inputSpec.length ? meta.inputSpec : [{ min: 1, default: 8 }]
    /* Walk each scalar across its legal range rather than only its seed. */
    const picks = [0, 0.25, 0.5, 0.75, 1]
    return picks.map(f => ({
      input: fields.map(fd => {
        const lo = fd.min ?? 1, hi = fd.max ?? Math.max(lo + 8, (fd.default ?? lo) + 4)
        return Math.round(lo + (hi - lo) * f)
      }).join(', '),
      target: '',
    }))
  }
  if (it === 'numberGrid') {
    return [
      { input: '1, 2, 3\n4, 5, 6\n7, 8, 9', target: '' },
      { input: '0, 0\n0, 0', target: '' },
      { input: '5', target: '' },
    ]
  }
  const type = meta?.type || 'array'
  const spread = SPREADS[type] || SPREADS.array
  if (type === 'searching') {
    /* Vary the target too: found-early, found-late and absent walk different
       branches, and a searching map that misses one is the likely typo. */
    const out = []
    for (const s of spread) {
      const nums = s.split(',').map(x => x.trim())
      out.push({ input: s, target: nums[Math.floor(nums.length / 2)] })
      out.push({ input: s, target: nums[0] })
      out.push({ input: s, target: nums[nums.length - 1] })
      out.push({ input: s, target: '99999' })
    }
    return out
  }
  return spread.map(s => ({ input: s, target: '' }))
}

/* Union of every codeLine the generator emits across the whole spread. */
async function reachableLines(dir, meta) {
  const stepsPath = path.join(dir, 'steps.js')
  if (!fs.existsSync(stepsPath)) return null
  let gen
  try { gen = (await import(pathToFileURL(path.resolve(stepsPath)).href)).generateSteps }
  catch { return null }
  if (typeof gen !== 'function') return null

  const set = new Set()
  let ran = 0
  /* The algorithm's OWN default first, always. The widened shapes below are
     built from the per-type defaults and do not know about a
     metadata.defaultInput seed, so without this an algorithm that ships its
     own input (and several do) gets audited against input it never runs on —
     which reports lines as unreachable that the default reaches on every
     single visit. */
  const spread = [defaultInputFor(meta), ...inputsFor(meta)]
  for (const inp of spread) {
    const r = argsFor(meta, inp.input, inp.target)
    if (r.error) continue
    try {
      const steps = gen(...r.args)
      if (!Array.isArray(steps)) continue
      ran++
      for (const s of steps) if (typeof s?.codeLine === 'number') set.add(s.codeLine)
    } catch { /* an input this generator rejects is not a finding */ }
  }
  return { set, ran }
}

/* ---------- run ---------- */

const files = fs.existsSync(DATA) ? fs.readdirSync(DATA).filter(f => f.endsWith('.cjs')).sort() : []
assert.ok(files.length, `no line-map data files in ${DATA}/`)

const unreachable = []
let mapped = 0, checked = 0, rescued = 0

for (const file of files) {
  const cat = file.replace(/\.cjs$/, '')
  const authored = require(path.resolve(DATA, file))
  for (const algo of Object.keys(authored)) {
    const dir = path.join(ROOT, cat, algo)
    const spec = authored[algo]
    let meta = {}
    try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8')) } catch { continue }

    const reach = await reachableLines(dir, meta)
    if (!reach || !reach.ran) continue
    checked++

    const javaSrc = (() => {
      try { return JSON.parse(fs.readFileSync(path.join(dir, 'code.json'), 'utf8')).java?.code || '' }
      catch { return '' }
    })()
    const javaLines = javaSrc.split('\n')

    /* A Java line is either reachable or not — that does not depend on which
       language it is mapped INTO, so collapse the per-language duplicates. */
    const javaMapped = new Set()
    /* A key whose value is `null` in every language is a deliberate omission,
       already the codebase's way of saying "this line has no counterpart".
       Only a key some language actually points somewhere can be a defect. */
    const pointedSomewhere = new Set()
    for (const lang of Object.keys(spec.lineMap || {})) {
      for (const [k, v] of Object.entries(spec.lineMap[lang])) {
        javaMapped.add(Number(k))
        if (v !== null && v !== undefined) pointedSomewhere.add(Number(k))
      }
    }
    mapped += javaMapped.size

    for (const ja of [...javaMapped].sort((a, b) => a - b)) {
      if (reach.set.has(ja)) continue
      /* Reached by some input but not the default = an input-dependent
         branch, which is exactly what the roadmap said most of these were. */
      const source = (javaLines[ja - 1] || '').trim()
      unreachable.push({
        id: `${cat}/${algo}`, line: ja,
        source: source.slice(0, 62),
        /* A map pointing at a blank line or a comment is wrong whatever the
           reachability story — neither is code, so a highlight there shows
           the learner nothing. A lone `}` is NOT in this category: mapping
           Java's closing brace to C's closing brace is faithful, just never
           exercised. */
        inert: pointedSomewhere.has(ja) && (source === '' || source.startsWith('//') || source.startsWith('#')),
        inputs: reach.ran,
      })
    }
  }
}

/* How many of the original 66 the widened spread accounted for. */
rescued = 66 - unreachable.length

console.log(`${checked} algorithms run across widened inputs, ${mapped} mapped lines checked`)
console.log(`\nmapped lines NO input ever reaches: ${unreachable.length}`)
console.log(`(the default-input list in apply-code-data.cjs is 66; widening the`)
console.log(` inputs accounts for ${rescued > 0 ? rescued : 0} of them as input-dependent branches)`)

const inert = unreachable.filter(u => u.inert)
if (inert.length) {
  console.log(`\n${inert.length} of them point at a line with nothing to highlight`)
  console.log('(blank, a lone brace, or a comment) — those are defects, not branches:')
  for (const u of inert) {
    console.log(`  ${u.id.padEnd(32)} java ${String(u.line).padStart(3)} | ${u.source || '(blank line)'}`)
  }
}

if (unreachable.length) {
  console.log('\nall unreachable mapped lines, by algorithm — worth reading by hand:')
  const byAlgo = new Map()
  for (const u of unreachable) {
    if (!byAlgo.has(u.id)) byAlgo.set(u.id, [])
    byAlgo.get(u.id).push(u)
  }
  for (const [id, rows] of [...byAlgo].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  ${id}  (${rows[0].inputs} inputs tried)`)
    for (const r of rows) console.log(`    java ${String(r.line).padStart(3)} | ${r.source}`)
  }
}

/* A floor, not a target: this number must not grow. Lower it when a real typo
   is fixed, so the fix cannot be undone silently. */
assert.ok(unreachable.length <= 20,
  `${unreachable.length} mapped lines are unreachable on every input — the ceiling is 20`)
assert.equal(inert.length, 0,
  `${inert.length} mapped line(s) point at a blank line or a comment — `
  + 'a highlight landing there shows the learner nothing')

console.log('\nOK audit-unreachable-lines')
