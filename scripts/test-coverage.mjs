/* Broad coverage check: walk every algorithm on disk, import its real
   steps.js, and run the full challenge pipeline. Verifies generators work on
   REAL step shapes (not just the synthetic unit test) and reports per-type
   coverage. Compensates for the lack of a browser smoke test. */
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { generateComplexity } from '../src/game/challenges/complexity.js'
import { generateNextOp } from '../src/game/challenges/nextOp.js'
import { generateFinalOutput } from '../src/game/challenges/finalOutput.js'
import { generateNameAlgorithm } from '../src/game/challenges/nameAlgorithm.js'
import { getDefaultInput } from '../src/game/defaultInput.js'

/* Inline mirror of src/game/runSteps.js dispatch, but without the validators
   import (extensionless, Vite-only) so this harness runs under plain node. */
const parseArr = (s) => (s || '').split(',').map(x => parseInt(x.trim(), 10)).filter(n => !Number.isNaN(n))
function runStepsLocal(e) {
  const gen = e.generateSteps
  if (!gen) return null
  const t = e.type
  const it = e.metadata?.inputType
  const def = getDefaultInput(t, it, e.metadata?.inputSpec, e.metadata?.defaultInput)
  try {
    if (t === 'searching') return gen(parseArr(def.input), parseInt(def.target, 10))
    if (t === 'graph') {
      /* Mirrors parseGraphInput, including the optional ":weight" suffix.
         A blank default means the algorithm supplies its own board. */
      if (!def.input.trim()) return gen(null, null, 0)
      const edges = def.input.split(',').map(p => {
        const [ends, w] = p.trim().split(':')
        const [from, to] = ends.split('-').map(Number)
        return w === undefined ? { from, to } : { from, to, weight: Number(w) }
      })
      const nodes = [...new Set(edges.flatMap(x => [x.from, x.to]))]
        .sort((a, b) => a - b).map(id => ({ id, label: String(id) }))
      return gen(nodes, edges, nodes[0]?.id ?? 0)
    }
    if (it === 'stringPair') {
      const parts = def.input.split(',')
      return gen(parts[0].trim().toUpperCase(), parts.slice(1).join(',').trim().toUpperCase())
    }
    if (it === 'singleString') return gen(def.input.trim())
    if (it === 'numberGrid') return gen(def.input.split('/').map(r => r.trim().split(',').map(Number)))
    return gen(parseArr(def.input))
  } catch { return null }
}

const ROOT = 'src/algorithms'
const entries = []
for (const c of fs.readdirSync(ROOT)) {
  const cdir = path.join(ROOT, c)
  if (!fs.statSync(cdir).isDirectory()) continue
  for (const a of fs.readdirSync(cdir)) {
    const adir = path.join(cdir, a)
    if (!fs.statSync(adir).isDirectory()) continue
    const metaP = path.join(adir, 'metadata.json')
    if (!fs.existsSync(metaP)) continue
    const metadata = JSON.parse(fs.readFileSync(metaP, 'utf8'))
    const stepsP = path.join(adir, 'steps.js')
    let generateSteps = null
    if (fs.existsSync(stepsP)) {
      try { generateSteps = (await import(pathToFileURL(path.resolve(stepsP)).href)).generateSteps || null }
      catch { generateSteps = null }
    }
    entries.push({
      categoryId: c, algorithmId: a, name: metadata.name, type: metadata.type,
      themeId: 'circuit', metadata, hasSteps: !!generateSteps, generateSteps,
    })
  }
}

const names = entries.map(e => e.name)
const wellFormed = (ch) => !ch || (ch.options.filter(o => o.isCorrect).length === 1 && ch.options.length >= 3 && typeof ch.prompt === 'string')

const stats = { total: entries.length, withSteps: 0, complexity: 0, nextOp: 0, finalOutput: 0, nameAlgorithm: 0, stepsRan: 0, stepsFailed: 0 }

for (const e of entries) {
  const cx = generateComplexity(e)
  assert.ok(wellFormed(cx), `malformed complexity for ${e.algorithmId}`)
  if (cx) stats.complexity++
  if (e.hasSteps) {
    stats.withSteps++
    const steps = runStepsLocal(e)
    if (steps && steps.length) {
      stats.stepsRan++
      const no = generateNextOp(e, steps); assert.ok(wellFormed(no), `malformed nextOp for ${e.algorithmId}`); if (no) stats.nextOp++
      const fo = generateFinalOutput(e, steps); assert.ok(wellFormed(fo), `malformed finalOutput for ${e.algorithmId}`); if (fo) stats.finalOutput++
      const na = generateNameAlgorithm(e, steps, names); assert.ok(wellFormed(na), `malformed nameAlgorithm for ${e.algorithmId}`); if (na) stats.nameAlgorithm++
    } else {
      stats.stepsFailed++
    }
  }
}

console.log(JSON.stringify(stats, null, 2))
assert.ok(stats.complexity >= stats.total * 0.8, 'complexity should cover most algorithms')
assert.ok(stats.nextOp > 0 && stats.finalOutput > 0 && stats.nameAlgorithm > 0, 'each step-based type should have coverage')
console.log('OK test-coverage')
