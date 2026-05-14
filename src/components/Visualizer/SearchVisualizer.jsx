import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function SearchVisualizer({ step }) {
  const { isDark } = useTheme()

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Enter a sorted array and target, then click Visualize
        </p>
      </div>
    )
  }

  const { array, low, high, mid, found, eliminated = [], target, description } = step

  const getState = (idx) => {
    if (found >= 0 && idx === found)    return 'found'
    if (found === -2 || eliminated?.includes(idx)) return 'eliminated'
    if (idx === mid)                     return 'mid'
    if (idx === low)                     return 'low'
    if (idx === high)                    return 'high'
    if (low >= 0 && idx >= low && idx <= high) return 'active'
    return 'default'
  }

  const stateStyle = {
    found:      { bg: '#34D399', border: '#10B981', text: '#065F46', label: 'FOUND' },
    eliminated: { bg: '#F3F4F6', border: '#E5E7EB', text: '#9CA3AF', label: ''      },
    mid:        { bg: '#FCD34D', border: '#F59E0B', text: '#78350F', label: 'MID'   },
    low:        { bg: '#60A5FA', border: '#3B82F6', text: '#1E3A8A', label: 'LOW'   },
    high:       { bg: '#F87171', border: '#EF4444', text: '#7F1D1D', label: 'HIGH'  },
    active:     { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF', label: ''      },
    default:    { bg: '#E5E7EB', border: '#D1D5DB', text: '#6B7280', label: ''      },
  }

  const cellSize = Math.max(38, Math.min(64, Math.floor(560 / array.length) - 6))

  return (
    <div className="w-full">
      {/* Target display */}
      <div className="flex justify-center mb-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
          isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
        }`}>
          🔦 Searching for:
          <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded font-bold font-mono">
            {target}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className={`mb-4 px-4 py-2.5 rounded-lg font-medium text-center min-h-[2.5rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`} style={{ fontSize: 15 }}>
        {description || '—'}
      </div>

      {/* Array cells */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 py-4 px-4">
        {array.map((val, idx) => {
          const state = getState(idx)
          const style = stateStyle[state]
          const isNotFound = found === -2

          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              {/* Index */}
              <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {idx}
              </span>

              {/* Cell */}
              <motion.div
                animate={{
                  backgroundColor: isDark && state === 'eliminated' ? '#374151' : style.bg,
                  borderColor: style.border,
                  scale: state === 'mid' || state === 'found' ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="rounded-lg flex items-center justify-center font-mono font-bold relative"
                style={{
                  width: cellSize,
                  height: cellSize,
                  border: `2px solid ${style.border}`,
                  boxShadow: (state === 'mid' || state === 'found') ? `0 0 12px ${style.bg}bb` : 'none',
                  opacity: state === 'eliminated' ? 0.35 : 1,
                  color: isDark && state === 'eliminated' ? '#6B7280' : style.text,
                  fontSize: cellSize >= 58 ? 22 : cellSize >= 48 ? 18 : cellSize >= 38 ? 15 : 12,
                }}
              >
                {val}
                {/* State badge */}
                {style.label && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <span className={`text-xs px-1 py-0.5 rounded font-bold whitespace-nowrap ${
                      state === 'found'
                        ? 'bg-green-500 text-white'
                        : state === 'mid'
                          ? 'bg-yellow-400 text-yellow-900'
                          : state === 'low'
                            ? 'bg-blue-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}>
                      {style.label}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Range indicators */}
      {low >= 0 && high >= 0 && found === -1 && (
        <div className={`mt-2 text-xs text-center font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Search range: [{low} … {high}]  {mid >= 0 ? `| mid = ${mid}` : ''}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 px-4">
        {[
          { label: 'Search range', color: '#DBEAFE', border: '#93C5FD' },
          { label: 'Low',   color: '#60A5FA', border: '#3B82F6' },
          { label: 'Mid',   color: '#FCD34D', border: '#F59E0B' },
          { label: 'High',  color: '#F87171', border: '#EF4444' },
          { label: 'Found', color: '#34D399', border: '#10B981' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: item.color, border: `1px solid ${item.border}` }} />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
