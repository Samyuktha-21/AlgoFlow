/* Left-leaning red-black tree (Sedgewick). A red link means "this node is
   glued to its parent" — collapse every red link and you get a perfectly
   balanced 2-3 tree, which is why the height stays within 2*log(n).

   Insertion is an ordinary BST insert followed by three fixups applied on the
   way back up, and only three:
     right link red, left link black  -> rotate left   (keep the lean leftward)
     left red and its left also red   -> rotate right  (a 4-node, split it)
     both children red                -> flip colours  (push the red upward)
   The recursion is what makes this work: each fixup is applied to a subtree
   whose descendants are already legal.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

export function generateSteps(inputArray) {
  const keys = Array.isArray(inputArray) && inputArray.length >= 2
    /* Duplicates are no-ops in this insert (neither < nor >), and a long list
       makes the tree wider than the canvas long before it gets instructive. */
    ? [...new Set(inputArray.map(v => Math.trunc(v)))].slice(0, 10)
    : [10, 20, 30, 15, 25]

  const steps = []
  let nextId = 0
  let root = null
  let inserting = null

  const isRed = n => n !== null && n.red
  const makeNode = key => ({ id: nextId++, key, red: true, left: null, right: null })

  /* TreeVisualizer wants a flat list with parent ids; `rb` is what paints the
     node red or black. */
  const flatten = () => {
    const out = []
    const walk = (n, parent) => {
      if (!n) return
      out.push({ id: n.id, value: n.key, left: n.left?.id ?? null, right: n.right?.id ?? null, parent, rb: n.red ? 'R' : 'B' })
      walk(n.left, n.id)
      walk(n.right, n.id)
    }
    walk(root, -1)
    return out
  }

  const push = (description, codeLine, focus = null) => steps.push({
    nodes: flatten(),
    visited: [],
    current: focus,
    highlighted: inserting !== null ? [inserting] : [],
    traversalOrder: [],
    description,
    codeLine,
    extra: { inserted: keys.slice(0, keys.indexOf(inserting?.key ?? -1) + 1).length || 0, height: heightOf(root) },
  })

  function heightOf(n) { return n ? 1 + Math.max(heightOf(n.left), heightOf(n.right)) : 0 }

  const rotateLeft = h => {
    const x = h.right
    h.right = x.left
    x.left = h
    x.red = h.red
    h.red = true
    return x
  }
  const rotateRight = h => {
    const x = h.left
    h.left = x.right
    x.right = h
    x.red = h.red
    h.red = true
    return x
  }
  const flipColors = h => {
    h.red = !h.red
    h.left.red = !h.left.red
    h.right.red = !h.right.red
  }

  /* Mirrors the Java `insert(Node h, int key)` exactly, including where each
     fixup sits relative to the recursive call. */
  function insert(h, key) {
    if (h === null) {
      const fresh = makeNode(key)
      root = root ?? fresh
      push(`Reached an empty spot — attach ${key} as a red node. New nodes are always red, so the tree's black height does not change.`, 10, fresh.id)
      return fresh
    }
    if (key < h.key) {
      push(`${key} < ${h.key} — go left.`, 11, h.id)
      h.left = insert(h.left, key)
    } else if (key > h.key) {
      push(`${key} > ${h.key} — go right.`, 12, h.id)
      h.right = insert(h.right, key)
    }

    if (isRed(h.right) && !isRed(h.left)) {
      push(`Node ${h.key} has a red link on the right and a black one on the left. This tree leans left by convention, so rotate left.`, 13, h.id)
      h = rotateLeft(h)
      push(`Rotated left — ${h.key} takes over the subtree.`, 6, h.id)
    }
    if (isRed(h.left) && isRed(h.left.left)) {
      push(`Two red links in a row on the left of ${h.key} — that is a 4-node. Rotate right to balance it.`, 14, h.id)
      h = rotateRight(h)
      push(`Rotated right — ${h.key} takes over, and both its children are now red.`, 7, h.id)
    }
    if (isRed(h.left) && isRed(h.right)) {
      push(`Both children of ${h.key} are red — split the 4-node by flipping colours.`, 15, h.id)
      flipColors(h)
      push(`Flipped: the children go black and ${h.key} goes red, passing the problem up to its parent.`, 8, h.id)
    }
    push(`Subtree at ${h.key} is legal again.`, 16, h.id)
    return h
  }

  push(`Insert ${keys.join(', ')} into an empty left-leaning red-black tree.`, 18)

  for (const key of keys) {
    inserting = null
    root = insert(root, key)
    inserting = root.id
    if (root.red) {
      root.red = false
      push(`Insertion of ${key} done. The root is always black — recolour it, which is the one place the tree's black height grows.`, 18, root.id)
    } else {
      push(`Insertion of ${key} done. The root is already black.`, 18, root.id)
    }
  }

  inserting = null
  push(`All ${keys.length} keys inserted. Height is ${heightOf(root)} for ${keys.length} nodes — a red-black tree is never more than twice the height of a perfect one.`, 18)
  steps[steps.length - 1].result = `Height ${heightOf(root)} for ${keys.length} keys`
  return steps
}
