import { parseArrayInput, parseSearchInput, parseGraphInput, parseNumberInput } from '../utils/validators'
import { getDefaultInput } from './defaultInput'

/* Runs a loaded pool entry's steps generator with its default input,
   dispatching by algorithm type exactly like the Algorithm page's
   handleVisualize. Returns a steps array, or null if it can't run. */
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
