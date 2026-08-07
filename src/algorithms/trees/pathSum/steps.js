import { buildBST } from '../../../utils/buildTree.js'

/* Does some root-to-leaf path add up to the target? Rather than summing each
   path and comparing, this subtracts as it descends and asks a leaf whether
   what is left equals its own value — same answer, but nothing has to be
   carried back up the recursion.

   The target is the LAST number in the input; the tree is built from the ones
   before it. */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [4, 2, 6, 1, 3, 5, 7]
  const target = nums[nums.length - 1]
  const { nodes, rootId, byId } = buildBST(nums.slice(0, -1))

  const steps = [], visited = []
  const addStep = (cur, sum, description, codeLine) => steps.push({
    nodes: [...nodes], visited: [...visited], current: cur,
    highlighted: cur >= 0 ? [cur] : [], traversalOrder: [],
    description, codeLine, extra: { target, remainingSum: sum },
  })

  addStep(-1, target, `Is there a root-to-leaf path summing to ${target}? (The target is the last number in the input; the tree is built from the rest.)`, 2)

  function dfs(id, rem) {
    if (id === null || id === undefined) return false
    const n = byId.get(id)
    if (!n) return false
    visited.push(id)
    addStep(id, rem - n.value, `At ${n.value}: ${rem} − ${n.value} = ${rem - n.value} still to find.`, 2)

    if (n.left === null && n.right === null) {
      if (rem === n.value) {
        addStep(id, 0, `Leaf ${n.value} and exactly ${n.value} left to find — the path adds up.`, 4)
        return true
      }
      addStep(id, rem - n.value, `Leaf ${n.value}, but ${rem - n.value} is left over — back up and try elsewhere.`, 4)
      return false
    }

    const found = dfs(n.left, rem - n.value) || dfs(n.right, rem - n.value)
    if (!found) addStep(id, rem, `No path below ${n.value} works — backtrack.`, 5)
    return found
  }

  const result = dfs(rootId, target)
  addStep(-1, 0, `A path summing to ${target} ${result ? 'exists' : 'does not exist'}.`, 2)
  steps[steps.length - 1].result = result ? `Path summing to ${target} exists` : `No path sums to ${target}`
  return steps
}
