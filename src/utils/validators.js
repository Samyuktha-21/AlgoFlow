export function parseArrayInput(input) {
  if (!input || !input.trim()) return { error: 'Input cannot be empty' }
  const parts = input.split(',').map(s => s.trim())
  if (parts.some(p => p === '')) return { error: 'Invalid format — use comma-separated integers (e.g. 5,3,7,1,9)' }
  const nums = parts.map(Number)
  if (nums.some(isNaN)) return { error: 'All values must be integers' }
  if (nums.some(n => !Number.isInteger(n))) return { error: 'All values must be integers (no decimals)' }
  if (nums.length < 2) return { error: 'Need at least 2 elements' }
  if (nums.length > 50) return { error: 'Maximum 50 elements allowed' }
  return { array: nums }
}

/* Scalar-input algorithms (factorial, gcd, n-queens …) take one or two plain
   numbers rather than a list, so the "at least 2 elements" array rule rejects
   perfectly valid input. Their metadata carries an `inputSpec`: one entry per
   field, each { label, min, max, default }. Bounds mirror what the step
   generator can actually render, so out-of-range input gets an error instead
   of being silently clamped. */
const FALLBACK_SPEC = [{ label: 'n', min: 1, max: 100 }]

export function normalizeNumberSpec(spec) {
  return Array.isArray(spec) && spec.length ? spec : FALLBACK_SPEC
}

export function describeNumberSpec(spec) {
  return normalizeNumberSpec(spec).map(f => `${f.label} (${f.min}–${f.max})`).join(', ')
}

export function parseNumberInput(input, spec) {
  const fields = normalizeNumberSpec(spec)
  const shape = describeNumberSpec(fields)
  if (!input || !input.trim()) return { error: `Input cannot be empty — enter ${shape}` }

  const parts = input.split(',').map(s => s.trim()).filter(s => s !== '')
  if (parts.length !== fields.length) {
    return {
      error: fields.length === 1
        ? `Enter a single integer: ${shape}`
        : `Enter ${fields.length} comma-separated integers: ${shape}`,
    }
  }

  const nums = []
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    const v = Number(parts[i])
    if (isNaN(v) || !Number.isInteger(v)) return { error: `${f.label} must be an integer` }
    if (v < f.min || v > f.max) return { error: `${f.label} must be between ${f.min} and ${f.max}` }
    nums.push(v)
  }
  return { array: nums }
}

export function parseSearchInput(arrayInput, targetInput) {
  const arrayResult = parseArrayInput(arrayInput)
  if (arrayResult.error) return arrayResult
  const target = Number(targetInput)
  if (isNaN(target) || !Number.isInteger(target)) return { error: 'Target must be an integer' }
  const sorted = [...arrayResult.array].sort((a, b) => a - b)
  return { array: sorted, target }
}

export function parseGraphInput(edgesInput) {
  if (!edgesInput || !edgesInput.trim()) return { error: 'Input cannot be empty' }
  const pairs = edgesInput.split(',').map(s => s.trim())
  const edges = []
  const nodeSet = new Set()
  for (const pair of pairs) {
    /* "0-1" is an edge; "0-1:4" is the same edge weighted 4. The weight is
       split off first so a negative one ("0-4:-4") cannot be mistaken for the
       dash separating the two node ids. */
    const [endpoints, ...weightParts] = pair.split(':')
    if (weightParts.length > 1) return { error: `Invalid edge format "${pair}" — use "0-1" or "0-1:4"` }
    const parts = endpoints.split('-')
    if (parts.length !== 2) return { error: `Invalid edge format "${pair}" — use "0-1" or "0-1:4"` }
    const [a, b] = parts.map(Number)
    if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) {
      return { error: `Invalid node IDs in "${pair}"` }
    }
    const edge = { from: a, to: b }
    if (weightParts.length === 1) {
      const w = Number(weightParts[0].trim())
      if (weightParts[0].trim() === '' || isNaN(w) || !Number.isInteger(w)) {
        return { error: `Invalid weight in "${pair}" — use an integer, e.g. "0-1:4"` }
      }
      edge.weight = w
    }
    edges.push(edge)
    nodeSet.add(a)
    nodeSet.add(b)
  }
  if (nodeSet.size > 20) return { error: 'Maximum 20 nodes allowed' }
  const nodes = [...nodeSet].sort((a, b) => a - b).map(id => ({ id, label: String(id) }))
  return { nodes, edges }
}
