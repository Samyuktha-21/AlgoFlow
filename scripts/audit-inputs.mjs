/* Input-contract audit. For every algorithm on disk this walks the exact
   path the Algorithm page takes — getDefaultInput -> the matching validator
   -> generateSteps — and reports anything that would show the user an error
   or an empty visualization.

   It also exercises the Random button, because a seed that works says
   nothing about the thousand other inputs the button can hand the generator.
   Random is sampled, not proved: a fixed number of draws per algorithm, with
   the failing input printed so the case is reproducible. */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getDefaultInput } from '../src/game/defaultInput.js'
import {
  parseArrayInput, parseSearchInput, parseGraphInput, parseNumberInput,
  normalizeNumberSpec,
} from '../src/utils/validators.js'
import { randomArray, randomSortedArray, randomGraphInput } from '../src/utils/helpers.js'

const RANDOM_DRAWS = 25
const ROOT = 'src/algorithms'
const TRACE = process.argv.includes('--trace')
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null

/* Mirrors handleVisualize in src/pages/Algorithm.jsx. Returns either
   { error } (what the user would see in red) or { steps }. */
function visualize(meta, gen, inputStr, targetStr) {
  const type = meta?.type || 'sorting'
  const it = meta?.inputType
  if (type === 'searching') {
    const p = parseSearchInput(inputStr, targetStr)
    if (p.error) return { error: p.error }
    return { steps: gen(p.array, p.target) }
  }
  if (type === 'graph') {
    if (inputStr?.trim()) {
      const p = parseGraphInput(inputStr)
      if (p.error) return { error: p.error }
      return { steps: gen(p.nodes, p.edges, p.nodes[0]?.id ?? 0) }
    }
    return { steps: gen(null, null, 0) }
  }
  if (it === 'stringPair') {
    const raw = (inputStr || '').trim()
    const parts = raw.split(',')
    if (!raw || parts.length < 2) return { error: 'stringPair: needs two comma-separated strings' }
    const s1 = parts[0].trim().toUpperCase()
    const s2 = parts.slice(1).join(',').trim().toUpperCase()
    if (!s1 || !s2) return { error: 'stringPair: both strings must be non-empty' }
    return { steps: gen(s1, s2) }
  }
  if (it === 'singleString') {
    const raw = (inputStr || '').trim()
    if (!raw) return { error: 'singleString: empty' }
    return { steps: gen(raw) }
  }
  if (it === 'singleNumber' || it === 'numberPair') {
    const p = parseNumberInput(inputStr, meta?.inputSpec)
    if (p.error) return { error: p.error }
    return { steps: gen(p.array) }
  }
  const p = parseArrayInput(inputStr)
  if (p.error) return { error: p.error }
  return { steps: gen(p.array) }
}

/* What the Random button in InputPanel would produce, for one draw. */
function randomInputFor(meta, defaultValue) {
  const type = meta?.type || 'sorting'
  const it = meta?.inputType
  const isGraph = type === 'graph'
  if (type === 'searching') {
    const arr = randomSortedArray()
    return { input: arr.join(', '), target: String(arr[Math.floor(arr.length * 0.6)]) }
  }
  if (isGraph) {
    if (defaultValue === '') return { input: '', target: '' }
    return { input: randomGraphInput({ weighted: (defaultValue || '').includes(':') }), target: '' }
  }
  if (it === 'singleNumber' || it === 'numberPair') {
    const fields = normalizeNumberSpec(meta?.inputSpec)
    return { input: fields.map(f => f.min + Math.floor(Math.random() * (f.max - f.min + 1))).join(', '), target: '' }
  }
  if (it === 'stringPair' || it === 'singleString') return null /* Random is not offered */
  return { input: randomArray().join(', '), target: '' }
}

/* Legal-but-awkward inputs: every one of these passes the validator, so a
   user can type it and expect a visualization. Labelled so a failure names
   the property that broke rather than just a number list. */
