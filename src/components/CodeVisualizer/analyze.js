/* Turns one trace step (frames + heap) into a list of "views" to draw.
   Detection is purely by shape/name of the data, so it works on any code:
     list of values        -> array (with i/j/lo/hi... pointers)   or stack/queue by name
     list of equal rows    -> grid (DP table / matrix)
     obj with left/right   -> binary tree
     obj with next         -> linked list
     dict of lists / adj   -> graph
     other dict / set / obj-> table / chips / card                                   */

const INDEX_NAME = /^([a-z]|lo|hi|low|high|mid|left|right|start|end|begin|top|front|rear|head|tail|pos|idx|index|ptr|cur|curr|slow|fast|pivot|row|col)$|(_?(idx|index|ptr|pos))$/i
const STACK_NAME = /(^|_)(stack|stk|st|call_stack)($|_)|stack$/i
const QUEUE_NAME = /(^|_)(queue|q|dq|deque|frontier)($|_)|queue$/i
const GRAPH_NAME = /graph|adj|edges|neighbors|neighbours/i
const VISITED_NAME = /visited|seen|explored|done|closed/i
const NODE_VAR_NAME = /^(node|u|cur|curr|current|vertex)$/i
const NEIGHBOR_VAR_NAME = /^(v|nei|nb|nbr|neighbor|neighbour|nxt|next_node|child|adj_node)$/i
const VALUE_FIELDS = ['val', 'value', 'data', 'key', 'item', 'name']

export const isPrim = (e) => e && 'p' in e
export const primText = (e) => {
  if (!e) return '?'
  if (e.p === null) return 'None'
  if (e.p === true) return 'True'
  if (e.p === false) return 'False'
  return e.str ? `'${e.p}'` : String(e.p)
}

function nodeValue(obj) {
  for (const f of VALUE_FIELDS) if (obj.fields[f] && isPrim(obj.fields[f])) return primText(obj.fields[f]).replace(/^'|'$/g, '')
  const first = Object.values(obj.fields).find(isPrim)
  return first ? primText(first) : obj.cls
}

const isTreeNode = (o) => o?.kind === 'obj' && ('left' in o.fields || 'right' in o.fields)
const isListNode = (o) => o?.kind === 'obj' && 'next' in o.fields && !isTreeNode(o)
const isSeq = (o) => o && (o.kind === 'list' || o.kind === 'tuple' || o.kind === 'deque')

/* Every heap object referenced by a variable, tagged with the names pointing
   at it and the top-most frame that holds it (for index pointers). */
function collectRoots(step) {
  const byRef = new Map()
  step.frames.forEach((fr, depth) => {
    for (const [name, enc] of Object.entries(fr.vars)) {
      if (!enc || !('ref' in enc)) continue
      const cur = byRef.get(enc.ref) || { ref: enc.ref, names: [], depth: -1, frame: null }
      if (!cur.names.includes(name)) cur.names.push(name)
      if (depth > cur.depth) { cur.depth = depth; cur.frame = fr }
      byRef.set(enc.ref, cur)
    }
  })
  return byRef
}

function arrayPointers(frame, len) {
  const ptrs = []
  if (!frame) return ptrs
  for (const [name, enc] of Object.entries(frame.vars)) {
    if (isPrim(enc) && Number.isInteger(enc.p) && typeof enc.p !== 'boolean' && enc.p >= 0 && enc.p < len && INDEX_NAME.test(name)) {
      ptrs.push({ name, index: enc.p })
    }
  }
  return ptrs
}

function changedIndices(cur, prev) {
  if (!prev || !isSeq(prev)) return []
  const out = []
  cur.items.forEach((it, i) => {
    const p = prev.items[i]
    if (!p || primText(p) !== primText(it)) out.push(i)
  })
  return out
}

