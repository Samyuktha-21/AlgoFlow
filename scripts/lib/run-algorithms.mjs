/* Shared loader for the audit scripts: walks every algorithm on disk, runs its
   generator on its own default input through the exact dispatch the Algorithm
   page uses, and hands back the metadata plus the steps.

   Each audit used to re-implement this dispatch, which is how they drifted
   apart — one of them was still missing numberGrid while another had it. */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getDefaultInput } from '../../src/game/defaultInput.js'
import {
  parseArrayInput, parseSearchInput, parseGraphInput, parseNumberInput, parseGridInput,
} from '../../src/utils/validators.js'

const ROOT = 'src/algorithms'

/* Mirrors handleVisualize in src/pages/Algorithm.jsx. Returns { args } for the
   generator, or { error } when the input would be rejected on the page. */
export function argsFor(meta, inputStr, targetStr) {
  const type = meta?.type || 'sorting'
  const it = meta?.inputType

  if (type === 'searching') {
    const p = parseSearchInput(inputStr, targetStr)
    return p.error ? { error: p.error } : { args: [p.array, p.target] }
  }
  if (type === 'graph') {
    if (!inputStr?.trim()) return { args: [null, null, 0] }
    const p = parseGraphInput(inputStr)
    return p.error ? { error: p.error } : { args: [p.nodes, p.edges, p.nodes[0]?.id ?? 0] }
  }
  if (it === 'stringPair') {
    const raw = (inputStr || '').trim()
    const parts = raw.split(',')
    if (!raw || parts.length < 2) return { error: 'stringPair needs two comma-separated values' }
    const s1 = parts[0].trim().toUpperCase()
    const s2 = parts.slice(1).join(',').trim().toUpperCase()
    if (!s1 || !s2) return { error: 'both halves must be non-empty' }
    return { args: [s1, s2] }
  }
  if (it === 'singleString') {
    const raw = (inputStr || '').trim()
    return raw ? { args: [raw] } : { error: 'empty string' }
  }
  if (it === 'numberGrid') {
    const p = parseGridInput(inputStr, { ragged: meta?.raggedGrid === true })
    return p.error ? { error: p.error } : { args: [p.grid] }
  }
  if (it === 'singleNumber' || it === 'numberPair') {
    const p = parseNumberInput(inputStr, meta?.inputSpec)
    return p.error ? { error: p.error } : { args: [p.array] }
  }
  const p = parseArrayInput(inputStr)
  return p.error ? { error: p.error } : { args: [p.array] }
}

export function defaultInputFor(meta) {
  return getDefaultInput(meta.type, meta.inputType, meta.inputSpec, meta.defaultInput)
}

/* Every algorithm on disk, with its metadata and loaded generator. */
export async function loadAlgorithms() {
  const out = []
  for (const c of fs.readdirSync(ROOT)) {
    const cdir = path.join(ROOT, c)
    if (!fs.statSync(cdir).isDirectory()) continue
    for (const a of fs.readdirSync(cdir)) {
      const adir = path.join(cdir, a)
      if (!fs.statSync(adir).isDirectory()) continue
      const metaP = path.join(adir, 'metadata.json')
      if (!fs.existsSync(metaP)) continue
      const meta = JSON.parse(fs.readFileSync(metaP, 'utf8'))
      const stepsP = path.join(adir, 'steps.js')
      let gen = null
      if (fs.existsSync(stepsP)) {
        try { gen = (await import(pathToFileURL(path.resolve(stepsP)).href)).generateSteps || null }
        catch { gen = null }
      }
      out.push({ id: `${c}/${a}`, category: c, algorithm: a, dir: adir, meta, gen })
    }
  }
  return out
}

/* Runs one algorithm on its own default input. */
export function runDefault(entry) {
  const def = defaultInputFor(entry.meta)
  const r = argsFor(entry.meta, def.input, def.target)
  if (r.error) return { error: r.error, def }
  try {
    const steps = entry.gen(...r.args)
    return { steps, def, args: r.args }
  } catch (e) {
    return { thrown: e.message, def }
  }
}
