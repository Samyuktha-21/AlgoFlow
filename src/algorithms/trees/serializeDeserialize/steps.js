import { buildBST } from '../../../utils/buildTree.js'

/* Serialising a tree to a string and back. A pre-order walk alone is not
   enough to rebuild the shape — "1,2,3" describes several different trees.
   The null markers are what make it unambiguous: writing "N" for every missing
   child records exactly where each subtree ended. */
export function generateSteps(inputArray) {
  const { nodes, rootId, byId } = buildBST(inputArray)
  const steps = [], visited = [], order = []
  const parts = []
  const addStep = (cur, description, codeLine) => steps.push({
    nodes: [...nodes], visited: [...visited], current: cur,
    highlighted: cur >= 0 ? [cur] : [], traversalOrder: [...order],
    description, codeLine, extra: { encoded: parts.join(',') },
  })

  addStep(-1, 'Serialize with a pre-order walk, writing "N" for every empty child.', 2)

  function ser(id) {
    if (id === null || id === undefined) {
      parts.push('N')
      addStep(-1, 'Empty child → write "N". These markers are what make the string decodable.', 3)
      return
    }
    const n = byId.get(id)
    if (!n) return
    visited.push(id)
    order.push(n.value)
    parts.push(String(n.value))
    addStep(id, `Write ${n.value}.`, 4)
    ser(n.left)
    ser(n.right)
  }
  ser(rootId)

  const encoded = parts.join(',')
  addStep(-1, `Serialized to "${encoded}". Reading it back in the same pre-order, taking "N" as an empty child, rebuilds this exact tree.`, 6)
  steps[steps.length - 1].result = encoded
  return steps
}
