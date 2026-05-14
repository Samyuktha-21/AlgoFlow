import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const R = 22   // node radius

/* ─── Constellation node styles ─────────────────── */
const STAR_STATES = {
  current: {
    fill: 'rgba(255,245,157,1)',  stroke: '#FCD34D',
    glow: 'rgba(252,211,77,.9)', glowR: 38,
    text: '#78350F', pulse: true,
  },
  visited: {
    fill: 'rgba(250,219,100,.95)', stroke: '#F59E0B',
    glow: 'rgba(251,191,36,.6)',  glowR: 28,
    text: '#78350F', pulse: false,
  },
  inQueue: {
    fill: 'rgba(147,210,253,.9)',  stroke: '#60A5FA',
    glow: 'rgba(96,165,250,.5)',   glowR: 30,
    text: '#1E3A8A', pulse: false,
  },
  default: {
    fill: 'rgba(30,58,95,.8)',     stroke: 'rgba(96,165,250,.5)',
    glow: 'rgba(96,165,250,.15)',  glowR: 26,
    text: '#BAE6FD', pulse: false,
  },
}

function StarNode({ node, state }) {
  const s = STAR_STATES[state]

  return (
    <g>
      {/* Outer glow halo */}
      <circle cx={node.x} cy={node.y} r={s.glowR}
        fill={s.glow} style={{ filter: 'blur(6px)' }} opacity={0.9} />

      {/* Pulse rings for current */}
      {s.pulse && <>
        <circle cx={node.x} cy={node.y} r={R + 8}
          fill="none" stroke="rgba(252,211,77,.35)" strokeWidth={1.5}
          style={{ animation: 'ripple-out 1.6s ease-out infinite' }} />
        <circle cx={node.x} cy={node.y} r={R + 14}
          fill="none" stroke="rgba(252,211,77,.15)" strokeWidth={1}
          style={{ animation: 'ripple-out 1.6s ease-out .4s infinite' }} />
      </>}

      {/* Queue dashed ring */}
      {state === 'inQueue' && (
        <circle cx={node.x} cy={node.y} r={R + 6}
          fill="none" stroke="rgba(96,165,250,.6)" strokeWidth={1.2}
          strokeDasharray="3,3"
          style={{ animation: 'spin-slow 4s linear infinite' }} />
      )}

      {/* Star core */}
      <circle cx={node.x} cy={node.y} r={R}
        fill={s.fill} stroke={s.stroke} strokeWidth={2} />

      {/* Inner highlight */}
      <circle cx={node.x - R * 0.3} cy={node.y - R * 0.3} r={R * 0.22}
        fill="rgba(255,255,255,.25)" />

      {/* Label */}
      <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central"
        fill={s.text} fontSize={12} fontWeight="bold" fontFamily="monospace">
        {node.label}
      </text>
    </g>
  )
}

function ConstellationEdge({ from, to, isTraversed, isActive }) {
  const color = isTraversed ? '#38BDF8' : 'rgba(96,165,250,.2)'
  const w = isTraversed ? 1.8 : 0.8

  return (
    <g>
      {/* Glow layer for traversed */}
      {isTraversed && (
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
          stroke="rgba(56,189,248,.35)" strokeWidth={6}
          style={{ filter: 'blur(3px)' }} />
      )}
      {/* Main line */}
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={color} strokeWidth={w}
        strokeDasharray={isTraversed ? 'none' : '3,5'} />
      {/* Edge weight if present */}
      {from.weight !== undefined && (
        <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
          textAnchor="middle" fill="rgba(96,165,250,.7)" fontSize={9}>
          {from.weight}
        </text>
      )}
    </g>
  )
}

