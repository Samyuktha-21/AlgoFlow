/* Drawings for each detected structure. Stage is always dark (like the main
   visualizer stage), so colours here are fixed rather than theme vars. */

const C = {
  cell: '#1e293b',
  cellBorder: '#334155',
  text: '#e2e8f0',
  muted: '#94a3b8',
  accent: '#38bdf8',
  changed: '#f59e0b',
  visited: '#22c55e',
  current: '#f43f5e',
  label: '#a78bfa',
}

function Card({ title, kind, note, children }) {
  return (
    <div style={{ background: '#0b1220', border: `1px solid ${C.cellBorder}`, borderRadius: 12, padding: 12, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: C.text, fontSize: 14 }}>{title}</span>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: C.muted }}>{kind}</span>
        {note && <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>{note}</span>}
      </div>
      <div style={{ overflowX: 'auto' }}>{children}</div>
    </div>
  )
}

const cellStyle = (hot, pointed = false) => ({
  minWidth: 40, height: 40, padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: hot ? 'rgba(245,158,11,0.18)' : pointed ? 'rgba(56,189,248,0.12)' : C.cell,
  border: `2px solid ${hot ? C.changed : pointed ? C.accent : C.cellBorder}`,
  borderRadius: 8, color: C.text, fontFamily: 'ui-monospace, monospace', fontSize: 14, fontWeight: 600,
  transition: 'all 0.25s ease',
})

const truncatedNote = (shown, len) => (len > shown ? `showing ${shown} of ${len}` : null)

