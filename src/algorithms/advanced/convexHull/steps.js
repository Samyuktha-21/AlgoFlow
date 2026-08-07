/* Convex hull by Andrew's monotone chain. Sort the points left to right, then
   sweep once building the lower boundary and once back building the upper one.
   The whole algorithm is the cross product on line 4: it says whether three
   points turn left or right, and any point that makes the chain turn the wrong
   way is inside the hull and gets popped.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

/* The input arrives as a flat number list, so consecutive values pair up into
   (x, y). An odd trailing value has no partner and is dropped. */
function toPoints(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 6
    ? inputArray
    : [0, 0, 4, 0, 4, 4, 0, 4, 2, 2]
  const pts = []
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]])
  /* Duplicates make the cross product degenerate and add nothing to see. */
  const seen = new Set()
  return pts.filter(p => {
    const k = `${p[0]},${p[1]}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const label = p => `${p[0]},${p[1]}`
const cross = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0])

export function generateSteps(inputArray) {
  const points = toPoints(inputArray)
  const n = points.length
  const steps = []

  /* Sorted order is the order the cells are drawn in, so an index into
     `points` is also an index into the visualizer's array. */
  points.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]))
  const cells = points.map(label)
  const hull = []

  const push = (description, codeLine, current = -1, considering = []) => steps.push({
    array: cells,
    array2: hull.map(label),
    array2Label: 'Hull chain (bottom of the stack first)',
    highlight: considering,
    sorted: hull.map(h => points.findIndex(p => p[0] === h[0] && p[1] === h[1])).filter(i => i >= 0),
    current,
    pointers: current >= 0 ? [{ index: current, label: 'i' }] : [],
    description,
    codeLine,
    extra: { points: n, onChain: hull.length },
  })

  push(`Convex hull of ${n} points — the smallest polygon containing them all.`, 7)
  if (n < 3) {
    push(`Fewer than 3 distinct points, so the hull is just the points themselves.`, 8)
    return steps
  }
  push(`Sort left to right (ties broken bottom to top): ${cells.join(' → ')}.`, 9)
  push('Start with an empty chain. Sweep right, building the lower boundary.', 11)

  /* ── Lower hull ── */
  for (let i = 0; i < n; i++) {
    while (hull.length >= 2) {
      const c = cross(hull[hull.length - 2], hull[hull.length - 1], points[i])
      push(`cross(${label(hull[hull.length - 2])}, ${label(hull[hull.length - 1])}, ${label(points[i])}) = ${c} — ${c > 0 ? 'a left turn, so the chain is still convex.' : 'not a left turn, so ' + label(hull[hull.length - 1]) + ' is inside the hull. Pop it.'}`,
        4, i, [i])
      if (c > 0) break
      hull.pop()
    }
    hull.push(points[i])
    push(`Add ${label(points[i])} to the lower chain.`, 12, i, [i])
  }

  const lowerCount = hull.length
  push(`Lower boundary done: ${hull.map(label).join(' → ')}. Now sweep back right to left for the upper boundary.`, 13)

  /* ── Upper hull ── */
  const t = hull.length + 1
  for (let i = n - 2; i >= 0; i--) {
    while (hull.length >= t) {
      const c = cross(hull[hull.length - 2], hull[hull.length - 1], points[i])
      push(`cross(${label(hull[hull.length - 2])}, ${label(hull[hull.length - 1])}, ${label(points[i])}) = ${c} — ${c > 0 ? 'a left turn, keep it.' : 'not a left turn, pop ' + label(hull[hull.length - 1]) + '.'}`,
        4, i, [i])
      if (c > 0) break
      hull.pop()
    }
    hull.push(points[i])
    push(`Add ${label(points[i])} to the upper chain.`, 13, i, [i])
  }

  /* The last point repeats the very first one, which is why Java returns k-1. */
  hull.pop()
  const inside = n - hull.length
  push(`Hull: ${hull.map(label).join(' → ')} — ${hull.length} vertices${inside > 0 ? `, with ${inside} point${inside > 1 ? 's' : ''} strictly inside` : ''}. Lower chain contributed ${lowerCount - 1}.`, 14)
  steps[steps.length - 1].result = `Hull: ${hull.map(label).join(' → ')}`
  return steps
}