function edgeCasesFor(meta) {
  const type = meta?.type || 'sorting'
  const it = meta?.inputType
  const cases = []
  const push = (label, input, target = '') => cases.push([label, { input, target }])

  if (type === 'graph') {
    const w = (meta.defaultInput || '').includes(':')
    if (meta.defaultInput === '') return cases /* built-in board, no edge list */
    const e = (a, b, n) => (w ? `${a}-${b}:${n}` : `${a}-${b}`)
    push('two-nodes', e(0, 1, 3))
    push('path', [e(0, 1, 1), e(1, 2, 2), e(2, 3, 3)].join(', '))
    push('star', [e(0, 1, 1), e(0, 2, 2), e(0, 3, 3), e(0, 4, 4)].join(', '))
    push('cycle', [e(0, 1, 1), e(1, 2, 2), e(2, 0, 3)].join(', '))
    push('complete-4', [e(0, 1, 1), e(0, 2, 2), e(0, 3, 3), e(1, 2, 4), e(1, 3, 5), e(2, 3, 6)].join(', '))
    push('disconnected', [e(0, 1, 1), e(2, 3, 2)].join(', '))
    push('self-loop', [e(0, 1, 1), e(1, 1, 2), e(1, 2, 3)].join(', '))
    push('sparse-ids', [e(5, 9, 1), e(9, 12, 2)].join(', '))
    if (w) push('zero-weight', [`0-1:0`, `1-2:0`, `0-2:5`].join(', '))
    return cases
  }
  if (it === 'singleNumber' || it === 'numberPair') {
    const fields = normalizeNumberSpec(meta.inputSpec)
    push('all-min', fields.map(f => f.min).join(', '))
    push('all-max', fields.map(f => f.max).join(', '))
    if (fields.length === 2) {
      push('min-max', `${fields[0].min}, ${fields[1].max}`)
      push('max-min', `${fields[0].max}, ${fields[1].min}`)
    }
    return cases
  }
  if (it === 'stringPair') {
    push('single-chars', 'A,B')
    push('identical', 'ABC,ABC')
    push('no-overlap', 'AAAA,BBBB')
    return cases
  }
  if (it === 'singleString') {
    push('single-char', 'A')
    push('two-chars', 'AB')
    push('all-same', 'AAAA')
    return cases
  }

  /* Array-shaped: sorting, tree, heap, dp, stack, array, greedy, hashing … */
  const target = type === 'searching' ? '7' : ''
  push('min-length', '3, 7', target)
  push('all-equal', '7, 7, 7, 7', target)
  push('duplicates', '5, 3, 5, 1, 3, 7', target)
  push('sorted', '1, 2, 3, 4, 5, 6, 7', target)
  push('reverse-sorted', '7, 6, 5, 4, 3, 2, 1', target)
  push('negatives', '-5, 3, -1, 8, -9, 2', target)
  push('zeros', '0, 0, 5, 0, 3', target)
  push('large-values', '99999, 12345, 67890, 500', target)
  push('max-length', Array.from({ length: 50 }, (_, i) => ((i * 17) % 97) + 1).join(', '), target)
  return cases
}

const findings = []
const add = (algo, kind, detail) => findings.push({ algo, kind, detail })

/* Every algorithm list on disk, as "category/id". */
function allAlgorithms() {
  const out = []
  for (const c of fs.readdirSync(ROOT)) {
    const cdir = path.join(ROOT, c)
    if (!fs.statSync(cdir).isDirectory()) continue
    for (const a of fs.readdirSync(cdir)) {
      const adir = path.join(cdir, a)
      if (!fs.statSync(adir).isDirectory()) continue
      if (fs.existsSync(path.join(adir, 'metadata.json'))) out.push(`${c}/${a}`)
    }
  }
  return out
}

/* A generator that never terminates cannot be caught in-process — it just
   eats the heap until node dies, taking the rest of the audit with it. So
   the default run forks one child per algorithm with a time and memory cap,
   and turns a death into an ordinary finding. A hang here is a frozen
   browser tab in production, so it has to be reported, not tripped over. */
if (!ONLY) {
  const { execFileSync } = await import('node:child_process')
  const algos = allAlgorithms()
  let clean = 0
  const lines = []
  for (const algo of algos) {
    try {
      const out = execFileSync(
        process.execPath,
        ['--max-old-space-size=512', process.argv[1], '--only', algo],
        { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'pipe'] },
      )
      if (out.trim()) lines.push(out.trimEnd())
      else clean++
    } catch (e) {
      const partial = (e.stdout || '').trim()
      if (partial) lines.push(partial)
      const why = e.killed || e.signal === 'SIGTERM'
        ? 'did not terminate within 20s (infinite loop or unbounded step growth)'
        : /heap out of memory/.test(String(e.stderr)) ? 'exhausted a 512MB heap (unbounded step growth)'
        : `crashed: ${String(e.stderr).split('\n').find(Boolean) || e.message}`
      lines.push(`  ${algo}: RUNAWAY — ${why}`)
    }
  }
  console.log(`audited ${algos.length} algorithms — ${clean} clean, ${algos.length - clean} with findings\n`)
  if (lines.length) console.log(lines.join('\n'))
  process.exitCode = lines.length ? 1 : 0
} else {
  await auditOne(ONLY)
  const byKind = {}
  for (const f of findings) (byKind[f.kind] ||= []).push(f)
  for (const kind of Object.keys(byKind).sort()) {
    for (const f of byKind[kind]) console.log(`  ${f.algo}: [${kind}] ${f.detail}`)
  }
}

