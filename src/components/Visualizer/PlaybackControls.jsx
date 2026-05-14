import { Play, Pause, SkipForward, RotateCcw, ChevronDown } from 'lucide-react'
import { useVisualization } from '../../context/VisualizationContext'
import { useTheme } from '../../context/ThemeContext'
import { useState, useRef, useEffect } from 'react'

const SPEEDS = ['0.25x', '0.5x', '1x', '2x', '4x']

export default function PlaybackControls({ disabled }) {
  const { isPlaying, isFinished, speed, steps, currentIndex, play, pause, next, reset, setSpeed } = useVisualization()
  const { isDark } = useTheme()
  const [speedOpen, setSpeedOpen] = useState(false)
  const speedRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!speedRef.current?.contains(e.target)) setSpeedOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const hasSteps = steps.length > 0
  const progress = hasSteps ? (currentIndex / Math.max(steps.length - 1, 1)) * 100 : 0

  const btnBase = `p-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed`
  const btnPrimary = `${btnBase} ${isDark
    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`
  const btnSecondary = `${btnBase} ${isDark
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`

  return (
    <div className={`rounded-xl border p-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Progress bar */}
      <div className={`mb-3 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div
          className="h-full bg-blue-500 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            onClick={reset}
            disabled={disabled || !hasSteps}
            className={btnSecondary}
            aria-label="Reset"
            title="Reset (R)"
          >
            <RotateCcw size={16} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : play}
            disabled={disabled || !hasSteps || isFinished}
            className={btnPrimary}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Step forward */}
          <button
            onClick={next}
            disabled={disabled || !hasSteps || isFinished}
            className={btnSecondary}
            aria-label="Next step"
            title="Next step (→)"
          >
            <SkipForward size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Step counter */}
          {hasSteps && (
            <span className={`text-xs tabular-nums ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentIndex + 1} / {steps.length}
            </span>
          )}

          {/* Speed selector */}
          <div className="relative" ref={speedRef}>
            <button
              onClick={() => setSpeedOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {speed}
              <ChevronDown size={13} className={`transition-transform ${speedOpen ? 'rotate-180' : ''}`} />
            </button>
            {speedOpen && (
              <div className={`absolute right-0 bottom-full mb-1 w-24 rounded-lg shadow-lg border overflow-hidden z-20 ${
                isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setSpeedOpen(false) }}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                      speed === s
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 font-medium'
                        : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status message */}
      {isFinished && (
        <div className={`mt-2 text-xs text-center font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
          ✓ Visualization complete — click Reset to start again
        </div>
      )}
    </div>
  )
}