export default function GraphVisualizer({ step, themeId }) {
  const { isDark } = useTheme()
  const isSpace = themeId === 'network' || !themeId

  if (!step) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: isSpace ? 'rgba(96,165,250,.5)' : isDark ? '#6b7280' : '#9ca3af', fontSize: 14 }}>
          Click Visualize to start traversal
        </p>
      </div>
    )
  }

  const { nodes, edges, visited = [], current, queue = [], description, distances } = step

  const getState = (id) => {
    if (current === id)       return 'current'
    if (visited.includes(id)) return 'visited'
    if (queue.includes(id))   return 'inQueue'
    return 'default'
  }

  const W = 560, H = 310

  return (
    <div className="w-full">
      {/* Description */}
      <div className="mb-3 px-4 py-2.5 rounded-lg font-medium text-center min-h-[2.5rem] flex items-center justify-center"
        style={isSpace ? {
          background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(96,165,250,.2)', color: 'rgba(186,230,253,.9)', fontSize: 15,
        } : { background: isDark ? 'rgba(31,41,55,.6)' : 'rgba(255,255,255,.7)', color: isDark ? '#d1d5db' : '#374151', fontSize: 15 }}>
        {description || '—'}
      </div>

      {/* SVG */}
      <div className="flex justify-center overflow-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full">
          <defs>
            <filter id="star-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const fn = nodes.find(n => n.id === edge.from)
            const tn = nodes.find(n => n.id === edge.to)
            if (!fn || !tn) return null
            const trav = visited.includes(edge.from) && visited.includes(edge.to)
            return <ConstellationEdge key={i} from={{ ...fn, weight: edge.weight }}
              to={tn} isTraversed={trav} isActive={current === edge.from || current === edge.to} />
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <StarNode key={node.id} node={node} state={getState(node.id)} />
          ))}

          {/* Distances overlay (Dijkstra) */}
          {distances && nodes.map(node => {
            const d = distances[node.id]
            if (d === undefined || d === Infinity) return null
            return (
              <text key={`d-${node.id}`} x={node.x} y={node.y + R + 14}
                textAnchor="middle" fill="rgba(251,191,36,.8)" fontSize={9} fontFamily="monospace">
                d={d}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Queue / Stack display */}
      <div className="mt-3 flex items-center gap-2 justify-center flex-wrap">
        <span style={{ color: isSpace ? 'rgba(96,165,250,.6)' : isDark ? '#6b7280' : '#6b7280',
          fontSize: 11, fontWeight: 600 }}>
          {queue.length > 0 ? 'Queue/Stack:' : ''}
        </span>
        {queue.length === 0
          ? <span style={{ color: isSpace ? 'rgba(96,165,250,.35)' : '#9ca3af', fontSize: 11 }}>empty</span>
          : <>
              <span style={{ color: 'rgba(96,165,250,.4)', fontSize: 11 }}>←</span>
              {queue.map((id, i) => (
                <motion.div key={`${id}-${i}`}
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                  style={{ background: 'rgba(96,165,250,.25)', border: '1px solid rgba(96,165,250,.5)', color: '#BAE6FD' }}>
                  {id}
                </motion.div>
              ))}
              <span style={{ color: 'rgba(96,165,250,.4)', fontSize: 11 }}>→</span>
            </>
        }
      </div>

      {/* Visited trail */}
      {visited.length > 0 && (
        <div className="mt-2 flex items-center gap-2 justify-center flex-wrap">
          <span style={{ color: isSpace ? 'rgba(96,165,250,.6)' : isDark ? '#6b7280' : '#6b7280', fontSize: 11, fontWeight: 600 }}>
            Visited:
          </span>
          <span style={{ color: isSpace ? 'rgba(251,191,36,.8)' : isDark ? '#34d399' : '#059669', fontSize: 11, fontFamily: 'monospace' }}>
            {visited.join(' → ')}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 px-4">
        {[
          { label: 'Star',    s: STAR_STATES.default },
          { label: 'Queued',  s: STAR_STATES.inQueue },
          { label: 'Active',  s: STAR_STATES.current },
          { label: 'Visited', s: STAR_STATES.visited },
        ].map(({ label, s }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full" style={{ background: s.fill, border: `2px solid ${s.stroke}` }} />
            <span style={{ fontSize: 11, color: isSpace ? 'rgba(186,230,253,.6)' : isDark ? '#9ca3af' : '#6b7280' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
