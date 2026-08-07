import { useState } from 'react'
import { Shuffle, Play, AlertCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { randomArray, randomSortedArray, randomGraphInput, randomWord } from '../../utils/helpers'
import { normalizeNumberSpec, describeNumberSpec } from '../../utils/validators'

/* The seed values are mount-time defaults, not a live binding: the caller
   passes a key derived from them, so a new seed remounts this panel instead of
   being pushed into state by an effect. */
export default function InputPanel({ algorithmType, onVisualize, placeholder, defaultValue, defaultTarget, inputType, inputSpec, inputHint }) {
  const { isDark } = useTheme()
  const [input, setInput] = useState(defaultValue || '')
  const [targetInput, setTargetInput] = useState(defaultTarget || '')
  const [error, setError] = useState('')

  const isSearch       = algorithmType === 'searching'
  const isGraph        = algorithmType === 'graph'
  const isStringPair   = inputType === 'stringPair'
  const isSingleString = inputType === 'singleString'
  /* Scalar algorithms (factorial, gcd, n-queens …) take one or two bounded
     numbers, so they get their own placeholder, hint and Random range. */
  const isNumber       = inputType === 'singleNumber' || inputType === 'numberPair'
  /* Grid-shaped input (mazes, Sudoku, k sorted lists): rows split on "/". */
  const isGrid         = inputType === 'numberGrid'
  const numFields      = isNumber ? normalizeNumberSpec(inputSpec) : null
  /* Weighted algorithms (Prim, Johnson's, TSP …) seed the box with ":w"
     suffixes; A* seeds it blank because its demo is an obstacle grid. */
  const isWeightedGraph   = isGraph && (defaultValue || '').includes(':')
  const isBlankGraphSeed  = isGraph && defaultValue === ''

  const handleRandom = () => {
    setError('')
    if (isSearch) {
      const arr = randomSortedArray(12)
      setInput(arr.join(', '))
      setTargetInput(String(arr[Math.floor(arr.length * 0.6)]))
    } else if (isGraph) {
      /* A blank seed means the algorithm builds its own board (A*'s grid);
         randomising it would silently take that demo away. */
      if (isBlankGraphSeed) setInput('')
      else setInput(randomGraphInput({ weighted: isWeightedGraph }))
    } else if (isNumber) {
      setInput(numFields.map(f => f.min + Math.floor(Math.random() * (f.max - f.min + 1))).join(', '))
    } else if (isGrid) {
      /* Keep the seed's shape so a 9x9 board stays 9x9 when randomised. */
      const widths = (defaultValue || '1,0 / 1,1').split('/').map(r => r.split(',').length)
      setInput(widths.map(w => Array.from({ length: w }, () => Math.floor(Math.random() * 2)).join(',')).join(' / '))
    } else if (isStringPair) {
      /* Without this these fell through to randomArray below and dropped
         "5, 3, 9" into a field that wants text. */
      setInput(`${randomWord(6)},${randomWord(5)}`)
    } else if (isSingleString) {
      setInput(randomWord(7))
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
            placeholder={placeholder || (isGrid
              ? 'Rows: 1,0,0 / 1,1,0 / 0,1,1'
              : isGraph
              ? (isWeightedGraph ? 'Edges: 0-1:4, 0-2:1, 1-3:5 ...' : 'Edges: 0-1, 0-2, 1-3 ...')
              : isSearch
                ? 'Sorted array: 2, 5, 8, 12 ...'
                : isStringPair
                  ? 'Two strings: ABCBDAB,BDCAB'
                  : isSingleString
                    ? 'String: racecar'
                    : isNumber
                      ? describeNumberSpec(numFields)
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
        {/* Several algorithms read their input by a convention the generic
            hint gets wrong — a trailing target, pairs, a leading capacity.
            Those ship their own sentence in metadata.inputHint. */
        inputHint
          ? <>{inputHint}{defaultValue ? <> Try: <code className="opacity-75">{defaultValue}</code></> : null}</>
          : isGrid
          ? <>One row per line, cells separated by commas and rows by <code className="opacity-75">/</code>. Try: <code className="opacity-75">1,0,0 / 1,1,0 / 0,1,1</code></>
          : isGraph
          ? isBlankGraphSeed
            ? <>Leave this empty to use the built-in board, or enter your own edges: <code className="opacity-75">0-1, 0-2, 1-3</code></>
            : isWeightedGraph
              ? <>Each number is a <b>node</b> and "0-1:4" is an edge of weight 4. Try: <code className="opacity-75">0-1:4, 0-2:1, 1-2:2, 1-3:5</code></>
              : <>Each number is a <b>node</b>. "0-1" means node 0 connects to node 1. Try: <code className="opacity-75">0-1, 0-2, 1-3, 1-4, 2-5</code></>
          : isSearch
            ? 'Enter a sorted array and a target value to search for'
            : isNumber
              ? <>This algorithm takes {numFields.length === 1 ? 'a single number' : `${numFields.length} numbers`}: <b>{describeNumberSpec(numFields)}</b></>
              : isStringPair
                ? 'Enter two strings separated by a comma'
                : isSingleString
                  ? 'Enter a single string'
                  : 'Enter 2–50 comma-separated integers, or click Random'}
      </p>
    </div>
  )
}
