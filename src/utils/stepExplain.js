/*
 * Shared step-explanation helpers, used by the Algorithm page (beginner "why"
 * hints + final answer) and the Test Yourself game (reveal text + final output).
 * Pure — no React, no Vite. Safe to import from node test scripts.
 */

export function getWhyText(step, algorithmType) {
  if (!step) return null
  const { type, array, comparing, swapping, sorted, target, mid, current, queue, pivot } = step

  if (type === 'compare' && Array.isArray(comparing) && comparing.length >= 2 && array) {
    const [i, j] = comparing
    const a = array[i], b = array[j]
    if (a !== undefined && b !== undefined) {
      if (a > b) return `${a} > ${b} — out of order for ascending sort, so they'll be swapped`
      return `${a} ≤ ${b} — already in the right order, no swap needed`
    }
  }
  if (type === 'swap' && Array.isArray(swapping) && swapping.length >= 2 && array) {
    const [i, j] = swapping
    const a = array[i], b = array[j]
    if (a !== undefined && b !== undefined)
      return `Moving ${a} and ${b} — the larger value bubbles toward the end of the array`
  }
  if (type === 'pivot' && pivot !== undefined && array)
    return `${array[pivot]} is the pivot — everything smaller goes left, everything larger goes right`
  if (type === 'sorted' && Array.isArray(sorted))
    return `This position is now permanent — the correct value is locked in place`
  if ((algorithmType === 'searching' || type === 'compare') && mid !== undefined && target !== undefined && array) {
    const midVal = array[mid]
    if (midVal === target) return `Middle value ${midVal} equals target — found it!`
    if (target < midVal) return `Target ${target} < middle value ${midVal} — search the LEFT half next (discard right)`
    return `Target ${target} > middle value ${midVal} — search the RIGHT half next (discard left)`
  }
  if (type === 'found') return `Target found! Binary search takes at most log₂(n) comparisons — far faster than checking every element`
  if (type === 'visit' && current !== undefined) {
    if (Array.isArray(queue) && queue.length > 0)
      return `Processing node ${current} from the front of the queue. BFS always expands closest nodes first — like ripples in a pond`
    return `Exploring as deep as possible from node ${current} before backtracking (DFS)`
  }
  if (type === 'enqueue')
    return `Adding unvisited neighbours to the queue so they'll be explored in order of discovery`
  if (type === 'backtrack')
    return `Dead end — no valid option here. Backtracking to try a different choice`
  if (type === 'update')
    return `Storing this result so we never recompute it — this is memoization, the core of dynamic programming`
  return null
}

export function deriveResult(step) {
  if (!step) return null
  /* An explicit `result` is the generator stating its own answer, so it wins
     over anything inferred from the step's shape. Only a non-empty string or
     a number counts: several generators use `result` as an array of indices
     for the visualizer, which is not an answer at all. */
  if (typeof step.result === 'string' && step.result.trim()) return step.result
  if (typeof step.result === 'number') return String(step.result)
  if (step.found >= 0) return `Found at index ${step.found}`
  if (step.found === -2) return 'Not found in array'
  if (step.array && step.sorted?.length === step.array.length) return step.array.join(' → ')
  if (step.visited?.length > 0 && !step.current && !step.queue?.length) return `Visited: ${step.visited.join(' → ')}`
  if (step.dp?.length && !step.current) return `dp result: ${step.dp[step.dp.length - 1]}`
  if (typeof step.description === 'string' &&
      (step.description.toLowerCase().includes('complete') || step.description.toLowerCase().includes('sorted')))
    return step.description
  return null
}
