import { buildList } from '../../../utils/buildList.js'

/* Find the middle of a list in one pass. A linked list has no length until you
   walk it, so the obvious approach costs two passes. Two pointers at different
   speeds do it in one: when the fast pointer has covered the whole list, the
   slow one — moving at half the rate — is exactly halfway. */
export function generateSteps(inputArray) {
  const { nodes, byId, headId } = buildList(inputArray)
  const steps = []
  let slow = headId, fast = headId

  const addStep = (description, codeLine) => steps.push({
    nodes: [...nodes],
    pointers: [
      { nodeId: slow, label: 'slow', color: '#4ade80' },
      { nodeId: fast, label: 'fast', color: '#f97316' },
    ],
    reversed: [],
    highlighted: [slow, fast].filter(x => x !== null),
    description,
    codeLine,
  })

  addStep(`Find the middle of this ${nodes.length}-node list: slow moves one step, fast moves two.`, 2)

  while (fast !== null && byId.get(fast).next !== null) {
    addStep(`slow is at ${byId.get(slow).value}, fast is at ${byId.get(fast).value}.`, 4)
    slow = byId.get(slow).next
    const fn = byId.get(fast).next
    fast = fn !== null ? byId.get(fn).next : null
    addStep(`Advance: slow → ${slow !== null ? byId.get(slow).value : 'null'}, fast → ${fast !== null ? byId.get(fast).value : 'null'}.`, 5)
  }

  addStep(`Fast has run out, so slow is standing on the middle node: ${byId.get(slow).value}.`, 7)
  steps[steps.length - 1].result = `Middle = ${byId.get(slow).value}`
  return steps
}
