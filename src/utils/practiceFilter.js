/* Filter curated practice problems by topic (categoryId) and algorithm.
   A problem with no algorithmId is a category-level fallback: it shows for
   any algorithm within its category. See the design spec §6. */
export function filterProblems(problems, topic, algo) {
  return problems.filter(p => {
    if (topic && topic !== 'all' && p.categoryId !== topic) return false
    if (algo && algo !== 'all' && p.algorithmId && p.algorithmId !== algo) return false
    return true
  })
}
