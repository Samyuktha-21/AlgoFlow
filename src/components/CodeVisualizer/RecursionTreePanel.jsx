import { visibleCalls } from './analyze'

const MAX_NODES = 150

/* Every function call becomes a node under the call that made it. Nodes on
   the current call chain are blue, finished calls green with their return. */
export default function RecursionTreePanel({ calls, stepIndex, activeCall }) {
  let visible = visibleCalls(calls, stepIndex)
  const clipped = visible.length > MAX_NODES
  if (clipped) visible = visible.slice(0, MAX_NODES)
  if (visible.length === 0) {
    return <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No function calls yet</span>
  }

  const byId = new Map(visible.map(c => [c.id, { ...c, kids: [] }]))
  const roots = []
  for (const c of byId.values()) {
    const parent = c.parent != null ? byId.get(c.parent) : null
    if (parent) parent.kids.push(c)
    else roots.push(c)
  }

  const chain = new Set()
  for (let id = activeCall; id != null; id = calls[id]?.parent) chain.add(id)

  // leaves get consecutive x slots, parents sit centred over their children
  let slot = 0
  let maxDepth = 0
  const place = (n, depth) => {
    n.depth = depth
    maxDepth = Math.max(maxDepth, depth)
    if (n.kids.length === 0) n.x = slot++
    else {
      n.kids.forEach(k => place(k, depth + 1))
      n.x = (n.kids[0].x + n.kids[n.kids.length - 1].x) / 2
    }
  }
  roots.forEach(r => place(r, 0))

  const GX = 92, GY = 70, W = 84, H = 34, PAD = 10
  const width = PAD * 2 + slot * GX
  const height = PAD * 2 + (maxDepth + 1) * GY
  const px = (n) => PAD + n.x * GX + (GX - W) / 2
  const py = (n) => PAD + n.depth * GY

  const nodes = [...byId.values()]
  return (
    <div style={{ overflow: 'auto', maxHeight: 420 }}>
      {clipped && <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6 }}>Showing the first {MAX_NODES} calls</div>}
      <svg width={width} height={height}>
        {nodes.flatMap(n => n.kids.map(k => (
          <line key={`${n.id}-${k.id}`} x1={px(n) + W / 2} y1={py(n) + H} x2={px(k) + W / 2} y2={py(k)} stroke="#334155" strokeWidth={1.5} />
        )))}
        {nodes.map(n => {
          const active = chain.has(n.id)
          const doneColor = n.raised ? '#f43f5e' : '#22c55e'
          const stroke = active ? '#38bdf8' : n.done ? doneColor : '#334155'
          const fill = active ? 'rgba(56,189,248,0.15)' : n.done ? (n.raised ? 'rgba(244,63,94,0.12)' : 'rgba(34,197,94,0.12)') : '#1e293b'
          const label = `${n.name}(${n.args})`
          return (
            <g key={n.id}>
              <title>{label}{n.done ? (n.raised ? ` raised ${n.ret}` : ` → ${n.ret}`) : ''}</title>
              <rect x={px(n)} y={py(n)} width={W} height={H} rx={8} fill={fill} stroke={stroke} strokeWidth={2} />
              <text x={px(n) + W / 2} y={py(n) + 14} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace">
                {label.length > 13 ? label.slice(0, 12) + '…' : label}
              </text>
              <text x={px(n) + W / 2} y={py(n) + 28} textAnchor="middle" fill={n.done ? doneColor : '#94a3b8'} fontSize={10} fontFamily="ui-monospace, monospace">
                {n.done ? `${n.raised ? '✗' : '→'} ${String(n.ret).slice(0, 10)}` : active ? 'running' : ''}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
