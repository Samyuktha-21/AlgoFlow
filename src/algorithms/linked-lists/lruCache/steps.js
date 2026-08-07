/* LRU cache. The list is kept in most-recently-used order, so eviction is
   always "drop the last one" — no scanning for a victim. Every access moves
   its entry to the front, which is why a doubly linked list plus a hash map
   gives O(1) for both get and put.

   Input: the FIRST number is the capacity, the rest are the keys accessed in
   order. A key not in the cache is a put; one already there is a get. */

export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [3, 1, 2, 3, 1, 4, 2]
  const cap = Math.min(Math.max(1, Math.abs(nums[0]) || 3), 6)
  const keys = nums.slice(1).slice(0, 14)

  /* Front of the array is most recently used; the back is the eviction end. */
  const cache = []
  const steps = []
  let nextId = 0

  const snapshot = () => cache.map((e, i) => ({
    id: e.id, value: `${e.key}→${e.val}`, next: i < cache.length - 1 ? cache[i + 1].id : null,
  }))
  const addStep = (op, description, codeLine) => steps.push({
    nodes: snapshot(),
    pointers: [],
    reversed: [],
    highlighted: cache.map(e => e.id),
    description,
    codeLine,
    extra: { op, cacheSize: cache.length, cap },
  })

  addStep('init', `LRU cache with capacity ${cap}. Most recently used on the left, least recently used on the right — which is the end that gets evicted.`, 2)

  let hits = 0, misses = 0, evictions = 0
  for (const k of keys) {
    const idx = cache.findIndex(e => e.key === k)
    if (idx >= 0) {
      hits++
      const [entry] = cache.splice(idx, 1)
      cache.unshift(entry)
      addStep('get', `get(${k}) → ${entry.val}. A hit, so move it to the front — it is now the most recently used.`, 9)
    } else {
      misses++
      if (cache.length >= cap) {
        const evicted = cache.pop()
        evictions++
        addStep('evict', `Cache is full, so evict the entry at the far end: key ${evicted.key}. It is the least recently used, which is exactly what the ordering gives us for free.`, 6)
      }
      const val = k * 10
      cache.unshift({ id: nextId++, key: k, val })
      addStep('put', `put(${k}, ${val}). A miss, so insert at the front. Cache: [${cache.map(e => e.key).join(' → ')}]`, 5)
    }
  }

  addStep('done', `Done: ${hits} hit${hits === 1 ? '' : 's'}, ${misses} miss${misses === 1 ? '' : 'es'}, ${evictions} eviction${evictions === 1 ? '' : 's'}. Final order: [${cache.map(e => e.key).join(' → ')}]`, 10)
  steps[steps.length - 1].result = `${hits} hits, ${misses} misses, ${evictions} evictions`
  return steps
}
