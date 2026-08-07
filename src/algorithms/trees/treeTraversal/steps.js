import { buildBST } from '../../../utils/buildTree.js'

/* In-order traversal: left subtree, then the node, then the right subtree.
   On a BST that yields the values in sorted order, which is the reason
   in-order is the traversal people mean when they don't say which one. */
export function generateSteps(inputArray) {
  const { nodes, rootId, byId } = buildBST(inputArray)
  const steps = [], visited = [], order = []
  const addStep = (cur, vis, description, codeLine) => steps.push({
    nodes: [...nodes], visited: [...vis], current: cur,
    highlighted: cur >= 0 ? [cur] : [], traversalOrder: [...order],
    description, codeLine,
  })

  addStep(-1, [], 'In-order traversal: left → root → right, which visits a BST in sorted order.', 2)

  function inorder(id) {
    if (id === null || id === undefined) return
    const n = byId.get(id)
    if (!n) return
    inorder(n.left)
    visited.push(id)
    order.push(n.value)
    addStep(id, visited, `Visit ${n.value}. Order so far: [${order.join(', ')}]`, 4)
    inorder(n.right)
  }
  inorder(rootId)

  addStep(-1, visited, `In-order complete: [${order.join(', ')}] — ascending, as it must be for a BST.`, 6)
  steps[steps.length - 1].result = order.join(' → ')
  return steps
}
