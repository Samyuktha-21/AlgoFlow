import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

/* Handles N-Queens (board), Sudoku (grid 9×9), and generic backtracking.
   Step shape:
     { board, queens, n, highlighted:{row,col}, conflicts:[], backtracking, description,
       type:'nqueens'|'sudoku'|'generic', extra }
*/

function NQueensBoard({ step, isDark }) {
  const { board = [], queens = [], highlighted, conflicts = [], backtracking, n = 8 } = step
  const size = board.length || n

  return (
    <div className="flex flex-col items-center gap-1">
      {Array.from({ length: size }, (_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: size }, (_, col) => {
            const isQueen      = queens.includes(row) && queens[row] === col
            const isHighlight  = highlighted?.row === row && highlighted?.col === col
            const isConflict   = conflicts.some(c => c.row === row && c.col === col)
            const isDark2 = (row + col) % 2 === 1
            let bg = isDark2 ? (isDark ? '#374151' : '#d1d5db') : (isDark ? '#1f2937' : '#f3f4f6')
            if (isConflict) bg = '#FCA5A5'
            if (isHighlight) bg = '#FCD34D'

            return (
              <motion.div key={col}
                animate={{ backgroundColor: bg }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center rounded text-sm font-bold"
                style={{ width: 36, height: 36, border: isHighlight ? '2px solid #F59E0B' : '1px solid transparent',
                  boxShadow: isHighlight ? '0 0 6px rgba(252,211,77,.5)' : 'none' }}
              >
                {isQueen && (
                  <span style={{ fontSize: 20, filter: backtracking ? 'opacity(0.4)' : 'none' }}>♛</span>
                )}
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function SudokuBoard({ step, isDark }) {
  const { board = [], highlighted, conflicts = [], filled = [] } = step

  return (
    <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(9, 1fr)', width: 306 }}>
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => {
          const val = board?.[row]?.[col]
          const isHL = highlighted?.row === row && highlighted?.col === col
          const isConflict = conflicts.some(c => c.row === row && c.col === col)
          const isFilled   = filled.some(f => f.row === row && f.col === col)
          const borderR = (col + 1) % 3 === 0 && col < 8 ? '2px' : '0'
          const borderB = (row + 1) % 3 === 0 && row < 8 ? '2px' : '0'

          return (
            <motion.div key={`${row}-${col}`}
              animate={{
                backgroundColor: isConflict ? '#FCA5A5' : isHL ? '#FCD34D' : isFilled ? (isDark ? '#1e3a5f' : '#dbeafe') : (isDark ? '#374151' : '#fff')
              }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center text-xs font-mono font-bold"
              style={{ width: 34, height: 34, border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                borderRight: borderR, borderBottom: borderB,
                color: isConflict ? '#7f1d1d' : isHL ? '#78350f' : isFilled ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#d1d5db' : '#374151') }}
            >
              {val || ''}
            </motion.div>
          )
        })
      ).flat()}
    </div>
  )
}

export default function BacktrackingVisualizer({ step }) {
  const { isDark } = useTheme()

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Click Visualize to start</p>
      </div>
    )
  }

  const { description, type = 'nqueens', extra, backtracking } = step

  return (
    <div className="w-full">
      <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium text-center min-h-[2rem] flex items-center justify-center ${
        isDark ? 'bg-gray-700/60 text-gray-300' : 'bg-white/70 text-gray-700'
      }`}>
        {description || '—'}
      </div>

      {backtracking && (
        <div className="flex justify-center mb-2">
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            ↩ Backtracking…
          </span>
        </div>
      )}

      {extra && Object.keys(extra).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {Object.entries(extra).map(([k, v]) => (
            <div key={k} className={`px-2 py-1 rounded text-xs font-semibold border ${
              isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
            }`}>
              {k}: <span className="text-purple-400 font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        {type === 'nqueens' && <NQueensBoard step={step} isDark={isDark} />}
        {type === 'sudoku'  && <SudokuBoard  step={step} isDark={isDark} />}
      </div>
    </div>
  )
}
