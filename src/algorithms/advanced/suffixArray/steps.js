/* Suffix array by prefix doubling. Sorting the n suffixes directly costs
   O(n^2 log n) because each comparison can read a whole suffix. The doubling
   trick sorts by the first 2^k characters instead, using the previous round's
   ranks as a pair — so every comparison is O(1) and the whole build is
   O(n log n) comparisons.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

function toText(input) {
  const raw = Array.isArray(input) ? input.join('') : input
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  /* Long strings turn the round-by-round rank trace into hundreds of steps
     that say the same thing; the structure is visible at this size. */
  return (s || 'BANANA').slice(0, 12)
}

export function generateSteps(input) {
  const s = toText(input)
  const n = s.length
  const chars = s.split('')
  const steps = []

  let sa = Array.from({ length: n }, (_, i) => i)
  let rank = chars.map(c => c.charCodeAt(0))
  let gap = 1

  /* The suffix each index stands for, which is what the sort is really
     ordering — the numbers alone are hard to read. */
  const suffixList = () => sa.map(i => s.slice(i)).join(' | ')
  const push = (description, codeLine, marked = []) => steps.push({
    array: chars,
    array2: [...sa],
    array2Label: `Suffix array — start indices in sorted order: ${suffixList()}`,
    highlight: marked,
    current: -1,
    pointers: [],
    description,
    codeLine,
    extra: { gap, ranks: rank.join(',') },
  })

  push(`Build the suffix array of "${s}" — the ${n} suffixes listed in sorted order.`, 3)
  push('Start with the suffixes in their natural order 0..n-1; nothing is sorted yet.', 5)
  push(`Rank each suffix by its first character alone: [${rank.join(', ')}] (character codes).`, 7)

  for (gap = 1; gap < n; gap *= 2) {
    push(`Round with gap = ${gap}: sort by the first ${gap * 2} characters, using each suffix's rank plus the rank ${gap} positions later.`, 8)

    const keyOf = i => [rank[i], i + gap < n ? rank[i + gap] : -1]
    sa = [...sa].sort((a, b) => {
      const ka = keyOf(a), kb = keyOf(b)
      return ka[0] - kb[0] || ka[1] - kb[1]
    })
    push(`Sorted on the pairs — order is now ${sa.join(', ')}. Each comparison read two numbers, not two whole suffixes.`, 10)

    const tmp = new Array(n).fill(0)
    tmp[sa[0]] = 0
    push(`The first suffix in the order gets rank 0.`, 15, [sa[0]])

    for (let i = 1; i < n; i++) {
      tmp[sa[i]] = tmp[sa[i - 1]]
      const pa = sa[i - 1], pb = sa[i]
      const ka = keyOf(pa), kb = keyOf(pb)
      push(`Compare suffix ${pb} ("${s.slice(pb)}") with the one before it, ${pa} ("${s.slice(pa)}").`, 16, [pb])
      if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
        tmp[sa[i]]++
        push(`Their pairs differ — suffix ${pb} gets a new, higher rank ${tmp[pb]}.`, 19, [pb])
      }
    }

    rank = tmp
    push(`Ranks for this round: [${rank.join(', ')}]. Ties here are suffixes that agree on their first ${gap * 2} characters.`, 21)

    /* Every suffix already has a distinct rank, so no later round can reorder
       anything — the Java loop would keep doubling, but pointlessly. */
    if (Math.max(...rank) === n - 1) break
  }

  push(`Done. Suffix array = [${sa.join(', ')}] — that is "${sa.map(i => s.slice(i)).join('", "')}" in sorted order.`, 23)
  steps[steps.length - 1].result = `Suffix array = [${sa.join(', ')}]`
  return steps
}
