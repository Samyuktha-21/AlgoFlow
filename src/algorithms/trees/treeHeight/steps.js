import { buildBST } from '../../../utils/buildTree.js'

/* Tree height by post-order recursion. A node cannot know its own height until
   both children have reported theirs, which is why the work happens on the way
   back up rather than on the way down. */
export function generateSteps(inputArray) {
  const { nodes, rootId, byId } = buildBST(inputArray)
  const steps = [], visited = []
  const addStep = (cur, description, codeLine, extra = {}) => steps.push({
    nodes: [...nodes], visited: [...visited], current: cur,
    highlighted: cur >= 0 ? [cur] : [], traversalOrder: [...visited],
    description, codeLine, extra,
  })

  addStep(-1, `Compute the height of this ${nodes.length}-node tree by post-order recursion.`, 2)

  function ht(id) {
    if (id === null || id === undefined) {
      addStep(-1, 'Empty subtree → height −1, so a leaf comes out at 0.', 3, { height: -1 })
      return -1
    }
    const n = byId.get(id)
    addStep(id, `Descend into ${n.value} — its height is not known until both children report.`, 4)
    const lh = ht(n.left)
    const rh = ht(n.right)
    const h = 1 + Math.max(lh, rh)
    visited.push(id)
    addStep(id, `${n.value}: left ${lh}, right ${rh} → height ${h}.`, 5, { height: h })
    return h
  }

  const totalH = ht(rootId)
  addStep(-1, `Tree height is ${totalH}.`, 6, { height: totalH })
  steps[steps.length - 1].result = `Height = ${totalH}`
  return steps
}
