import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

/* Step shape:
  { array, current, stack, result, highlighted, description, codeLine,
    stack2 (optional for two-stack), extra }
*/
export default function StackVisualizer({ step }) {
  const { isDark } = useTheme()

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Enter input and click Visualize to start</p>
      </div>
    )
  }

  const { array = [], current = -1, stack = [], result = [], highlighted = -1, description, extra, stack2, stack2Label, stackLabel } = step
  const cellW = Math.max(34, Math.min(52, Math.floor(500 / Math.max(array.length, 1)) - 4))

  return (
    <div className="w-full">
      {/* Description */}
      <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium text-center min-h-[2rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`}>
        {description || '—'}
      </div>

      {/* Extra */}
      {extra && Object.keys(extra).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {Object.entries(extra).map(([k, v]) => (
            <div key={k} className={`px-2 py-1 rounded text-xs font-semibold border ${
              isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
            }`}>
              {k}: <span className="text-blue-400 font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-8 items-start justify-center">
        {/* Input array */}
        {array.length > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Input</span>
            <div className="flex gap-1">
              {array.map((val, i) => {
                const isCur = i === current
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-mono opacity-40" style={{ fontSize: 9 }}>{i}</span>
                    <motion.div
                      animate={{ backgroundColor: isCur ? '#FCD34D' : (isDark ? '#374151' : '#E5E7EB') }}
                      transition={{ duration: 0.2 }}
                      className="rounded flex items-center justify-center font-mono font-bold border"
                      style={{ width: cellW, height: cellW,
                        borderColor: isCur ? '#F59E0B' : (isDark ? '#4b5563' : '#d1d5db'),
                        color: isCur ? '#78350f' : (isDark ? '#d1d5db' : '#374151'),
                        fontSize: cellW < 40 ? 11 : 13,
                        boxShadow: isCur ? '0 0 8px rgba(252,211,77,.6)' : 'none' }}
                    >
                      {val}
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Main stack */}
        <div className="flex flex-col items-center gap-1">
          <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {stackLabel || 'Stack'} (top →)
          </span>
          <div className={`rounded-xl border p-2 min-w-[80px] min-h-[60px] flex flex-col-reverse gap-1 ${
            isDark ? 'bg-gray-700/40 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <AnimatePresence>
              {stack.map((val, i) => {
                const isTop = i === stack.length - 1
                const isHL  = i === highlighted
                return (
                  <motion.div key={`${val}-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded flex items-center justify-center font-mono font-bold text-sm border"
                    style={{ width: 44, height: 36, minWidth: 44,
                      backgroundColor: isTop ? '#60A5FA' : isHL ? '#FCD34D' : (isDark ? '#374151' : '#fff'),
                      borderColor: isTop ? '#3B82F6' : isHL ? '#F59E0B' : (isDark ? '#4b5563' : '#d1d5db'),
                      color: isTop ? '#fff' : isHL ? '#78350f' : (isDark ? '#d1d5db' : '#374151'),
                      boxShadow: isTop ? '0 0 8px rgba(96,165,250,.5)' : 'none' }}
                  >
                    {val}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>bottom</span>
        </div>

        {/* Optional second stack */}
        {stack2 !== undefined && (
          <div className="flex flex-col items-center gap-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {stack2Label || 'Stack 2'}
            </span>
            <div className={`rounded-xl border p-2 min-w-[80px] min-h-[60px] flex flex-col-reverse gap-1 ${
              isDark ? 'bg-gray-700/40 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              {stack2.map((val, i) => (
                <div key={`s2-${i}`}
                  className="rounded flex items-center justify-center font-mono font-bold text-sm border"
                  style={{ width: 44, height: 36,
                    backgroundColor: i === stack2.length - 1 ? '#A78BFA' : (isDark ? '#374151' : '#fff'),
                    borderColor: i === stack2.length - 1 ? '#8B5CF6' : (isDark ? '#4b5563' : '#d1d5db'),
                    color: i === stack2.length - 1 ? '#fff' : (isDark ? '#d1d5db' : '#374151') }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result array */}
        {result.length > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Result</span>
            <div className="flex gap-1 flex-wrap max-w-[200px]">
              {result.map((val, i) => (
                <div key={i}
                  className="rounded flex items-center justify-center font-mono font-bold text-xs border"
                  style={{ width: 36, height: 36,
                    backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
                    borderColor: '#60a5fa',
                    color: isDark ? '#93c5fd' : '#1d4ed8' }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
