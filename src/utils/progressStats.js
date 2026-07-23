/* Pure helpers for per-user learning progress. No React, no Firestore — the
   progress maps, categories, and algorithm registry are passed in, so this is
   fully unit-testable. See the Phase 3b design spec §3.2. */

/* Firestore map key for one algorithm. Field keys can't contain '/' or '.',
   so we join with '__' (mirrors the algoStats/{cat}__{algo} convention). */
export function progressKey(categoryId, algorithmId) {
  return `${categoryId}__${algorithmId}`
}

export function splitKey(key) {
  const i = key.indexOf('__')
  return i < 0 ? [key, ''] : [key.slice(0, i), key.slice(i + 2)]
}

/* Given the learned map and the site's categories + registry, compute learned
   counts and percentages. Only algorithms flagged implemented count toward
   either numerator or denominator. */
export function computeProgress(learned, categories, registry) {
  const map = learned || {}
  const byCategory = {}
  let oLearned = 0
  let oTotal = 0
  for (const c of categories) {
    const algos = (registry[c.id] || []).filter(a => a.implemented)
    const total = algos.length
    const learnedCount = algos.filter(a => map[progressKey(c.id, a.id)]).length
    byCategory[c.id] = { learned: learnedCount, total, pct: total ? Math.round((learnedCount / total) * 100) : 0 }
    oLearned += learnedCount
    oTotal += total
  }
  return {
    overall: { learned: oLearned, total: oTotal, pct: oTotal ? Math.round((oLearned / oTotal) * 100) : 0 },
    byCategory,
  }
}
