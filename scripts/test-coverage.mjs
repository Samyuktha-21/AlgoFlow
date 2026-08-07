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
/* The real dispatcher, not a copy of it. This file used to inline its own
   mirror of runSteps because that module was Vite-only; the copy drifted. */
import { runSteps } from '../src/game/runSteps.js'

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
    const steps = runSteps(e)
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
