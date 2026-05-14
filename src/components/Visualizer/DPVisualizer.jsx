import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

/* Renders a 1-D or 2-D DP table.
   Step shape (1-D):  { dp, current, computed, description, codeLine, extra }
   Step shape (2-D):  { dp2d, rows, cols, cell, computed2d, description, codeLine, extra } */
export default function DPVisualizer({ step }) {
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

  const { description, extra, dp, current: cur1, computed, dp2d, rows, cols, cell, computed2d } = step
  const is2D = !!dp2d

  return (
    <div className="w-full overflow-auto">
      {/* Description */}
      <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium text-center min-h-[2rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`}>
        {description || '—'}
      </div>

      {/* Extra values */}
      {extra && Object.keys(extra).length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-3">
          {Object.entries(extra).map(([k, v]) => (
            <div key={k} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
              isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
            }`}>
              <span className="opacity-60">{k}: </span>
              <span className="text-blue-400 font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {is2D ? (
        /* ── 2-D table ── */
        <div className="overflow-auto max-h-64">
          <table className="mx-auto border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className={`w-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>—</th>
                {cols?.map((c, j) => (
                  <th key={j} className={`w-10 text-center font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dp2d.map((row, i) => (
                <tr key={i}>
                  <td className={`text-center font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rows?.[i] ?? i}</td>
                  {row.map((val, j) => {
                    const isCurrent = cell?.row === i && cell?.col === j
                    const isDone    = computed2d?.[i]?.[j]
                    return (
                      <td key={j} className="p-0">
                        <motion.div
                          animate={{
                            backgroundColor: isCurrent ? '#FCD34D' : isDone ? (isDark ? '#1e3a5f' : '#dbeafe') : (isDark ? '#374151' : '#f9fafb'),
                          }}
                          transition={{ duration: 0.2 }}
                          className="w-10 h-8 flex items-center justify-center rounded border mx-0.5 my-0.5 font-bold"
                          style={{
                            borderColor: isCurrent ? '#F59E0B' : isDone ? '#60a5fa' : (isDark ? '#4b5563' : '#e5e7eb'),
                            color: isCurrent ? '#78350f' : isDone ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#6b7280' : '#9ca3af'),
                            boxShadow: isCurrent ? '0 0 8px rgba(252,211,77,.5)' : 'none',
                            fontSize: 11,
                          }}
                        >
                          {val !== null && val !== undefined ? val : '—'}
                        </motion.div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── 1-D array ── */
        <div className="flex flex-col items-center gap-2">
          {/* Index labels */}
          <div className="flex gap-1">
            {(dp || []).map((_, i) => (
              <div key={i} className={`w-10 text-center text-xs font-mono opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {i}
              </div>
            ))}
          </div>
          {/* DP cells */}
          <div className="flex gap-1">
            {(dp || []).map((val, i) => {
              const isCur  = cur1 === i
              const isDone = computed?.[i]
              return (
                <motion.div key={i}
                  animate={{
                    backgroundColor: isCur ? '#FCD34D' : isDone ? (isDark ? '#1e3a5f' : '#dbeafe') : (isDark ? '#374151' : '#f9fafb'),
                  }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border font-mono font-bold text-sm"
                  style={{
                    borderColor: isCur ? '#F59E0B' : isDone ? '#60a5fa' : (isDark ? '#4b5563' : '#e5e7eb'),
                    color: isCur ? '#78350f' : isDone ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#6b7280' : '#9ca3af'),
                    boxShadow: isCur ? '0 0 8px rgba(252,211,77,.5)' : 'none',
                    fontSize: 12,
                  }}
                >
                  {val !== null && val !== undefined ? val : '?'}
                </motion.div>
              )
            })}
          </div>
          {/* dp[i] label */}
          <div className="flex gap-1">
            {(dp || []).map((_, i) => (
              <div key={i} className={`w-10 text-center text-xs font-mono opacity-40 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                dp[{i}]
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {[
          { label: 'Not computed', bg: '#F9FAFB', b: '#E5E7EB' },
          { label: 'Computed',     bg: '#DBEAFE', b: '#60A5FA' },
          { label: 'Current cell', bg: '#FCD34D', b: '#F59E0B' },
        ].map(it => (
          <div key={it.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: it.bg, border: `1px solid ${it.b}` }} />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
