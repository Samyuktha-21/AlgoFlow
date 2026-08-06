/* Canonical default input per algorithm type/inputType. Shared by the
   Algorithm page (auto-run) and the Test Yourself game. Returns
   { input: string, target: string }. */

export function getDefaultInput(type, inputType, inputSpec, presetInput) {
  /* An algorithm may ship its own seed in metadata.defaultInput. Prim, SCC,
     TSP and Johnson's all need something the shared per-type default cannot
     express — weights, direction, or a graph that is not a tree — and a
     visualization is worthless if it opens on input the algorithm cannot
     say anything interesting about. An empty string is a deliberate choice
     too: A*'s demo is an obstacle grid, which no edge list can describe, so
     it opens with a blank box and falls through to its built-in board. */
  if (typeof presetInput === 'string') return { input: presetInput, target: '' }
  if (inputType === 'stringPair')   return { input: 'ABCBDAB,BDCAB', target: '' }
  if (inputType === 'singleString') return { input: 'racecar', target: '' }
  /* Scalar algorithms carry their own seed in metadata.inputSpec — a shared
     per-type default would be out of range for most of them. */
  if (inputType === 'singleNumber' || inputType === 'numberPair') {
    const fields = Array.isArray(inputSpec) && inputSpec.length ? inputSpec : [{ min: 1, default: 8 }]
    return { input: fields.map(f => f.default ?? f.min ?? 1).join(', '), target: '' }
  }
  switch (type) {
    case 'sorting':     return { input: '64, 34, 25, 12, 22, 11, 90', target: '' }
    case 'searching':   return { input: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91', target: '23' }
    case 'graph':       return { input: '0-1, 0-2, 1-3, 1-4, 2-5, 2-6', target: '' }
    case 'tree':        return { input: '4, 2, 6, 1, 3, 5, 7', target: '' }
    case 'heap':        return { input: '90, 70, 80, 40, 50, 60, 30', target: '' }
    case 'dp':          return { input: '5, 3, 8, 1, 9, 2, 7', target: '' }
    case 'dynamic-programming': return { input: '5, 3, 8, 1, 9, 2, 7', target: '' }
    case 'backtracking':return { input: '4, 2, 6, 1, 3', target: '' }
    case 'linked-list': return { input: '1, 2, 3, 4, 5', target: '' }
    case 'stack':       return { input: '3, 7, 2, 5, 8, 4', target: '' }
    case 'queue':       return { input: '3, 7, 2, 5, 8, 4', target: '' }
    case 'array':       return { input: '3, 1, 4, 1, 5, 9, 2, 6', target: '' }
    case 'fundamentals':return { input: '5, 3, 7, 1, 9, 4, 6', target: '' }
    case 'hashing':     return { input: '12, 24, 36, 15, 27', target: '' }
    case 'greedy':      return { input: '10, 20, 30, 5, 15', target: '' }
    default:            return { input: '5, 3, 7, 1, 9', target: '' }
  }
}
