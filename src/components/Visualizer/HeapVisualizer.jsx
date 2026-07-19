import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const NODE_R = 22

function heapLayout(size, W = 520) {
  const positions = {}
  if (size === 0) return positions
  for (let i = 0; i < size; i++) {
    const depth = Math.floor(Math.log2(i + 1))
    const nodesInLevel = Math.pow(2, depth)
    const posInLevel   = i - (nodesInLevel - 1)
    const x = (posInLevel + 0.5) * (W / nodesInLevel)
    const y = NODE_R + depth * 70
    positions[i] = { x, y }
  }
  return positions
}

export default function HeapVisualizer({ step }) {
  const { isDark } = useTheme()

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Enter input and click Visualize</p>
      </div>
    )
  }

  const { array = [], heapSize, comparing = [], swapping = [], sorted = [], description } = step
  const size  = heapSize ?? array.length
  const W     = 520
  const H     = (Math.floor(Math.log2(size)) + 1) * 70 + 50

  const positions = heapLayout(size, W)

  const getCellStyle = (i) => {
    if (sorted.includes(i))    return { fill: '#34D399', stroke: '#10B981', text: '#064e3b' }
    if (swapping.includes(i))  return { fill: '#F87171', stroke: '#EF4444', text: '#7f1d1d' }
    if (comparing.includes(i)) return { fill: '#FCD34D', stroke: '#F59E0B', text: '#78350f' }
    return { fill: isDark ? '#374151' : '#E5E7EB', stroke: isDark ? '#4B5563' : '#9CA3AF', text: isDark ? '#d1d5db' : '#374151' }
  }

  const cellW = Math.max(30, Math.min(52, Math.floor(500 / array.length) - 4))

  return (
    <div className="w-full">
      <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium text-center min-h-[2rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`}>
        {description || '—'}
      </div>

      {/* Array representation */}
      <div className="flex flex-col items-center mb-4">
        <span className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Array</span>
        <div className="flex gap-1">
          {array.map((val, i) => {
            const s = getCellStyle(i)
            const inactive = i >= size
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-mono opacity-40" style={{ fontSize: 9 }}>{i}</span>
                <motion.div
                  animate={{ backgroundColor: inactive ? (isDark ? '#1f2937' : '#f9fafb') : s.fill }}
                  transition={{ duration: 0.2 }}
                  className="rounded flex items-center justify-center font-mono font-bold border"
                  style={{ width: cellW, height: cellW, opacity: inactive ? 0.3 : 1,
                    borderColor: inactive ? (isDark ? '#374151' : '#e5e7eb') : s.stroke,
                    color: inactive ? (isDark ? '#4b5563' : '#9ca3af') : s.text,
                    fontSize: cellW < 40 ? 11 : 13 }}
                >
                  {val}
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tree representation */}
      <div className="flex flex-col items-center">
        <span className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Heap Tree (first {size} elements)</span>
        <div className="overflow-auto">
          <svg width={W} height={Math.max(H, 80)} viewBox={`0 0 ${W} ${Math.max(H, 80)}`} className="max-w-full">
            {/* Edges */}
            {Array.from({ length: size }, (_, i) => {
              const left  = 2 * i + 1
              const right = 2 * i + 2
              return [left, right].filter(c => c < size).map(c => {
                const f = positions[i], t = positions[c]
                if (!f || !t) return null
                return <line key={`${i}-${c}`} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                  stroke={isDark ? '#374151' : '#D1D5DB'} strokeWidth={1.5} />
              })
            }).flat()}

            {/* Nodes */}
            {Array.from({ length: size }, (_, i) => {
              const pos = positions[i]
              if (!pos) return null
              const s = getCellStyle(i)
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r={NODE_R} fill={s.fill} stroke={s.stroke} strokeWidth={2} />
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                    fill={s.text} fontSize={12} fontWeight="bold" fontFamily="monospace">
                    {array[i]}
                  </text>
                  <text x={pos.x} y={pos.y + NODE_R + 10} textAnchor="middle"
                    fill={isDark ? '#4b5563' : '#9ca3af'} fontSize={9} fontFamily="monospace">
                    [{i}]
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
