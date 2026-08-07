import { buildList, listValues } from '../../../utils/buildList.js'

/* Remove the nth node from the end in one pass. "From the end" normally means
   measuring the list first; the trick is to start one pointer n nodes ahead,
   so when it reaches the last node the other sits exactly on the node *before*
   the one to delete — which is the one you need, because a singly linked list
   can only unlink forwards.

   n is the LAST number in the input; the list is built from the ones before. */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [1, 2, 3, 4, 5, 2]
  const { nodes, byId, headId, values } = buildList(nums.slice(0, -1))
  /* n has to land inside the list or there is nothing to remove. */
  const n = Math.min(Math.max(1, Math.abs(nums[nums.length - 1])), values.length)

  const steps = []
  let fast = headId, slow = headId

  const addStep = (description, codeLine) => steps.push({
    nodes: nodes.map(nd => ({ ...nd })),
    pointers: [
      { nodeId: slow, label: 'slow', color: '#4ade80' },
      { nodeId: fast, label: 'fast', color: '#f97316' },
    ],
    reversed: [],
    highlighted: [slow, fast].filter(x => x !== null),
    description,
    codeLine,
    extra: { n },
  })

  const ord = n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`
  addStep(`Remove the ${ord} node from the end (n is the last number in the input). First push fast ${n} ahead.`, 2)

  for (let i = 0; i < n; i++) {
    fast = byId.get(fast).next
    addStep(`Fast is now at ${fast !== null ? byId.get(fast).value : 'the end'}.`, 3)
    if (fast === null) break
  }

  if (fast === null) {
    /* Fast ran off the end, so the node n-from-the-end is the head itself. */
    const head = byId.get(headId)
    addStep(`Fast ran off the end, so the ${ord} from the end is the head — remove ${head.value}.`, 8)
    const rest = listValues(byId, head.next)
    addStep(`Removed ${head.value}. List: [${rest.join(', ')}]`, 9)
    steps[steps.length - 1].result = rest.join(' → ') || '(empty)'
    return steps
  }

  addStep('Now move both together — the gap between them stays exactly n.', 5)
  while (byId.get(fast).next !== null) {
    slow = byId.get(slow).next
    fast = byId.get(fast).next
    addStep(`slow at ${byId.get(slow).value}, fast at ${byId.get(fast).value}.`, 6)
  }

  const target = byId.get(slow).next
  const removedValue = byId.get(target).value
  addStep(`Fast is on the last node, so slow sits just before the target — remove ${removedValue}.`, 8)
  byId.get(slow).next = byId.get(target).next
  const rest = listValues(byId, headId)
  addStep(`Removed ${removedValue}. List: [${rest.join(', ')}]`, 9)
  steps[steps.length - 1].result = rest.join(' → ')
  return steps
}
