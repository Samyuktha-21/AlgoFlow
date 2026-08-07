/* A trie stores words by their characters, one character per edge, so words
   with a common prefix share the nodes for that prefix. That sharing is the
   whole point: lookup costs O(length of the word) no matter how many words are
   stored, and every word with a given prefix hangs off one subtree.

   The old version here created a fresh chain of nodes for every word, which
   shares nothing and is therefore not a trie at all. */

function toWords(input) {
  const raw = Array.isArray(input) ? input.join(',') : input
  const text = typeof raw === 'string' ? raw : ''
  const words = text.split(/[,\s]+/).map(w => w.trim().toLowerCase()).filter(Boolean)
  /* Enough words to show sharing, few enough to stay on the canvas. */
  return (words.length ? words : ['apple', 'app', 'application', 'apt', 'bat'])
    .slice(0, 6)
    .map(w => w.slice(0, 12))
}

export function generateSteps(input) {
  const words = toWords(input)
  const nodes = []
  const steps = []
  const visited = []
  let nextId = 0

  const root = { id: nextId++, value: '•', left: null, right: null, parent: -1, children: {}, terminal: false }
  nodes.push(root)

  const addStep = (cur, description, codeLine) => steps.push({
    /* `children` is scaffolding for this generator; the visualizer reads the
       parent links, so it is stripped out of the snapshot. */
    nodes: nodes.map(n => ({
      id: n.id, value: n.terminal ? `${n.value}▪` : n.value,
      left: n.left, right: n.right, parent: n.parent,
    })),
    visited: [...visited],
    current: cur,
    highlighted: cur >= 0 ? [cur] : [],
    traversalOrder: [],
    description,
    codeLine,
    extra: { words: words.length, nodes: nodes.length },
  })

  addStep(0, `Build a trie for ${words.map(w => `"${w}"`).join(', ')}. Each edge is one character; the root holds nothing.`, 2)

  let reused = 0
  for (const word of words) {
    addStep(0, `Insert "${word}", walking down from the root one character at a time.`, 4)
    let cur = root
    for (let i = 0; i < word.length; i++) {
      const ch = word[i]
      const prefix = word.slice(0, i + 1)
      if (cur.children[ch]) {
        cur = cur.children[ch]
        reused++
        visited.push(cur.id)
        addStep(cur.id, `"${prefix}" already exists — follow the shared node instead of making a new one. This is what a trie saves.`, 5)
      } else {
        const node = { id: nextId++, value: ch, left: null, right: null, parent: cur.id, children: {}, terminal: false }
        cur.children[ch] = node
        nodes.push(node)
        cur = node
        visited.push(node.id)
        addStep(node.id, `No '${ch}' branch yet — add a node for "${prefix}".`, 5)
      }
    }
    cur.terminal = true
    addStep(cur.id, `Mark the end of "${word}" (shown ▪) — without it there is no way to tell a stored word from a mere prefix.`, 5)
  }

  const letters = words.reduce((s, w) => s + w.length, 0)
  addStep(-1, `Trie built: ${nodes.length - 1} nodes for ${letters} characters of input — ${reused} step${reused === 1 ? '' : 's'} reused an existing prefix. Looking up a word costs its own length, whatever else is stored.`, 7)
  steps[steps.length - 1].result = `${nodes.length - 1} nodes for ${words.length} words`
  return steps
}
