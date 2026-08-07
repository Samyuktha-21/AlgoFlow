export function randomArray(min = 5, max = 20, valMin = 1, valMax = 99) {
  const len = Math.floor(Math.random() * (max - min + 1)) + min
  return Array.from({ length: len }, () => Math.floor(Math.random() * (valMax - valMin + 1)) + valMin)
}

export function randomSortedArray(len = 12, valMin = 1, valMax = 99) {
  const arr = randomArray(len, len, valMin, valMax)
  return [...new Set(arr)].sort((a, b) => a - b)
}

/* A random edge list for the graph input box. Builds a spanning tree first so
   the graph is always connected — a disconnected random graph makes most of
   these algorithms stop after one component and look broken — then adds a few
   extra edges so there is something to choose between. */
export function randomGraphInput({ weighted = false, nodes = 0 } = {}) {
  const n = nodes || Math.floor(Math.random() * 3) + 5
  const edges = []
  for (let v = 1; v < n; v++) edges.push([Math.floor(Math.random() * v), v])
  const extra = Math.floor(Math.random() * 3) + 1
  for (let i = 0; i < extra; i++) {
    const a = Math.floor(Math.random() * n)
    const b = Math.floor(Math.random() * n)
    if (a !== b && !edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) edges.push([a, b])
  }
  return edges
    .map(([a, b]) => (weighted ? `${a}-${b}:${Math.floor(Math.random() * 9) + 1}` : `${a}-${b}`))
    .join(', ')
}

/* Random text for the string algorithms. The alphabet is deliberately small:
   over 26 letters two random strings share almost nothing, and an LCS or
   edit-distance trace with no matches in it teaches nothing. */
export function randomWord(len = 6, alphabet = 'ABCD') {
  return Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function formatComplexity(c) {
  return c.replace(/O\(([^)]+)\)/g, (_, inner) => `O(${inner})`)
}

export function getCategoryByAlgorithm(algorithmId, registry) {
  for (const [catId, algos] of Object.entries(registry)) {
    if (algos.some(a => a.id === algorithmId)) return catId
  }
  return null
}

export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
