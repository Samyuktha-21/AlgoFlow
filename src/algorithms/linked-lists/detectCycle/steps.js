/* Floyd's cycle detection. Two pointers move at different speeds; if there is
   a loop the fast one laps the slow one and they land on the same node, and if
   there is not, the fast one simply runs off the end. It needs no extra memory
   at all, which is the whole reason to prefer it over a visited set.

   Input: the LAST number is the 0-based index the tail links back to. Give an
   index outside the list (say 99) and there is no cycle, so both outcomes can
   actually be seen — the link target used to be hardcoded to node 2, which
   made "no cycle" unreachable AND pointed a 2-node list at a node that does
   not exist. */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [1, 2, 3, 4, 5, 6, 2]

  const vals = nums.slice(0, -1)
  const linkTo = nums[nums.length - 1]
  const n = vals.length
  /* Out of range means the tail stays null: a list with no cycle. */
  const cycleAt = Number.isInteger(linkTo) && linkTo >= 0 && linkTo < n ? linkTo : null

  const nodes = vals.map((v, i) => ({ id: i, value: v, next: i < n - 1 ? i + 1 : null }))
  if (cycleAt !== null) nodes[n - 1].next = cycleAt

  const steps = []
  let slow = 0, fast = 0
  const addStep = (description, codeLine) => steps.push({
    nodes: nodes.map(nd => ({ ...nd })),
    pointers: [
      { nodeId: slow, label: 'slow', color: '#4ade80' },
      { nodeId: fast, label: 'fast', color: '#f97316' },
    ],
    reversed: [],
    highlighted: [slow, fast],
    description,
    codeLine,
  })

  addStep(cycleAt !== null
    ? `slow and fast both start at the head. The tail links back to node ${cycleAt}, so there is a loop to find.`
    : 'slow and fast both start at the head. The tail is null, so there is no loop.', 2)

  let found = false
  /* Two pointers one step apart close the gap by one per move, so they must
     meet within one lap. */
  for (let step = 0; step < n * 2 + 2; step++) {
    const one = nodes[fast].next
    const two = one !== null && one !== undefined ? nodes[one].next : null
    if (one === null || one === undefined || two === null || two === undefined) {
      addStep('fast ran off the end — a list with an end cannot contain a loop.', 4)
      steps[steps.length - 1].result = 'No cycle'
      return steps
    }
    slow = nodes[slow].next
    fast = two
    addStep(`slow → node ${slow}, fast → node ${fast}.`, 4)
    if (slow === fast) {
      found = true
      addStep(`slow and fast are both on node ${slow}. The fast pointer lapped the slow one, which can only happen inside a loop.`, 6)
      break
    }
  }

  if (!found) addStep('No meeting point within the bound — no cycle.', 7)
  /* This used to say "Cycle detected" unconditionally, contradicting the very
     step it was attached to. */
  steps[steps.length - 1].result = found ? 'Cycle detected' : 'No cycle'
  return steps
}
