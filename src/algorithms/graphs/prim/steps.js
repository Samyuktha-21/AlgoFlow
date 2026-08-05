import { computeLayout } from '../bfs/steps.js'

/* A weighted graph whose MST is not simply "the first edge out of every node",
   so the greedy choice is visibly doing work. MST here is
   0-2(1), 2-1(2), 1-3(1), 3-4(3), 4-5(2) = 9. */
const DEFAULT_WEIGHTED = {
  nodes: [{ id: 0, label: '0' }, { id: 1, label: '1' }, { id: 2, label: '2' },
    { id: 3, label: '3' }, { id: 4, label: '4' }, { id: 5, label: '5' }],
  edges: [
    { from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 1 },
    { from: 2, to: 1, weight: 2 }, { from: 1, to: 3, weight: 1 },
    { from: 2, to: 3, weight: 5 }, { from: 3, to: 4, weight: 3 },
    { from: 4, to: 5, weight: 2 }, { from: 1, to: 4, weight: 7 },
  ],
}

/* Graph input in the UI is unweighted ("0-1, 0-2"), but Prim is meaningless
   without weights. Derive a stable weight from the endpoints so a custom graph
   still produces a repeatable, explainable run. */
export function weightFor(edge) {
  if (typeof edge.weight === 'number') return edge.weight
  return ((edge.from * 7 + edge.to * 13) % 9) + 1
}

const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)

/**
 * Prim's MST. Grows one tree from the start node; each round adds the cheapest
 * edge leaving the tree. Mirrors the Java key[]/inMST[]/priority-queue form.
 */
export function generateSteps(inputNodes = null, inputEdges = null, startNode = 0) {
  const nodes = inputNodes || DEFAULT_WEIGHTED.nodes
  const rawEdges = inputEdges || DEFAULT_WEIGHTED.edges
  const edges = rawEdges.map(e => ({ ...e, weight: weightFor(e) }))
  const start = nodes.some(n => n.id === startNode) ? startNode : nodes[0].id

  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.from].push({ to: e.to, w: e.weight })
    adj[e.to].push({ to: e.from, w: e.weight })
  })
  Object.keys(adj).forEach(k => adj[k].sort((a, b) => a.w - b.w || a.to - b.to))

  const positions = computeLayout(nodes, edges)
  const steps = []
  const inMST = new Set()
  const treeEdges = []
  const keyOf = {}
  const parent = {}
  nodes.forEach(n => { keyOf[n.id] = Infinity; parent[n.id] = null })
  keyOf[start] = 0
  let total = 0

  const frontier = () => nodes
    .filter(n => !inMST.has(n.id) && keyOf[n.id] < Infinity)
    .sort((a, b) => keyOf[a.id] - keyOf[b.id] || a.id - b.id)
    .map(n => n.id)

  const addStep = (current, description, codeLine) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges,
    visited: [...inMST],
    current,
    queue: frontier(),
    distances: { ...keyOf },
    treeEdges: [...treeEdges],
    treeEdgeLabel: 'MST edges',
    description,
    codeLine,
  })

  addStep(null, `Prim's MST from node ${start}. key[${start}]=0, every other key=∞, and the tree is empty.`, 8)

  while (inMST.size < nodes.length) {
    /* Smallest key among reachable outsiders = cheapest edge crossing out
       of the tree. That is exactly what the Java priority queue pops. */
    const candidates = nodes
      .filter(n => !inMST.has(n.id) && keyOf[n.id] < Infinity)
      .sort((a, b) => keyOf[a.id] - keyOf[b.id] || a.id - b.id)

    if (candidates.length === 0) {
      addStep(null, 'No edge leaves the tree — the remaining nodes are unreachable, so this graph is disconnected.', 23)
      break
    }
    const u = candidates[0].id

    addStep(u, `Pop the smallest key from the queue: node ${u} with key=${keyOf[u]}.`, 13)

    inMST.add(u)
    total += keyOf[u]
    if (parent[u] === null) {
      addStep(u, `Node ${u} is the root, so it joins the tree at cost 0.`, 15)
    } else {
      treeEdges.push(key(parent[u], u))
      addStep(u, `Add node ${u} through edge ${parent[u]}–${u} (weight ${keyOf[u]}). MST weight so far: ${total}.`, 16)
    }

    for (const { to: v, w } of adj[u]) {
      if (inMST.has(v)) {
        addStep(u, `Neighbour ${v} is already in the tree — edge ${u}–${v} would close a cycle, skip it.`, 18)
        continue
      }
      if (w < keyOf[v]) {
        const before = keyOf[v] === Infinity ? '∞' : keyOf[v]
        keyOf[v] = w
        parent[v] = u
        addStep(u, `Edge ${u}–${v} costs ${w}, beating node ${v}'s current key ${before} → key[${v}]=${w} via ${u}.`, 19)
      } else {
        addStep(u, `Edge ${u}–${v} costs ${w}, which does not beat node ${v}'s key ${keyOf[v]} — leave it.`, 18)
      }
    }
  }

  addStep(null,
    `MST complete: ${treeEdges.length} edge${treeEdges.length === 1 ? '' : 's'} spanning ${inMST.size} nodes, total weight ${total}.`,
    24)

  return steps
}
