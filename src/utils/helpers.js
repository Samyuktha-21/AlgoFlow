export function randomArray(min = 5, max = 20, valMin = 1, valMax = 99) {
  const len = Math.floor(Math.random() * (max - min + 1)) + min
  return Array.from({ length: len }, () => Math.floor(Math.random() * (valMax - valMin + 1)) + valMin)
}

export function randomSortedArray(len = 12, valMin = 1, valMax = 99) {
  const arr = randomArray(len, len, valMin, valMax)
  return [...new Set(arr)].sort((a, b) => a - b)
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
