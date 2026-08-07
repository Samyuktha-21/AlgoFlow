/* Does the algorithm actually get the right answer?

   Every other audit checks that a generator runs, reads its input and renders.
   None of them checks that it is CORRECT — a sorting algorithm that returns
   the wrong order still animates beautifully, which is exactly how
   countingSort and radixSort shipped for months returning arrays full of
   holes for any negative input, and interpolationSearch reported "not found"
   for a target sitting in an all-equal array.

   Only invariants that hold for a whole category are checked here, so this
   stays true as algorithms change:
     sorting   — the last step's array is the input, sorted
     searching — a reported index really holds the target, and a target that
                 is present is never reported missing
     traversal — bfs/dfs visit exactly the reachable set, once each
     heap      — the final array satisfies the heap property and is still a
                 permutation of the input

   Per-algorithm correctness (Huffman optimality, MST weight, red-black
   invariants…) is verified against independent references when that algorithm
   is written; this file catches the category-wide regressions.

   Usage: node scripts/audit-correctness.mjs */
import { loadAlgorithms, argsFor } from './lib/run-algorithms.mjs'

/* Deliberately awkward: negatives and duplicates are what broke the
   counting-family sorts, and an all-equal array is what broke interpolation
   search. */
const SORT_INPUTS = [
  '3, 7', '7, 7, 7, 7', '5, 3, 5, 1, 3, 7', '1, 2, 3, 4, 5, 6, 7',
  '9, 8, 7, 6, 5, 4, 3', '-5, 3, -1, 8, -9, 2', '0, 0, 5, 0, 3',
  '64, 34, 25, 12, 22, 11, 90', '-3, -1, -2', '100, 5, 50000, 7',
  '0, 0', '-1, -1, -1',
]
const SEARCH_ARRAYS = ['2, 5, 8, 12, 16, 23, 38', '1, 2, 3', '5, 5, 5, 5', '-3, -1, 4', '7, 7']
const SEARCH_TARGETS = ['5', '23', '99', '-3', '7']

const GRAPH_INPUTS = [
  '0-1:1, 1-2:2, 2-3:3', '0-1:4, 0-2:1, 1-2:2, 1-3:5, 2-3:8',
  '0-1:2, 1-2:2, 2-0:2', '5-9:3, 9-12:4', '0-1:1, 2-3:1',
]
const parseGraph = (s) => {
  const edges = s.split(',').map(p => {
    const [e, w] = p.trim().split(':')
    const [a, b] = e.split('-').map(Number)
    return w === undefined ? { from: a, to: b } : { from: a, to: b, weight: Number(w) }
  })
  const nodes = [...new Set(edges.flatMap(x => [x.from, x.to]))]
    .sort((a, b) => a - b).map(id => ({ id, label: String(id) }))
  return { nodes, edges }
}
const multiset = a => [...a].sort((x, y) => x - y).join(',')

const all = await loadAlgorithms()
const findings = []
let sorted = 0, searched = 0, traversals = 0, heaps = 0

