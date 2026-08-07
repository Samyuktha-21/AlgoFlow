/* Which algorithms ignore what the user typed?

   audit-inputs.mjs asks whether a generator SURVIVES its input. This asks the
   different and equally important question of whether it READS it — a
   generator that returns a canned demo no matter what is typed produces no
   error, no crash and no empty canvas, so nothing else in the repo notices.
   From the user's side it looks like the Visualize button is broken.

   The test is behavioural: run the generator on several different legal inputs
   and compare the steps. Function.length cannot be used for this — it stops
   counting at the first default parameter, so the very common
   `generateSteps(nodes = null, edges = null)` reports zero parameters while
   using both.

   ── Why several probes and not two ──
   With a single pair, one unlucky collision is indistinguishable from a real
   finding, and the probe values become something to hand-tune. Three separate
   false positives came from exactly that: plain-letter probes against the
   bracket matchers (which strip non-brackets), a 3x3 grid against a solver
   that only accepts 9x9, and [3,7] vs [42,88] against dutchFlag, which maps
   values `% 3` so both collapse to [0,1].

   So a finding now requires ALL probes to agree with each other. Any one of
   them distinguishing the algorithm clears it, which makes a collision
   harmless instead of misleading — the probe values stop being load-bearing.

   Usage: node scripts/audit-input-ignored.mjs [--quiet] */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = 'src/algorithms'
const QUIET = process.argv.includes('--quiet')

/* Probes vary in length, sign, spread, parity and residue mod 2/3/5, so no
   single transformation an algorithm might apply can flatten all of them. */
const ARRAY_PROBES = [
  [5, 3, 8, 1, 9, 2, 7],
  [42, 17, 99, 4, 63, 28, 11, 77],
  [1, 1, 2, 3, 5, 8, 13],
  [-4, 12, -7, 30, 6],
  [100, 25, 64, 81, 49, 36],
]
/* Both at the shortest length parseArrayInput accepts. A generator with a
   `length >= 5` guard swaps every one of these for its own fallback, so they
   come out identical — which is how kLargestElements quietly showed the wrong
   array for any input under five values. */
const SHORT_PROBES = [[1, 5], [2, 7], [9, 4], [-3, 6]]

const STRING_PROBES = ['ban(an)a', 'zz{x}y', 'mississippi', '[a,b],c']
const PAIR_PROBES = [['ABCABC', 'ABC'], ['ZZXYZ', 'XY'], ['MISSISSIPPI', 'ISSI'], ['A/B,AB']]

function probesFor(meta) {
  const t = meta.type, it = meta.inputType
  if (t === 'graph') {
    return [
      '0-1:1, 1-2:2, 2-3:3',
      '0-1:5, 0-2:9, 1-2:1, 1-3:4, 2-3:7, 0-3:2',
      '0-1:2, 1-2:2, 2-0:2, 2-3:9',
      '3-4:6, 4-5:1, 5-3:8',
    ]
  }
  if (it === 'stringPair') return PAIR_PROBES.map(p => (Array.isArray(p) ? p : [p]))
  if (it === 'singleString') return STRING_PROBES.map(s => [s])
  if (it === 'numberGrid') {
    /* Grid algorithms reject a grid of the wrong shape — a Sudoku solver only
       accepts 9x9 — so a fixed probe would make them all look like they
       ignore their input. Every probe is derived from the seed's own shape. */
    const seed = meta.defaultInput || '1,0,0 / 1,1,0 / 0,1,1'
    const grid = seed.split('/').map(r => r.trim().split(',').map(Number))
    const variant = (fn) => grid.map((r, i) => r.map((v, j) => fn(v, i, j))).map(r => r.join(',')).join(' / ')
    return [
      seed,
      variant((v, i, j) => (v !== 0 && (i + j) % 3 === 0 ? 0 : v)),
      variant((v, i, j) => (v !== 0 && (i * 2 + j) % 4 === 0 ? 0 : v)),
      variant((v, i, j) => (v !== 0 && (i + j * 3) % 5 === 0 ? 0 : v)),
    ]
  }
  if (it === 'singleNumber' || it === 'numberPair') {
    const f = Array.isArray(meta.inputSpec) && meta.inputSpec.length ? meta.inputSpec : [{ min: 1, max: 9 }]
    const at = frac => f.map(x => x.min + Math.floor((x.max - x.min) * frac))
    return [at(0), at(0.25), at(0.5), at(0.75)].map(a => [a])
  }
  if (t === 'searching') return ARRAY_PROBES.map(a => [[...a].sort((x, y) => x - y), a[0]])
  return ARRAY_PROBES.map(a => [a])
}

