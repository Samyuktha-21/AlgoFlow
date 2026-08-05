import { useState } from 'react'
import { Shuffle, Play, AlertCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { randomArray, randomSortedArray } from '../../utils/helpers'

/* The seed values are mount-time defaults, not a live binding: the caller
   passes a key derived from them, so a new seed remounts this panel instead of
   being pushed into state by an effect. */
export default function InputPanel({ algorithmType, onVisualize, placeholder, defaultValue, defaultTarget, inputType }) {
  const { isDark } = useTheme()
  const [input, setInput] = useState(defaultValue || '')
  const [targetInput, setTargetInput] = useState(defaultTarget || '')
  const [error, setError] = useState('')

  const isSearch       = algorithmType === 'searching'
  const isGraph        = algorithmType === 'graph'
  const isStringPair   = inputType === 'stringPair'
  const isSingleString = inputType === 'singleString'

  const handleRandom = () => {
    setError('')
    if (isSearch) {
      const arr = randomSortedArray(12)
      setInput(arr.join(', '))
      setTargetInput(String(arr[Math.floor(arr.length * 0.6)]))
    } else if (isGraph) {
      setInput('0-1, 0-2, 1-3, 1-4, 2-5, 2-6')
    } else {
      setInput(randomArray(8, 15).join(', '))
    }
  }

  const handleVisualize = () => {
    setError('')
    const result = onVisualize(input, isSearch ? targetInput : undefined)
    if (result?.error) setError(result.error)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleVisualize()
  }

  return (
    <div className={`rounded-xl border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`text-xs font-semibold mb-3 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Input
      </div>

      <div className="flex flex-wrap gap-2 items-start">
        {/* Array / edges input */}
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || (isGraph
              ? 'Edges: 0-1, 0-2, 1-3 ...'
              : isSearch
                ? 'Sorted array: 2, 5, 8, 12 ...'
                : isStringPair
                  ? 'Two strings: ABCBDAB,BDCAB'
                  : isSingleString
                    ? 'String: racecar'
                    : 'Array: 5, 3, 7, 1, 9 ...')}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
              error
                ? 'border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400'
                : isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400'
            }`}
          />
        </div>

        {/* Target input for search */}
        {isSearch && (
          <div className="w-28">
            <input
              type="text"
              value={targetInput}
              onChange={e => { setTargetInput(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="Target"
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400'
              }`}
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleRandom}
          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${
            isDark
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700 bg-gray-800'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
          title="Generate random input"
        >
          <Shuffle size={14} />
          Random
        </button>

        <button
          type="button"
          onClick={handleVisualize}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Play size={14} />
          Visualize
        </button>
      </div>

      {error && (
        <div className={`mt-2 flex items-start gap-1.5 text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {isGraph
          ? <>Each number is a <b>node</b>. "0-1" means node 0 connects to node 1. Try: <code className="opacity-75">0-1, 0-2, 1-3, 1-4, 2-5</code></>
          : isSearch
            ? 'Enter a sorted array and a target value to search for'
            : 'Enter 2–50 comma-separated integers, or click Random'}
      </p>
    </div>
  )
}
