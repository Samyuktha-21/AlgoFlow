/* Does the declared input type match what the generator actually consumes?

   metadata.inputType decides three separate things: which parser the Algorithm
   page runs, what the input box tells the user to type, and what the Random
   button produces. If it disagrees with the generator, all three are wrong in
   different ways and nothing errors — the page just shows a demo the user
   cannot steer.

   Checks:
     1. the declared default input passes its own validator
     2. the generator survives that default and returns steps
     3. a declared string type really receives a string (not a number list)
     4. inputSpec is complete and its default is inside its own bounds
     5. the Random button's output parses under the same validator

   Usage: node scripts/audit-input-contract.mjs */
import { loadAlgorithms, argsFor, defaultInputFor } from './lib/run-algorithms.mjs'
import { normalizeNumberSpec } from '../src/utils/validators.js'
import { randomArray, randomSortedArray, randomGraphInput, randomWord } from '../src/utils/helpers.js'

const RANDOM_DRAWS = 20

/* Exactly what InputPanel's Random button puts in the box. */
function randomInput(meta) {
  const t = meta.type, it = meta.inputType
  if (t === 'searching') {
    const arr = randomSortedArray(12)
    return { input: arr.join(', '), target: String(arr[Math.floor(arr.length * 0.6)]) }
  }
  if (t === 'graph') {
    const seed = meta.defaultInput
    if (seed === '') return { input: '', target: '' }
    return { input: randomGraphInput({ weighted: (seed || '').includes(':') }), target: '' }
  }
  if (it === 'singleNumber' || it === 'numberPair') {
    const fields = normalizeNumberSpec(meta.inputSpec)
    return { input: fields.map(f => f.min + Math.floor(Math.random() * (f.max - f.min + 1))).join(', '), target: '' }
  }
  if (it === 'numberGrid') {
    const widths = (meta.defaultInput || '1,0 / 1,1').split('/').map(r => r.split(',').length)
    return { input: widths.map(w => Array.from({ length: w }, () => Math.floor(Math.random() * 2)).join(',')).join(' / '), target: '' }
  }
  if (it === 'stringPair') return { input: `${randomWord(6)},${randomWord(5)}`, target: '' }
  if (it === 'singleString') return { input: randomWord(7), target: '' }
  return { input: randomArray(8, 15).join(', '), target: '' }
}

const STRING_TYPES = new Set(['stringPair', 'singleString'])
const all = await loadAlgorithms()
const findings = []

for (const e of all) {
  const { meta, id } = e
  if (!e.gen) { findings.push(`${id}: no generateSteps`); continue }

  /* 1 + 2: the shipped default must survive its own validator and generator. */
  const def = defaultInputFor(meta)
  const r = argsFor(meta, def.input, def.target)
  if (r.error) { findings.push(`${id}: its own defaultInput is rejected by its validator — ${r.error}`); continue }
  let steps
  try { steps = e.gen(...r.args) } catch (err) { findings.push(`${id}: threw on its own default — ${err.message}`); continue }
  if (!Array.isArray(steps) || !steps.length) { findings.push(`${id}: its own default produces no steps`); continue }

  /* 3: a string type must actually hand the generator strings. */
  if (STRING_TYPES.has(meta.inputType)) {
    if (!r.args.every(a => typeof a === 'string')) {
      findings.push(`${id}: declares ${meta.inputType} but the dispatcher passes ${r.args.map(a => typeof a).join(', ')}`)
    }
  }
  if (meta.inputType === 'numberGrid' && !Array.isArray(r.args[0]?.[0])) {
    findings.push(`${id}: declares numberGrid but the dispatcher does not pass a 2-D array`)
  }

  /* 4: inputSpec completeness. */
  if (meta.inputType === 'singleNumber' || meta.inputType === 'numberPair') {
    const want = meta.inputType === 'numberPair' ? 2 : 1
    const fields = Array.isArray(meta.inputSpec) ? meta.inputSpec : []
    if (fields.length !== want) findings.push(`${id}: ${meta.inputType} needs ${want} inputSpec field(s), has ${fields.length}`)
    fields.forEach((f, i) => {
      for (const k of ['label', 'min', 'max']) {
        if (f[k] === undefined) findings.push(`${id}: inputSpec[${i}] is missing "${k}" — the hint renders "undefined"`)
      }
      if (f.default !== undefined && (f.default < f.min || f.default > f.max)) {
        findings.push(`${id}: inputSpec[${i}] default ${f.default} is outside its own ${f.min}..${f.max}`)
      }
    })
  } else if (meta.inputSpec !== undefined) {
    findings.push(`${id}: has an inputSpec but inputType is "${meta.inputType || 'array'}", which never reads it`)
  }

  /* 5: whatever Random produces must parse and run. */
  for (let d = 0; d < RANDOM_DRAWS; d++) {
    const rnd = randomInput(meta)
    const rr = argsFor(meta, rnd.input, rnd.target)
    if (rr.error) { findings.push(`${id}: the Random button produces input its own validator rejects — ${JSON.stringify(rnd.input)} → ${rr.error}`); break }
    try {
      const s = e.gen(...rr.args)
      if (!Array.isArray(s) || !s.length) { findings.push(`${id}: Random input produces no steps — ${JSON.stringify(rnd.input)}`); break }
    } catch (err) { findings.push(`${id}: threw on Random input ${JSON.stringify(rnd.input)} — ${err.message}`); break }
  }
}

console.log(`${all.length} algorithms checked against their declared input contract.\n`)
if (findings.length) {
  console.log(`${findings.length} finding(s):\n`)
  console.log(findings.map(f => '  ' + f).join('\n'))
} else {
  console.log('No findings — every declared inputType matches what its generator consumes.')
}
process.exitCode = findings.length ? 1 : 0
