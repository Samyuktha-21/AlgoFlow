import { buildBST } from '../../../utils/buildTree.js'

/* Level-order (breadth-first) traversal. The queue is what makes it work: a
   node's children go in behind everything already waiting, so the whole of
   depth d comes out before any of depth d+1. */
export function generateSteps(inputArray) {
  const { nodes, rootId, byId } = buildBST(inputArray)
  const steps = [], visited = [], order = []
  const addStep = (cur, q, description, codeLine) => steps.push({
    nodes: [...nodes], visited: [...visited], current: cur,
    highlighted: cur >= 0 ? [cur] : [], traversalOrder: [...order],
    description, codeLine, extra: { queue: q.slice() },
  })

  addStep(-1, [], 'Level order: visit the tree one depth at a time, using a queue.', 2)

  const queue = [rootId]
  addStep(-1, queue, `Enqueue the root, ${byId.get(rootId).value}.`, 3)

  while (queue.length > 0) {
    const id = queue.shift()
    const n = byId.get(id)
    visited.push(id)
    order.push(n.value)
    addStep(id, queue, `Visit ${n.value}. Level order so far: [${order.join(', ')}]`, 6)
    if (n.left != null) {
      queue.push(n.left)
      addStep(id, queue, `Enqueue left child ${byId.get(n.left).value} — it waits behind everything already queued.`, 8)
    }
    if (n.right != null) {
      queue.push(n.right)
      addStep(id, queue, `Enqueue right child ${byId.get(n.right).value}.`, 9)
    }
  }

  addStep(-1, [], `Level order complete: [${order.join(' → ')}]`, 11)
  steps[steps.length - 1].result = order.join(' → ')
  return steps
}
