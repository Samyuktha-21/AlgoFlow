import { useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext'

/* Step shape:
  { nodes:[{id,value,left,right,parent}], visited:[], current, highlighted:[],
    traversalOrder:[], description, codeLine, extra }
  Nodes can also be passed as a flat tree via `root` (the id of the root).
*/
const NODE_R = 22

function buildLayout(nodes) {
  if (!nodes || nodes.length === 0) return {}
  // Find root (node with no parent or parent=-1)
  const root = nodes.find(n => n.parent == null || n.parent === -1) || nodes[0]
  const childMap = {}
  for (const n of nodes) {
    if (n.parent != null && n.parent !== -1) {
      if (!childMap[n.parent]) childMap[n.parent] = []
      childMap[n.parent].push(n.id)
    }
  }

  const positions = {}
  let counter = 0
  // DFS in-order traversal for x-position
  const inorder = (id) => {
    const node = nodes.find(n => n.id === id)
    if (!node) return
    const children = childMap[id] || []
    if (node.left !== undefined && node.left !== null) inorder(node.left)
    else if (children[0] !== undefined) inorder(children[0])
    positions[id] = { col: counter++ }
    if (node.right !== undefined && node.right !== null) inorder(node.right)
    else if (children[1] !== undefined) inorder(children[1])
  }
  inorder(root.id)

  // Assign y based on depth
  const depths = {}
  const bfs = (id, d) => {
    if (id == null) return
    depths[id] = d
    const node = nodes.find(n => n.id === id)
    if (!node) return
    if (node.left != null)  bfs(node.left,  d + 1)
    if (node.right != null) bfs(node.right, d + 1)
    const children = childMap[id] || []
    for (const c of children) bfs(c, d + 1)
  }
  bfs(root.id, 0)
  const maxDepth = Math.max(...Object.values(depths), 0)
  const maxCol   = Math.max(...Object.values(positions).map(p => p.col), 0)

  const W = Math.max(520, (maxCol + 1) * 60)
  const H = (maxDepth + 1) * 80 + 20

  for (const [id, pos] of Object.entries(positions)) {
    const x = ((pos.col + 0.5) / (maxCol + 1)) * W
    const y = NODE_R + depths[id] * 80
    positions[id] = { x, y }
  }

  return { positions, W, H }
}

const NODE_COLORS = {
  current:  { fill: '#FCD34D', stroke: '#F59E0B', text: '#78350f' },
  visited:  { fill: '#34D399', stroke: '#10B981', text: '#064e3b' },
  highlighted: { fill: '#60A5FA', stroke: '#3B82F6', text: '#1e3a8a' },
  default:  { fill: null,     stroke: null,     text: null },
}

export default function TreeVisualizer({ step }) {
  const { isDark } = useTheme()

  const { positions, W, H } = useMemo(() => {
    if (!step?.nodes) return { positions: {}, W: 520, H: 200 }
    return buildLayout(step.nodes)
  }, [step?.nodes])

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Enter input and click Visualize</p>
      </div>
    )
  }

  const { nodes = [], visited = [], current, highlighted = [], description, traversalOrder = [] } = step

  const getStyle = (id) => {
    if (current === id)           return NODE_COLORS.current
    if (visited.includes(id))     return NODE_COLORS.visited
    if (highlighted.includes(id)) return NODE_COLORS.highlighted
    return NODE_COLORS.default
  }

  // Build edge list
  const edges = []
  for (const n of nodes) {
    if (n.left  != null && positions[n.left])  edges.push({ from: n.id, to: n.left })
    if (n.right != null && positions[n.right]) edges.push({ from: n.id, to: n.right })
  }

  return (
    <div className="w-full">
      <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium text-center min-h-[2rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`}>
        {description || '—'}
      </div>

      <div className="overflow-auto flex justify-center">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full">
          {/* Edges */}
          {edges.map((e, i) => {
            const f = positions[e.from], t = positions[e.to]
            if (!f || !t) return null
            const isTraversed = visited.includes(e.from) && visited.includes(e.to)
            return (
              <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                stroke={isTraversed ? '#34D399' : (isDark ? '#374151' : '#D1D5DB')}
                strokeWidth={isTraversed ? 2 : 1.5} />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const pos = positions[node.id]
            if (!pos) return null
            const s = getStyle(node.id)
            const fill   = s.fill   ?? (isDark ? '#374151' : '#E5E7EB')
            const stroke = s.stroke ?? (isDark ? '#4B5563' : '#9CA3AF')
            const text   = s.text   ?? (isDark ? '#d1d5db' : '#374151')
            return (
              <g key={node.id}>
                {current === node.id && (
                  <circle cx={pos.x} cy={pos.y} r={NODE_R + 6} fill="none" stroke="#FCD34D" strokeWidth={2} opacity={0.4}
                    className="anim-ripple" />
                )}
                <circle cx={pos.x} cy={pos.y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={2.5} />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                  fill={text} fontSize={12} fontWeight="bold" fontFamily="monospace">
                  {node.value}
                </text>
                {/* Balance factor badge for AVL tree */}
                {node.bf !== undefined && (
                  <text x={pos.x + NODE_R + 2} y={pos.y - NODE_R - 2} textAnchor="middle" fontSize={9} fontWeight="bold"
                    fill={Math.abs(node.bf) > 1 ? '#f87171' : node.bf === 0 ? '#34d399' : '#fbbf24'}>
                    BF:{node.bf}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {traversalOrder.length > 0 && (
        <div className="flex items-center gap-2 justify-center flex-wrap mt-2">
          <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Order:</span>
          <span className={`text-xs font-mono ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            {traversalOrder.join(' → ')}
          </span>
        </div>
      )}
    </div>
  )
}
