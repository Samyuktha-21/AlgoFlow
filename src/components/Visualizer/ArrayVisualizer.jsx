import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const POINTER_COLORS = {
  i: '#60a5fa', j: '#f87171', k: '#22d3ee', left: '#60a5fa', right: '#f87171',
  slow: '#4ade80', fast: '#f97316', prev: '#a78bfa', curr: '#fbbf24',
  lo: '#60a5fa', mid: '#fcd34d', hi: '#f87171', target: '#fbbf24',
  window: '#34d399', candidate: '#a78bfa', max: '#34d399', min: '#f87171',
}

function cellBg(idx, step) {
  const { comparing=[], swapping=[], sorted=[], highlight=[], window, current, partition } = step
  if (sorted?.includes(idx))    return { bg: '#34D399', border: '#10B981', text: '#064e3b' }
  if (swapping?.includes(idx))  return { bg: '#F87171', border: '#EF4444', text: '#7f1d1d' }
  if (comparing?.includes(idx)) return { bg: '#FCD34D', border: '#F59E0B', text: '#78350f' }
  if (current === idx)          return { bg: '#60A5FA', border: '#3B82F6', text: '#1e3a8a' }
  if (highlight?.includes(idx)) return { bg: '#A78BFA', border: '#8B5CF6', text: '#2e1065' }
  if (window && idx >= window.start && idx <= window.end)
                                 return { bg: '#6EE7B7', border: '#34D399', text: '#065f46' }
  if (partition?.low === idx)   return { bg: '#93C5FD', border: '#3B82F6', text: '#1e3a8a' }
  if (partition?.high === idx)  return { bg: '#FCA5A5', border: '#EF4444', text: '#7f1d1d' }
  return null
}

export default function ArrayVisualizer({ step }) {
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

  const { array, array2, array2Label, pointers = [], description, extra } = step
  const cellW = Math.max(34, Math.min(58, Math.floor(540 / array.length) - 5))

  const ptrMap = {}
  for (const p of pointers) {
    if (!ptrMap[p.index]) ptrMap[p.index] = []
    ptrMap[p.index].push(p)
  }

  return (
    <div className="w-full">
      {/* Description */}
      <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium text-center min-h-[2rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`}>
        {description || '—'}
      </div>

      {/* Extra values row */}
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

      {/* Pointer labels above */}
      <div className="flex justify-center mb-0.5">
        {array.map((_, idx) => (
          <div key={idx} className="flex flex-col items-center" style={{ width: cellW + 5, minHeight: 18 }}>
            {ptrMap[idx]?.map(p => (
              <span key={p.label} className="text-xs font-bold leading-none"
                style={{ color: POINTER_COLORS[p.label] || p.color || '#60a5fa', fontSize: 10 }}>
                {p.label}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Main array */}
      <div className="flex justify-center gap-1 py-2 flex-wrap">
        {array.map((val, idx) => {
          const s = cellBg(idx, step)
          const bg = s?.bg ?? (isDark ? '#374151' : '#E5E7EB')
          const border = s?.border ?? (isDark ? '#4B5563' : '#D1D5DB')
          const textColor = s?.text ?? (isDark ? '#d1d5db' : '#374151')
          return (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-mono opacity-40" style={{ fontSize: 9 }}>{idx}</span>
              <motion.div
                animate={{ backgroundColor: bg }}
                transition={{ duration: 0.2 }}
                className="rounded-lg flex items-center justify-center font-mono font-bold"
                style={{ width: cellW, height: cellW, border: `2px solid ${border}`,
                  boxShadow: s ? `0 0 8px ${bg}77` : 'none', color: textColor,
                  fontSize: cellW < 42 ? 11 : 13 }}
              >
                {val}
              </motion.div>
              {/* Arrow indicators for pointers */}
              {ptrMap[idx] && (
                <div className="flex gap-0.5">
                  {ptrMap[idx].map(p => (
                    <div key={p.label} className="w-0.5 h-2 rounded-full"
                      style={{ background: POINTER_COLORS[p.label] || p.color || '#60a5fa' }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Optional 2nd array row */}
      {array2 && (
        <div className="mt-2">
          <p className={`text-xs text-center font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {array2Label || 'Secondary array'}
          </p>
          <div className="flex justify-center gap-1 flex-wrap">
            {array2.map((val, idx) => (
              <motion.div key={idx}
                animate={{ backgroundColor: val !== null ? (isDark ? '#1e3a5f' : '#dbeafe') : (isDark ? '#374151' : '#f9fafb') }}
                transition={{ duration: 0.25 }}
                className="rounded-lg flex items-center justify-center font-mono font-bold border"
                style={{ width: cellW, height: cellW * 0.8,
                  borderColor: val !== null ? '#60a5fa' : (isDark ? '#4b5563' : '#e5e7eb'),
                  color: val !== null ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#4b5563' : '#9ca3af'),
                  fontSize: cellW < 42 ? 10 : 12 }}
              >
                {val !== null ? val : '?'}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        {[
          { label: 'Default',  bg: '#E5E7EB', b: '#D1D5DB' },
          { label: 'Active',   bg: '#60A5FA', b: '#3B82F6' },
          { label: 'Window',   bg: '#6EE7B7', b: '#34D399' },
          { label: 'Swap',     bg: '#F87171', b: '#EF4444' },
          { label: 'Sorted',   bg: '#34D399', b: '#10B981' },
        ].map(it => (
          <div key={it.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: it.bg, border: `1px solid ${it.b}` }} />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
