/* Greedy coin change: repeatedly take the largest coin that still fits.

   The denominations used to be hardcoded to [25,10,5,1]. That is a *canonical*
   system, where greedy happens to be optimal — so the one thing this algorithm
   is famous for, that greedy is NOT optimal in general, could never be shown.
   With denominations 1,3,4 and an amount of 6, greedy takes 4+1+1 = three
   coins where two (3+3) would do, and the trace now says so.

   Input: the LAST number is the amount; the numbers before it are the coin
   denominations. */

/* Optimal coin count by DP, purely so the trace can tell the user when greedy
   got it wrong. This is not part of the greedy algorithm. */
function optimalCount(coins, amount) {
  const INF = Infinity
  const dp = new Array(amount + 1).fill(INF)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1
  }
  return dp[amount]
}

export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [25, 10, 5, 1, 67]

  const amount = Math.min(Math.max(1, Math.abs(nums[nums.length - 1])), 500)
  /* Descending order is what "greedy" means here; duplicates and zeros would
     stall the loop. */
  const coins = [...new Set(nums.slice(0, -1).map(v => Math.abs(v)).filter(v => v > 0))]
    .sort((a, b) => b - a)
  if (!coins.length) coins.push(1)

  const arr = [...coins], steps = [], sorted = [], used = []
  let rem = amount
  const addStep = (i, description, codeLine) => steps.push({
    array: arr,
    current: i,
    highlight: i >= 0 ? [i] : [],
    sorted: [...sorted],
    pointers: i >= 0 ? [{ index: i, label: 'coin' }] : [],
    extra: { remaining: rem, total: used.reduce((s, u) => s + u.count, 0) },
    description,
    codeLine,
  })

  addStep(-1, `Make ${amount} using denominations [${coins.join(', ')}], always taking the largest coin that fits.`, 2)

  for (let i = 0; i < coins.length; i++) {
    const cnt = Math.floor(rem / coins[i])
    addStep(i, `Coin ${coins[i]}: ${rem} ÷ ${coins[i]} = ${cnt}.`, 5)
    if (cnt > 0) {
      used.push({ coin: coins[i], count: cnt })
      sorted.push(i)
      rem -= cnt * coins[i]
      addStep(i, `Take ${cnt}×${coins[i]} = ${cnt * coins[i]}. Remaining: ${rem}.`, 6)
    }
  }

  const total = used.reduce((s, u) => s + u.count, 0)
  const best = rem === 0 ? optimalCount(coins, amount) : Infinity
  let verdict
  if (rem > 0) {
    verdict = `Greedy could not make ${amount} exactly — ${rem} is left over and no coin divides it.`
  } else if (total > best) {
    verdict = `Greedy used ${total} coins (${used.map(u => `${u.count}×${u.coin}`).join(' + ')}), but ${best} would have been enough. Greedy is only optimal for some denomination systems — this is not one of them.`
  } else {
    verdict = `${total} coins: ${used.map(u => `${u.count}×${u.coin}`).join(' + ')}. That is optimal for these denominations.`
  }
  addStep(-1, verdict, 8)
  steps[steps.length - 1].result = rem > 0
    ? `Cannot make ${amount} exactly`
    : `${total} coins${total > best ? ` (optimal is ${best})` : ''}`
  return steps
}
