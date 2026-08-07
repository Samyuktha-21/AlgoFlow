/* Flatten a multilevel list. Each node may have a `child` list, whose nodes
   may have children of their own, and the result has to read in depth-first
   order: when a node has a child, the whole child list comes before that
   node's own successor.

   The stack is what makes it work iteratively — on stepping into a child, the
   node that was next gets pushed, and it is popped back once the child branch
   runs out. That is the same bookkeeping recursion would do.

   The previous version here emitted four hardcoded sentences and never ran an
   algorithm at all.

   Levels are carved out of the input: roughly the first half is the main list,
   the next chunk is a child hanging off its second node, and anything left is
   a grandchild below that. */

export function generateSteps(inputArray) {
  const vals = (Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [1, 2, 3, 5, 6]).slice(0, 12)

  let nextId = 0
  const mk = (value, level) => ({ id: nextId++, value, next: null, child: null, level })

  const mainCount = Math.max(2, Math.ceil(vals.length / 2))
  const mainVals = vals.slice(0, mainCount)
  const restVals = vals.slice(mainCount)
  const childCount = restVals.length >= 4 ? Math.ceil(restVals.length / 2) : restVals.length
  const childVals = restVals.slice(0, childCount)
  const grandVals = restVals.slice(childCount)

  const link = (values, level) => {
    const ns = values.map(v => mk(v, level))
    ns.forEach((n, i) => { n.next = i < ns.length - 1 ? ns[i + 1].id : null })
    return ns
  }

  const main = link(mainVals, 0)
  const child = link(childVals, 1)
  const grand = link(grandVals, 2)
  const all = new Map([...main, ...child, ...grand].map(n => [n.id, n]))

  /* Hang the child off the main list's second node, and the grandchild off
     the child's second node, so there is real nesting to unwind. */
  if (child.length) main[Math.min(1, main.length - 1)].child = child[0].id
  if (grand.length) child[Math.min(1, child.length - 1)].child = grand[0].id

  const steps = []
  const out = []
  const addStep = (description, codeLine, marked = []) => steps.push({
    /* Arrows are drawn between consecutive entries, so this array IS the
       flattened order as far as it has been worked out. */
    nodes: out.map(id => ({ ...all.get(id), next: null })),
    pointers: [],
    reversed: [],
    highlighted: marked,
    description,
    codeLine,
    extra: { placed: out.length, stack: 0 },
  })

  addStep(`Flatten a ${all.size}-node multilevel list: level 0 is [${mainVals.join(', ')}]${childVals.length ? `, with [${childVals.join(', ')}] hanging under ${main[Math.min(1, main.length - 1)].value}` : ''}${grandVals.length ? `, and [${grandVals.join(', ')}] under ${child[Math.min(1, child.length - 1)].value}` : ''}.`, 2)

  const stack = []
  let cur = main[0].id
  while (cur !== null || stack.length) {
    if (cur === null) {
      cur = stack.pop()
      addStep(`This branch ended — pop ${all.get(cur).value} off the stack and carry on from there.`, 6, [cur])
      continue
    }
    const node = all.get(cur)
    out.push(cur)
    addStep(`Place ${node.value} (level ${node.level}).`, 4, [cur])

    if (node.child !== null) {
      if (node.next !== null) {
        stack.push(node.next)
        addStep(`${node.value} has a child list, so its own successor ${all.get(node.next).value} has to wait — push it on the stack.`, 5, [cur])
      }
      cur = node.child
      addStep(`Descend into ${node.value}'s child list, starting at ${all.get(cur).value}.`, 5, [cur])
    } else {
      cur = node.next
    }
  }

  const flat = out.map(id => all.get(id).value)
  addStep(`Flattened to [${flat.join(', ')}] — depth-first, every child list spliced in ahead of its parent's successor.`, 6, [...out])
  steps[steps.length - 1].result = flat.join(' → ')
  return steps
}
