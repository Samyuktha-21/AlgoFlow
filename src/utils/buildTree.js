/* Builds the node array TreeVisualizer wants from a plain list of numbers.

   Every tree algorithm used to carry its own hardcoded seven-node tree and
   ignore the input box entirely. Inserting the shared default "4, 2, 6, 1, 3,
   5, 7" as a BST reproduces exactly that tree, so routing them through here
   costs nothing at the default and makes the input box work everywhere else.

   Node ids are the values themselves, matching what the old hardcoded arrays
   did — which is also why duplicates have to go: two nodes with the same id
   would collide in every `visited`/`highlighted` lookup. */

const FALLBACK = [4, 2, 6, 1, 3, 5, 7]
/* A BST of the 50 values the validator allows is far wider than the canvas,
   and the recursion traces get long enough to be useless. */
const MAX_NODES = 15

export function buildBST(values, fallback = FALLBACK) {
  const source = Array.isArray(values) && values.length ? values : fallback
  const vals = [...new Set(source.map(v => Math.trunc(v)))].slice(0, MAX_NODES)

  const nodes = []
  const byId = new Map()
  let rootId = null

  for (const v of vals) {
    const node = { id: v, value: v, left: null, right: null, parent: -1 }
    if (rootId === null) {
      rootId = v
      nodes.push(node)
      byId.set(v, node)
      continue
    }
    let cur = byId.get(rootId)
    for (;;) {
      if (v < cur.value) {
        if (cur.left === null) { cur.left = v; node.parent = cur.id; break }
        cur = byId.get(cur.left)
      } else {
        if (cur.right === null) { cur.right = v; node.parent = cur.id; break }
        cur = byId.get(cur.right)
      }
    }
    nodes.push(node)
    byId.set(v, node)
  }

  return { nodes, rootId, byId, values: vals }
}

/* Depth of the tree in edges, matching the "height of a leaf is 0" convention
   the tree algorithms use. Returns -1 for an empty tree. */
export function treeHeightOf(byId, id) {
  if (id === null || id === undefined) return -1
  const n = byId.get(id)
  if (!n) return -1
  return 1 + Math.max(treeHeightOf(byId, n.left), treeHeightOf(byId, n.right))
}

export function inorderValues(byId, id, out = []) {
  if (id === null || id === undefined) return out
  const n = byId.get(id)
  if (!n) return out
  inorderValues(byId, n.left, out)
  out.push(n.value)
  inorderValues(byId, n.right, out)
  return out
}
