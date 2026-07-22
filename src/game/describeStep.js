/*
 * Turns a visualization step into a short human label for the "predict the
 * next step" challenge. Prefers a typed label (compare/swap/... — used by a
 * few visualizers) and otherwise falls back to the step's own `description`
 * string, which every real steps.js generator emits. Returns null only when a
 * step carries neither. Pure — node-testable.
 */

const val = (arr, i) => (arr && arr[i] !== undefined ? arr[i] : `#${i}`)

function typedLabel(step) {
  if (!step || !step.type) return null
  const a = step.array
  switch (step.type) {
    case 'compare':
      if (Array.isArray(step.comparing) && step.comparing.length >= 2)
        return `Compare ${val(a, step.comparing[0])} and ${val(a, step.comparing[1])}`
      return 'Compare two elements'
    case 'swap':
      if (Array.isArray(step.swapping) && step.swapping.length >= 2)
        return `Swap ${val(a, step.swapping[0])} and ${val(a, step.swapping[1])}`
      return 'Swap two elements'
    case 'sorted': {
      const idx = Array.isArray(step.sorted) ? step.sorted[step.sorted.length - 1] : undefined
      return idx !== undefined ? `Mark position ${idx} as sorted` : 'Lock a position as sorted'
    }
    case 'pivot':     return step.pivot !== undefined ? `Choose ${val(a, step.pivot)} as pivot` : 'Choose a pivot'
    case 'found':     return 'Target found'
    case 'visit':     return step.current !== undefined ? `Visit node ${step.current}` : 'Visit a node'
    case 'enqueue':   return 'Add neighbours to the queue'
    case 'dequeue':   return 'Take the next node from the queue'
    case 'backtrack': return 'Backtrack from a dead end'
    case 'update':    return 'Update a stored (memoized) value'
    case 'relax':     return 'Relax an edge (shorter path found)'
    case 'insert':    return 'Insert the element into place'
    default:          return null
  }
}

export function describeStep(step) {
  if (!step) return null
  const typed = typedLabel(step)
  if (typed) return typed
  if (typeof step.description === 'string' && step.description.trim()) return step.description.trim()
  return null
}

export function buildNextOpOptions(steps, i) {
  const correct = describeStep(steps[i + 1])
  if (!correct) return null
  const seen = new Set([correct])
  const distractors = []
  // distractors are other steps from the same run — same style as the answer
  for (const s of steps) {
    const label = describeStep(s)
    if (label && !seen.has(label)) { seen.add(label); distractors.push(label) }
    if (distractors.length >= 3) break
  }
  if (distractors.length < 2) return null
  return { correct, distractors: distractors.slice(0, 3) }
}
