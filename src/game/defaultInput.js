/* Canonical default input per algorithm type/inputType. Shared by the
   Algorithm page (auto-run) and the Test Yourself game. Returns
   { input: string, target: string }. */

export function getDefaultInput(type, inputType, inputSpec) {
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
