import { buildBST } from '../../../utils/buildTree.js'

/* Mirroring a tree is one swap per node. The swap happens before recursing —
   do it after and the recursion follows pointers that are about to move. */
export function generateSteps(inputArray) {
  const built = buildBST(inputArray)
  /* Deep-copied because the swap mutates, and each step keeps its own
     snapshot of the node list. */
  const nodes = built.nodes.map(n => ({ ...n }))
  const map = {}
  nodes.forEach(n => { map[n.id] = n })
  const steps = [], visited = []
  const addStep = (cur, description, codeLine) => steps.push({
    nodes: nodes.map(n => ({ ...n })), visited: [...visited], current: cur,
    highlighted: cur >= 0 ? [cur] : [], traversalOrder: [], description, codeLine,
  })

  addStep(-1, 'Mirror the tree by swapping the two children of every node.', 2)

  function doMirror(id) {
    if (id === null || id === undefined) return
    const n = map[id]
    if (!n) return
    addStep(id, `Visit ${n.value}.`, 4)
    const tmp = n.left
    n.left = n.right
    n.right = tmp
    /* Parent links must follow the swap, or the layout keeps drawing the old
       shape even though the child pointers moved. */
    if (n.left != null && map[n.left]) map[n.left].parent = n.id
    if (n.right != null && map[n.right]) map[n.right].parent = n.id
    addStep(id, `Swapped ${n.value}'s children: left is now ${n.left ?? '—'}, right is now ${n.right ?? '—'}.`, 5)
    visited.push(id)
    doMirror(n.left)
    doMirror(n.right)
  }
  doMirror(built.rootId)

  addStep(-1, 'Mirror complete — an in-order walk of this tree now runs descending.', 7)
  steps[steps.length - 1].result = 'Tree mirrored'
  return steps
}
