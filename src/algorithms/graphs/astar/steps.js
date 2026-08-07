import { computeLayout } from '../bfs/steps.js'

/* The Java reference walks a grid with a Manhattan heuristic, so the default
   demo is a real 4x4 grid with two blocked cells. Node id = row * 4 + col,
   every move costs 1, and h is the Manhattan distance to the goal — the exact
   heuristic in the code panel. */
const COLS = 4, ROWS = 4
const BLOCKED = new Set([5, 9])          // (1,1) and (2,1)
const rc = id => ({ r: Math.floor(id / COLS), c: id % COLS })

function buildGrid() {
  const nodes = []
  for (let id = 0; id < ROWS * COLS; id++) {
    if (BLOCKED.has(id)) continue
    const { r, c } = rc(id)
    nodes.push({ id, label: `${r},${c}`, x: 90 + c * 130, y: 45 + r * 75 })
  }
  const alive = new Set(nodes.map(n => n.id))
  const edges = []
  for (const id of alive) {
    const { r, c } = rc(id)
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const nr = r + dr, nc = c + dc
      if (nr >= ROWS || nc >= COLS) continue
      const nid = nr * COLS + nc
      if (alive.has(nid)) edges.push({ from: id, to: nid })
    }
  }
  return { nodes, edges, start: 0, goal: ROWS * COLS - 1 }
}

/**
 * A* on a graph with unit edge costs, expanding the open node with the lowest
 * f = g + h. On the built-in grid h is Manhattan distance; on a custom graph
 * it falls back to straight-line distance divided by the longest edge, which
 * is still admissible (one edge can never close more ground than that) and so
 * still guarantees the shortest path.
 */
export function generateSteps(inputNodes = null, inputEdges = null, startNode = 0) {
  const grid = !inputNodes || !inputEdges
  const g = grid ? buildGrid() : null
  const nodes = grid ? g.nodes : inputNodes
  const edges = grid ? g.edges : inputEdges
  const start = grid ? g.start : (nodes.some(n => n.id === startNode) ? startNode : nodes[0].id)
  const goal = grid ? g.goal : nodes[nodes.length - 1].id

  const positions = grid
    ? Object.fromEntries(nodes.map(n => [n.id, { x: n.x, y: n.y }]))
    : computeLayout(nodes, edges)

  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from) })
  Object.keys(adj).forEach(k => adj[k].sort((a, b) => a - b))

  /* Longest edge in layout space — the scale factor that keeps the fallback
     heuristic admissible. */
  let maxEdge = 1
  for (const e of edges) {
    const a = positions[e.from], b = positions[e.to]
    if (a && b) maxEdge = Math.max(maxEdge, Math.hypot(a.x - b.x, a.y - b.y))
  }

  const h = (id) => {
    if (grid) {
      const a = rc(id), b = rc(goal)
      return Math.abs(a.r - b.r) + Math.abs(a.c - b.c)
    }
    const p = positions[id], q = positions[goal]
    if (!p || !q) return 0
    return Math.ceil(Math.hypot(p.x - q.x, p.y - q.y) / maxEdge)
  }

  const steps = []
  const gScore = {}
  const cameFrom = {}
  nodes.forEach(n => { gScore[n.id] = Infinity; cameFrom[n.id] = null })
  gScore[start] = 0

  const open = [start]
  const closed = new Set()
  let pathEdges = []
  let pathLabel = 'Path so far'

  const fOf = id => gScore[id] + h(id)
  /* Ties on f broken toward the larger g — the standard A* tie-break. Still
     optimal, and it stops the search fanning out across every equal-f node,
     which is the whole reason A* beats a blind search. */
  const openByF = () => [...open].sort((a, b) => fOf(a) - fOf(b) || gScore[b] - gScore[a] || a - b)

  const addStep = (current, description, codeLine) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges,
    visited: [...closed],
    current,
    queue: openByF(),
    distances: Object.fromEntries(nodes.map(n => [n.id, gScore[n.id] === Infinity ? Infinity : fOf(n.id)])),
    treeEdges: [...pathEdges],
    treeEdgeLabel: pathLabel,
    description,
    codeLine,
  })

  const chainTo = (id) => {
    const out = []
    let cur = id
    while (cameFrom[cur] !== null) {
      const p = cameFrom[cur]
      out.push(p < cur ? `${p}-${cur}` : `${cur}-${p}`)
      cur = p
    }
    return out
  }
  const nameOf = id => nodes.find(n => n.id === id)?.label ?? String(id)

  addStep(null,
    `A* from ${nameOf(start)} to ${nameOf(goal)}. g[start]=0 and f=g+h, so the start's f is its heuristic ${h(start)}. The number under each node is its f.`,
    10)

  let found = false
  while (open.length > 0) {
    const orderedOpen = openByF()
    const cur = orderedOpen[0]
    open.splice(open.indexOf(cur), 1)

    addStep(cur, `Pop the open node with the lowest f: ${nameOf(cur)} (g=${gScore[cur]} + h=${h(cur)} = f=${fOf(cur)}).`, 16)

    if (cur === goal) {
      pathEdges = chainTo(goal)
      pathLabel = 'Shortest path'
      found = true
      addStep(cur, `${nameOf(cur)} is the goal — A* stops here. Because h never overestimates, this path of cost ${gScore[goal]} is optimal.`, 18)
      break
    }

    closed.add(cur)

    for (const nb of adj[cur]) {
      const tentative = gScore[cur] + 1
      addStep(cur, `Neighbour ${nameOf(nb)}: cost through ${nameOf(cur)} is g=${gScore[cur]}+1=${tentative}, versus its best known ${gScore[nb] === Infinity ? '∞' : gScore[nb]}.`, 22)

      if (tentative < gScore[nb]) {
        gScore[nb] = tentative
        cameFrom[nb] = cur
        if (!open.includes(nb)) open.push(nb)
        pathEdges = chainTo(nb)
        addStep(cur, `Better route found → g[${nameOf(nb)}]=${tentative}, f=${tentative}+${h(nb)}=${tentative + h(nb)}. Push it onto the open set.`, 24)
      } else {
        addStep(cur, `No improvement for ${nameOf(nb)} — keep its existing route.`, 23)
      }
    }
  }

  if (found) {
    addStep(goal,
      `Reconstructed path: ${(() => { const p = []; let c = goal; while (c !== null) { p.unshift(nameOf(c)); c = cameFrom[c] } return p.join(' → ') })()} — total cost ${gScore[goal]}, after expanding only ${closed.size} of ${nodes.length} nodes.`,
      35)
  } else {
    addStep(null, 'The open set is empty and the goal was never reached — no path exists.', 30)
  }

  steps[steps.length - 1].result = found
    ? `Path cost ${gScore[goal]}, ${closed.size} nodes expanded`
    : 'No path exists'
  return steps
}