async function auditOne(algo) {
  {
    const [c, a] = algo.split('/')
    const adir = path.join(ROOT, c, a)
    const metaP = path.join(adir, 'metadata.json')
    const meta = JSON.parse(fs.readFileSync(metaP, 'utf8'))
    const stepsP = path.join(adir, 'steps.js')
    let gen = null
    if (fs.existsSync(stepsP)) {
      try { gen = (await import(pathToFileURL(path.resolve(stepsP)).href)).generateSteps || null }
      catch (e) { add(algo, 'import-failed', e.message) }
    }
    if (!gen) { add(algo, 'no-generator', 'steps.js missing or exports no generateSteps'); return }

    /* An inputSpec without bounds makes parseNumberInput reject or accept
       arbitrarily, and the hint text renders "undefined". */
    const it = meta.inputType
    if (it === 'singleNumber' || it === 'numberPair') {
      const fields = Array.isArray(meta.inputSpec) ? meta.inputSpec : []
      const want = it === 'numberPair' ? 2 : 1
      if (fields.length !== want) add(algo, 'spec-arity', `inputType ${it} but inputSpec has ${fields.length} field(s)`)
      fields.forEach((f, i) => {
        for (const k of ['label', 'min', 'max']) {
          if (f[k] === undefined) add(algo, 'spec-incomplete', `inputSpec[${i}] missing "${k}"`)
        }
        if (f.default !== undefined && (f.default < f.min || f.default > f.max)) {
          add(algo, 'spec-default-oob', `inputSpec[${i}] default ${f.default} outside ${f.min}–${f.max}`)
        }
      })
    }

    const def = getDefaultInput(meta.type, it, meta.inputSpec, meta.defaultInput)
    let clean = true
    let r
    try { r = visualize(meta, gen, def.input, def.target) }
    catch (e) { r = { thrown: e.message } }
    if (r.thrown) { add(algo, 'default-threw', `${JSON.stringify(def.input)} -> ${r.thrown}`); clean = false }
    else if (r.error) { add(algo, 'default-rejected', `${JSON.stringify(def.input)} -> ${r.error}`); clean = false }
    else if (!Array.isArray(r.steps) || r.steps.length === 0) {
      add(algo, 'default-no-steps', `${JSON.stringify(def.input)} -> ${Array.isArray(r.steps) ? '0 steps' : typeof r.steps}`)
      clean = false
    }

    /* The Random button only ever produces comfortable input. The validators
       permit a great deal more, and anything they permit is something a user
       can type, so it has to produce a visualization rather than a crash or
       an empty canvas. */
    for (const [label, cand] of edgeCasesFor(meta)) {
      let er
      if (TRACE) process.stderr.write(`${algo} [${label}] ${cand.input}\n`)
      try { er = visualize(meta, gen, cand.input, cand.target) }
      catch (e) { er = { thrown: e.message } }
      if (er.thrown) { add(algo, 'edge-threw', `${label} ${JSON.stringify(cand.input)} -> ${er.thrown}`); clean = false }
      else if (er.error) { add(algo, 'edge-rejected', `${label} ${JSON.stringify(cand.input)} -> ${er.error}`); clean = false }
      else if (!Array.isArray(er.steps) || er.steps.length === 0) {
        add(algo, 'edge-no-steps', `${label} ${JSON.stringify(cand.input)} -> ${Array.isArray(er.steps) ? '0 steps' : typeof er.steps}`)
        clean = false
      }
    }

    for (let d = 0; d < RANDOM_DRAWS; d++) {
      const rnd = randomInputFor(meta, meta.defaultInput)
      if (!rnd) break
      let rr
      try { rr = visualize(meta, gen, rnd.input, rnd.target) }
      catch (e) { rr = { thrown: e.message } }
      if (rr.thrown) { add(algo, 'random-threw', `${JSON.stringify(rnd.input)} -> ${rr.thrown}`); clean = false; break }
      if (rr.error) { add(algo, 'random-rejected', `${JSON.stringify(rnd.input)} -> ${rr.error}`); clean = false; break }
      if (!Array.isArray(rr.steps) || rr.steps.length === 0) {
        add(algo, 'random-no-steps', `${JSON.stringify(rnd.input)} -> ${Array.isArray(rr.steps) ? '0 steps' : typeof rr.steps}`)
        clean = false; break
      }
    }
  }
}
