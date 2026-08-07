/* Builds the node array LinkedListVisualizer wants from a list of numbers.

   Every linked-list algorithm used to carry its own hardcoded 1→2→3→4→5 and
   ignore the input box. Ids are positional (not the values) because a linked
   list is allowed to repeat a value, unlike the tree builder where ids double
   as BST keys. */

/* Long lists run off the canvas and the pointer-chasing traces get tedious. */
const MAX_NODES = 12

export function buildList(values, { fallback = [1, 2, 3, 4, 5], startId = 0 } = {}) {
  const source = Array.isArray(values) && values.length ? values : fallback
  const vals = source.map(v => Math.trunc(v)).slice(0, MAX_NODES)
  const nodes = vals.map((v, i) => ({
    id: startId + i,
    value: v,
    next: i < vals.length - 1 ? startId + i + 1 : null,
  }))
  const byId = new Map(nodes.map(n => [n.id, n]))
  return { nodes, byId, headId: nodes.length ? nodes[0].id : null, values: vals }
}

/* Walks `next` from a head and returns the values in order. Guards against a
   cycle so a malformed list cannot hang the page. */
export function listValues(byId, headId) {
  const out = []
  const seen = new Set()
  let cur = headId
  while (cur !== null && cur !== undefined && byId.has(cur) && !seen.has(cur)) {
    seen.add(cur)
    out.push(byId.get(cur).value)
    cur = byId.get(cur).next
  }
  return out
}