for (const e of all) {
  if (!e.gen) continue

  if (e.meta.type === 'sorting') {
    sorted++
    for (const v of SORT_INPUTS) {
      const r = argsFor(e.meta, v, '')
      if (r.error) continue
      let steps
      try { steps = e.gen(...r.args) } catch (err) { findings.push(`${e.id} threw on "${v}" — ${err.message}`); continue }
      if (!steps?.length) { findings.push(`${e.id} produced no steps on "${v}"`); continue }
      const want = [...r.args[0]].sort((a, b) => a - b)
      const got = steps[steps.length - 1].array
      if (JSON.stringify(got) !== JSON.stringify(want)) {
        findings.push(`${e.id} ["${v}"] final array ${JSON.stringify(got)} is not the sorted input ${JSON.stringify(want)}`)
      }
      /* The closing sentence must not contradict the array it ships with. */
      const d = steps[steps.length - 1].description
      const m = typeof d === 'string' && d.match(/\[([-\d,\s]+)\]/)
      if (m) {
        const shown = m[1].split(',').map(x => Number(x.trim()))
        if (JSON.stringify(shown) !== JSON.stringify(got)) {
          findings.push(`${e.id} ["${v}"] final text lists ${JSON.stringify(shown)} but the array is ${JSON.stringify(got)}`)
        }
      }
    }
  }

  if (e.meta.type === 'searching') {
    searched++
    for (const v of SEARCH_ARRAYS) for (const t of SEARCH_TARGETS) {
      const r = argsFor(e.meta, v, t)
      if (r.error) continue
      let steps
      try { steps = e.gen(...r.args) } catch (err) { findings.push(`${e.id} threw on "${v}" / ${t} — ${err.message}`); continue }
      const [arr, target] = r.args
      const idx = steps.map(s => s.found).filter(x => typeof x === 'number' && x >= 0).pop()
      const present = arr.includes(target)
      if (present && idx === undefined) findings.push(`${e.id} ["${v}" target ${t}] the target IS in the array but was never reported found`)
      if (!present && idx !== undefined) findings.push(`${e.id} ["${v}" target ${t}] the target is absent but was reported found at ${idx}`)
      if (idx !== undefined && arr[idx] !== target) findings.push(`${e.id} ["${v}" target ${t}] reported index ${idx}, which holds ${arr[idx]}`)
    }
  }

  /* A traversal can be quietly wrong in exactly two ways: miss a node it
     should reach, or visit one twice. */
  if (e.meta.type === 'graph' && /bfs|dfs/.test(e.id)) {
    traversals++
    for (const gs of GRAPH_INPUTS) {
      const { nodes, edges } = parseGraph(gs)
      let steps
      try { steps = e.gen(nodes, edges, nodes[0].id) } catch (err) { findings.push(`${e.id} threw on "${gs}" — ${err.message}`); continue }
      const vis = steps[steps.length - 1]?.visited || []
      const ids = new Set(nodes.map(n => n.id))
      if (new Set(vis).size !== vis.length) findings.push(`${e.id} ["${gs}"] visited the same node twice: ${vis.join(', ')}`)
      for (const v of vis) if (!ids.has(v)) { findings.push(`${e.id} ["${gs}"] visited node ${v}, which is not in the graph`); break }
      const adj = {}
      nodes.forEach(n => { adj[n.id] = [] })
      edges.forEach(x => { adj[x.from].push(x.to); adj[x.to].push(x.from) })
      const seen = new Set([nodes[0].id]); const q = [nodes[0].id]
      while (q.length) { const u = q.shift(); for (const v of adj[u]) if (!seen.has(v)) { seen.add(v); q.push(v) } }
      if (vis.length !== seen.size) findings.push(`${e.id} ["${gs}"] visited ${vis.length} nodes but ${seen.size} are reachable from the start`)
    }
  }

  if (e.meta.type === 'heap' && /minHeap|maxHeap/.test(e.id)) {
    heaps++
    const isMin = /minHeap/.test(e.id)
    for (const v of SORT_INPUTS) {
      const r = argsFor(e.meta, v, '')
      if (r.error) continue
      let steps
      try { steps = e.gen(...r.args) } catch (err) { findings.push(`${e.id} threw on "${v}" — ${err.message}`); continue }
      const h = steps[steps.length - 1]?.array || steps[steps.length - 1]?.heap
      if (!Array.isArray(h)) continue
      for (let i = 0; i < h.length; i++) {
        for (const c of [2 * i + 1, 2 * i + 2]) {
          if (c >= h.length) continue
          if (isMin ? h[i] > h[c] : h[i] < h[c]) {
            findings.push(`${e.id} ["${v}"] heap property broken between ${i} and ${c} in [${h}]`)
            i = h.length
            break
          }
        }
      }
      if (multiset(h) !== multiset(r.args[0])) findings.push(`${e.id} ["${v}"] final heap [${h}] is not a permutation of the input`)
    }
  }
}

const uniq = [...new Set(findings)]
console.log(`${sorted} sorting, ${searched} searching, ${traversals} traversal and ${heaps} heap algorithms checked against category invariants.\n`)
if (uniq.length) {
  console.log(`${uniq.length} finding(s):\n`)
  console.log(uniq.map(f => '  ' + f).join('\n'))
} else {
  console.log('No findings — sorts return the sorted input, searches report true indices,')
  console.log('traversals cover exactly the reachable set, and heaps hold their property.')
}
process.exitCode = uniq.length ? 1 : 0
