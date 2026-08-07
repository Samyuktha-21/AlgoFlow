import { buildBST } from '../../../utils/buildTree.js'

/* Height-balanced means every node's two subtrees differ in height by at most
   one. Checking it top-down would recompute heights over and over; the trick
   here is to compute the height and the verdict in one post-order pass, using
   -1 as a sentinel meaning "something below me was unbalanced", so the failure
   travels straight up without any extra traversal. */
export function generateSteps(inputArray) {
  const { nodes, rootId, byId } = buildBST(inputArray)
  const steps = [], visited = []
  const addStep = (cur, balanced, h, description, codeLine) => steps.push({
    nodes: [...nodes], visited: [...visited], current: cur,
    highlighted: cur >= 0 ? [cur] : [], traversalOrder: [],
    description, codeLine, extra: { balanced, height: h },
  })

  addStep(-1, true, -1, 'Balanced means |height(left) − height(right)| ≤ 1 at every node.', 2)

  let failed = false
  function chk(id) {
    if (id === null || id === undefined) return 0
    const n = byId.get(id)
    if (!n) return 0
    addStep(id, true, -1, `Check ${n.value}.`, 4)
    const l = chk(n.left)
    if (l === -1) return -1
    const r = chk(n.right)
    if (r === -1) return -1
    const diff = Math.abs(l - r)
    const h = 1 + Math.max(l, r)
    visited.push(id)
    if (diff > 1) {
      failed = true
      addStep(id, false, -1, `${n.value}: |${l} − ${r}| = ${diff} > 1 → unbalanced. The −1 sentinel now travels up without re-walking anything.`, 8)
      return -1
    }
    addStep(id, true, h, `${n.value}: left ${l}, right ${r} → balanced, height ${h}.`, 9)
    return h
  }

  const result = chk(rootId)
  addStep(-1, !failed, result, `This tree is ${failed ? 'NOT balanced' : 'balanced'}.`, 10)
  steps[steps.length - 1].result = failed ? 'Not balanced' : 'Balanced'
  return steps
}