/* Find the same variable's object in the previous step to diff against */
function prevObjectFor(prevStep, names) {
  if (!prevStep) return null
  for (let d = prevStep.frames.length - 1; d >= 0; d--) {
    for (const n of names) {
      const enc = prevStep.frames[d].vars[n]
      if (enc && 'ref' in enc) return prevStep.heap[enc.ref]
    }
  }
  return null
}

function buildTree(heap, ref, labels, seen = new Set()) {
  const o = heap[ref]
  if (!o || seen.has(ref)) return null
  seen.add(ref)
  const child = (f) => {
    const e = o.fields[f]
    return e && 'ref' in e && isTreeNode(heap[e.ref]) ? buildTree(heap, e.ref, labels, seen) : null
  }
  return { ref, value: nodeValue(o), labels: labels.get(ref) || [], left: child('left'), right: child('right') }
}

function buildChain(heap, ref, labels) {
  const nodes = []
  const seen = new Set()
  let cycleTo = null
  let r = ref
  while (r != null && heap[r] && isListNode(heap[r])) {
    if (seen.has(r)) { cycleTo = r; break }
    seen.add(r)
    nodes.push({ ref: r, value: nodeValue(heap[r]), labels: labels.get(r) || [] })
    const nx = heap[r].fields.next
    r = nx && 'ref' in nx ? nx.ref : null
    if (nodes.length > 40) break
  }
  return { nodes, cycleTo }
}

function keyText(e, heap) {
  if (isPrim(e)) return primText(e).replace(/^'|'$/g, '')
  const o = e && heap[e.ref]
  if (o?.kind === 'tuple') return `(${o.items.map(primText).join(',')})`
  return '?'
}

function buildGraph(heap, obj, step, isDict) {
  const nodes = new Map()
  const edges = []
  const add = (k) => { if (!nodes.has(k)) nodes.set(k, { id: k }) }
  const rows = isDict ? obj.entries.map(([k, v]) => [keyText(k, heap), v]) : obj.items.map((v, i) => [String(i), v])
  for (const [from, v] of rows) {
    add(from)
    const nb = v && 'ref' in v ? heap[v.ref] : null
    const list = nb && (isSeq(nb) || nb.kind === 'set') ? nb.items : []
    for (const it of list) {
      let to = it
      let w = null
      const t = it && 'ref' in it ? heap[it.ref] : null
      if (t && isSeq(t) && t.items.length >= 1) { to = t.items[0]; w = t.items[1] ? primText(t.items[1]) : null }
      const id = keyText(to, heap)
      add(id)
      edges.push({ from, to: id, w })
    }
  }
  // highlight visited sets and "current node" variables from the top frame
  const visited = new Set()
  const current = new Set()
  const exploring = new Set()
  const top = step.frames[step.frames.length - 1]
  for (const fr of step.frames) {
    for (const [name, enc] of Object.entries(fr.vars)) {
      if (VISITED_NAME.test(name) && enc && 'ref' in enc) {
        const o = step.heap[enc.ref]
        if (o?.kind === 'set' || isSeq(o)) o.items.forEach(it => visited.add(keyText(it, step.heap)))
        if (o?.kind === 'dict') o.entries.forEach(([k]) => visited.add(keyText(k, step.heap)))
      }
    }
  }
  if (top) for (const [name, enc] of Object.entries(top.vars)) {
    if (!isPrim(enc)) continue
    const id = primText(enc).replace(/^'|'$/g, '')
    if (NODE_VAR_NAME.test(name)) current.add(id)
    else if (NEIGHBOR_VAR_NAME.test(name)) exploring.add(id)
  }
  // undirected graphs list each edge twice — draw it once
  const undirected = edges.every(e => edges.some(o => o.from === e.to && o.to === e.from))
  const drawn = undirected ? edges.filter(e => e.from <= e.to) : edges
  return { nodes: [...nodes.values()], edges: drawn, directed: !undirected, visited, current, exploring }
}