function shortProbesFor(meta) {
  const t = meta.type, it = meta.inputType
  if (t === 'graph' || it === 'stringPair' || it === 'singleString'
      || it === 'numberGrid' || it === 'singleNumber' || it === 'numberPair') return null
  if (t === 'searching') return SHORT_PROBES.map(a => [[...a].sort((x, y) => x - y), a[0]])
  return SHORT_PROBES.map(a => [a])
}

function callWith(meta, gen, input) {
  if (meta.inputType === 'numberGrid') {
    return gen(input.split('/').map(r => r.trim().split(',').map(Number)))
  }
  if (meta.type === 'graph') {
    const edges = input.split(',').map(p => {
      const [ends, w] = p.trim().split(':')
      const [from, to] = ends.split('-').map(Number)
      return w === undefined ? { from, to } : { from, to, weight: Number(w) }
    })
    const nodes = [...new Set(edges.flatMap(e => [e.from, e.to]))]
      .sort((a, b) => a - b).map(id => ({ id, label: String(id) }))
    return gen(nodes, edges, nodes[0].id)
  }
  return gen(...input)
}

/* True when every probe produced the same steps — i.e. nothing about the
   input reached the output. */
function allAgree(meta, gen, probes) {
  const seen = []
  for (const p of probes) {
    let out
    try { out = JSON.stringify(callWith(meta, gen, p)) } catch { return null }
    if (out === undefined) return null
    seen.push(out)
  }
  return seen.every(s => s === seen[0])
}

const ignored = []
const fellBack = []
let total = 0

for (const c of fs.readdirSync(ROOT)) {
  const cdir = path.join(ROOT, c)
  if (!fs.statSync(cdir).isDirectory()) continue
  for (const a of fs.readdirSync(cdir)) {
    const adir = path.join(cdir, a)
    if (!fs.statSync(adir).isDirectory()) continue
    const stepsP = path.join(adir, 'steps.js')
    if (!fs.existsSync(stepsP)) continue
    let gen
    try { gen = (await import(pathToFileURL(path.resolve(stepsP)).href)).generateSteps } catch { continue }
    if (typeof gen !== 'function') continue
    const meta = JSON.parse(fs.readFileSync(path.join(adir, 'metadata.json'), 'utf8'))
    total++

    const label = `${c}/${a}`.padEnd(38) + `type=${meta.type}${meta.inputType ? `, inputType=${meta.inputType}` : ''}`

    /* A generator that throws on a probe is audit-inputs.mjs's problem. */
    const same = allAgree(meta, gen, probesFor(meta))
    if (same === null) continue
    if (same) { ignored.push(label); continue }

    const short = shortProbesFor(meta)
    if (short) {
      const shortSame = allAgree(meta, gen, short)
      if (shortSame) fellBack.push(label)
    }
  }
}

console.log(`${total} algorithms checked — ${total - ignored.length} read their input, ${ignored.length} ignore it.`)
console.log(`${fellBack.length} silently fall back on legal-but-short input.\n`)
if (ignored.length && !QUIET) {
  console.log('IGNORES ITS INPUT — every probe produced identical steps, so the')
  console.log('Visualize button appears to do nothing with what the user typed:\n')
  console.log(ignored.map(l => '  ' + l).join('\n'))
  console.log()
}
if (fellBack.length && !QUIET) {
  console.log('SILENT FALLBACK — a guard rejects input the validator accepts, so a short')
  console.log('array is swapped for a canned one with no indication:\n')
  console.log(fellBack.map(l => '  ' + l).join('\n'))
}
process.exitCode = (ignored.length + fellBack.length) ? 1 : 0