function ArrayView({ v }) {
  const changed = new Set(v.changed)
  return (
    <Card title={v.title} kind="array" note={truncatedNote(v.items.length, v.len)}>
      {v.items.length === 0 ? <Empty /> : (
        <div style={{ display: 'flex', gap: 6, paddingBottom: 4 }}>
          {v.items.map((it, i) => {
            const ptrs = v.pointers.filter(p => p.index === i)
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={cellStyle(changed.has(i), ptrs.length > 0)}>{it}</div>
                <span style={{ fontSize: 10, color: C.muted }}>{i}</span>
                <div style={{ minHeight: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {ptrs.map(p => (
                    <span key={p.name} style={{ fontSize: 11, fontWeight: 700, color: C.accent, fontFamily: 'ui-monospace, monospace', lineHeight: 1.2 }}>
                      ↑{p.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function StackView({ v }) {
  const changed = new Set(v.changed)
  return (
    <Card title={v.title} kind="stack" note={truncatedNote(v.items.length, v.len)}>
      <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 4, minWidth: 120 }}>
        <div style={{ width: 120, height: 3, background: C.cellBorder, borderRadius: 2 }} />
        {v.items.length === 0 && <Empty />}
        {v.items.map((it, i) => (
          <div key={i} style={{ ...cellStyle(changed.has(i)), width: 120, position: 'relative' }}>
            {it}
            {i === v.items.length - 1 && (
              <span style={{ position: 'absolute', right: -44, fontSize: 11, color: C.accent, fontWeight: 700 }}>← top</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function QueueView({ v }) {
  const changed = new Set(v.changed)
  return (
    <Card title={v.title} kind="queue" note={truncatedNote(v.items.length, v.len)}>
      {v.items.length === 0 ? <Empty /> : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>front →</span>
          {v.items.map((it, i) => <div key={i} style={cellStyle(changed.has(i))}>{it}</div>)}
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>← rear</span>
        </div>
      )}
    </Card>
  )
}

function GridView({ v }) {
  const head = (on) => ({ fontSize: 10, color: on ? C.accent : C.muted, fontWeight: on ? 700 : 500, paddingRight: 4 })
  return (
    <Card title={v.title} kind="grid">
      <table style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
        <thead>
          <tr>
            <th />
            {v.rows[0]?.cells.map((_, j) => <th key={j} style={head(j === v.col)}>{j}</th>)}
          </tr>
        </thead>
        <tbody>
          {v.rows.map((row, i) => {
            const changed = new Set(row.changed)
            return (
              <tr key={i}>
                <td style={head(i === v.row)}>{i}</td>
                {row.cells.map((c, j) => (
                  <td key={j} style={{ ...cellStyle(changed.has(j), i === v.row && (v.col == null || j === v.col)), display: 'table-cell', textAlign: 'center', minWidth: 34, height: 32, fontSize: 13 }}>{c}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

function layoutTree(root) {
  const nodes = []
  const edges = []
  let x = 0
  let maxDepth = 0
  const visit = (n, depth) => {
    if (!n) return
    maxDepth = Math.max(maxDepth, depth)
    visit(n.left, depth + 1)
    const me = { ...n, x: x++, depth }
    nodes.push(me)
    visit(n.right, depth + 1)
    if (n.left) edges.push([n.ref, n.left.ref])
    if (n.right) edges.push([n.ref, n.right.ref])
  }
  visit(root, 0)
  return { nodes, edges, width: x, height: maxDepth + 1 }
}

function TreeView({ v }) {
  const { nodes, edges, width, height } = layoutTree(v.tree)
  const GX = 52, GY = 64, R = 19, PAD = 28
  const pos = new Map(nodes.map(n => [n.ref, { x: PAD + n.x * GX, y: PAD + n.depth * GY }]))
  const W = PAD * 2 + (width - 1) * GX
  const H = PAD * 2 + (height - 1) * GY + 14
  return (
    <Card title={v.title} kind="binary tree" note={`${nodes.length} nodes`}>
      <svg width={Math.max(W, 120)} height={H}>
        {edges.map(([a, b]) => {
          const p = pos.get(a), q = pos.get(b)
          return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.cellBorder} strokeWidth={2} />
        })}
        {nodes.map(n => {
          const p = pos.get(n.ref)
          const hot = n.labels.length > 0
          return (
            <g key={n.ref} style={{ transition: 'all 0.3s' }}>
              <circle cx={p.x} cy={p.y} r={R} fill={hot ? 'rgba(56,189,248,0.2)' : C.cell} stroke={hot ? C.accent : C.cellBorder} strokeWidth={2} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fill={C.text} fontSize={13} fontWeight={700} fontFamily="ui-monospace, monospace">{String(n.value).slice(0, 4)}</text>
              {hot && (
                <text x={p.x} y={p.y + R + 13} textAnchor="middle" fill={C.label} fontSize={10} fontWeight={700}>{n.labels.join(',')}</text>
              )}
            </g>
          )
        })}
      </svg>
    </Card>
  )
}

function LinkedView({ v }) {
  return (
    <Card title={v.title} kind="linked list" note={v.cycleTo != null ? 'cycle detected' : null}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flexWrap: 'wrap', rowGap: 8 }}>
        {v.nodes.map((n, i) => (
          <div key={n.ref} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', border: `2px solid ${n.labels.length ? C.accent : C.cellBorder}`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ ...cellStyle(false), border: 'none', borderRadius: 0, background: n.labels.length ? 'rgba(56,189,248,0.18)' : C.cell }}>{n.value}</div>
                <div style={{ width: 14, background: '#0f172a', borderLeft: `1px solid ${C.cellBorder}` }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.label, minHeight: 13 }}>{n.labels.join(', ')}</span>
            </div>
            <span style={{ color: C.muted, fontSize: 18, margin: '8px 4px 0' }}>→</span>
            {i === v.nodes.length - 1 && (
              <span style={{ color: v.cycleTo != null ? C.current : C.muted, fontSize: 12, fontWeight: 700, marginTop: 12 }}>
                {v.cycleTo != null ? `back to ${v.nodes.find(x => x.ref === v.cycleTo)?.value}` : 'None'}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GraphView({ v }) {
  const n = v.nodes.length
  const R = 18
  const radius = Math.max(70, n * 14)
  const size = radius * 2 + R * 2 + 30
  const cx = size / 2, cy = size / 2
  const pos = new Map(v.nodes.map((node, i) => {
    const a = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2
    return [node.id, { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }]
  }))
  return (
    <Card title={v.title} kind={v.directed ? 'directed graph' : 'graph'} note={`${n} nodes · ${v.edges.length} edges`}>
      <svg width={size} height={size}>
        <defs>
          <marker id="cv-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={C.muted} />
          </marker>
        </defs>
        {v.edges.map((e, i) => {
          const p = pos.get(e.from), q = pos.get(e.to)
          if (!p || !q) return null
          if (e.from === e.to) return <circle key={i} cx={p.x} cy={p.y - R} r={10} fill="none" stroke={C.cellBorder} strokeWidth={2} />
          const dx = q.x - p.x, dy = q.y - p.y
          const len = Math.hypot(dx, dy) || 1
          const ex = q.x - (dx / len) * (R + 2), ey = q.y - (dy / len) * (R + 2)
          return (
            <g key={i}>
              <line x1={p.x} y1={p.y} x2={ex} y2={ey} stroke={C.cellBorder} strokeWidth={2} markerEnd={v.directed ? 'url(#cv-arrow)' : undefined} />
              {e.w != null && (
                <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 4} fill={C.changed} fontSize={11} fontWeight={700} textAnchor="middle">{e.w}</text>
              )}
            </g>
          )
        })}
        {v.nodes.map(node => {
          const p = pos.get(node.id)
          const cur = v.current.has(node.id)
          const exp = !cur && v.exploring.has(node.id)
          const vis = v.visited.has(node.id)
          const stroke = cur ? C.current : exp ? C.changed : vis ? C.visited : C.cellBorder
          const fill = cur ? 'rgba(244,63,94,0.2)' : exp ? 'rgba(245,158,11,0.18)' : vis ? 'rgba(34,197,94,0.18)' : C.cell
          return (
            <g key={node.id}>
              <circle cx={p.x} cy={p.y} r={R} fill={fill} stroke={stroke} strokeWidth={2.5} style={{ transition: 'all 0.3s' }} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace">{node.id.slice(0, 4)}</text>
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.muted, marginTop: 4 }}>
        <span><b style={{ color: C.current }}>●</b> current</span>
        <span><b style={{ color: C.changed }}>●</b> neighbour</span>
        <span><b style={{ color: C.visited }}>●</b> visited</span>
      </div>
    </Card>
  )
}

function KeyValueTable({ rows }) {
  if (rows.length === 0) return <Empty />
  return (
    <table style={{ borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>
      <tbody>
        {rows.map(([k, val], i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.cellBorder}` }}>
            <td style={{ padding: '4px 12px 4px 4px', color: C.accent, fontWeight: 700 }}>{k}</td>
            <td style={{ padding: '4px', color: C.text }}>{val}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DictView({ v }) {
  return (
    <Card title={v.title} kind="dict" note={truncatedNote(v.rows.length, v.len)}>
      <KeyValueTable rows={v.rows} />
    </Card>
  )
}

function SetView({ v }) {
  return (
    <Card title={v.title} kind="set" note={truncatedNote(v.items.length, v.len)}>
      {v.items.length === 0 ? <Empty /> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {v.items.map((it, i) => (
            <span key={i} style={{ padding: '4px 10px', borderRadius: 999, background: C.cell, border: `1px solid ${C.cellBorder}`, color: C.text, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>{it}</span>
          ))}
        </div>
      )}
    </Card>
  )
}

function ObjectView({ v }) {
  return (
    <Card title={v.title} kind={v.cls}>
      <KeyValueTable rows={v.fields} />
    </Card>
  )
}

function Empty() {
  return <span style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>empty</span>
}

const VIEWS = {
  array: ArrayView, stack: StackView, queue: QueueView, grid: GridView, tree: TreeView,
  linked: LinkedView, graph: GraphView, dict: DictView, set: SetView, object: ObjectView,
}

export default function StructureView({ view }) {
  const V = VIEWS[view.type]
  return V ? <V v={view} /> : null
}
