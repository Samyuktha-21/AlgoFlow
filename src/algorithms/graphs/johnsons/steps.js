import { computeLayout } from '../bfs/steps.js'

/* Johnson's only earns its keep on a DIRECTED graph with negative edges, so
   the demo ships the classic CLRS example: 3→2 and 0→4 are negative, there is
   no negative cycle, and the potentials come out h = [0, -1, -5, 0, -4]. */
const DEFAULT_DIRECTED_WEIGHTED = {
  nodes: [{ id: 0, label: '0' }, { id: 1, label: '1' }, { id: 2, label: '2' },
    { id: 3, label: '3' }, { id: 4, label: '4' }],
  edges: [
    { from: 0, to: 1, weight: 3 }, { from: 0, to: 2, weight: 8 }, { from: 0, to: 4, weight: -4 },
    { from: 1, to: 3, weight: 1 }, { from: 1, to: 4, weight: 7 },
    { from: 2, to: 1, weight: 4 },
    { from: 3, to: 0, weight: 2 }, { from: 3, to: 2, weight: -5 },
    { from: 4, to: 3, weight: 6 },
  ],
}

/* The graph box in the UI accepts unweighted pairs ("0-1, 0-2"), but Johnson's
   is about negative weights. Derive a repeatable weight in -3..8 from the
   endpoints so a custom graph still exercises the reweighting. */
export function weightFor(edge) {
  if (typeof edge.weight === 'number') return edge.weight
  return (((edge.from * 7 + edge.to * 13) % 12) + 12) % 12 - 3
}

const INF = Infinity
const fmt = (x) => (x === INF || x === -INF ? '∞' : String(x))

/**
 * Johnson's all-pairs shortest paths.
 *
 * Bellman-Ford from a virtual source gives a potential h[v] for every node.
 * Reweighting each edge to w + h[u] - h[v] leaves every weight non-negative
 * while preserving which path is shortest, so Dijkstra — normally illegal on
 * negative weights — can then run once per source.
 */
