/* Rod cutting: given a price for every length, cut a rod of length n to
   maximise revenue. dp[i] is the best revenue for a rod of length i, and each
   one is found by trying every possible FIRST cut and reusing the already
   solved remainder — which is why one pass over j is enough per length.

   The price table used to be hardcoded, with the input controlling only the
   rod length; the prices are the whole problem, so they are the input now:
   each value is the price for that length, and the rod length is how many
   prices were given. */
export function generateSteps(inputArray) {
  /* Every step snapshots the dp row, and the inner loop is quadratic. */
  const price = (Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.max(0, Math.trunc(v)))
    : [1, 5, 8, 9, 10, 17, 17, 20]).slice(0, 12)
  const n = price.length

  const dp = new Array(n + 1).fill(0), computed = new Array(n + 1).fill(false)
  computed[0] = true
  const steps = []
  const addStep = (cur, description, codeLine) => steps.push({
    dp: [...dp], current: cur, computed: [...computed],
    description, codeLine, extra: { maxRevenue: dp[n] || 0, n },
  })

  addStep(0, `Rod of length ${n}. Price by length: [${price.join(', ')}]. dp[i] is the best revenue for a rod of length i, and dp[0] = 0.`, 2)

  for (let i = 1; i <= n; i++) {
    addStep(i, `Best revenue for length ${i}: try every first cut from 1 to ${i}.`, 4)
    for (let j = 1; j <= i; j++) {
      const cand = price[j - 1] + dp[i - j]
      addStep(i, `Cut off ${j}: price ${price[j - 1]} + best of the remaining ${i - j} (${dp[i - j]}) = ${cand}, against the current best ${dp[i]}.`, 6)
      if (cand > dp[i]) dp[i] = cand
    }
    computed[i] = true
    addStep(i, `dp[${i}] = ${dp[i]}.`, 6)
  }

  addStep(n, `Best revenue for a rod of length ${n} is ${dp[n]}${dp[n] > price[n - 1] ? `, beating the ${price[n - 1]} it fetches uncut.` : ', which is what it fetches uncut.'}`, 7)
  steps[steps.length - 1].result = `Max revenue = ${dp[n]}`
  return steps
}