export function analyzeStep(step, prevStep) {
  if (!step) return []
  const { heap } = step
  const roots = collectRoots(step)
  const views = []

  // labels for tree / list nodes, shared by every structure drawn
  const nodeLabels = new Map()
  for (const r of roots.values()) nodeLabels.set(r.ref, r.names)

  // tree + list nodes reachable from variables; roots are those no other node points to
  const reachable = new Set()
  const childOf = new Set()
  const walk = (ref) => {
    if (reachable.has(ref)) return
    const o = heap[ref]
    if (!isTreeNode(o) && !isListNode(o)) return
    reachable.add(ref)
    for (const f of ['left', 'right', 'next']) {
      const e = o.fields[f]
      if (e && 'ref' in e && (isTreeNode(heap[e.ref]) || isListNode(heap[e.ref]))) { childOf.add(e.ref); walk(e.ref) }
    }
  }
  for (const r of roots.values()) walk(r.ref)
  // also walk node-valued containers (e.g. a stack/queue of tree nodes)
  for (const r of roots.values()) {
    const o = heap[r.ref]
    if (isSeq(o)) o.items.forEach(it => it && 'ref' in it && walk(it.ref))
  }

  const drawnNodes = new Set()
  for (const ref of reachable) {
    if (childOf.has(ref) || drawnNodes.has(ref)) continue
    const o = heap[ref]
    if (isTreeNode(o)) {
      const tree = buildTree(heap, ref, nodeLabels)
      const mark = (n) => { if (n) { drawnNodes.add(n.ref); mark(n.left); mark(n.right) } }
      mark(tree)
      const names = nodeLabels.get(ref) || []
      views.push({ type: 'tree', key: `t${ref}`, title: names.length ? names.join(', ') : 'tree', tree })
    } else {
      const chain = buildChain(heap, ref, nodeLabels)
      chain.nodes.forEach(n => drawnNodes.add(n.ref))
      const names = nodeLabels.get(ref) || []
      views.push({ type: 'linked', key: `l${ref}`, title: names.length ? names.join(', ') : 'linked list', ...chain })
    }
  }
  // a cycle with no outside head (every node is someone's child)
  for (const ref of reachable) {
    if (drawnNodes.has(ref)) continue
    const chain = buildChain(heap, ref, nodeLabels)
    chain.nodes.forEach(n => drawnNodes.add(n.ref))
    views.push({ type: 'linked', key: `l${ref}`, title: (nodeLabels.get(ref) || ['cycle']).join(', '), ...chain })
  }

  for (const r of roots.values()) {
    const o = heap[r.ref]
    if (!o || drawnNodes.has(r.ref)) continue
    const title = r.names.join(', ')
    const anyName = (re) => r.names.some(n => re.test(n))
    const prev = prevObjectFor(prevStep, r.names)

    if (isSeq(o)) {
      const subs = o.items.map(it => (it && 'ref' in it ? heap[it.ref] : null))
      const allPrim = o.items.every(isPrim)
      const allRows = o.items.length > 0 && subs.every(s => isSeq(s) && s.items.every(isPrim))
      const nodeItems = o.items.length > 0 && subs.every(s => isTreeNode(s) || isListNode(s))

      if (allRows && (anyName(GRAPH_NAME) || new Set(subs.map(s => s.items.length)).size > 1)) {
        views.push({ type: 'graph', key: `g${r.ref}`, title, ...buildGraph(heap, o, step, false) })
      } else if (allRows) {
        const prevRows = prev && isSeq(prev) ? prev.items.map(it => (it && 'ref' in it ? prevStep.heap[it.ref] : null)) : []
        const rows = subs.map((s, i) => ({ cells: s.items.map(primText), changed: changedIndices(s, prevRows[i]) }))
        const cols = Math.max(0, ...rows.map(x => x.cells.length))
        const pick = (re, len) => arrayPointers(r.frame, len).find(p => re.test(p.name))?.index ?? null
        views.push({ type: 'grid', key: `d${r.ref}`, title, rows, row: pick(/^(i|r|row|x)$/i, rows.length), col: pick(/^(j|c|col|y)$/i, cols) })
      } else if (allPrim || nodeItems || o.items.length === 0) {
        const items = o.items.map(it => (isPrim(it) ? primText(it) : nodeValue(heap[it.ref]) ))
        const base = { key: `a${r.ref}`, title, items, len: o.len, changed: allPrim ? changedIndices(o, prev) : [] }
        if (anyName(STACK_NAME)) views.push({ type: 'stack', ...base })
        else if (o.kind === 'deque' || anyName(QUEUE_NAME)) views.push({ type: 'queue', ...base })
        else views.push({ type: 'array', ...base, pointers: arrayPointers(r.frame, o.items.length) })
      } else {
        views.push({ type: 'array', key: `a${r.ref}`, title, items: o.items.map(it => describe(it, heap)), len: o.len, changed: [], pointers: [] })
      }
    } else if (o.kind === 'dict') {
      const vals = o.entries.map(([, v]) => (v && 'ref' in v ? heap[v.ref] : null))
      const adjacency = o.entries.length > 0 && vals.every(v => v && (isSeq(v) || v.kind === 'set'))
      if (adjacency && (anyName(GRAPH_NAME) || vals.some(v => v.items.length > 0))) {
        views.push({ type: 'graph', key: `g${r.ref}`, title, ...buildGraph(heap, o, step, true) })
      } else {
        views.push({ type: 'dict', key: `m${r.ref}`, title, rows: o.entries.map(([k, v]) => [describe(k, heap), describe(v, heap)]), len: o.len })
      }
    } else if (o.kind === 'set') {
      views.push({ type: 'set', key: `s${r.ref}`, title, items: o.items.map(it => describe(it, heap)), len: o.len })
    } else if (o.kind === 'obj') {
      views.push({ type: 'object', key: `o${r.ref}`, title, cls: o.cls, fields: Object.entries(o.fields).map(([k, v]) => [k, describe(v, heap)]) })
    }
  }

  // Order: the most "algorithmic" pictures first
  const rank = { tree: 0, linked: 1, graph: 2, grid: 3, array: 4, stack: 5, queue: 6, dict: 7, set: 8, object: 9 }
  return views.sort((a, b) => rank[a.type] - rank[b.type])
}

