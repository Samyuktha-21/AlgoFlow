import { buildList } from '../../../utils/buildList.js'

/* Where do two lists join? The two run-ups can be different lengths, so
   walking in step never lines the pointers up. The fix is elegant: when a
   pointer hits the end, send it to the *other* list's head. Each pointer then
   covers lenA + lenB in total, so after that many steps they are equidistant
   from the end — and therefore meet exactly at the first shared node, or both
   hit null together if the lists never join.

   The input is split into the two run-ups and a shared tail. */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 3
    ? inputArray.map(v => Math.trunc(v))
    : [1, 2, 3, 4, 5, 6, 7]

  /* Roughly: first third is A's run-up, second third is B's, the rest is
     shared. Clamped so every part has at least one node. */
  const tailLen = Math.max(1, Math.floor(nums.length / 3))
  const rest = nums.length - tailLen
  const aLen = Math.max(1, Math.ceil(rest / 2))
  const aVals = nums.slice(0, aLen)
  const bVals = nums.slice(aLen, rest)
  const tailVals = nums.slice(rest)

  const tail = buildList(tailVals, { startId: 200 })
  const listA = buildList(aVals, { startId: 0 })
  const listB = buildList(bVals.length ? bVals : [nums[0]], { startId: 100 })
  /* Both run-ups link into the same tail nodes — that shared suffix is the
     intersection. */
  listA.nodes[listA.nodes.length - 1].next = tail.headId
  listB.nodes[listB.nodes.length - 1].next = tail.headId

  const nodes = [...listA.nodes, ...listB.nodes, ...tail.nodes]
  const byId = new Map(nodes.map(n => [n.id, n]))

  const headA = listA.headId, headB = listB.headId
  let p1 = headA, p2 = headB
  const steps = []
  const addStep = (description, codeLine) => steps.push({
    nodes: [...nodes],
    pointers: [
      { nodeId: p1, label: 'p1', color: '#60a5fa' },
      { nodeId: p2, label: 'p2', color: '#f87171' },
    ],
    reversed: [],
    highlighted: [p1, p2].filter(x => x !== null),
    description,
    codeLine,
  })

  const val = id => (id === null ? 'null' : byId.get(id).value)
  addStep(`List A is ${aVals.length} node(s) then the shared tail; list B is ${bVals.length || 1}. Each pointer walks its own list, then the other — so both cover the same total distance.`, 2)

  /* Each pointer switches lists at most once, so 2*(lenA+lenB) bounds it. */
  const limit = 2 * nodes.length + 4
  let found = null
  for (let i = 0; i < limit; i++) {
    if (p1 === p2) {
      found = p1
      addStep(p1 === null
        ? 'Both pointers reached null at the same time — the lists never join.'
        : `p1 and p2 are both on ${val(p1)} — that is the first shared node.`, 5)
      break
    }
    addStep(`p1 at ${val(p1)}, p2 at ${val(p2)} — not the same node yet, so advance both.`, 3)
    p1 = p1 === null ? headB : byId.get(p1).next
    p2 = p2 === null ? headA : byId.get(p2).next
  }

  if (found === undefined) addStep('No meeting point within the bound — the lists do not intersect.', 6)
  steps[steps.length - 1].result = found === null || found === undefined
    ? 'No intersection'
    : `Intersects at ${val(found)}`
  return steps
}
