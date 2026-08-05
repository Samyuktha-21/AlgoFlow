/* The same 4-city matrix the Java main() runs, so the panel's stated answer
   — tour 0→1→3→2→0, cost 80 — is exactly what the animation produces. */
const DEFAULT_DIST = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
]

const INF = Infinity

/* Cities on a circle: a complete graph has no meaningful hierarchy, so a ring
   keeps every edge visible instead of letting the level layout overlap them. */
function ringPositions(n, w = 560, h = 310) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 55
  const out = {}
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n
    out[i] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  return out
}

/* A custom graph arrives unweighted and possibly incomplete. TSP needs a
   distance between every pair, so missing pairs get a stable synthetic cost. */
function distanceMatrix(nodes, edges) {
  const idx = new Map(nodes.map((n, i) => [n.id, i]))
  const n = nodes.length
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : null)))
  for (const e of edges) {
    const a = idx.get(e.from), b = idx.get(e.to)
    if (a === undefined || b === undefined || a === b) continue
    const w = typeof e.weight === 'number' ? e.weight : ((e.from * 7 + e.to * 13) % 20) + 5
    d[a][b] = w; d[b][a] = w
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (d[i][j] === null) d[i][j] = ((i * 7 + j * 13) % 20) + 5
    }
  }
  return d
}

/**
 * Held-Karp exact TSP. dp[mask][u] is the cheapest way to start at city 0,
 * visit exactly the cities in `mask`, and end at u. Each step below is one
 * real relaxation of that table, not a walk over the node list.
 */
export function generateSteps(inputNodes = null, inputEdges = null) {
  const custom = Boolean(inputNodes && inputEdges && inputNodes.length >= 3)
  /* 2^n blows up fast and every state is drawn, so cap the demo at 5 cities. */
  const baseNodes = custom ? inputNodes.slice(0, 5) : [0, 1, 2, 3].map(i => ({ id: i, label: String(i) }))
  const dist = custom
    ? distanceMatrix(baseNodes, inputEdges)
    : DEFAULT_DIST

  const n = baseNodes.length
  const nodes = baseNodes.map((nd, i) => ({ ...nd, id: i, label: nd.label ?? String(i) }))
  const edges = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) edges.push({ from: i, to: j, weight: dist[i][j] })
  }
  const positions = ringPositions(n)

  const FULL = (1 << n) - 1
  const dp = Array.from({ length: 1 << n }, () => Array(n).fill(INF))
  const par = Array.from({ length: 1 << n }, () => Array(n).fill(-1))
  dp[1][0] = 0

  const steps = []
  let tourEdges = []
  let tourLabel = 'Best path to this state'

  const maskCities = m => nodes.map(x => x.id).filter(i => m & (1 << i))
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)

  /* Walk par[] backwards to draw the actual route behind a dp state. */
  const pathTo = (mask, u) => {
    const out = []
    let m = mask, c = u
    while (c !== -1 && par[m][c] !== -1) {
      const p = par[m][c]
      out.push(key(p, c))
      m ^= (1 << c)
      c = p
    }
    return out
  }

  const addStep = (mask, current, description, codeLine) => steps.push({
    nodes: nodes.map(x => ({ ...x, ...positions[x.id] })),
    edges,
    visited: maskCities(mask),
    current,
    queue: [],
    distances: Object.fromEntries(nodes.map(x => [x.id, dp[mask]?.[x.id] ?? INF])),
    treeEdges: [...tourEdges],
    treeEdgeLabel: tourLabel,
    description,
    codeLine,
  })

  addStep(1, 0,
    `Held-Karp on ${n} cities. dp[mask][u] = cheapest route that starts at city 0, covers exactly the cities in mask, and stops at u. Seed it with dp[{0}][0] = 0.`,
    22)

  for (let mask = 1; mask <= FULL; mask++) {
    if (!(mask & 1)) continue                       // every route starts at city 0
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue              // u must be inside the mask
      if (dp[mask][u] === INF) continue             // unreachable state, nothing to extend

      tourEdges = pathTo(mask, u)
      tourLabel = `Route behind dp[{${maskCities(mask).join(',')}}][${u}]`

      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue               // already visited
        const newMask = mask | (1 << v)
        const newCost = dp[mask][u] + dist[u][v]
        const prev = dp[newMask][v]

        if (newCost < prev) {
          dp[newMask][v] = newCost
          par[newMask][v] = u
          addStep(mask, u,
            `From dp[{${maskCities(mask).join(',')}}][${u}]=${dp[mask][u]}, hop ${u}→${v} costs ${dist[u][v]} → ${newCost}. That beats ${prev === INF ? '∞' : prev}, so dp[{${maskCities(newMask).join(',')}}][${v}]=${newCost}.`,
            33)
        } else {
          addStep(mask, u,
            `Hop ${u}→${v} would cost ${newCost}, no better than the ${prev} already recorded for that state — discard it.`,
            32)
        }
      }
    }
  }

  /* Close the loop: every full-coverage state must still return to city 0. */
  let minCost = INF, lastCity = -1
  for (let u = 1; u < n; u++) {
    if (dp[FULL][u] === INF) continue
    const cost = dp[FULL][u] + dist[u][0]
    tourEdges = [...pathTo(FULL, u), key(u, 0)]
    tourLabel = `Closing via ${u}`
    if (cost < minCost) {
      minCost = cost
      lastCity = u
      addStep(FULL, u, `All cities covered ending at ${u} costs ${dp[FULL][u]}; returning ${u}→0 adds ${dist[u][0]} for a full tour of ${cost} — the best so far.`, 45)
    } else {
      addStep(FULL, u, `Ending at ${u} gives a tour of ${cost}, worse than the ${minCost} already found.`, 44)
    }
  }

  if (lastCity === -1) {
    addStep(FULL, null, 'No tour visits every city — the graph is not connected enough for a Hamiltonian cycle.', 62)
    return steps
  }

  /* Reconstruct the winning tour from par[]. */
  const path = []
  let mask = FULL, cur = lastCity
  while (cur !== -1) {
    path.push(cur)
    const prev = par[mask][cur]
    mask ^= (1 << cur)
    cur = prev
  }
  path.reverse()
  path.push(0)

  tourEdges = []
  for (let i = 0; i + 1 < path.length; i++) tourEdges.push(key(path[i], path[i + 1]))
  tourLabel = 'Optimal tour'

  addStep(FULL, lastCity, `Walk par[] backwards from city ${lastCity} to rebuild the route.`, 53)
  addStep(FULL, 0, `Optimal tour: ${path.join(' → ')} with total cost ${minCost}.`, 61)

  return steps
}