export function generateSteps(inputNodes = null, inputEdges = null) {
  const nodes = inputNodes || DEFAULT_DIRECTED_WEIGHTED.nodes
  const rawEdges = inputEdges || DEFAULT_DIRECTED_WEIGHTED.edges
  const edges = rawEdges.map(e => ({ ...e, weight: weightFor(e) }))
  const ids = nodes.map(n => n.id)

  const positions = computeLayout(nodes, edges)
  const steps = []

  /* Phase 1 and 3 show different numbers on the same picture: the potentials
     while Bellman-Ford runs, then one Dijkstra's distances. `shownEdges` swaps
     the original weights for the reweighted ones once phase 2 has run. */
  let shownEdges = edges
  let panel = {}
  let settled = []
  let frontier = []
  let treeEdges = []
  let treeLabel = 'Shortest-path tree'

  const addStep = (current, description, codeLine) => steps.push({
    nodes: nodes.map(n => ({ ...n, ...positions[n.id] })),
    edges: shownEdges,
    visited: [...settled],
    current,
    queue: [...frontier],
    distances: { ...panel },
    treeEdges: [...treeEdges],
    treeEdgeLabel: treeLabel,
    directed: true,
    description,
    codeLine,
  })

  /* ── Phase 1: potentials via Bellman-Ford from a virtual source ── */
  const h = {}
  ids.forEach(id => { h[id] = INF })
  let hq = 0                                    // potential of the virtual source
  panel = { ...h }
  treeLabel = 'Reweighted edges'

  addStep(null,
    'Johnson\'s runs Dijkstra once per node, but Dijkstra cannot handle negative edges. '
    + 'Step 1: add a virtual source with a 0-weight edge to every node, then Bellman-Ford from it.',
    10)

  ids.forEach(id => { h[id] = hq })             // the n virtual 0-weight edges
  panel = { ...h }
  addStep(null,
    'Pass 1 relaxes the virtual edges, so every potential starts at h=0. The real edges cannot fire yet — nothing is reachable until now.',
    15)

  let negativeCycle = false
  for (let pass = 1; pass < ids.length + 1; pass++) {
    let changed = 0
    for (const e of edges) {
      if (h[e.from] === INF) continue
      const cand = h[e.from] + e.weight
      if (cand < h[e.to]) {
        const before = fmt(h[e.to])
        h[e.to] = cand
        panel = { ...h }
        changed++
        addStep(e.to,
          `Pass ${pass + 1}: edge ${e.from}→${e.to} weighs ${e.weight}, so going through ${e.from} gives h=${cand}, better than ${before}. Set h[${e.to}]=${cand}.`,
          15)
      }
    }
    if (changed === 0) {
      addStep(null,
        `Pass ${pass + 1} changed nothing — the potentials have converged after ${pass} useful pass${pass === 1 ? '' : 'es'}.`,
        13)
      break
    }
    addStep(null,
      `Pass ${pass + 1} tightened ${changed} potential${changed === 1 ? '' : 's'}: h = {${ids.map(id => `${id}:${fmt(h[id])}`).join(', ')}}.`,
      13)
    /* A relaxation still firing on the n-th pass means some cycle keeps
       getting cheaper, which is exactly the negative-cycle certificate. */
    if (pass === ids.length) negativeCycle = true
  }

  if (negativeCycle) {
    addStep(null,
      'An edge still relaxes after n passes, so this graph contains a negative cycle — shortest paths are undefined and Johnson\'s stops here.',
      17)
    return steps
  }

  addStep(null,
    `No edge relaxes on the final check, so there is no negative cycle. Potentials: h = {${ids.map(id => `${id}:${fmt(h[id])}`).join(', ')}}.`,
    17)

  /* ── Phase 2: reweight ── */
  const reweighted = edges.map(e => ({ ...e, weight: e.weight + h[e.from] - h[e.to], original: e.weight }))
  const adj = {}
  ids.forEach(id => { adj[id] = [] })
  reweighted.forEach(e => { if (adj[e.from]) adj[e.from].push(e) })
  ids.forEach(id => adj[id].sort((a, b) => a.weight - b.weight || a.to - b.to))

  for (let i = 0; i < reweighted.length; i++) {
    const e = reweighted[i]
    shownEdges = edges.map((orig, j) => (j <= i ? reweighted[j] : orig))
    treeEdges = reweighted.slice(0, i + 1).map(x => `${x.from}-${x.to}`)
    addStep(e.from,
      `Reweight ${e.from}→${e.to}: ${e.original} + h[${e.from}](${fmt(h[e.from])}) − h[${e.to}](${fmt(h[e.to])}) = ${e.weight}. `
      + 'Never negative, and every path between the same two nodes shifts by the same amount, so the shortest one is unchanged.',
      22)
  }

  shownEdges = reweighted
  treeEdges = []
  treeLabel = 'Shortest-path tree'

  /* ── Phase 3: Dijkstra per source on the non-negative graph ── */
  const allPairs = {}
  for (const src of ids) {
    const d = {}
    ids.forEach(id => { d[id] = INF })
    d[src] = 0
    const parent = {}
    const done = new Set()
    settled = []
    treeEdges = []
    panel = { ...d }
    frontier = [src]

    addStep(src, `Dijkstra from node ${src} on the reweighted graph — legal now that no weight is negative. d[${src}]=0, everything else ∞.`, 28)

    while (true) {
      const next = ids
        .filter(id => !done.has(id) && d[id] < INF)
        .sort((a, b) => d[a] - d[b] || a - b)
      if (next.length === 0) break
      const u = next[0]
      done.add(u)
      settled.push(u)
      frontier = next.slice(1)
      addStep(u, `Pop node ${u} with the smallest tentative distance, ${d[u]}. Its distance from ${src} is now final.`, 32)

      for (const e of adj[u]) {
        const cand = d[u] + e.weight
        if (cand < d[e.to]) {
          const before = fmt(d[e.to])
          d[e.to] = cand
          if (parent[e.to]) treeEdges = treeEdges.filter(k => k !== `${parent[e.to]}-${e.to}`)
          parent[e.to] = u
          treeEdges = [...treeEdges, `${u}-${e.to}`]
          panel = { ...d }
          frontier = ids.filter(id => !done.has(id) && d[id] < INF).sort((a, b) => d[a] - d[b] || a - b)
          addStep(u, `Edge ${u}→${e.to} costs ${e.weight}, so ${e.to} is reachable for ${cand} — better than ${before}. Update it.`, 37)
        } else {
          addStep(u, `Edge ${u}→${e.to} costs ${e.weight}, giving ${fmt(cand)} — no better than ${e.to}'s current ${fmt(d[e.to])}. Leave it.`, 36)
        }
      }
    }

    /* Undo the shift: the reweighted run measured d' = d + h[src] - h[v]. */
    const real = {}
    ids.forEach(id => { real[id] = d[id] === INF ? INF : d[id] + h[id] - h[src] })
    allPairs[src] = real
    panel = { ...real }
    frontier = []
    addStep(null,
      `Undo the reweighting for source ${src}: real = d + h[v] − h[${src}]. Distances from ${src}: ${ids.map(id => `${id}:${fmt(real[id])}`).join(', ')}.`,
      43)
  }

  panel = {}
  settled = []
  treeEdges = []
  addStep(null,
    `All-pairs shortest paths complete — ${ids.length} Dijkstra runs on the reweighted graph instead of one O(V³) Floyd-Warshall. `
    + `Row 0: ${ids.map(id => `${id}:${fmt(allPairs[ids[0]][id])}`).join(', ')}.`,
    45)

  return steps
}
