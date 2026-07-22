import { parseArrayInput, parseSearchInput, parseGraphInput } from '../utils/validators'
import { getDefaultInput } from './defaultInput'

/* Runs a loaded pool entry's steps generator with its default input,
   dispatching by algorithm type exactly like the Algorithm page's
   handleVisualize. Returns a steps array, or null if it can't run. */
export function runSteps(entry) {
  const gen = entry.generateSteps
  if (!gen) return null
  const type = entry.type
  const inputType = entry.metadata?.inputType
  const def = getDefaultInput(type, inputType)
  try {
    if (type === 'searching') {
      const p = parseSearchInput(def.input, def.target)
      if (p.error) return null
      return gen(p.array, p.target)
    }
    if (type === 'graph') {
      const p = parseGraphInput(def.input)
      if (p.error) return null
      return gen(p.nodes, p.edges, 0)
    }
    if (inputType === 'stringPair') {
      const parts = (def.input || '').split(',')
      if (parts.length < 2) return null
      return gen(parts[0].trim().toUpperCase(), parts.slice(1).join(',').trim().toUpperCase())
    }
    if (inputType === 'singleString') {
      return gen((def.input || '').trim())
    }
    const p = parseArrayInput(def.input)
    if (p.error) return null
    return gen(p.array)
  } catch {
    return null
  }
}
