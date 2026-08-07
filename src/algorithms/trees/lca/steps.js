import { buildBST } from '../../../utils/buildTree.js'

/* Lowest common ancestor by a single post-order pass. Each node asks its two
   subtrees "did you find either target?" — if both say yes, this node is where
   the paths meet; if only one does, pass that answer straight up. No parent
   pointers and no second traversal.

   The two targets are the last two numbers of the input, so they are always
   nodes that actually exist in the tree. */
export function generateSteps(inputArray) {
  const { nodes, rootId, byId, values } = buildBST(inputArray)
  /* Falls back to the root when there is only one node to talk about. */
  const q = values.length >= 1 ? values[values.length - 1] : rootId
  const p = values.length >= 2 ? values[values.length - 2] : q

  const steps = [], visited = []
  const addStep = (cur, description, codeLine) => steps.push({
    nodes: [...nodes], visited: [...visited], current: cur,
    highlighted: cur >= 0 ? [cur, p, q] : [p, q],
    traversalOrder: [...visited], description, codeLine, extra: { p, q },
  })

  addStep(-1, `Find the lowest common ancestor of ${p} and ${q} — the last two numbers in the input.`, 2)

  function lcaFn(id) {
    if (id === null || id === undefined) {
      addStep(-1, 'Empty subtree — found neither target.', 3)
      return null
    }
    const n = byId.get(id)
    if (!n) return null
    if (n.id === p || n.id === q) {
      visited.push(id)
      addStep(id, `${n.value} is one of the targets — report it upward.`, 3)
      return id
    }
    addStep(id, `Search below ${n.value}.`, 4)
    const l = lcaFn(n.left)
    const r = lcaFn(n.right)
    if (l !== null && r !== null) {
      visited.push(id)
      addStep(id, `One target came back from each side of ${n.value} — this is where their paths meet, so ${n.value} is the LCA.`, 6)
      return id
    }
    const res = l !== null ? l : r
    if (res !== null) {
      visited.push(id)
      addStep(id, `Only one side found a target — pass ${byId.get(res).value} up through ${n.value} unchanged.`, 7)
    }
    return res
  }

  const result = lcaFn(rootId)
  const label = result === null ? 'none' : byId.get(result).value
  addStep(result === null ? -1 : result, `LCA of ${p} and ${q} is ${label}.`, 8)
  steps[steps.length - 1].result = `LCA(${p}, ${q}) = ${label}`
  return steps
}
