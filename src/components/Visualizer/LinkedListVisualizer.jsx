import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

/* Step shape:
  { nodes: [{id, value, next}], pointers:[{nodeId, label, color}],
    highlighted:[], removed:[], reversed:[], description, codeLine }
*/
const PTR_COLORS = {
  slow: '#4ade80', fast: '#f97316', prev: '#a78bfa', curr: '#fbbf24',
  p1: '#60a5fa', p2: '#f87171', head: '#22d3ee', tail: '#f97316',
}

export default function LinkedListVisualizer({ step }) {
  const { isDark } = useTheme()

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Enter input and click Visualize to start
        </p>
      </div>
    )
  }

  const { nodes = [], pointers = [], highlighted = [], removed = [], reversed = [], description } = step

  // Build pointer map
  const pMap = {}
  for (const p of pointers) {
    if (!pMap[p.nodeId]) pMap[p.nodeId] = []
    pMap[p.nodeId].push(p)
  }

  const getNodeStyle = (id) => {
    if (removed.includes(id))     return { bg: '#F87171', border: '#EF4444', text: '#7f1d1d', opacity: 0.4 }
    if (highlighted.includes(id)) return { bg: '#FCD34D', border: '#F59E0B', text: '#78350f', opacity: 1 }
    return { bg: isDark ? '#374151' : '#E5E7EB', border: isDark ? '#4B5563' : '#D1D5DB', text: isDark ? '#d1d5db' : '#374151', opacity: 1 }
  }

  return (
    <div className="w-full">
      {/* Description */}
      <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium text-center min-h-[2rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`}>
        {description || '—'}
      </div>

      {/* Pointer labels */}
      <div className="flex items-start justify-center gap-2 mb-1 overflow-x-auto px-4">
        {nodes.map(node => (
          <div key={node.id} className="flex flex-col items-center" style={{ minWidth: 56 }}>
            {pMap[node.id]?.map(p => (
              <span key={p.label} className="text-xs font-bold"
                style={{ color: PTR_COLORS[p.label] || p.color || '#60a5fa', fontSize: 10 }}>
                {p.label}
              </span>
            ))}
            {pMap[node.id]?.length > 0 && (
              <div className="w-0.5 h-3" style={{ background: PTR_COLORS[pMap[node.id][0].label] || '#60a5fa' }} />
            )}
          </div>
        ))}
      </div>

      {/* Nodes row */}
      <div className="flex items-center justify-center gap-0 overflow-x-auto px-4 py-2">
        {nodes.map((node, i) => {
          const s = getNodeStyle(node.id)
          const isRev = reversed.includes(node.id)
          return (
            <div key={node.id} className="flex items-center">
              {/* Node box */}
              <motion.div
                animate={{ backgroundColor: s.bg, opacity: s.opacity }}
                transition={{ duration: 0.2 }}
                className="rounded-lg flex flex-col items-center justify-center font-mono font-bold border"
                style={{ width: 48, height: 48, borderColor: s.border, color: s.text,
                  boxShadow: highlighted.includes(node.id) ? `0 0 10px ${s.bg}99` : 'none', fontSize: 13 }}
              >
                {node.value}
                <div className={`text-xs opacity-40 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: 8 }}>
                  id:{node.id}
                </div>
              </motion.div>

              {/* Arrow to next */}
              {i < nodes.length - 1 && (
                <div className="flex items-center" style={{ width: 28 }}>
                  {isRev ? (
                    /* Reversed arrow */
                    <svg width="28" height="16" viewBox="0 0 28 16">
                      <defs><marker id={`rev-${node.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <path d="M6,0 L0,3 L6,6 Z" fill="#a78bfa" />
                      </marker></defs>
                      <line x1="28" y1="8" x2="2" y2="8" stroke="#a78bfa" strokeWidth="1.5"
                        markerEnd={`url(#rev-${node.id})`} />
                    </svg>
                  ) : (
                    /* Forward arrow */
                    <svg width="28" height="16" viewBox="0 0 28 16">
                      <defs><marker id={`fwd-${node.id}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill={isDark ? '#4b5563' : '#94a3b8'} />
                      </marker></defs>
                      <line x1="0" y1="8" x2="26" y2="8"
                        stroke={isDark ? '#4b5563' : '#94a3b8'} strokeWidth="1.5"
                        markerEnd={`url(#fwd-${node.id})`} />
                    </svg>
                  )}
                </div>
              )}
              {/* NULL at end */}
              {i === nodes.length - 1 && node.next === null && (
                <div className="ml-2">
                  <span className={`text-xs font-mono font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    null
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
