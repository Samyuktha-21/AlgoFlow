import { parseArrayInput, parseSearchInput, parseGraphInput, parseNumberInput, parseGridInput } from '../utils/validators.js'
import { getDefaultInput } from './defaultInput.js'

/* Runs a loaded pool entry's steps generator with its default input,
   dispatching by algorithm type exactly like the Algorithm page's
   handleVisualize. Returns a steps array, or null if it can't run.

   The imports above carry explicit .js extensions so this module loads under
   plain node as well as Vite. It used to be Vite-only, which meant no test
   harness could reach it — scripts/test-coverage.mjs kept its own copy of this
   dispatch instead, and that copy silently fell behind (it was still missing
   numberGrid long after the app had it). One dispatcher, one place. */
export function runSteps(entry) {
  const gen = entry.generateSteps
  if (!gen) return null
  const type = entry.type
  const inputType = entry.metadata?.inputType
  const inputSpec = entry.metadata?.inputSpec
  const def = getDefaultInput(type, inputType, inputSpec, entry.metadata?.defaultInput)
  try {
    if (type === 'searching') {
      const p = parseSearchInput(def.input, def.target)
      if (p.error) return null
      return gen(p.array, p.target)
    }
    if (type === 'graph') {
      /* A blank default is deliberate — the algorithm ships its own board
         (A*'s obstacle grid), so hand it nothing and let it build one. */
      if (!def.input.trim()) return gen(null, null, 0)
      const p = parseGraphInput(def.input)
      if (p.error) return null
      return gen(p.nodes, p.edges, p.nodes[0]?.id ?? 0)
    }
    if (inputType === 'stringPair') {
      const parts = (def.input || '').split(',')
      if (parts.length < 2) return null
      return gen(parts[0].trim().toUpperCase(), parts.slice(1).join(',').trim().toUpperCase())
    }
    if (inputType === 'singleString') {
      return gen((def.input || '').trim())
    }
    if (inputType === 'numberGrid') {
      const p = parseGridInput(def.input, { ragged: entry.metadata?.raggedGrid === true })
      if (p.error) return null
      return gen(p.grid)
    }
    if (inputType === 'singleNumber' || inputType === 'numberPair') {
      const p = parseNumberInput(def.input, inputSpec)
      if (p.error) return null
      return gen(p.array)
    }
    const p = parseArrayInput(def.input)
    if (p.error) return null
    return gen(p.array)
  } catch {
    return null
  }
}