/* Short inline text for any encoded value (used in tables & call-stack frames) */
export function describe(enc, heap) {
  if (!enc) return '?'
  if (isPrim(enc)) return primText(enc)
  const o = heap?.[enc.ref]
  if (!o) return '…'
  if (isSeq(o)) {
    if (o.items.length > 0 && !o.items.some(isPrim)) return `${o.kind}[${o.len}] of ${describe(o.items[0], heap).startsWith('[') ? 'lists' : 'items'}`
    const inner = o.items.slice(0, 6).map(it => (isPrim(it) ? primText(it) : '…')).join(', ')
    const more = o.len > 6 ? ', …' : ''
    return o.kind === 'tuple' ? `(${inner}${more})` : `[${inner}${more}]`
  }
  if (o.kind === 'set') return `{${o.items.slice(0, 6).map(it => (isPrim(it) ? primText(it) : '…')).join(', ')}${o.len > 6 ? ', …' : ''}}`
  if (o.kind === 'dict') return `{${o.len} keys}`
  if (o.kind === 'obj') return `${o.cls}(${nodeValue(o)})`
  return o.text || o.kind
}

/* Recursion-tree nodes visible at a given step index. Dunder calls such as
   __init__ are hidden; their children re-attach to the nearest shown ancestor. */
export function visibleCalls(calls, stepIndex) {
  const shownParent = (c) => {
    let p = c.parent
    while (p != null && calls[p]?.hidden) p = calls[p].parent
    return p
  }
  return calls
    .filter(c => c.start <= stepIndex && !c.hidden)
    .map(c => ({ ...c, parent: shownParent(c), done: c.end != null && c.end <= stepIndex }))
}

export function hasRecursion(calls) {
  return calls.some(c => c.parent != null && calls[c.parent]?.name === c.name)
}
