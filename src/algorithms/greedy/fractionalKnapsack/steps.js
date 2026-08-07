/* Fractional knapsack: because items can be cut, the best packing is simply
   the highest value-per-weight first, taking a fraction of whatever no longer
   fits whole. That greedy choice is provably optimal here — and provably NOT
   optimal for 0/1 knapsack, where an item must be taken whole and dynamic
   programming is needed instead.

   Input: the FIRST number is the capacity, then pairs of (weight, value). */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 3
    ? inputArray.map(v => Math.trunc(v))
    : [50, 10, 60, 20, 100, 30, 120]

  let W = Math.max(1, Math.abs(nums[0]))
  const items = []
  for (let i = 1; i + 1 < nums.length; i += 2) {
    const w = Math.max(1, Math.abs(nums[i]))
    const v = Math.abs(nums[i + 1])
    items.push({ w, v, r: v / w })
  }
  if (!items.length) items.push({ w: 10, v: 60, r: 6 })
  items.sort((a, b) => b.r - a.r)

  const capacity = W
  const arr = items.map(it => it.v)
  const steps = [], sorted = [], selected = []
  const addStep = (cur, hl, description, codeLine) => steps.push({
    array: arr,
    current: cur,
    highlight: [...hl],
    sorted: [...sorted],
    pointers: cur >= 0 ? [{ index: cur, label: 'item' }] : [],
    extra: {
      capacityLeft: W,
      totalValue: selected.reduce((s, { frac, v }) => s + frac * v, 0).toFixed(1),
    },
    description,
    codeLine,
  })

  addStep(-1, [], `Capacity ${capacity}. Items sorted by value/weight: ${items.map(it => `w${it.w}/v${it.v} (${it.r.toFixed(2)})`).join(', ')}. The cells show each item's value.`, 7)

  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    addStep(i, [i], `Item w=${it.w}, v=${it.v}, ratio ${it.r.toFixed(2)}. Capacity left: ${W}.`, 9)
    if (W >= it.w) {
      selected.push({ frac: 1, v: it.v })
      sorted.push(i)
      W -= it.w
      addStep(i, [i], `It fits whole — take all of it for ${it.v}. Capacity left: ${W}.`, 10)
    } else if (W > 0) {
      const f = W / it.w
      selected.push({ frac: f, v: it.v })
      sorted.push(i)
      addStep(i, [i], `Only ${W} of capacity left, so take ${(f * 100).toFixed(0)}% of it for ${(f * it.v).toFixed(1)}. This is the step 0/1 knapsack cannot do.`, 11)
      W = 0
      break
    } else {
      addStep(i, [], 'Knapsack is full — everything after this is left behind.', 11)
      break
    }
  }

  const totalV = selected.reduce((s, { frac, v }) => s + frac * v, 0)
  addStep(-1, sorted, `Maximum value = ${totalV.toFixed(1)}.`, 13)
  steps[steps.length - 1].result = `Max value = ${totalV.toFixed(1)}`
  return steps
}
