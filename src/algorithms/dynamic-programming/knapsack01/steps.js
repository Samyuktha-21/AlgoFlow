/* 0/1 knapsack: each item is taken whole or not at all. Greedy by value per
   weight — which is optimal when items can be cut — gives wrong answers here,
   so every (item, capacity) pair gets its own subproblem. Each cell asks one
   question: is it worth more to take this item and solve the smaller capacity,
   or to skip it entirely?

   Input: the FIRST number is the capacity, then pairs of (weight, value). */

/* The table is (items+1) x (capacity+1) and every step snapshots all of it, so
   the capacity has to stay bounded or the tab dies. */
const MAX_W = 50
const MAX_ITEMS = 6

export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 3
    ? inputArray.map(v => Math.trunc(v))
    : [50, 10, 60, 20, 100, 30, 120]

  const W = Math.min(Math.max(1, Math.abs(nums[0])), MAX_W)
  const weights = [], values = []
  for (let i = 1; i + 1 < nums.length && weights.length < MAX_ITEMS; i += 2) {
    weights.push(Math.max(1, Math.abs(nums[i])))
    values.push(Math.abs(nums[i + 1]))
  }
  if (!weights.length) { weights.push(10); values.push(60) }
  const n = weights.length

  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  const computed2d = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(false))
  const rows = ['(none)', ...weights.map((w, i) => `Item${i + 1}(w=${w},v=${values[i]})`)]
  const cols = Array.from({ length: W + 1 }, (_, i) => i)
  const steps = []

  const addStep = (r, c, description, codeLine) => steps.push({
    dp2d: dp.map(row => [...row]),
    rows,
    cols,
    cell: { row: r, col: c },
    computed2d: computed2d.map(row => [...row]),
    description,
    codeLine,
    extra: { MaxValue: dp[n][W] },
  })

  addStep(0, 0, `Capacity ${W}, ${n} item${n === 1 ? '' : 's'}. With no items available the best value is 0 at every capacity.`, 3)
  for (let w = 0; w <= W; w++) { dp[0][w] = 0; computed2d[0][w] = true }

  for (let i = 1; i <= n; i++) {
    const wi = weights[i - 1], vi = values[i - 1]
    for (let w = 0; w <= W; w++) {
      addStep(i, w, `Item ${i} (w=${wi}, v=${vi}) with capacity ${w}.`, 5)
      if (wi > w) {
        dp[i][w] = dp[i - 1][w]
        addStep(i, w, `It weighs ${wi}, more than the ${w} available — no choice but to skip it, so carry the row above down.`, 6)
      } else {
        const take = dp[i - 1][w - wi] + vi, skip = dp[i - 1][w]
        dp[i][w] = Math.max(take, skip)
        addStep(i, w, `Take it: ${vi} + best of capacity ${w - wi} = ${take}. Skip it: ${skip}. Keep ${dp[i][w]}.`, 8)
      }
      computed2d[i][w] = true
    }
  }

  addStep(n, W, `Best value with all ${n} item${n === 1 ? '' : 's'} and capacity ${W} is ${dp[n][W]}.`, 11)
  steps[steps.length - 1].result = `Max value = ${dp[n][W]}`
  return steps
}
