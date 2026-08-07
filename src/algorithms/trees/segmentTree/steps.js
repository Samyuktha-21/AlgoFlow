/* Segment tree for range sums. Each node covers a range and stores its total;
   a node's value is just the sum of its two children, so the build is one
   post-order pass. That structure is what makes an arbitrary range query cost
   log n instead of n — any range decomposes into O(log n) of these nodes.

   The tree lives in a flat array (children of i at 2i+1 and 2i+2), which is
   the standard representation. It is ALSO drawn as a tree here: the metadata
   says type "tree", and this generator used to emit only the flat `dp` array
   with no `nodes` at all, so TreeVisualizer rendered an empty canvas. */
export function generateSteps(inputArray) {
  const arr = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v)).slice(0, 8)
    : [1, 3, 5, 7, 9, 11]
  const n = arr.length
  const dp = new Array(4 * n).fill(0)
  const computed = new Array(4 * n).fill(false)
  const range = {}
  const steps = []

  /* Only the nodes actually built get drawn, so the flat array's unused slots
     do not appear as phantom children. */
  const live = new Set()
  const nodesView = () => [...live].sort((a, b) => a - b).map(id => ({
    id,
    value: dp[id],
    left: live.has(2 * id + 1) ? 2 * id + 1 : null,
    right: live.has(2 * id + 2) ? 2 * id + 2 : null,
    parent: id === 0 ? -1 : Math.floor((id - 1) / 2),
  }))

  const addStep = (cur, description, codeLine) => steps.push({
    nodes: nodesView(),
    visited: [...live].filter(id => computed[id]),
    current: cur,
    highlighted: cur >= 0 ? [cur] : [],
    traversalOrder: [],
    /* Kept so the flat-array view still has its data alongside the tree. */
    dp: dp.slice(0, Math.min(15, 4 * n)),
    computed: computed.slice(0, Math.min(15, 4 * n)),
    description,
    codeLine,
    extra: { array: arr.join(', '), covers: range[cur] || '—' },
  })

  addStep(-1, `Build a segment tree over [${arr.join(', ')}]. Every node holds the sum of the range it covers.`, 2)

  function build(nd, s, e) {
    live.add(nd)
    range[nd] = s === e ? `[${s}]` : `[${s}..${e}]`
    if (s === e) {
      dp[nd] = arr[s]
      computed[nd] = true
      addStep(nd, `Leaf for [${s}] holds arr[${s}] = ${arr[s]}.`, 4)
      return
    }
    const m = Math.floor((s + e) / 2)
    build(2 * nd + 1, s, m)
    build(2 * nd + 2, m + 1, e)
    dp[nd] = dp[2 * nd + 1] + dp[2 * nd + 2]
    computed[nd] = true
    addStep(nd, `Node covering [${s}..${e}] = ${dp[2 * nd + 1]} + ${dp[2 * nd + 2]} = ${dp[nd]} — a parent is only the sum of its children.`, 6)
  }
  build(0, 0, n - 1)

  addStep(0, `Built. The root covers [0..${n - 1}] and sums to ${dp[0]}. Any range query now touches only O(log n) of these nodes.`, 7)
  steps[steps.length - 1].result = `Range sum [0..${n - 1}] = ${dp[0]}`
  return steps
}
