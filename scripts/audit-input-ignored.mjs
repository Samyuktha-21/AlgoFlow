/* Which algorithms ignore what the user typed?

   audit-inputs.mjs asks whether a generator SURVIVES its input. This asks the
   different and equally important question of whether it READS it — a
   generator that returns a canned demo no matter what is typed produces no
   error, no crash and no empty canvas, so nothing else in the repo notices.
   From the user's side it looks like the Visualize button is broken.

   The test is behavioural, not static: run each generator on two different
   legal inputs and compare the steps. Function.length cannot be used for this
   — it stops counting at the first default parameter, so the very common
   `generateSteps(nodes = null, edges = null)` reports zero parameters while
   using both.

   Usage: node scripts/audit-input-ignored.mjs [--quiet] */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = 'src/algorithms'
const QUIET = process.argv.includes('--quiet')

/* Two inputs that differ in length, values and structure, so a generator that
   reads any part of its input has to produce different steps. */
function inputsFor(meta) {
  const t = meta.type, it = meta.inputType
  if (t === 'graph') return ['0-1:1, 1-2:2, 2-3:3', '0-1:5, 0-2:9, 1-2:1, 1-3:4, 2-3:7, 0-3:2']
  if (it === 'stringPair') return [['ABCABC', 'ABC'], ['ZZXYZ', 'XY']]
  if (it === 'singleString') return [['BANANA'], ['ZZZAB']]
  if (it === 'singleNumber' || it === 'numberPair') {
    const f = Array.isArray(meta.inputSpec) && meta.inputSpec.length ? meta.inputSpec : [{ min: 1, max: 9 }]
    return [[f.map(x => x.min)], [f.map(x => Math.min(x.max, x.min + 3))]]
  }
  if (t === 'searching') return [[[1, 2, 3, 4, 5, 6, 7], 3], [[10, 20, 30, 40, 50, 60], 50]]
  return [[[5, 3, 8, 1, 9, 2, 7]], [[42, 17, 99, 4, 63, 28, 11, 77]]]
}

function callWith(meta, gen, input) {
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

const ignored = []
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

    const [A, B] = inputsFor(meta)
    let sa, sb
    /* A generator that throws on one of these is audit-inputs.mjs's problem,
       not this script's. */
    try { sa = JSON.stringify(callWith(meta, gen, A)) } catch { continue }
    try { sb = JSON.stringify(callWith(meta, gen, B)) } catch { continue }
    if (sa === sb) ignored.push(`${c}/${a}`.padEnd(38) + `type=${meta.type}${meta.inputType ? `, inputType=${meta.inputType}` : ''}`)
  }
}

console.log(`${total} algorithms checked — ${total - ignored.length} read their input, ${ignored.length} ignore it.\n`)
if (ignored.length && !QUIET) {
  console.log('These return identical steps for two different legal inputs, so the')
  console.log('Visualize button appears to do nothing with what the user typed:\n')
  console.log(ignored.map(l => '  ' + l).join('\n'))
}
process.exitCode = ignored.length ? 1 : 0
